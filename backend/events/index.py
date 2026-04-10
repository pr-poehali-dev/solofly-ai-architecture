"""
Системные события, алерты и AI-модели.
GET  /          — последние события (фильтр: level, drone_id, unresolved)
GET  /?type=ai  — AI-модели и статистика
POST /          — добавить событие
PATCH /?id=5    — отметить resolved
"""
import os, json
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
    for k in ("ts", "updated_at", "created_at"):
        if d.get(k) and hasattr(d[k], "isoformat"):
            d[k] = d[k].isoformat()
    return d


def handler(event: dict, context) -> dict:
    """Системные события SoloFly — алерты, журнал ИИ, отметка как решённых."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == "GET" and params.get("type") == "ai":
            cur.execute(f"SELECT * FROM {SCHEMA}.ai_models ORDER BY accuracy DESC")
            models = [serialize_row(dict(r)) for r in cur.fetchall()]
            cur.execute(f"SELECT SUM(cycles) as total FROM {SCHEMA}.ai_models")
            cycles = cur.fetchone()
            total_cycles = int(cycles["total"] or 0)
            avg_acc = round(sum(m["accuracy"] for m in models) / len(models), 1) if models else 0
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "models": models,
                        "total_models": len(models),
                        "total_cycles": total_cycles,
                        "avg_accuracy": avg_acc,
                    })}

        if method == "GET":
            limit = min(int(params.get("limit", 20)), 100)
            where_parts, args = [], []
            if params.get("level"):
                where_parts.append("level = %s")
                args.append(params["level"])
            if params.get("drone_id"):
                where_parts.append("drone_id = %s")
                args.append(params["drone_id"])
            if params.get("unresolved") == "true":
                where_parts.append("resolved = false")

            where = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""
            cur.execute(
                f"SELECT * FROM {SCHEMA}.events {where} ORDER BY ts DESC LIMIT %s",
                args + [limit]
            )
            rows = [serialize_row(dict(r)) for r in cur.fetchall()]
            cur.execute(
                f"SELECT COUNT(*) as cnt FROM {SCHEMA}.events WHERE resolved = false"
            )
            unresolved = int(cur.fetchone()["cnt"])
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"events": rows, "total": len(rows), "unresolved": unresolved})}

        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            msg = body.get("message")
            if not msg:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "message required"})}
            cur.execute(
                f"""INSERT INTO {SCHEMA}.events (drone_id, mission_id, level, category, message)
                    VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (body.get("drone_id"), body.get("mission_id"),
                 body.get("level", "info"), body.get("category", "system"), msg)
            )
            new_id = cur.fetchone()["id"]
            conn.commit()
            return {"statusCode": 201, "headers": CORS,
                    "body": json.dumps({"ok": True, "id": new_id})}

        elif method == "PATCH":
            event_id = params.get("id")
            if not event_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "id required"})}
            cur.execute(
                f"UPDATE {SCHEMA}.events SET resolved=true WHERE id=%s", (int(event_id),)
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "resolved": event_id})}

    finally:
        cur.close()
        conn.close()
