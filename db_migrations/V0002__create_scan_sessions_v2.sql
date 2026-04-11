-- Таблица сессий сканирования поверхности
CREATE TABLE IF NOT EXISTS t_p93256795_solofly_ai_architect.scan_sessions (
    id           bigserial PRIMARY KEY,
    drone_id     varchar(20) REFERENCES t_p93256795_solofly_ai_architect.drones(id),
    mode         varchar(50)  NOT NULL,
    sensor       varchar(50)  NOT NULL,
    range_m      integer      NOT NULL DEFAULT 500,
    status       varchar(20)  NOT NULL DEFAULT 'pending',
    progress     smallint     NOT NULL DEFAULT 0,
    area_km2     numeric(10,4)         DEFAULT 0,
    points_count bigint                DEFAULT 0,
    result_url   text,
    started_at   timestamptz           DEFAULT now(),
    ended_at     timestamptz,
    meta         jsonb                 DEFAULT '{}'::jsonb
);
