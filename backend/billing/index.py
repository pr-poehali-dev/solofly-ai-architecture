"""
Биллинг SoloFly — тарифные планы и лимиты.
GET  /                       — список всех планов
GET  /?action=my             — текущий план пользователя
GET  /?action=limits         — текущие лимиты и использование
POST /?action=upgrade        — сменить тариф (plan_id, billing)
"""
import os, json
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

VALID_PLANS = ("free", "pro", "team", "enterprise")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def safe_val(v):
    return float(v) if isinstance(v, Decimal) else v


def serialize(row: dict) -> dict:
    d = {k: safe_val(v) for k, v in row.items()}
    for k in ("plan_expires_at", "created_at"):
        if d.get(k) and hasattr(d[k], "isoformat"):
            d[k] = d[k].isoformat()
    return d


def get_user_id(event, cur) -> int | None:
    """Получить user_id из X-Auth-Token заголовка."""
    headers = event.get("headers") or {}
    token   = headers.get("x-auth-token") or headers.get("X-Auth-Token")
    if not token:
        return None
    cur.execute(f"""
        SELECT u.id FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > now()
    """, (token,))
    row = cur.fetchone()
    return row["id"] if row else None


def handler(event: dict, context) -> dict:
    """Биллинг SoloFly — планы, лимиты, апгрейд."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── GET / — список всех планов ───────────────────────────────────────
        if method == "GET" and not action:
            cur.execute(f"SELECT * FROM {SCHEMA}.plans ORDER BY price_month ASC")
            plans = [serialize(dict(r)) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"plans": plans})}

        # ── GET /?action=my — текущий план пользователя ──────────────────────
        elif method == "GET" and action == "my":
            user_id = get_user_id(event, cur)
            if not user_id:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            cur.execute(f"""
                SELECT u.plan_id, u.plan_billing, u.plan_expires_at,
                       p.name, p.price_month, p.price_year,
                       p.max_drones, p.max_missions, p.features, p.is_popular
                FROM {SCHEMA}.users u
                JOIN {SCHEMA}.plans p ON p.id = u.plan_id
                WHERE u.id = %s
            """, (user_id,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 404, "headers": CORS,
                        "body": json.dumps({"error": "Пользователь не найден"})}

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"plan": serialize(dict(row))})}

        # ── GET /?action=limits — лимиты и текущее использование ────────────
        elif method == "GET" and action == "limits":
            user_id = get_user_id(event, cur)
            if not user_id:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            # Тариф пользователя
            cur.execute(f"""
                SELECT p.max_drones, p.max_missions, p.id as plan_id
                FROM {SCHEMA}.users u
                JOIN {SCHEMA}.plans p ON p.id = u.plan_id
                WHERE u.id = %s
            """, (user_id,))
            plan = dict(cur.fetchone())

            # Текущее использование
            cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.drones")
            drones_used = int(cur.fetchone()["cnt"])

            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.missions
                WHERE created_at > date_trunc('month', now())
            """)
            missions_used = int(cur.fetchone()["cnt"])

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "plan_id":       plan["plan_id"],
                        "drones":        {"used": drones_used,  "max": plan["max_drones"]},
                        "missions":      {"used": missions_used, "max": plan["max_missions"]},
                        "drones_ok":     plan["max_drones"]   == -1 or drones_used   < plan["max_drones"],
                        "missions_ok":   plan["max_missions"] == -1 or missions_used < plan["max_missions"],
                    })}

        # ── POST /?action=upgrade — сменить тариф ────────────────────────────
        elif method == "POST" and action == "upgrade":
            user_id = get_user_id(event, cur)
            if not user_id:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            body    = json.loads(event.get("body") or "{}")
            plan_id = body.get("plan_id")
            billing = body.get("billing", "month")

            if plan_id not in VALID_PLANS:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Неверный тарифный план"})}

            # Рассчитываем expires_at
            if plan_id == "free":
                expires_sql = "NULL"
                expires_arg = None
            else:
                interval = "1 year" if billing == "year" else "1 month"
                cur.execute(f"SELECT now() + interval '{interval}' AS exp")
                expires_arg = cur.fetchone()["exp"].isoformat()
                expires_sql = "%s"

            cur.execute(
                f"""UPDATE {SCHEMA}.users
                    SET plan_id = %s, plan_billing = %s, plan_expires_at = {expires_sql}
                    WHERE id = %s""",
                ([plan_id, billing, expires_arg, user_id] if expires_arg else [plan_id, billing, user_id])
            )
            conn.commit()

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "ok":      True,
                        "plan_id": plan_id,
                        "billing": billing,
                        "expires": expires_arg,
                    })}

        return {"statusCode": 400, "headers": CORS,
                "body": json.dumps({"error": "Unknown action"})}

    finally:
        cur.close()
        conn.close()
