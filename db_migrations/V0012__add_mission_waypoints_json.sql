
-- Добавляем хранение координат маршрута в миссиях
ALTER TABLE t_p93256795_solofly_ai_architect.missions
  ADD COLUMN IF NOT EXISTS waypoints_json JSONB DEFAULT '[]'::jsonb;

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_missions_drone_status
  ON t_p93256795_solofly_ai_architect.missions(drone_id, status);
