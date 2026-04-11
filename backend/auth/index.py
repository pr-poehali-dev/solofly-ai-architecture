"""
Авторизация SoloFly.
POST  /?action=register  — регистрация (email, password, name, consent=true)
POST  /?action=login     — вход (email, password) → token
POST  /?action=logout    — выход
POST  /?action=delete    — удаление аккаунта (152-ФЗ, право на забвение)
GET   /?action=me        — данные текущего пользователя
PATCH /?action=update    — изменить имя, email, пароль, цвет аватара
"""
import os, json, secrets, hashlib, re
from datetime import datetime, timezone
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}

AVATAR_COLORS = ["#00d4ff", "#00ff88", "#a78bfa", "#f97316", "#ec4899", "#14b8a6"]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_token(event: dict) -> str | None:
    headers = event.get("headers") or {}
    # Из заголовка X-Auth-Token
    token = headers.get("x-auth-token") or headers.get("X-Auth-Token")
    if token:
        return token
    # Из Cookie (платформа проксирует как X-Cookie)
    cookie_header = headers.get("x-cookie") or headers.get("X-Cookie") or ""
    for part in cookie_header.split(";"):
        k, _, v = part.strip().partition("=")
        if k.strip() == "sf_token":
            return v.strip()
    return None


def make_cookie(token: str) -> str:
    return f"sf_token={token}; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly"


