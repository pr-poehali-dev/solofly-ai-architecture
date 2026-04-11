
ALTER TABLE t_p93256795_solofly_ai_architect.drones
  ADD COLUMN IF NOT EXISTS drone_token  TEXT,
  ADD COLUMN IF NOT EXISTS hw_serial    TEXT,
  ADD COLUMN IF NOT EXISTS last_seen    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS flight_mode  TEXT;

ALTER TABLE t_p93256795_solofly_ai_architect.telemetry
  ADD COLUMN IF NOT EXISTS flight_mode  TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_drones_token     ON t_p93256795_solofly_ai_architect.drones(drone_token) WHERE drone_token IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_drones_hw_serial ON t_p93256795_solofly_ai_architect.drones(hw_serial)   WHERE hw_serial IS NOT NULL;
CREATE INDEX        IF NOT EXISTS idx_drones_last_seen  ON t_p93256795_solofly_ai_architect.drones(last_seen);
