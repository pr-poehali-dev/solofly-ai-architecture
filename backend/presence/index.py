"""
Присутствие операторов на карте — совместная работа в реальном времени.
GET  /                    — список активных операторов (онлайн за последние 30 сек)
POST /                    — обновить свою позицию (upsert)
DELETE /?operator_id=xxx  — убрать оператора (выход)
"""
import os, json
from datetime import datetime, timezone
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

# Цвета для операторов (ротация по индексу)
OPERATOR_COLORS = [
    "#00d4ff", "#00ff88", "#ff9500", "#a78bfa",
    "#f97316", "#ec4899", "#14b8a6", "#eab308",
]

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def safe_val(v):
    if isinstance(v, Decimal):
        return float(v)
    return v

def serialize_row(row: dict) -> dict:
    d = {k: safe_val(v) for k, v in row.items()}
    if d.get("updated_at") and hasattr(d["updated_at"], "isoformat"):
        d["updated_at"] = d["updated_at"].isoformat()
    return d


def handler(event: dict, context) -> dict:
    """Присутствие операторов SoloFly — совместная работа на карте."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── GET / — список операторов онлайн (активны за 30 сек) ────────────
        if method == "GET":
            cur.execute(f"""
                SELECT id, operator_id, name, color, lat, lon, heading, page, updated_at
                FROM {SCHEMA}.operator_presence
                WHERE updated_at > now() - interval '30 seconds'
                ORDER BY updated_at DESC
            """)
            operators = [serialize_row(dict(r)) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"operators": operators, "total": len(operators)})}

        # ── POST / — обновить позицию (upsert) ───────────────────────────────
        elif method == "POST":
            body = json.loads(event.get("body") or "{}")
            operator_id = body.get("operator_id")
            lat         = body.get("lat")
            lon         = body.get("lon")
            if not operator_id or lat is None or lon is None:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "operator_id, lat, lon required"})}

            name    = body.get("name", "Оператор")
            heading = body.get("heading", 0)
            page    = body.get("page", "dashboard")

            # Определяем цвет на основе порядкового номера оператора
            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.operator_presence
                WHERE operator_id != %s
            """, (operator_id,))
            idx   = int(cur.fetchone()["cnt"])
            color = body.get("color") or OPERATOR_COLORS[idx % len(OPERATOR_COLORS)]

            cur.execute(f"""
                INSERT INTO {SCHEMA}.operator_presence
                    (operator_id, name, color, lat, lon, heading, page, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, now())
                ON CONFLICT (operator_id) DO UPDATE SET
                    name       = EXCLUDED.name,
                    color      = EXCLUDED.color,
                    lat        = EXCLUDED.lat,
                    lon        = EXCLUDED.lon,
                    heading    = EXCLUDED.heading,
                    page       = EXCLUDED.page,
                    updated_at = now()
                RETURNING id, color
            """, (operator_id, name, color, lat, lon, heading, page))
            row = cur.fetchone()
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "id": row["id"], "color": row["color"]})}

        # ── DELETE /?operator_id=xxx — оператор вышел ────────────────────────
        elif method == "DELETE":
            operator_id = params.get("operator_id")
            if not operator_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "operator_id required"})}
            cur.execute(
                f"DELETE FROM {SCHEMA}.operator_presence WHERE operator_id = %s",
                (operator_id,)
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True})}

        return {"statusCode": 405, "headers": CORS,
                "body": json.dumps({"error": "Method not allowed"})}

    finally:
        cur.close()
        conn.close()