def handler(event: dict, context) -> dict:
    """Авторизация SoloFly — регистрация, вход, выход, профиль."""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    conn = get_conn()
    cur  = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── POST /?action=register ────────────────────────────────────────────
        if method == "POST" and action == "register":
            body  = json.loads(event.get("body") or "{}")
            email = (body.get("email") or "").strip().lower()
            name  = (body.get("name") or "").strip()
            pwd   = body.get("password") or ""

            if not email or not pwd:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "email и password обязательны"})}
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Некорректный email"})}
            if len(pwd) < 6:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Пароль минимум 6 символов"})}
            # 152-ФЗ: регистрация без согласия запрещена
            if not body.get("consent"):
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Необходимо согласие на обработку персональных данных"})}

            # Проверяем уникальность email
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
            if cur.fetchone():
                return {"statusCode": 409, "headers": CORS,
                        "body": json.dumps({"error": "Этот email уже зарегистрирован"})}

            # Определяем цвет аватара
            cur.execute(f"SELECT COUNT(*) as cnt FROM {SCHEMA}.users")
            idx   = int(cur.fetchone()["cnt"])
            color = AVATAR_COLORS[idx % len(AVATAR_COLORS)]

            pwd_hash = hash_password(pwd)
            cur.execute(
                f"""INSERT INTO {SCHEMA}.users
                    (email, name, password_hash, avatar_color, consent_given, consent_given_at)
                    VALUES (%s, %s, %s, %s, true, now()) RETURNING id, role""",
                (email, name or email.split("@")[0], pwd_hash, color)
            )
            row     = cur.fetchone()
            user_id = row["id"]
            role    = row["role"]

            # Логируем согласие (152-ФЗ)
            ip    = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp")
            ua    = (event.get("headers") or {}).get("user-agent", "")
            cur.execute(
                f"""INSERT INTO {SCHEMA}.consent_log (user_id, action, ip_addr, user_agent)
                    VALUES (%s, 'given', %s, %s)""",
                (user_id, ip, ua)
            )

            # Создаём сессию
            token = secrets.token_urlsafe(32)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
                (token, user_id)
            )
            conn.commit()

            resp_headers = {**CORS, "X-Set-Cookie": make_cookie(token)}
            return {"statusCode": 201, "headers": resp_headers,
                    "body": json.dumps({
                        "ok":    True,
                        "token": token,
                        "user":  {"id": user_id, "email": email, "name": name or email.split("@")[0],
                                  "role": role, "avatar_color": color},
                    })}

        # ── POST /?action=login ───────────────────────────────────────────────
        elif method == "POST" and action == "login":
            body  = json.loads(event.get("body") or "{}")
            email = (body.get("email") or "").strip().lower()
            pwd   = body.get("password") or ""
            ip    = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp", "unknown")

            if not email or not pwd:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "email и password обязательны"})}

            # Rate-limit: не более 10 неудачных попыток с одного IP за 15 минут
            cur.execute(f"""
                SELECT COUNT(*) as cnt FROM {SCHEMA}.login_attempts
                WHERE ip = %s AND success = false
                  AND ts > now() - interval '15 minutes'
            """, (ip,))
            fail_count = int(cur.fetchone()["cnt"])
            if fail_count >= 10:
                return {"statusCode": 429, "headers": CORS,
                        "body": json.dumps({"error": "Слишком много попыток. Попробуйте через 15 минут"})}

            cur.execute(
                f"SELECT * FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
                (email, hash_password(pwd))
            )
            user = cur.fetchone()

            # Логируем попытку
            cur.execute(
                f"INSERT INTO {SCHEMA}.login_attempts (ip, email, success) VALUES (%s, %s, %s)",
                (ip, email, user is not None)
            )

            if not user:
                conn.commit()
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Неверный email или пароль"})}

            # Создаём новую сессию
            token = secrets.token_urlsafe(32)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
                (token, user["id"])
            )
            cur.execute(
                f"UPDATE {SCHEMA}.users SET last_login = now() WHERE id = %s",
                (user["id"],)
            )
            conn.commit()

            resp_headers = {**CORS, "X-Set-Cookie": make_cookie(token)}
            return {"statusCode": 200, "headers": resp_headers,
                    "body": json.dumps({
                        "ok":    True,
                        "token": token,
                        "user":  {
                            "id":               user["id"],
                            "email":            user["email"],
                            "name":             user["name"],
                            "role":             user["role"],
                            "avatar_color":     user["avatar_color"],
                            "plan_id":          user["plan_id"],
                            "plan_billing":     user["plan_billing"],
                            "plan_active":      True,
                        },
                    })}

        # ── GET /?action=me ───────────────────────────────────────────────────
        elif method == "GET" and action == "me":
            token = get_token(event)
            if not token:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            cur.execute(f"""
                SELECT u.id, u.email, u.name, u.role, u.avatar_color,
                       u.created_at, u.last_login,
                       u.plan_id, u.plan_billing, u.plan_expires_at
                FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > now()
            """, (token,))
            user = cur.fetchone()
            if not user:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Сессия истекла"})}

            def fmt(v):
                return v.isoformat() if v and hasattr(v, "isoformat") else v

            # Проверяем не истёк ли платный план → если истёк, сбрасываем на free
            plan_id  = user["plan_id"] or "free"
            expires  = user["plan_expires_at"]
            from datetime import datetime, timezone as tz
            if plan_id != "free" and expires and expires < datetime.now(tz.utc):
                cur.execute(
                    f"UPDATE {SCHEMA}.users SET plan_id='free', plan_expires_at=NULL WHERE id=%s",
                    (user["id"],)
                )
                conn.commit()
                plan_id = "free"
                expires = None

            plan_active = plan_id != "free" or True  # free всегда активен
            if plan_id != "free" and not expires:
                plan_active = False

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "user": {
                            "id":               user["id"],
                            "email":            user["email"],
                            "name":             user["name"],
                            "role":             user["role"],
                            "avatar_color":     user["avatar_color"],
                            "created_at":       fmt(user["created_at"]),
                            "last_login":       fmt(user["last_login"]),
                            "plan_id":          plan_id,
                            "plan_billing":     user["plan_billing"],
                            "plan_expires_at":  fmt(expires),
                            "plan_active":      plan_active,
                        }
                    })}

        # ── PATCH /?action=update — обновить профиль ─────────────────────────
        elif method == "PATCH" and action == "update":
            token = get_token(event)
            if not token:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            # Проверяем сессию
            cur.execute(f"""
                SELECT u.id FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > now()
            """, (token,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Сессия истекла"})}

            user_id = row["id"]
            body    = json.loads(event.get("body") or "{}")

            updates = {}

            # Имя
            if "name" in body and body["name"].strip():
                updates["name"] = body["name"].strip()

            # Email — проверяем уникальность
            if "email" in body:
                new_email = body["email"].strip().lower()
                cur.execute(
                    f"SELECT id FROM {SCHEMA}.users WHERE email = %s AND id != %s",
                    (new_email, user_id)
                )
                if cur.fetchone():
                    return {"statusCode": 409, "headers": CORS,
                            "body": json.dumps({"error": "Этот email уже занят"})}
                updates["email"] = new_email

            # Новый пароль — требуем текущий
            if "new_password" in body:
                current_pwd = body.get("current_password", "")
                cur.execute(
                    f"SELECT password_hash FROM {SCHEMA}.users WHERE id = %s",
                    (user_id,)
                )
                u = cur.fetchone()
                if u["password_hash"] != hash_password(current_pwd):
                    return {"statusCode": 403, "headers": CORS,
                            "body": json.dumps({"error": "Текущий пароль неверный"})}
                if len(body["new_password"]) < 6:
                    return {"statusCode": 400, "headers": CORS,
                            "body": json.dumps({"error": "Пароль минимум 6 символов"})}
                updates["password_hash"] = hash_password(body["new_password"])

            # Цвет аватара
            if "avatar_color" in body:
                updates["avatar_color"] = body["avatar_color"]

            if not updates:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Нечего обновлять"})}

            set_clause = ", ".join(f"{k} = %s" for k in updates)
            cur.execute(
                f"UPDATE {SCHEMA}.users SET {set_clause} WHERE id = %s RETURNING id, email, name, role, avatar_color",
                list(updates.values()) + [user_id]
            )
            updated = dict(cur.fetchone())
            conn.commit()

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({"ok": True, "user": updated})}

        # ── POST /?action=delete — удаление аккаунта (152-ФЗ, право на забвение) ──
        elif method == "POST" and action == "delete":
            token = get_token(event)
            if not token:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            cur.execute(f"""
                SELECT u.id, u.password_hash FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > now()
            """, (token,))
            row = cur.fetchone()
            if not row:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Сессия истекла"})}

            body = json.loads(event.get("body") or "{}")
            pwd  = body.get("password", "")
            if not pwd or hash_password(pwd) != row["password_hash"]:
                return {"statusCode": 403, "headers": CORS,
                        "body": json.dumps({"error": "Неверный пароль"})}

            user_id = row["id"]
            ip  = (event.get("requestContext") or {}).get("identity", {}).get("sourceIp")
            ua  = (event.get("headers") or {}).get("user-agent", "")

            # Логируем отзыв согласия и удаление (152-ФЗ)
            cur.execute(
                f"""INSERT INTO {SCHEMA}.consent_log (user_id, action, ip_addr, user_agent)
                    VALUES (%s, 'account_deleted', %s, %s)""",
                (user_id, ip, ua)
            )

            # Анонимизируем данные вместо физического удаления — сохраняем лог согласий
            anon_email = f"deleted_{user_id}_{secrets.token_hex(4)}@deleted.invalid"
            cur.execute(f"""
                UPDATE {SCHEMA}.users SET
                    email         = %s,
                    name          = 'Удалённый пользователь',
                    password_hash = '',
                    consent_given = false,
                    last_login    = null
                WHERE id = %s
            """, (anon_email, user_id))

            # Удаляем все активные сессии
            cur.execute(
                f"UPDATE {SCHEMA}.sessions SET expires_at = now() WHERE user_id = %s",
                (user_id,)
            )
            conn.commit()

            clear_cookie = "sf_token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly"
            return {"statusCode": 200,
                    "headers": {**CORS, "X-Set-Cookie": clear_cookie},
                    "body": json.dumps({"ok": True, "message": "Аккаунт удалён"})}

        # ── POST /?action=logout ──────────────────────────────────────────────
        elif method == "POST" and action == "logout":
            token = get_token(event)
            if token:
                cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = now() WHERE token = %s", (token,))
                conn.commit()

            clear_cookie = "sf_token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly"
            return {"statusCode": 200,
                    "headers": {**CORS, "X-Set-Cookie": clear_cookie},
                    "body": json.dumps({"ok": True})}

        return {"statusCode": 400, "headers": CORS,
                "body": json.dumps({"error": "Unknown action"})}

    finally:
        cur.close()
        conn.close()