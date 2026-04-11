"""
Регистрация дрона и выдача токена для отправки телеметрии.
POST /?action=register   — зарегистрировать дрон, получить token
POST /?action=heartbeat  — дрон сообщает что онлайн (обновляет last_seen)
GET  /?token=XXX         — проверить токен, вернуть drone_id
GET  /?action=list       — список дронов с токенами (для владельца)
"""
import os, json, secrets
from datetime import datetime, timezone
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Регистрация реального дрона и выдача токена для передачи телеметрии."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── POST /?action=register — регистрация дрона ───────────────────────
        if method == "POST" and action == "register":
            body  = json.loads(event.get("body") or "{}")
            name  = body.get("name", "").strip()
            model = body.get("model", "Ardupilot").strip()
            hw_id = body.get("hw_id", "").strip()  # уникальный ID бортового железа

            if not name:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Укажите название дрона"})}

            # Генерируем токен
            token = "sf_" + secrets.token_urlsafe(32)

            # Проверяем — если дрон с таким hw_id уже есть, обновляем токен
            if hw_id:
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.drones WHERE hw_serial = %s",
                    (hw_id,)
                )
                existing = cur.fetchone()
                if existing:
                    cur.execute(
                        f"""UPDATE {SCHEMA}.drones
                            SET drone_token=%s, updated_at=now()
                            WHERE hw_serial=%s
                            RETURNING id, name""",
                        (token, hw_id)
                    )
                    row = dict(cur.fetchone())
                    conn.commit()
                    return {"statusCode": 200, "headers": CORS,
                            "body": json.dumps({
                                "ok":      True,
                                "action":  "token_refreshed",
                                "drone_id": row["id"],
                                "name":    row["name"],
                                "token":   token,
                            })}

            # Новый дрон
            drone_id = f"SF-{secrets.token_hex(3).upper()}"
            cur.execute(
                f"""INSERT INTO {SCHEMA}.drones
                    (id, name, notes, hw_serial, drone_token, status,
                     battery, altitude, speed, lat, lon, heading)
                    VALUES (%s,%s,%s,%s,%s,'idle',100,0,0,55.751244,37.618423,0)
                    RETURNING id, name""",
                (drone_id, name, model, hw_id or None, token)
            )
            row = dict(cur.fetchone())
            conn.commit()

            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({
                        "ok":      True,
                        "action":  "registered",
                        "drone_id": row["id"],
                        "name":    row["name"],
                        "token":   token,
                        "telemetry_url": "https://functions.poehali.dev/drone-connect-telemetry",
                    })}

        # ── POST /?action=heartbeat — дрон онлайн ────────────────────────────
        elif method == "POST" and action == "heartbeat":
            body  = json.loads(event.get("body") or "{}")
            token = body.get("token", "")
            if not token:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "token required"})}

            cur.execute(
                f"""UPDATE {SCHEMA}.drones
                    SET last_seen=now(), updated_at=now()
                    WHERE drone_token=%s
                    RETURNING id, status""",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS,
                        "body": json.dumps({"error": "Дрон не найден"})}
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "drone_id": row["id"], "status": row["status"]})}

        # ── GET /?token=XXX — проверка токена ────────────────────────────────
        elif method == "GET" and params.get("token"):
            token = params["token"]
            cur.execute(
                f"""SELECT id, name, notes, status, battery, altitude
                    FROM {SCHEMA}.drones WHERE drone_token=%s""",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS,
                        "body": json.dumps({"error": "Токен не найден"})}
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "drone": dict(row)})}

        # ── GET /?action=list — список дронов с токенами ──────────────────────
        elif method == "GET" and action == "list":
            cur.execute(
                f"""SELECT id, name, notes, hw_serial, drone_token, status,
                           battery, altitude, last_seen, created_at
                    FROM {SCHEMA}.drones
                    ORDER BY created_at DESC"""
            )
            rows = []
            for r in cur.fetchall():
                d = {}
                for k, v in dict(r).items():
                    if hasattr(v, "isoformat"):
                        d[k] = v.isoformat()
                    elif isinstance(v, __import__("decimal").Decimal):
                        d[k] = float(v)
                    else:
                        d[k] = v
                if d.get("drone_token"):
                    t = d["drone_token"]
                    d["drone_token_preview"] = t[:12] + "…"
                rows.append(d)

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"drones": rows})}

        return {"statusCode": 400, "headers": CORS,
                "body": json.dumps({"error": "Unknown action"})}

    finally:
        cur.close()
        conn.close()