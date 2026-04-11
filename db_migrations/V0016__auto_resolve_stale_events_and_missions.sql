-- Закрываем все неразрешённые события старше 24 часов
UPDATE t_p93256795_solofly_ai_architect.events
SET resolved = true
WHERE resolved = false
  AND ts < NOW() - INTERVAL '24 hours';

-- Сбрасываем зависшие дроны в статусе flight старше 3 часов
UPDATE t_p93256795_solofly_ai_architect.drones
SET status = 'standby',
    altitude = 0,
    speed = 0,
    updated_at = NOW()
WHERE status = 'flight'
  AND updated_at < NOW() - INTERVAL '3 hours';

-- Сбрасываем активные миссии у зависших дронов
UPDATE t_p93256795_solofly_ai_architect.missions
SET status = 'completed',
    progress = 100
WHERE status = 'active'
  AND start_time < NOW() - INTERVAL '12 hours';
