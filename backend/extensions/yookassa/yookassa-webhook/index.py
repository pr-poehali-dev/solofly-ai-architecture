"""YooKassa webhook handler — активирует план пользователя после оплаты."""
import json
import os
import base64
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import HTTPError

import psycopg2
from psycopg2.extras import RealDictCursor

HEADERS = {'Content-Type': 'application/json'}
YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments"
SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def verify_payment(payment_id: str, shop_id: str, secret_key: str) -> dict | None:
    """Верифицируем платёж напрямую через YooKassa API (безопаснее подписи)."""
    auth = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
    req = Request(
        f"{YOOKASSA_API_URL}/{payment_id}",
        headers={'Authorization': f'Basic {auth}', 'Content-Type': 'application/json'},
        method='GET'
    )
    try:
        with urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode())
    except Exception:
        return None


def activate_plan(cur, user_id: int, plan_id: str, billing: str):
    """Устанавливаем план и рассчитываем срок действия."""
    months = 12 if billing == 'year' else 1
    cur.execute(
        f"""UPDATE {SCHEMA}.users
            SET plan_id = %s,
                plan_billing = %s,
                plan_expires_at = now() + (%s * interval '1 month')
            WHERE id = %s""",
        (plan_id, billing, months, user_id)
    )


def handler(event: dict, context) -> dict:
    """Webhook от YooKassa — активирует подписку после успешной оплаты."""
    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

    body = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        body = base64.b64decode(body).decode('utf-8')

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Invalid JSON'})}

    payment_object = data.get('object', {})
    payment_id = payment_object.get('id', '')
    metadata = payment_object.get('metadata', {})

    if not payment_id:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Missing payment_id'})}

    shop_id    = os.environ.get('YOOKASSA_SHOP_ID', '')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY', '')

    # Верифицируем платёж через API (защита от подделки)
    if shop_id and secret_key:
        verified = verify_payment(payment_id, shop_id, secret_key)
        if not verified:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Payment verification failed'})}
        payment_status = verified.get('status', '')
        # Перечитываем metadata из верифицированного ответа
        metadata = verified.get('metadata', metadata)
    else:
        payment_status = payment_object.get('status', '')

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Находим заказ
        cur.execute(
            f"SELECT id, status, user_id, plan_id, plan_billing FROM {SCHEMA}.orders WHERE yookassa_payment_id = %s",
            (payment_id,)
        )
        order = cur.fetchone()

        if not order:
            # Пробуем найти по order_id из metadata
            order_id_meta = metadata.get('order_id')
            if order_id_meta:
                cur.execute(
                    f"SELECT id, status, user_id, plan_id, plan_billing FROM {SCHEMA}.orders WHERE id = %s",
                    (int(order_id_meta),)
                )
                order = cur.fetchone()

        if not order:
            return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Order not found'})}

        now = datetime.now(timezone.utc).isoformat()

        if payment_status == 'succeeded' and order['status'] != 'paid':
            # Помечаем заказ оплаченным
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET status='paid', paid_at=%s, updated_at=%s WHERE id=%s",
                (now, now, order['id'])
            )

            # Активируем план пользователя если привязан user_id
            if order['user_id']:
                activate_plan(cur, order['user_id'], order['plan_id'], order['plan_billing'])

            conn.commit()

        elif payment_status == 'canceled' and order['status'] not in ('paid', 'canceled'):
            cur.execute(
                f"UPDATE {SCHEMA}.orders SET status='canceled', updated_at=%s WHERE id=%s",
                (now, order['id'])
            )
            conn.commit()

        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'ok': True, 'status': payment_status})}

    except Exception as e:
        conn.rollback()
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
    finally:
        cur.close()
        conn.close()
