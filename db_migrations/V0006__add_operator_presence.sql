
CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.operator_presence (
  id          SERIAL PRIMARY KEY,
  operator_id TEXT        NOT NULL,
  name        TEXT        NOT NULL DEFAULT 'Оператор',
  color       TEXT        NOT NULL DEFAULT '#00d4ff',
  lat         NUMERIC(10,7) NOT NULL,
  lon         NUMERIC(10,7) NOT NULL,
  heading     NUMERIC(5,1)  NOT NULL DEFAULT 0,
  page        TEXT        NOT NULL DEFAULT 'dashboard',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(operator_id)
);

CREATE INDEX IF NOT EXISTS idx_operator_presence_updated
  ON t_p93256795_solofly_ai_architect.operator_presence(updated_at);
