-- ЦУП: расширение таблицы drones для регистрации и аналитики
ALTER TABLE t_p93256795_solofly_ai_architect.drones
  ADD COLUMN IF NOT EXISTS registered_by  varchar(100) DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS firmware_ver   varchar(30)  DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS serial_num     varchar(50),
  ADD COLUMN IF NOT EXISTS notes          text,
  ADD COLUMN IF NOT EXISTS total_flights  integer      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_hours    numeric(8,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_km       numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen_at   timestamptz  DEFAULT now();

-- ЦУП: таблица событий подключения БПЛА
CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.drone_connections (
  id          bigserial PRIMARY KEY,
  drone_id    varchar(20) REFERENCES t_p93256795_solofly_ai_architect.drones(id),
  event       varchar(30) NOT NULL DEFAULT 'connect',
  ip_addr     varchar(45),
  signal_db   smallint,
  link_quality smallint,
  ts          timestamptz DEFAULT now()
);

-- Заполним тестовые данные аналитики
UPDATE t_p93256795_solofly_ai_architect.drones SET
  total_flights = 47, total_hours = 38.5, total_km = 1240.3, firmware_ver = '2.4.1', serial_num = 'SOLOFLY-A001'
  WHERE id = 'SF-001';
UPDATE t_p93256795_solofly_ai_architect.drones SET
  total_flights = 31, total_hours = 22.1, total_km = 670.8, firmware_ver = '2.4.1', serial_num = 'SOLOFLY-A002'
  WHERE id = 'SF-002';
UPDATE t_p93256795_solofly_ai_architect.drones SET
  total_flights = 19, total_hours = 14.7, total_km = 390.2, firmware_ver = '2.3.9', serial_num = 'SOLOFLY-A003'
  WHERE id = 'SF-003';
UPDATE t_p93256795_solofly_ai_architect.drones SET
  total_flights = 62, total_hours = 51.3, total_km = 2180.6, firmware_ver = '2.4.1', serial_num = 'SOLOFLY-B001'
  WHERE id = 'SF-004';
