"""
Биллинг SoloFly — тарифные планы и оплата.
GET  /                         — список всех планов
GET  /?action=my               — текущий план пользователя
GET  /?action=limits           — лимиты и использование
POST /?action=create-payment   — создать платёж YooKassa (возвращает payment_url)
POST /?action=upgrade          — вручную сменить тариф (только для free)
"""
import os, json, uuid, base64
from decimal import Decimal
from datetime import datetime, timezone
from urllib.request import Request, urlopen
import psycopg2
from psycopg2.extras import RealDictCursor

YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments"

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
            plan_row = cur.fetchone()
            if not plan_row:
                return {"statusCode": 404, "headers": CORS,
                        "body": json.dumps({"error": "Тариф не найден"})}
            plan = dict(plan_row)

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

        # ── POST /?action=create-payment — создать платёж YooKassa ─────────
        elif method == "POST" and action == "create-payment":
            user_id = get_user_id(event, cur)
            if not user_id:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            body    = json.loads(event.get("body") or "{}")
            plan_id = body.get("plan_id")
            billing = body.get("billing", "month")  # month | year

            if plan_id not in VALID_PLANS or plan_id == "free":
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Неверный план для оплаты"})}

            # Получаем цену плана из БД
            cur.execute(f"SELECT * FROM {SCHEMA}.plans WHERE id = %s", (plan_id,))
            plan = cur.fetchone()
            if not plan:
                return {"statusCode": 404, "headers": CORS,
                        "body": json.dumps({"error": "План не найден"})}

            # Цена: годовая или месячная
            price = float(plan["price_year"] if billing == "year" else plan["price_month"])
            if price <= 0:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Цена плана не задана"})}

            # Получаем email пользователя
            cur.execute(f"SELECT email, name FROM {SCHEMA}.users WHERE id = %s", (user_id,))
            user_row = cur.fetchone()
            if not user_row:
                return {"statusCode": 404, "headers": CORS,
                        "body": json.dumps({"error": "Пользователь не найден"})}

            shop_id    = os.environ.get("YOOKASSA_SHOP_ID", "")
            secret_key = os.environ.get("YOOKASSA_SECRET_KEY", "")
            if not shop_id or not secret_key:
                return {"statusCode": 500, "headers": CORS,
                        "body": json.dumps({"error": "Платёжная система не настроена"})}

            # Создаём заказ в БД
            billing_label = "годовая" if billing == "year" else "месячная"
            order_number  = f"SF-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
            description   = f"SoloFly {plan['name']} ({billing_label} подписка)"

            cur.execute(
                f"""INSERT INTO {SCHEMA}.orders
                    (order_number, user_id, user_email, user_name, amount,
                     plan_id, plan_billing, status)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,'pending') RETURNING id""",
                (order_number, user_id, user_row["email"], user_row["name"],
                 price, plan_id, billing)
            )
            order_id = cur.fetchone()["id"]
            conn.commit()

            # Создаём платёж в YooKassa
            return_url = body.get("return_url",
                "https://solofly-ai-architecture.poehali.dev/?paid=1")
            auth = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
            payload = {
                "amount": {"value": f"{price:.2f}", "currency": "RUB"},
                "capture": True,
                "confirmation": {"type": "redirect", "return_url": return_url},
                "description": f"{description} ({order_number})",
                "receipt": {
                    "customer": {"email": user_row["email"]},
                    "items": [{
                        "description": plan["name"][:128],
                        "quantity": "1.000",
                        "amount": {"value": f"{price:.2f}", "currency": "RUB"},
                        "vat_code": 1,
                        "payment_subject": "service",
                        "payment_mode": "full_payment",
                    }]
                },
                "metadata": {
                    "order_id": str(order_id),
                    "order_number": order_number,
                    "user_id": str(user_id),
                    "plan_id": plan_id,
                    "billing": billing,
                },
            }
            yk_req = Request(
                YOOKASSA_API_URL,
                data=json.dumps(payload).encode(),
                headers={
                    "Authorization": f"Basic {auth}",
                    "Idempotence-Key": str(uuid.uuid4()),
                    "Content-Type": "application/json",
                },
                method="POST"
            )
            with urlopen(yk_req, timeout=30) as resp:
                yk = json.loads(resp.read().decode())

            payment_url = yk.get("confirmation", {}).get("confirmation_url", "")
            payment_id  = yk.get("id", "")

            # Сохраняем payment_id и URL в заказе
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET yookassa_payment_id=%s, payment_url=%s WHERE id=%s",
                (payment_id, payment_url, order_id)
            )
            conn.commit()

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "ok":          True,
                        "payment_url": payment_url,
                        "order_number": order_number,
                        "amount":      price,
                    })}

        # ── POST /?action=upgrade — вручную сменить тариф ────────────────────
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

            # Рассчитываем expires_at безопасным способом
            if plan_id == "free":
                cur.execute(
                    f"UPDATE {SCHEMA}.users SET plan_id=%s, plan_billing=%s, plan_expires_at=NULL WHERE id=%s",
                    (plan_id, billing, user_id)
                )
                expires_arg = None
            else:
                months = 12 if billing == "year" else 1
                cur.execute(
                    f"""UPDATE {SCHEMA}.users
                        SET plan_id=%s, plan_billing=%s,
                            plan_expires_at = now() + (%s * interval '1 month')
                        WHERE id=%s""",
                    (plan_id, billing, months, user_id)
                )
                cur.execute("SELECT now() + (%s * interval '1 month') AS exp", (months,))
                expires_row = cur.fetchone()
                expires_arg = expires_row["exp"].isoformat() if expires_row else None
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