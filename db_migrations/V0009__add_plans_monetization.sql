
-- Тарифные планы
CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.plans (
  id              TEXT        PRIMARY KEY,  -- 'free' | 'pro' | 'team' | 'enterprise'
  name            TEXT        NOT NULL,
  price_month     INTEGER     NOT NULL DEFAULT 0,
  price_year      INTEGER     NOT NULL DEFAULT 0,
  max_drones      INTEGER     NOT NULL DEFAULT 1,
  max_missions    INTEGER     NOT NULL DEFAULT 10,
  features        TEXT[]      NOT NULL DEFAULT '{}',
  is_popular      BOOLEAN     NOT NULL DEFAULT false
);

INSERT INTO t_p93256795_solofly_ai_architect.plans
  (id, name, price_month, price_year, max_drones, max_missions, features, is_popular)
VALUES
  ('free',       'Старт',    0,      0,       1,  10,  ARRAY['1 дрон','10 миссий в месяц','Дашборд','Базовая телеметрия','Карта позиций'],  false),
  ('pro',        'Про',      2900,   24900,   5,  -1,  ARRAY['5 дронов','Неограниченные миссии','ИИ-ядро','Управление роем','Сканирование','История полётов','Объяснимый ИИ'], true),
  ('team',       'Команда',  7900,   69900,  20,  -1,  ARRAY['20 дронов','Совместная работа','API доступ','Мониторинг и отчёты','Приоритетная поддержка','Все функции Про'], false),
  ('enterprise', 'Enterprise', 49000, 0,    -1,  -1,  ARRAY['Без ограничений','On-premise','SLA 99.9%','Выделенный менеджер','Кастомная интеграция','Обучение команды'], false)
ON CONFLICT (id) DO UPDATE SET
  price_month  = EXCLUDED.price_month,
  price_year   = EXCLUDED.price_year,
  max_drones   = EXCLUDED.max_drones,
  max_missions = EXCLUDED.max_missions,
  features     = EXCLUDED.features,
  is_popular   = EXCLUDED.is_popular;

-- Поля тарифа в users
ALTER TABLE t_p93256795_solofly_ai_architect.users
  ADD COLUMN IF NOT EXISTS plan_id          TEXT        NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_billing     TEXT        NOT NULL DEFAULT 'month';

-- Индекс для быстрой проверки тарифа
CREATE INDEX IF NOT EXISTS idx_users_plan ON t_p93256795_solofly_ai_architect.users(plan_id);
