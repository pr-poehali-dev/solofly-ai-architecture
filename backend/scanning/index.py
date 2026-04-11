"""
Модуль сканирования поверхности — LiDAR, Радар, SAR, Тепловизор.
GET  /           — список сессий сканирования
GET  /?id=1      — одна сессия
POST /           — создать и запустить сессию
PATCH /?id=1     — обновить прогресс / завершить
DELETE /?id=1    — удалить сессию
"""
import os, json
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

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
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

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


def handler(event: dict, context) -> dict:
    """Управление сессиями сканирования поверхности БПЛА."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
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
                            "body": json.dumps({"error": "Session not found"})}
                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps({"session": serialize(row)}, default=json_safe)}

            drone_filter = params.get("drone_id")
            scan_mode_filter = params.get("scan_mode")
            where_parts, args = [], []
            if drone_filter:
                where_parts.append("s.drone_id = %s")
                args.append(drone_filter)
            if scan_mode_filter:
                where_parts.append("s.scan_mode = %s")
                args.append(scan_mode_filter)
            where = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""
            cur.execute(
                f"SELECT s.id, s.code, s.drone_id, s.scan_mode, s.target_mode, s.status, "
                f"s.range_m, s.resolution_cm, s.frequency_hz, s.coverage_pct, "
                f"s.area_km2, s.points_total, s.objects_found, s.started_at, s.finished_at, "
                f"d.name as drone_name "
                f"FROM {SCHEMA}.scan_sessions s "
                f"LEFT JOIN {SCHEMA}.drones d ON s.drone_id = d.id "
                f"{where} ORDER BY s.created_at DESC LIMIT 50",
                args
            )
            rows = [serialize(r) for r in cur.fetchall()]
            stats = {}
            for r in rows:
                stats[r["status"]] = stats.get(r["status"], 0) + 1

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"sessions": rows, "total": len(rows), "stats": stats}, default=json_safe)}

        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            scan_mode = body.get("mode", "lidar_terrain")
            target_mode = body.get("target_mode", "terrain")
            drone_id = body.get("drone_id")

            sp = SENSOR_PARAMS.get(scan_mode, SENSOR_PARAMS["lidar_terrain"])
            range_m = int(body.get("range_m", sp["range_m"]))
            resolution_cm = sp["resolution_cm"]
            frequency_hz = sp["freq_hz"]
            fov_deg = sp["fov_deg"]

            # Генерируем код сессии
            cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.scan_sessions")
            cnt = cur.fetchone()["cnt"]
            code = f"SCN-{int(cnt) + 1:04d}"

            cur.execute(
                f"INSERT INTO {SCHEMA}.scan_sessions "
                f"(code, drone_id, scan_mode, target_mode, status, range_m, resolution_cm, "
                f"frequency_hz, fov_deg) "
                f"VALUES (%s, %s, %s, %s, 'active', %s, %s, %s, %s) RETURNING id",
                (code, drone_id, scan_mode, target_mode, range_m, resolution_cm, frequency_hz, fov_deg)
            )
            new_id = cur.fetchone()["id"]
            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"ok": True, "id": int(new_id), "code": code, "mode": scan_mode})}

        elif method == "PATCH":
            session_id = params.get("id")
            if not session_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}
            body = json.loads(event.get("body") or "{}")

            allowed = ["status", "coverage_pct", "area_km2", "points_total", "objects_found"]
            updates = {k: body[k] for k in allowed if k in body}
            finish = body.get("status") in ("done", "aborted", "finished")

            if not updates:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Nothing to update"})}

            set_parts = [f"{k} = %s" for k in updates]
            vals = list(updates.values())
            if finish:
                set_parts.append("finished_at = now()")
            cur.execute(
                f"UPDATE {SCHEMA}.scan_sessions SET {', '.join(set_parts)} WHERE id = %s",
                vals + [session_id]
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True})}

        elif method == "DELETE":
            session_id = params.get("id")
            if not session_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}
            cur.execute(f"DELETE FROM {SCHEMA}.scan_sessions WHERE id = %s", (session_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True})}

        return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}

    finally:
        cur.close()
        conn.close()
