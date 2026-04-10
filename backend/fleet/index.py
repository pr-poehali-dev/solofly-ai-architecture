"""
Флот БПЛА — получение списка дронов и обновление статуса.
GET  / — список всех дронов с последней телеметрией
GET  /?id=SF-001 — один дрон
POST / — обновить статус/телеметрию дрона (от борта)
"""
import os, json
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    for k in ("created_at", "updated_at", "ts"):
        if d.get(k) and hasattr(d[k], "isoformat"):
            d[k] = d[k].isoformat()
    return d


def handler(event: dict, context) -> dict:
    """Управление флотом БПЛА — чтение и обновление состояния дронов."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET":
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
            else:
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
                set_clause = ", ".join(f"{k} = %s" for k in updates) + ", updated_at = now()"
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

    finally:
        cur.close()
        conn.close()
