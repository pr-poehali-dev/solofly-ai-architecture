"""
Флот БПЛА — ЦУП: регистрация, телеметрия, аналитика, события подключения.
GET  /                — список всех дронов с текущим статусом
GET  /?id=SF-001      — один дрон + история телеметрии
GET  /?action=analytics — сводная аналитика по флоту
GET  /?action=connections&id=SF-001 — история подключений дрона
POST /                — обновить телеметрию от борта
POST /?action=register — зарегистрировать новый БПЛА в ЦУП
POST /?action=connect  — зафиксировать факт подключения/отключения
PATCH /?id=SF-001     — редактировать метаданные дрона (ЦУП)
DELETE /?id=SF-001    — удалить дрон из ЦУП
"""
import os, json, re
from datetime import datetime, timezone
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def safe_val(v):
    if isinstance(v, Decimal):
        return float(v)
    return v

def serialize_row(row: dict) -> dict:
    d = {k: safe_val(v) for k, v in row.items()}
    for k in ("created_at", "updated_at", "ts", "last_seen_at"):
        if d.get(k) and hasattr(d[k], "isoformat"):
            d[k] = d[k].isoformat()
    return d


def handler(event: dict, context) -> dict:
    """ЦУП: управление флотом БПЛА — регистрация, телеметрия, аналитика."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── GET /  ────────────────────────────────────────────────────────────
        if method == "GET":

            # Аналитика по всему флоту
            if action == "analytics":
                cur.execute(f"SELECT * FROM {SCHEMA}.drones ORDER BY id")
                drones = [serialize_row(dict(r)) for r in cur.fetchall()]

                cur.execute(f"""
                    SELECT
                        COUNT(*) FILTER (WHERE status = 'flight')   AS flying,
                        COUNT(*) FILTER (WHERE status = 'standby')  AS standby,
                        COUNT(*) FILTER (WHERE status = 'charging') AS charging,
                        COUNT(*) FILTER (WHERE status = 'offline')  AS offline,
                        COUNT(*) FILTER (WHERE status = 'error')    AS errors,
                        AVG(battery)      AS avg_battery,
                        MIN(battery)      AS min_battery,
                        SUM(total_flights) AS total_flights,
                        SUM(total_hours)   AS total_hours,
                        SUM(total_km)      AS total_km
                    FROM {SCHEMA}.drones
                """)
                stats = serialize_row(dict(cur.fetchone()))

                # Последние события телеметрии (аномалии)
                cur.execute(f"""
                    SELECT drone_id, level, category, message, ts
                    FROM {SCHEMA}.events
                    WHERE resolved = false
                    ORDER BY ts DESC LIMIT 10
                """)
                alerts = [serialize_row(dict(r)) for r in cur.fetchall()]

                # Сигнал GPS — среднее по летящим
                cur.execute(f"""
                    SELECT AVG(gps_sats) AS avg_gps,
                           AVG(cpu_load) AS avg_cpu,
                           AVG(ai_confidence) AS avg_ai
                    FROM {SCHEMA}.telemetry
                    WHERE ts > now() - interval '5 minutes'
                """)
                sensors = serialize_row(dict(cur.fetchone()))

                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps({
                            "fleet": drones,
                            "stats": stats,
                            "alerts": alerts,
                            "sensors": sensors,
                        })}

            # История подключений конкретного дрона
            if action == "connections":
                drone_id = params.get("id")
                if not drone_id:
                    return {"statusCode": 400, "headers": CORS,
                            "body": json.dumps({"error": "id required"})}
                cur.execute(
                    f"SELECT * FROM {SCHEMA}.drone_connections WHERE drone_id = %s ORDER BY ts DESC LIMIT 50",
                    (drone_id,)
                )
                rows = [serialize_row(dict(r)) for r in cur.fetchall()]
                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps({"connections": rows, "total": len(rows)})}

            # Один дрон
            drone_id = params.get("id")
            if drone_id:
                cur.execute(f"SELECT * FROM {SCHEMA}.drones WHERE id = %s", (drone_id,))
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS,
                            "body": json.dumps({"error": "Drone not found"})}
                cur.execute(
                    f"""SELECT battery, altitude, speed, heading, lat, lon,
                               roll, pitch, yaw, wind, temperature, cpu_load, ai_confidence, ts
                        FROM {SCHEMA}.telemetry
                        WHERE drone_id = %s ORDER BY ts DESC LIMIT 20""",
                    (drone_id,)
                )
                history = [serialize_row(dict(r)) for r in cur.fetchall()]
                result = serialize_row(dict(row))
                result["telemetry_history"] = history
                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps({"drone": result})}

            # Список флота
            cur.execute(f"SELECT * FROM {SCHEMA}.drones ORDER BY id")
            drones = [serialize_row(dict(r)) for r in cur.fetchall()]
            cur.execute(
                f"""SELECT drone_id, code, name, type, status, progress
                    FROM {SCHEMA}.missions WHERE status IN ('active','planned')"""
            )
            missions = {r["drone_id"]: serialize_row(dict(r)) for r in cur.fetchall()}
            for d in drones:
                d["current_mission"] = missions.get(d["id"])
            flying = sum(1 for d in drones if d["status"] == "flight")
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"drones": drones, "total": len(drones), "flying": flying})}

        # ── POST /?action=register — регистрация нового БПЛА ─────────────────
        elif method == "POST" and action == "register":
            body = json.loads(event.get("body") or "{}")

            # Обязательные поля
            for f in ["id", "name"]:
                if not body.get(f):
                    return {"statusCode": 400, "headers": CORS,
                            "body": json.dumps({"error": f"{f} is required"})}

            drone_id = body["id"].strip().upper()
            # Валидация формата ID: только буквы, цифры, дефис
            if not re.match(r"^[A-Z0-9\-]{2,20}$", drone_id):
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id: only A-Z, 0-9, dash, 2–20 chars"})}

            # Проверка дублей
            cur.execute(f"SELECT id FROM {SCHEMA}.drones WHERE id = %s", (drone_id,))
            if cur.fetchone():
                return {"statusCode": 409, "headers": CORS,
                        "body": json.dumps({"error": f"Drone {drone_id} already exists"})}

            cur.execute(
                f"""INSERT INTO {SCHEMA}.drones
                    (id, name, role, status,
                     hw_weight, hw_motors, hw_battery_cap, hw_max_speed,
                     ai_model, firmware_ver, serial_num, notes, registered_by)
                    VALUES (%s,%s,%s,'offline',%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    drone_id,
                    body["name"],
                    body.get("role", "scout"),
                    float(body.get("hw_weight", 2.0)),
                    int(body.get("hw_motors", 4)),
                    int(body.get("hw_battery_cap", 10000)),
                    int(body.get("hw_max_speed", 90)),
                    body.get("ai_model", "PathNet-v4.2"),
                    body.get("firmware_ver", "1.0.0"),
                    body.get("serial_num", ""),
                    body.get("notes", ""),
                    body.get("registered_by", "ЦУП"),
                )
            )
            # Событие регистрации
            cur.execute(
                f"""INSERT INTO {SCHEMA}.drone_connections (drone_id, event, ip_addr)
                    VALUES (%s, 'registered', %s)""",
                (drone_id, event.get("requestContext", {}).get("identity", {}).get("sourceIp"))
            )
            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"ok": True, "id": drone_id, "name": body["name"]})}

        # ── POST /?action=connect — событие подключения/отключения ───────────
        elif method == "POST" and action == "connect":
            body = json.loads(event.get("body") or "{}")
            drone_id = body.get("drone_id")
            if not drone_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "drone_id required"})}
            cur.execute(
                f"""INSERT INTO {SCHEMA}.drone_connections
                    (drone_id, event, ip_addr, signal_db, link_quality)
                    VALUES (%s, %s, %s, %s, %s)""",
                (
                    drone_id,
                    body.get("event", "connect"),
                    body.get("ip_addr"),
                    body.get("signal_db"),
                    body.get("link_quality"),
                )
            )
            # Обновить last_seen
            cur.execute(
                f"UPDATE {SCHEMA}.drones SET last_seen_at = now() WHERE id = %s",
                (drone_id,)
            )
            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"ok": True})}

        # ── POST /  — телеметрия от борта (без action) ───────────────────────
        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            drone_id = body.get("id")
            if not drone_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}

            fields = ["status", "battery", "altitude", "speed", "heading",
                      "lat", "lon", "wind", "temperature", "vibration", "gps_sats"]
            updates = {f: body[f] for f in fields if f in body}
            if updates:
                set_clause = ", ".join(f"{k} = %s" for k in updates) + ", updated_at = now(), last_seen_at = now()"
                cur.execute(
                    f"UPDATE {SCHEMA}.drones SET {set_clause} WHERE id = %s",
                    list(updates.values()) + [drone_id]
                )

            tel_fields = ["battery", "altitude", "speed", "heading", "lat", "lon",
                          "roll", "pitch", "yaw", "wind", "temperature", "vibration",
                          "gps_sats", "cpu_load", "ai_confidence"]
            tel = {f: body[f] for f in tel_fields if f in body}
            if tel:
                tel["drone_id"] = drone_id
                tel["mission_id"] = body.get("mission_id")
                cols = ", ".join(tel.keys())
                vals = ", ".join(["%s"] * len(tel))
                cur.execute(
                    f"INSERT INTO {SCHEMA}.telemetry ({cols}) VALUES ({vals})",
                    list(tel.values())
                )

            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "updated": drone_id})}

        # ── PATCH /?id=SF-001 — редактирование метаданных из ЦУП ─────────────
        elif method == "PATCH":
            drone_id = params.get("id")
            if not drone_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}
            body = json.loads(event.get("body") or "{}")

            allowed = ["name", "role", "ai_model", "firmware_ver", "serial_num",
                       "notes", "hw_weight", "hw_motors", "hw_battery_cap", "hw_max_speed",
                       "status"]
            updates = {k: body[k] for k in allowed if k in body}
            if not updates:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Nothing to update"})}

            set_clause = ", ".join(f"{k} = %s" for k in updates) + ", updated_at = now()"
            cur.execute(
                f"UPDATE {SCHEMA}.drones SET {set_clause} WHERE id = %s",
                list(updates.values()) + [drone_id]
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True})}

        # ── DELETE /?id=SF-001 — снять дрон с учёта ──────────────────────────
        elif method == "DELETE":
            drone_id = params.get("id")
            if not drone_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}
            # Удаляем связанные записи
            cur.execute(f"DELETE FROM {SCHEMA}.drone_connections WHERE drone_id = %s", (drone_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.telemetry WHERE drone_id = %s", (drone_id,))
            cur.execute(f"DELETE FROM {SCHEMA}.drones WHERE id = %s", (drone_id,))
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "deleted": drone_id})}

        return {"statusCode": 405, "headers": CORS,
                "body": json.dumps({"error": "Method not allowed"})}

    finally:
        cur.close()
        conn.close()
