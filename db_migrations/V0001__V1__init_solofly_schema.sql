
CREATE TABLE IF NOT EXISTS drones (
    id          VARCHAR(20) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(50)  DEFAULT 'scout',
    status      VARCHAR(30)  DEFAULT 'offline',
    battery     SMALLINT     DEFAULT 100,
    altitude    NUMERIC(8,2) DEFAULT 0,
    speed       NUMERIC(6,2) DEFAULT 0,
    heading     NUMERIC(6,2) DEFAULT 0,
    lat         NUMERIC(12,8) DEFAULT 0,
    lon         NUMERIC(12,8) DEFAULT 0,
    wind        NUMERIC(5,2) DEFAULT 0,
    temperature SMALLINT     DEFAULT 20,
    vibration   VARCHAR(30)  DEFAULT 'норма',
    gps_sats    SMALLINT     DEFAULT 0,
    ai_model    VARCHAR(100) DEFAULT 'PathNet-v4.2',
    hw_weight   NUMERIC(5,2) DEFAULT 2.0,
    hw_motors   SMALLINT     DEFAULT 4,
    hw_battery_cap INTEGER   DEFAULT 10000,
    hw_max_speed SMALLINT    DEFAULT 90,
    created_at  TIMESTAMPTZ  DEFAULT now(),
    updated_at  TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS missions (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    drone_id    VARCHAR(20) REFERENCES drones(id),
    type        VARCHAR(50) DEFAULT 'patrol',
    status      VARCHAR(30) DEFAULT 'planned',
    progress    SMALLINT    DEFAULT 0,
    waypoints   SMALLINT    DEFAULT 0,
    tasks       TEXT[]      DEFAULT '{}',
    start_time  TIMESTAMPTZ,
    eta         TIMESTAMPTZ,
    ended_at    TIMESTAMPTZ,
    weather_wind    NUMERIC(5,2) DEFAULT 0,
    weather_vis     VARCHAR(50)  DEFAULT 'хорошая',
    weather_temp    SMALLINT     DEFAULT 15,
    weather_risk    VARCHAR(20)  DEFAULT 'low',
    obstacles_avoided SMALLINT   DEFAULT 0,
    route_adjustments SMALLINT   DEFAULT 0,
    distance_km NUMERIC(8,2)    DEFAULT 0,
    created_at  TIMESTAMPTZ     DEFAULT now()
);

CREATE TABLE IF NOT EXISTS telemetry (
    id          BIGSERIAL PRIMARY KEY,
    drone_id    VARCHAR(20) REFERENCES drones(id),
    mission_id  INTEGER     REFERENCES missions(id),
    ts          TIMESTAMPTZ DEFAULT now(),
    battery     SMALLINT,
    altitude    NUMERIC(8,2),
    speed       NUMERIC(6,2),
    heading     NUMERIC(6,2),
    lat         NUMERIC(12,8),
    lon         NUMERIC(12,8),
    roll        NUMERIC(6,2),
    pitch       NUMERIC(6,2),
    yaw         NUMERIC(6,2),
    wind        NUMERIC(5,2),
    temperature SMALLINT,
    vibration   VARCHAR(30),
    gps_sats    SMALLINT,
    cpu_load    SMALLINT,
    ai_confidence SMALLINT
);

CREATE INDEX IF NOT EXISTS idx_telemetry_drone_ts ON telemetry(drone_id, ts DESC);

CREATE TABLE IF NOT EXISTS events (
    id          BIGSERIAL PRIMARY KEY,
    drone_id    VARCHAR(20),
    mission_id  INTEGER,
    level       VARCHAR(20) DEFAULT 'info',
    category    VARCHAR(50) DEFAULT 'system',
    message     TEXT        NOT NULL,
    resolved    BOOLEAN     DEFAULT false,
    ts          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts DESC);

CREATE TABLE IF NOT EXISTS ai_models (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    version     VARCHAR(20),
    model_type  VARCHAR(100),
    framework   VARCHAR(50),
    accuracy    NUMERIC(5,2),
    size_mb     NUMERIC(8,2),
    cycles      INTEGER      DEFAULT 0,
    status      VARCHAR(30)  DEFAULT 'active',
    updated_at  TIMESTAMPTZ  DEFAULT now()
);

INSERT INTO drones (id, name, role, status, battery, altitude, speed, heading, lat, lon, wind, temperature, gps_sats, ai_model, hw_weight, hw_motors, hw_battery_cap, hw_max_speed) VALUES
('SF-001', 'Орёл-1',  'scout',  'flight',  74, 128.0, 42.0, 245.0, 55.75580, 37.61760, 8.0,  38, 17, 'PathNet-v4.2', 2.4, 4, 10000, 90),
('SF-002', 'Орёл-2',  'mapper', 'standby', 98,   0.0,  0.0,   0.0, 55.75200, 37.61200, 3.0,  22, 14, 'PathNet-v4.2', 2.4, 4, 10000, 90),
('SF-003', 'Орёл-3',  'relay',  'charging',31,   0.0,  0.0,   0.0, 55.75100, 37.61100, 3.0,  21,  0, 'PathNet-v4.2', 2.4, 4, 10000, 90),
('SF-004', 'Сокол-1', 'leader', 'flight',  52,  85.0, 67.0, 112.0, 55.75900, 37.62100, 14.0, 41, 14, 'PathNet-v4.2', 3.1, 6, 12000, 120)
ON CONFLICT (id) DO NOTHING;

INSERT INTO missions (code, name, drone_id, type, status, progress, waypoints, tasks, start_time, weather_wind, weather_vis, weather_temp, weather_risk, obstacles_avoided, route_adjustments) VALUES
('MSN-047', 'Патруль периметра А',  'SF-001', 'patrol',   'active',  68, 12, ARRAY['Видеосъёмка','Мониторинг периметра'],  now() - interval '1.5 hours', 8.0,  'хорошая',   12, 'low',    3, 1),
('MSN-048', 'Картографирование B2', 'SF-004', 'mapping',  'active',  34, 24, ARRAY['3D-картография','Фотограмметрия'],     now() - interval '18 minutes',14.0, 'умеренная',  9, 'medium', 1, 2),
('MSN-049', 'Доставка груза С3',    'SF-002', 'delivery', 'planned',  0,  6, ARRAY['Доставка','Подтверждение получения'],  null,                          11.0, 'хорошая',   11, 'low',    0, 0),
('MSN-046', 'Обзор-14',            'SF-003', 'recon',    'done',   100, 18, ARRAY['Разведка','Тепловизор'],               now() - interval '3 hours',    6.0,  'хорошая',   13, 'low',    5, 3)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ai_models (name, version, model_type, framework, accuracy, size_mb, cycles, status) VALUES
('PathNet',      'v4.2', 'Планирование траекторий (RL)',     'PyTorch',         96.8, 12.4, 1247, 'active'),
('VisionCore',   'v7.1', 'Компьютерное зрение (CNN)',        'TensorFlow Lite', 97.4, 28.1, 3812, 'active'),
('ThreatDetect', 'v2.0', 'Обнаружение угроз (YOLO)',         'ONNX',            94.1, 18.7,  892, 'training'),
('WeatherAdapt', 'v1.4', 'Погодная адаптация (LSTM)',        'PyTorch',         91.3,  4.2,  421, 'active'),
('DecisionNet',  'v3.0', 'Принятие решений (DQN)',           'PyTorch',         93.7,  8.9,  674, 'active'),
('Transfer3D',   'v1.0', 'Трансфер симуляция→реальность',   'ONNX',            88.2, 31.4,  156, 'training');

INSERT INTO events (drone_id, mission_id, level, category, message) VALUES
('SF-003', null, 'warning', 'battery', 'SF-003: заряд < 35%'),
('SF-001', 1,    'info',    'ai',      'SF-001: обновлена модель PathNet, цикл #1247'),
(null,     3,    'info',    'mission', 'Миссия «Обзор-14» завершена успешно'),
('SF-004', 2,    'info',    'ai',      'SF-004: обнаружен новый объект, добавлен в датасет');
