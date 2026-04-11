"""
Приём телеметрии с реального дрона по токену (MAVLink → HTTP).
POST / — отправить пакет телеметрии (авторизация по заголовку X-Drone-Token)

Raspberry Pi на борту отправляет POST каждые 1-2 секунды.
Поля (все опциональны кроме token):
  token, lat, lon, altitude, speed, heading, battery,
  roll, pitch, yaw, wind, temperature, gps_sats,
  vibration, cpu_load, mode, armed
"""
import os, json
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Drone-Token",
}

TELEMETRY_FIELDS = [
    "lat", "lon", "altitude", "speed", "heading",
    "battery", "roll", "pitch", "yaw", "wind",
    "temperature", "gps_sats", "vibration", "cpu_load",
    "ai_confidence", "mission_id",
]

DRONE_UPDATE_FIELDS = ["battery", "altitude", "speed", "heading", "lat", "lon"]

# Маппинг режимов Ardupilot → читаемое название
MODE_MAP = {
    "0": "STABILIZE", "2": "ALT_HOLD", "3": "AUTO",
    "4": "GUIDED",    "5": "LOITER",   "6": "RTL",
    "9": "LAND",      "16": "POSHOLD", "19": "BRAKE",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """Приём телеметрии с реального дрона (Ardupilot/MAVLink → HTTP)."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": CORS,
                "body": json.dumps({"error": "Only POST allowed"})}

    headers = event.get("headers") or {}
    body    = json.loads(event.get("body") or "{}")

    # Токен из заголовка или тела
    token = (headers.get("x-drone-token")
             or headers.get("X-Drone-Token")
             or body.get("token", ""))

    if not token:
        return {"statusCode": 401, "headers": CORS,
                "body": json.dumps({"error": "X-Drone-Token required"})}

    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Проверяем токен
        cur.execute(
            f"SELECT id, status FROM {SCHEMA}.drones WHERE drone_token = %s",
            (token,)
        )
        drone = cur.fetchone()
        if not drone:
            return {"statusCode": 403, "headers": CORS,
                    "body": json.dumps({"error": "Неверный токен дрона"})}

        drone_id = drone["id"]

        # Статус armed → flight / idle
        armed   = body.get("armed")
        new_status = None
        if armed is True:
            new_status = "flight"
        elif armed is False and drone["status"] == "flight":
            new_status = "idle"

        # Собираем запись телеметрии
        tel = {"drone_id": drone_id}
        for f in TELEMETRY_FIELDS:
            if f in body and body[f] is not None:
                tel[f] = body[f]

        # Режим полёта
        mode_raw = str(body.get("mode", ""))
        if mode_raw:
            tel["flight_mode"] = MODE_MAP.get(mode_raw, mode_raw)

        if len(tel) > 1:  # есть данные кроме drone_id
            cols = ", ".join(tel.keys())
            vals = ", ".join(["%s"] * len(tel))
            cur.execute(
                f"INSERT INTO {SCHEMA}.telemetry ({cols}) VALUES ({vals}) RETURNING id",
                list(tel.values())
            )
            tel_id = cur.fetchone()["id"]
        else:
            tel_id = None

        # Обновляем дрон
        upd = {k: body[k] for k in DRONE_UPDATE_FIELDS if k in body and body[k] is not None}
        if new_status:
            upd["status"] = new_status
        upd["last_seen"] = "now()"

        if upd:
            # now() — SQL функция, нельзя через %s
            set_parts = []
            set_vals  = []
            for k, v in upd.items():
                if k == "last_seen":
                    set_parts.append("last_seen=now(), updated_at=now()")
                else:
                    set_parts.append(f"{k}=%s")
                    set_vals.append(v)
            set_clause = ", ".join(set_parts)
            cur.execute(
                f"UPDATE {SCHEMA}.drones SET {set_clause} WHERE id=%s",
                set_vals + [drone_id]
            )

        conn.commit()

        return {"statusCode": 200, "headers": CORS,
                "body": json.dumps({
                    "ok":       True,
                    "drone_id": drone_id,
                    "tel_id":   tel_id,
                    "status":   new_status or drone["status"],
                })}

    finally:
        cur.close()
        conn.close()