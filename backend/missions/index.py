"""
Миссии БПЛА — CRUD и управление статусом.
GET  /         — список миссий (фильтр: status, drone_id)
GET  /?id=1    — одна миссия
POST /         — создать миссию
PATCH /?id=1   — обновить статус/прогресс
"""
import os, json
from datetime import datetime, timezone
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
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
    for k in ("start_time", "eta", "ended_at", "created_at"):
        if d.get(k) and hasattr(d[k], "isoformat"):
            d[k] = d[k].isoformat()
    # waypoints_json уже является dict/list из psycopg2 — оставляем как есть
    if "waypoints_json" not in d:
        d["waypoints_json"] = []
    return d


def handler(event: dict, context) -> dict:
    """Управление миссиями БПЛА — создание, мониторинг, обновление прогресса."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET":
            mission_id = params.get("id")
            if mission_id:
                cur.execute(
                    f"""SELECT m.*, d.name as drone_name, d.status as drone_status
                        FROM {SCHEMA}.missions m
                        LEFT JOIN {SCHEMA}.drones d ON m.drone_id = d.id
                        WHERE m.id = %s""", (mission_id,)
                )
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS,
                            "body": json.dumps({"error": "Mission not found"})}
                return {"statusCode": 200, "headers": CORS,
                        "body": json.dumps({"mission": serialize_row(dict(row))})}

            where_parts, args = [], []
            if params.get("status"):
                where_parts.append("m.status = %s")
                args.append(params["status"])
            if params.get("drone_id"):
                where_parts.append("m.drone_id = %s")
                args.append(params["drone_id"])

            where = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""
            cur.execute(
                f"""SELECT m.*, d.name as drone_name
                    FROM {SCHEMA}.missions m
                    LEFT JOIN {SCHEMA}.drones d ON m.drone_id = d.id
                    {where} ORDER BY m.created_at DESC LIMIT 50""",
                args
            )
            rows = [serialize_row(dict(r)) for r in cur.fetchall()]
            stats = {"active": 0, "planned": 0, "done": 0, "aborted": 0}
            for r in rows:
                s = r.get("status", "")
                if s in stats:
                    stats[s] += 1
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"missions": rows, "total": len(rows), "stats": stats})}

        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            for f in ["code", "name", "drone_id", "type"]:
                if not body.get(f):
                    return {"statusCode": 400, "headers": CORS,
                            "body": json.dumps({"error": f"{f} is required"})}
            import json as _json
            wps_json = body.get("waypoints_json", [])
            wps_count = len(wps_json) if wps_json else body.get("waypoints", 0)
            cur.execute(
                f"""INSERT INTO {SCHEMA}.missions
                    (code, name, drone_id, type, status, waypoints, waypoints_json, tasks,
                     altitude_m, weather_wind, weather_vis, weather_temp, weather_risk)
                    VALUES (%s,%s,%s,%s,'planned',%s,%s,%s,%s,%s,%s,%s,%s)
                    RETURNING id, code""",
                (body["code"], body["name"], body["drone_id"], body["type"],
                 wps_count, _json.dumps(wps_json), body.get("tasks", []),
                 body.get("altitude_m", 60),
                 body.get("weather_wind", 0), body.get("weather_vis", "хорошая"),
                 body.get("weather_temp", 15), body.get("weather_risk", "low"))
            )
            new = cur.fetchone()
            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"ok": True, "id": new["id"], "code": new["code"]})}

        elif method == "PATCH":
            mission_id = params.get("id")
            if not mission_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}
            body = json.loads(event.get("body") or "{}")
            allowed = ["status", "progress", "obstacles_avoided",
                       "route_adjustments", "distance_km", "waypoints_json"]
            updates = {f: body[f] for f in allowed if f in body}
            if updates.get("status") in ("done", "aborted"):
                updates["ended_at"] = datetime.now(timezone.utc).isoformat()
            if updates.get("status") == "active":
                updates["start_time"] = datetime.now(timezone.utc).isoformat()
            # waypoints_json — JSONB, сериализуем строкой
            if "waypoints_json" in updates:
                updates["waypoints_json"] = json.dumps(updates["waypoints_json"])
                updates["waypoints"] = len(body.get("waypoints_json", []))
            if not updates:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "nothing to update"})}
            set_c = ", ".join(f"{k}=%s" for k in updates)
            cur.execute(
                f"UPDATE {SCHEMA}.missions SET {set_c} WHERE id=%s",
                list(updates.values()) + [int(mission_id)]
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "updated": mission_id})}

    finally:
        cur.close()
        conn.close()