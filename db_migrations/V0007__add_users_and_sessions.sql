
CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  name          TEXT        NOT NULL DEFAULT '',
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'operator',
  avatar_color  TEXT        NOT NULL DEFAULT '#00d4ff',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.sessions (
  token      TEXT        PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES t_p93256795_solofly_ai_architect.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 days'
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON t_p93256795_solofly_ai_architect.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON t_p93256795_solofly_ai_architect.sessions(expires_at);
