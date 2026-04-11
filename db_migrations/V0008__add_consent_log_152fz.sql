
-- Таблица согласий на обработку персональных данных (152-ФЗ)
CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.consent_log (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER     NOT NULL,
  action      TEXT        NOT NULL,
  ip_addr     TEXT,
  user_agent  TEXT,
  policy_ver  TEXT        NOT NULL DEFAULT '1.0',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON t_p93256795_solofly_ai_architect.consent_log(user_id);

-- Поля согласия в users
ALTER TABLE t_p93256795_solofly_ai_architect.users
  ADD COLUMN IF NOT EXISTS consent_given    BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_given_at TIMESTAMPTZ;
