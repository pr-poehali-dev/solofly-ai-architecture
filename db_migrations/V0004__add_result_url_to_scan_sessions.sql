ALTER TABLE t_p93256795_solofly_ai_architect.scan_sessions
  ADD COLUMN IF NOT EXISTS result_url text,
  ADD COLUMN IF NOT EXISTS result_size_kb integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS result_format varchar(20) DEFAULT 'json';
