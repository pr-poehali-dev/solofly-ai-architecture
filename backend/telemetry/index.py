"""
Телеметрия БПЛА — запись и чтение временных рядов.
GET  /?drone_id=SF-001&limit=50 — последние N точек телеметрии
POST /?action=simulate           — генерировать тик телеметрии для летящих дронов
POST /                           — записать пакет телеметрии
"""
import os, json, random, math
from datetime import datetime, timezone
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
    for k in ("ts", "created_at", "updated_at"):
        if d.get(k) and hasattr(d[k], "isoformat"):
            d[k] = d[k].isoformat()
    return d


def simulate_telemetry(drone: dict, step: int) -> dict:
    if drone["status"] != "flight":
        return None
    alt = float(drone["altitude"] or 0) + random.uniform(-2, 2)
    alt = max(10, min(300, alt))
    speed = float(drone["speed"] or 0) + random.uniform(-3, 3)
    speed = max(5, min(float(drone["hw_max_speed"] or 90), speed))
    heading = (float(drone["heading"] or 0) + random.uniform(-5, 5)) % 360
    battery = max(0, int(drone["battery"] or 50) - random.randint(0, 1))
    lat = float(drone["lat"] or 0) + math.sin(step * 0.1) * 0.0001
    lon = float(drone["lon"] or 0) + math.cos(step * 0.1) * 0.0001
    return {
        "drone_id": drone["id"],
        "battery": battery,
        "altitude": round(alt, 1),
        "speed": round(speed, 1),
        "heading": round(heading, 1),
        "lat": round(lat, 8),
        "lon": round(lon, 8),
        "roll": round(random.uniform(-5, 5), 2),
        "pitch": round(random.uniform(-3, 3), 2),
        "yaw": round(heading, 1),
        "wind": round(float(drone["wind"] or 0) + random.uniform(-0.5, 0.5), 2),
        "temperature": int(drone["temperature"] or 30) + random.randint(-1, 1),
        "vibration": "норма" if random.random() > 0.05 else "умеренная",
        "gps_sats": max(8, int(drone["gps_sats"] or 14) + random.randint(-1, 1)),
        "cpu_load": random.randint(55, 80),
        "ai_confidence": random.randint(88, 99),
    }


def handler(event: dict, context) -> dict:
    """Телеметрия БПЛА — запись и чтение данных полётов в реальном времени."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "POST" and params.get("action") == "simulate":
            cur.execute(f"SELECT * FROM {SCHEMA}.drones WHERE status = 'flight'")
            flying = cur.fetchall()
            inserted = 0
            step = int(datetime.now(timezone.utc).timestamp()) % 1000
            for drone in flying:
                tel = simulate_telemetry(serialize_row(dict(drone)), step)
                if tel:
                    cols = ", ".join(tel.keys())
                    vals = ", ".join(["%s"] * len(tel))
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.telemetry ({cols}) VALUES ({vals})",
                        list(tel.values())
                    )
                    cur.execute(
                        f"""UPDATE {SCHEMA}.drones
                            SET battery=%s, altitude=%s, speed=%s, heading=%s,
                                lat=%s, lon=%s,
                                gps_sats=%s, wind=%s, temperature=%s, vibration=%s,
                                updated_at=now()
                            WHERE id=%s""",
                        (tel["battery"], tel["altitude"], tel["speed"],
                         tel["heading"], tel["lat"], tel["lon"],
                         tel.get("gps_sats", 14), tel.get("wind", 0),
                         tel.get("temperature", 20), tel.get("vibration", "норма"),
                         tel["drone_id"])
                    )
                    inserted += 1
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "simulated": inserted})}

        if method == "GET":
            drone_id = params.get("drone_id")
            if not drone_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "drone_id required"})}

            mission_id = params.get("mission_id")
            limit = min(int(params.get("limit", 50)), 500)
            where = "WHERE drone_id = %s"
            args = [drone_id]
            if mission_id:
                where += " AND mission_id = %s"
                args.append(int(mission_id))

            cur.execute(
                f"""SELECT id, ts, battery, altitude, speed, heading,
                           lat, lon, roll, pitch, yaw, wind,
                           temperature, cpu_load, ai_confidence
                    FROM {SCHEMA}.telemetry {where}
                    ORDER BY ts DESC LIMIT %s""",
                args + [limit]
            )
            rows = [serialize_row(dict(r)) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"drone_id": drone_id, "points": rows, "count": len(rows)})}

        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            drone_id = body.get("drone_id")
            if not drone_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "drone_id required"})}

            fields = ["battery", "altitude", "speed", "heading", "lat", "lon",
                      "roll", "pitch", "yaw", "wind", "temperature", "vibration",
                      "gps_sats", "cpu_load", "ai_confidence", "mission_id"]
            tel = {"drone_id": drone_id}
            for f in fields:
                if f in body:
                    tel[f] = body[f]

            cols = ", ".join(tel.keys())
            vals = ", ".join(["%s"] * len(tel))
            cur.execute(
                f"INSERT INTO {SCHEMA}.telemetry ({cols}) VALUES ({vals}) RETURNING id",
                list(tel.values())
            )
            new_id = cur.fetchone()["id"]

            upd = {k: body[k] for k in ["battery", "altitude", "speed", "heading", "lat", "lon"] if k in body}
            if upd:
                set_c = ", ".join(f"{k}=%s" for k in upd) + ", updated_at=now()"
                cur.execute(
                    f"UPDATE {SCHEMA}.drones SET {set_c} WHERE id=%s",
                    list(upd.values()) + [drone_id]
                )

            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"ok": True, "id": new_id})}

    finally:
        cur.close()
        conn.close()