"""
Модуль сканирования поверхности — LiDAR, Радар, SAR, Тепловизор.
GET  /            — список сессий (фильтры: drone_id, scan_mode, status)
GET  /?id=1       — одна сессия
POST /            — создать и запустить сессию
POST /?action=save — сохранить результат в S3 и завершить сессию
PATCH /?id=1      — обновить прогресс / завершить
DELETE /?id=1     — удалить сессию + файл из S3
"""
import os, json, io, gzip
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor
from botocore.exceptions import ClientError

SCHEMA = "t_p93256795_solofly_ai_architect"
BUCKET = "files"
CDN    = f"https://cdn.poehali.dev/projects/{os.environ.get('AWS_ACCESS_KEY_ID', '')}/bucket"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

SENSOR_PARAMS = {
    "lidar_terrain": {"sensor": "LiDAR",      "range_m": 500,   "resolution_cm": 2,  "freq_hz": 20, "fov_deg": 120},
    "lidar_objects": {"sensor": "LiDAR",      "range_m": 300,   "resolution_cm": 1,  "freq_hz": 40, "fov_deg": 90},
    "radar_long":    {"sensor": "Radar SAR",  "range_m": 15000, "resolution_cm": 50, "freq_hz": 1,  "fov_deg": 30},
    "thermal":       {"sensor": "FLIR",       "range_m": 5000,  "resolution_cm": 10, "freq_hz": 30, "fov_deg": 60},
    "multispectral": {"sensor": "MS-camera",  "range_m": 1000,  "resolution_cm": 5,  "freq_hz": 10, "fov_deg": 75},
    "sar":           {"sensor": "SAR X-band", "range_m": 15000, "resolution_cm": 25, "freq_hz": 2,  "fov_deg": 45},
    # legacy modes from DB seed
    "lidar":         {"sensor": "LiDAR",      "range_m": 500,   "resolution_cm": 5,  "freq_hz": 20, "fov_deg": 120},
    "radar":         {"sensor": "Radar SAR",  "range_m": 15000, "resolution_cm": 50, "freq_hz": 1,  "fov_deg": 30},
    "thermal_img":   {"sensor": "FLIR",       "range_m": 5000,  "resolution_cm": 10, "freq_hz": 30, "fov_deg": 60},
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def get_s3():
    import boto3
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )

