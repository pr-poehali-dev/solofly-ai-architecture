"""
Авторизация SoloFly.
POST /?action=register  — регистрация (email, password, name)
POST /?action=login     — вход (email, password) → token в Set-Cookie
POST /?action=logout    — выход (удаляет сессию)
GET  /?action=me        — данные текущего пользователя по токену
"""
import os, json, secrets, hashlib
from datetime import datetime, timezone
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p93256795_solofly_ai_architect"

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
            if len(pwd) < 6:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "Пароль минимум 6 символов"})}

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
                f"""INSERT INTO {SCHEMA}.users (email, name, password_hash, avatar_color)
                    VALUES (%s, %s, %s, %s) RETURNING id, role""",
                (email, name or email.split("@")[0], pwd_hash, color)
            )
            row     = cur.fetchone()
            user_id = row["id"]
            role    = row["role"]

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

            if not email or not pwd:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "email и password обязательны"})}

            cur.execute(
                f"SELECT * FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
                (email, hash_password(pwd))
            )
            user = cur.fetchone()
            if not user:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Неверный email или пароль"})}

            # Создаём новую сессию
            token = secrets.token_urlsafe(32)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES (%s, %s)",
                (token, user["id"])
            )
            # Обновляем last_login
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
                            "id":           user["id"],
                            "email":        user["email"],
                            "name":         user["name"],
                            "role":         user["role"],
                            "avatar_color": user["avatar_color"],
                        },
                    })}

        # ── GET /?action=me ───────────────────────────────────────────────────
        elif method == "GET" and action == "me":
            token = get_token(event)
            if not token:
                return {"statusCode": 401, "headers": CORS,
                        "body": json.dumps({"error": "Не авторизован"})}

            cur.execute(f"""
                SELECT u.id, u.email, u.name, u.role, u.avatar_color, u.created_at, u.last_login
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

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "user": {
                            "id":           user["id"],
                            "email":        user["email"],
                            "name":         user["name"],
                            "role":         user["role"],
                            "avatar_color": user["avatar_color"],
                            "created_at":   fmt(user["created_at"]),
                            "last_login":   fmt(user["last_login"]),
                        }
                    })}

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
