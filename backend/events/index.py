"""
Системные события, алерты и AI-модели.
GET  /                   — последние события (фильтр: level, drone_id, unresolved)
GET  /?type=ai           — AI-модели и статистика
GET  /?type=explain&drone_id=SF-001&maneuver=hover — объяснение решения ИИ
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
        # ── GET /?type=explain — объяснение решения ИИ для манёвра ─────────────
        if method == "GET" and params.get("type") == "explain":
            drone_id = params.get("drone_id")
            maneuver = params.get("maneuver", "")
            if not drone_id:
                return {"statusCode": 400, "headers": CORS,
                        "body": json.dumps({"error": "drone_id required"})}

            # Текущая телеметрия дрона
            cur.execute(
                f"SELECT * FROM {SCHEMA}.drones WHERE id = %s",
                (drone_id,)
            )
            row = cur.fetchone()
            drone = serialize_row(dict(row)) if row else {}

            # Последняя точка телеметрии
            cur.execute(
                f"""SELECT battery, altitude, speed, wind, roll, pitch, cpu_load, ai_confidence
                    FROM {SCHEMA}.telemetry WHERE drone_id = %s
                    ORDER BY ts DESC LIMIT 1""",
                (drone_id,)
            )
            tel_row = cur.fetchone()
            tel = serialize_row(dict(tel_row)) if tel_row else {}

            # Последние события по дрону
            cur.execute(
                f"""SELECT level, category, message, ts FROM {SCHEMA}.events
                    WHERE drone_id = %s ORDER BY ts DESC LIMIT 5""",
                (drone_id,)
            )
            recent_events = [serialize_row(dict(r)) for r in cur.fetchall()]

            # Модель ИИ, принявшая решение
            cur.execute(f"SELECT * FROM {SCHEMA}.ai_models ORDER BY accuracy DESC LIMIT 3")
            ai_models = [serialize_row(dict(r)) for r in cur.fetchall()]

            # Строим объяснение на основе данных
            battery   = tel.get("battery") or drone.get("battery") or 0
            wind      = tel.get("wind")    or drone.get("wind")    or 0
            altitude  = tel.get("altitude") or drone.get("altitude") or 0
            speed     = tel.get("speed")    or drone.get("speed")    or 0
            ai_conf   = tel.get("ai_confidence") or 0

            MANEUVER_LOGIC = {
                "hover": {
                    "model":   "DecisionNet v3.0",
                    "trigger": "Обнаружен объект интереса — дрон перешёл в режим зависания для детального анализа",
                    "factors": [
                        {"label": "Заряд АКБ",      "val": f"{battery}%",  "ok": battery > 30},
                        {"label": "Скорость ветра",  "val": f"{wind} м/с", "ok": wind < 10},
                        {"label": "Высота",          "val": f"{altitude} м","ok": True},
                        {"label": "Уверенность ИИ",  "val": f"{round(ai_conf)}%","ok": ai_conf > 70},
                    ],
                    "alternatives": ["Продолжить патруль (отклонено: объект требует анализа)", "Снизить высоту (отклонено: ветер выше нормы)"],
                },
                "orbit": {
                    "model":   "PathNet v4.2",
                    "trigger": "Целевой объект выявлен — PathNet построил оптимальный орбитальный маршрут",
                    "factors": [
                        {"label": "Скорость",     "val": f"{speed} км/ч", "ok": speed < 60},
                        {"label": "Радиус орбиты","val": "25 м",          "ok": True},
                        {"label": "Ветер",        "val": f"{wind} м/с",   "ok": wind < 12},
                        {"label": "Заряд АКБ",    "val": f"{battery}%",   "ok": battery > 25},
                    ],
                    "alternatives": ["Зависание (отклонено: требуется обход 360°)", "Снижение (отклонено: безопасная дистанция)"],
                },
                "land": {
                    "model":   "PathNet v4.2 + VisionCore v7.1",
                    "trigger": "Инициирована безопасная посадка: ИИ выбрал зону без людей и препятствий",
                    "factors": [
                        {"label": "Заряд АКБ",     "val": f"{battery}%",  "ok": battery > 15},
                        {"label": "Зона посадки",  "val": "Чистая",        "ok": True},
                        {"label": "Ветер",         "val": f"{wind} м/с",   "ok": wind < 8},
                        {"label": "Видимость",     "val": "Хорошая",       "ok": True},
                    ],
                    "alternatives": ["RTB (отклонено: недостаточно заряда)", "Зависание (отклонено: необходима посадка)"],
                },
                "rtb": {
                    "model":   "PathNet v4.2",
                    "trigger": "Построен маршрут возврата: рассчитан с учётом остатка заряда и погоды",
                    "factors": [
                        {"label": "Заряд АКБ",       "val": f"{battery}%",  "ok": battery > 20},
                        {"label": "Расст. до базы",  "val": "—",            "ok": True},
                        {"label": "Ветер попутный",  "val": f"{wind} м/с",  "ok": True},
                        {"label": "Маршрут",         "val": "Оптимальный",  "ok": True},
                    ],
                    "alternatives": ["Продолжить миссию (отклонено: низкий заряд)", "Экстр. посадка (отклонено: заряд позволяет RTB)"],
                },
                "climb": {
                    "model":   "WeatherAdapt v1.4 + PathNet v4.2",
                    "trigger": "Набор высоты: WeatherAdapt обнаружил турбулентность у земли, PathNet перестроил маршрут",
                    "factors": [
                        {"label": "Текущая высота", "val": f"{altitude} м","ok": True},
                        {"label": "Ветер низкий",   "val": f"{wind} м/с",  "ok": wind > 5},
                        {"label": "Заряд АКБ",      "val": f"{battery}%",  "ok": battery > 40},
                        {"label": "Турбулентность", "val": "Класс A",       "ok": True},
                    ],
                    "alternatives": ["Боковой манёвр (отклонено: турбулентность на всём горизонте)", "Снижение (отклонено: препятствия)"],
                },
                "scan": {
                    "model":   "VisionCore v7.1 + PathNet v4.2",
                    "trigger": "Запущен скан-паттерн: VisionCore запросил систематическое покрытие зоны",
                    "factors": [
                        {"label": "Покрытие цели", "val": "0% → 100%",    "ok": True},
                        {"label": "Разрешение",    "val": "4K / 30 Гц",   "ok": True},
                        {"label": "Высота съёмки", "val": f"{altitude} м","ok": True},
                        {"label": "Уверенность",   "val": f"{round(ai_conf)}%","ok": ai_conf > 60},
                    ],
                    "alternatives": ["Зависание (отклонено: нужно полное покрытие)", "Разовый облёт (отклонено: недостаточное разрешение)"],
                },
            }

            logic = MANEUVER_LOGIC.get(maneuver, {
                "model":   ai_models[0]["name"] if ai_models else "DecisionNet",
                "trigger": f"Выполняется команда: {maneuver}",
                "factors": [
                    {"label": "Заряд АКБ",     "val": f"{battery}%", "ok": battery > 20},
                    {"label": "Уверенность ИИ","val": f"{round(ai_conf)}%","ok": ai_conf > 50},
                ],
                "alternatives": [],
            })

            return {"statusCode": 200, "headers": CORS,
                    "body": json.dumps({
                        "maneuver":     maneuver,
                        "drone_id":     drone_id,
                        "model":        logic["model"],
                        "trigger":      logic["trigger"],
                        "factors":      logic["factors"],
                        "alternatives": logic["alternatives"],
                        "recent_events": recent_events,
                        "confidence":   round(ai_conf) if ai_conf else 85,
                        "decision_ms":  12,
                    })}

        # ── GET /?type=ai — AI-модели и статистика ────────────────────────────
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