def json_safe(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Not serializable: {type(obj)}")

def serialize(row: dict) -> dict:
    d = dict(row)
    for k in ("started_at", "finished_at", "created_at"):
        if d.get(k):
            d[k] = d[k].isoformat()
    for k, v in list(d.items()):
        if isinstance(v, Decimal):
            d[k] = float(v)
    return d

def build_result_json(session: dict, log: list, scan_mode: str) -> dict:
    """Формирует JSON-отчёт о результатах сканирования для сохранения в S3."""
    sp = SENSOR_PARAMS.get(scan_mode, {})
    return {
        "version": "1.0",
        "solofly": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "session": {
            "id":          session["id"],
            "code":        session["code"],
            "drone_id":    session["drone_id"],
            "drone_name":  session.get("drone_name"),
            "scan_mode":   scan_mode,
            "target_mode": session.get("target_mode"),
            "sensor":      sp.get("sensor", scan_mode),
            "range_m":     session.get("range_m"),
            "resolution_cm": float(session.get("resolution_cm") or sp.get("resolution_cm", 0)),
            "frequency_hz":  float(session.get("frequency_hz") or sp.get("freq_hz", 0)),
            "fov_deg":       float(session.get("fov_deg") or sp.get("fov_deg", 0)),
        },
        "results": {
            "status":        "done",
            "coverage_pct":  session.get("coverage_pct", 100),
            "area_km2":      float(session.get("area_km2") or 0),
            "points_total":  session.get("points_total", 0),
            "objects_found": session.get("objects_found", 0),
            "elevation_min_m": float(session.get("elevation_min_m") or 0),
            "elevation_max_m": float(session.get("elevation_max_m") or 0),
            "accuracy_m":      float(session.get("accuracy_m") or 0),
            "started_at":    session.get("started_at", ""),
            "finished_at":   datetime.now(timezone.utc).isoformat(),
        },
        "log": log or [],
    }


def handler(event: dict, context) -> dict:
    """Управление сессиями и архивом сканирования поверхности БПЛА."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── GET ──────────────────────���──────────────────────��───────────────
        if method == "GET":
            session_id = params.get("id")
            if session_id:
                cur.execute(
                    f"SELECT s.*, d.name as drone_name "
                    f"FROM {SCHEMA}.scan_sessions s "
                    f"LEFT JOIN {SCHEMA}.drones d ON s.drone_id = d.id "
                    f"WHERE s.id = %s", (session_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS,
                            "body": {"error": "Session not found"}}
                return {"statusCode": 200, "headers": CORS,
                        "body": {"session": serialize(row)}}

            # список с фильтрами
            where_parts, args = [], []
            for col, param in [("s.drone_id", "drone_id"), ("s.scan_mode", "scan_mode"), ("s.status", "status")]:
                if params.get(param):
                    where_parts.append(f"{col} = %s")
                    args.append(params[param])
            where = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""

            cur.execute(
                f"SELECT s.id, s.code, s.drone_id, s.scan_mode, s.target_mode, s.status, "
                f"s.range_m, s.resolution_cm, s.frequency_hz, s.fov_deg, s.coverage_pct, "
                f"s.area_km2, s.points_total, s.objects_found, s.accuracy_m, "
                f"s.result_url, s.result_size_kb, s.result_format, "
                f"s.started_at, s.finished_at, s.created_at, d.name as drone_name "
                f"FROM {SCHEMA}.scan_sessions s "
                f"LEFT JOIN {SCHEMA}.drones d ON s.drone_id = d.id "
                f"{where} ORDER BY s.created_at DESC LIMIT 100",
                args
            )
            rows = [serialize(r) for r in cur.fetchall()]
            stats = {}
            for r in rows:
                stats[r["status"]] = stats.get(r["status"], 0) + 1

            return {"statusCode": 200, "headers": CORS,
                    "body": {"sessions": rows, "total": len(rows), "stats": stats}}

        # ── POST /  — создать сессию ─────────────────────────────────────────
        elif method == "POST" and not action:
            body = json.loads(event.get("body") or "{}")
            scan_mode   = body.get("mode", "lidar_terrain")
            target_mode = body.get("target_mode", "terrain")
            drone_id    = body.get("drone_id")

            sp = SENSOR_PARAMS.get(scan_mode, SENSOR_PARAMS["lidar_terrain"])
            range_m      = int(body.get("range_m", sp["range_m"]))
            resolution_cm = sp["resolution_cm"]
            frequency_hz  = sp["freq_hz"]
            fov_deg       = sp["fov_deg"]

            cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.scan_sessions")
            cnt  = cur.fetchone()["cnt"]
            code = f"SCN-{int(cnt) + 1:04d}"

            cur.execute(
                f"INSERT INTO {SCHEMA}.scan_sessions "
                f"(code, drone_id, scan_mode, target_mode, status, range_m, resolution_cm, frequency_hz, fov_deg) "
                f"VALUES (%s, %s, %s, %s, 'active', %s, %s, %s, %s) RETURNING id",
                (code, drone_id, scan_mode, target_mode, range_m, resolution_cm, frequency_hz, fov_deg)
            )
            new_id = cur.fetchone()["id"]
            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"ok": True, "id": int(new_id), "code": code, "mode": scan_mode})}

        # ── POST /?action=save — сохранить результат в S3 ────────────────────
        elif method == "POST" and action == "save":
            body        = json.loads(event.get("body") or "{}")
            session_id  = body.get("id") or params.get("id")
            scan_log    = body.get("log", [])

            if not session_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}

            # читаем сессию
            cur.execute(
                f"SELECT s.*, d.name as drone_name "
                f"FROM {SCHEMA}.scan_sessions s "
                f"LEFT JOIN {SCHEMA}.drones d ON s.drone_id = d.id "
                f"WHERE s.id = %s", (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS,
                        "body": json.dumps({"error": "Session not found"})}

            session = serialize(row)
            scan_mode = session.get("scan_mode", "lidar_terrain")

            # Формируем JSON-результат
            result_data = build_result_json(session, scan_log, scan_mode)
            result_bytes = json.dumps(result_data, ensure_ascii=False, indent=2).encode("utf-8")
            size_kb = len(result_bytes) // 1024 + 1

            # Сохраняем в S3
            ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            s3_key = f"scan_results/{session['code']}_{ts}.json"

            s3 = get_s3()
            s3.put_object(
                Bucket=BUCKET,
                Key=s3_key,
                Body=result_bytes,
                ContentType="application/json",
            )

            cdn_url = f"{CDN}/{s3_key}"

            # Обновляем запись в БД
            cur.execute(
                f"UPDATE {SCHEMA}.scan_sessions "
                f"SET status = 'done', coverage_pct = %s, finished_at = now(), "
                f"result_url = %s, result_size_kb = %s, result_format = 'json' "
                f"WHERE id = %s",
                (body.get("coverage_pct", 100), cdn_url, size_kb, session_id)
            )
            conn.commit()

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "ok": True,
                        "url": cdn_url,
                        "key": s3_key,
                        "size_kb": size_kb,
                        "code": session["code"],
                    })}

        # ── PATCH — обновить прогресс ───────────────────────────────────���────
        elif method == "PATCH":
            session_id = params.get("id")
            if not session_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}
            body    = json.loads(event.get("body") or "{}")
            allowed = ["status", "coverage_pct", "area_km2", "points_total", "objects_found"]
            updates = {k: body[k] for k in allowed if k in body}
            finish  = body.get("status") in ("done", "aborted", "finished")

            if not updates:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Nothing to update"})}

            set_parts = [f"{k} = %s" for k in updates]
            vals      = list(updates.values())
            if finish:
                set_parts.append("finished_at = now()")
            cur.execute(
                f"UPDATE {SCHEMA}.scan_sessions SET {', '.join(set_parts)} WHERE id = %s",
                vals + [session_id]
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        # ── DELETE ───────────────────────────────────────────────────────────
        elif method == "DELETE":
            session_id = params.get("id")
            if not session_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}

            # читаем result_url для удаления из S3
            cur.execute(f"SELECT result_url FROM {SCHEMA}.scan_sessions WHERE id = %s", (session_id,))
            row = cur.fetchone()
            if row and row.get("result_url"):
                try:
                    cdn_prefix = f"{CDN}/"
                    url = row["result_url"]
                    if url.startswith(cdn_prefix):
                        s3_key = url[len(cdn_prefix):]
                        get_s3().delete_object(Bucket=BUCKET, Key=s3_key)
                except ClientError:
                    pass  # не критично — удаляем запись из БД в любом случае

            cur.execute(f"DELETE FROM {SCHEMA}.scan_sessions WHERE id = %s", (session_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}

    finally:
        cur.close()
        conn.close()