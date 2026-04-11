-- Геолокация дрона в момент скана + S3 архив результатов
ALTER TABLE t_p93256795_solofly_ai_architect.scan_sessions
  ADD COLUMN IF NOT EXISTS drone_lat   numeric(12,8),
  ADD COLUMN IF NOT EXISTS drone_lon   numeric(12,8),
  ADD COLUMN IF NOT EXISTS drone_alt_m numeric(8,2),
  ADD COLUMN IF NOT EXISTS center_lat  numeric(12,8),
  ADD COLUMN IF NOT EXISTS center_lon  numeric(12,8),
  ADD COLUMN IF NOT EXISTS s3_key      text,
  ADD COLUMN IF NOT EXISTS s3_url      text,
  ADD COLUMN IF NOT EXISTS file_size_kb integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes       text;
