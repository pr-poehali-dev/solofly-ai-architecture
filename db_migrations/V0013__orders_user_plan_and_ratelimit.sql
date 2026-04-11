-- Добавляем связь orders → users и план
ALTER TABLE t_p93256795_solofly_ai_architect.orders
  ADD COLUMN IF NOT EXISTS user_id integer REFERENCES t_p93256795_solofly_ai_architect.users(id),
  ADD COLUMN IF NOT EXISTS plan_id text NOT NULL DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS plan_billing text NOT NULL DEFAULT 'month';

-- Таблица для rate-limit (защита от брутфорса)
CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.login_attempts (
  id        bigserial PRIMARY KEY,
  ip        text NOT NULL,
  email     text NOT NULL,
  ts        timestamptz NOT NULL DEFAULT now(),
  success   boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_ts
  ON t_p93256795_solofly_ai_architect.login_attempts(ip, ts);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_ts
  ON t_p93256795_solofly_ai_architect.login_attempts(email, ts);
