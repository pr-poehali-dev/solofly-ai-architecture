-- Сбрасываем зависшие дроны в статусе flight более 2 часов
UPDATE t_p93256795_solofly_ai_architect.drones
SET 
  status = 'standby',
  altitude = 0,
  speed = 0,
  updated_at = NOW()
WHERE 
  status = 'flight' 
  AND updated_at < NOW() - INTERVAL '2 hours';

-- Убираем аномальные значения скорости (> 30 м/с)
UPDATE t_p93256795_solofly_ai_architect.drones
SET speed = 0
WHERE speed > 30;
