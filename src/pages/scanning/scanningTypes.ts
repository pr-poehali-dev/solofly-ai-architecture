// Shared types, constants and log messages for the Scanning module

export const SENSOR_MODES = [
  {
    id: "lidar_terrain",
    label: "LiDAR · Рельеф",
    icon: "Mountain",
    color: "var(--signal-green)",
    sensor: "LiDAR",
    range_m: 500,
    resolution_cm: 2,
    freq_hz: 20,
    fov_deg: 120,
    desc: "Высокоточная 3D-топография, облако точек, построение ЦМР",
    tag: "tag-green",
    pointDensity: "150 тч/м²",
    accuracy: "±2 см",
    scanPattern: "Зигзаг",
  },
  {
    id: "lidar_objects",
    label: "LiDAR · Объекты",
    icon: "Scan",
    color: "var(--electric)",
    sensor: "LiDAR",
    range_m: 300,
    resolution_cm: 1,
    freq_hz: 40,
    fov_deg: 90,
    desc: "Обнаружение и классификация объектов, 3D-профилирование",
    tag: "tag-electric",
    pointDensity: "320 тч/м²",
    accuracy: "±1 см",
    scanPattern: "Спираль",
  },
  {
    id: "radar_long",
    label: "Радар · Дальний",
    icon: "Radio",
    color: "#a78bfa",
    sensor: "Радар SAR",
    range_m: 15000,
    resolution_cm: 50,
    freq_hz: 1,
    fov_deg: 30,
    desc: "Обнаружение объектов и поверхностей на расстоянии до 15 км",
    tag: "tag-muted",
    pointDensity: "4 тч/м²",
    accuracy: "±50 см",
    scanPattern: "Секторный",
  },
  {
    id: "thermal",
    label: "Тепловизор",
    icon: "Flame",
    color: "#f97316",
    sensor: "FLIR",
    range_m: 5000,
    resolution_cm: 10,
    freq_hz: 30,
    fov_deg: 60,
    desc: "Тепловое картирование, поиск живых объектов, мониторинг инфраструктуры",
    tag: "tag-warning",
    pointDensity: "—",
    accuracy: "±0.1°C",
    scanPattern: "Полосовой",
  },
  {
    id: "multispectral",
    label: "Мультиспектр",
    icon: "Layers",
    color: "#22d3ee",
    sensor: "MS-камера",
    range_m: 1000,
    resolution_cm: 5,
    freq_hz: 10,
    fov_deg: 75,
    desc: "Анализ растительности (NDVI), состояние почвы, мониторинг посевов",
    tag: "tag-electric",
    pointDensity: "80 тч/м²",
    accuracy: "±5 см",
    scanPattern: "Полосовой",
  },
  {
    id: "sar",
    label: "SAR · Синтетика",
    icon: "Aperture",
    color: "#e879f9",
    sensor: "SAR X-band",
    range_m: 15000,
    resolution_cm: 25,
    freq_hz: 2,
    fov_deg: 45,
    desc: "Радиолокационная съёмка сквозь облака и ночью, до 15 000 м",
    tag: "tag-muted",
    pointDensity: "10 тч/м²",
    accuracy: "±25 см",
    scanPattern: "Боковой обзор",
  },
] as const;

export type SensorModeId = typeof SENSOR_MODES[number]["id"];

export type SensorMode = typeof SENSOR_MODES[number];

export interface ScanLogEntry {
  ts: string;
  msg: string;
  color: string;
}

export function getScanLogMessages(id: SensorModeId, rangeKm: number): Record<SensorModeId, string[]> {
  return {
    lidar_terrain: [
      "Калибровка IMU завершена", "Первый пролёт — линия 001",
      "Плотность точек в норме (150 тч/м²)", "Обнаружен перепад высот +12 м",
      "Построение ЦМР-сетки...", "Финальный пролёт — линия завершена",
    ],
    lidar_objects: [
      "Инициализация 40 Гц режима", "Обнаружен объект 0.8×1.2 м",
      "Классификация: транспортное средство", "3D-профиль записан",
      "Обнаружен объект: строение", "Экспорт облака точек...",
    ],
    radar_long: [
      "Синхронизация фазовой решётки", "Луч стабилизирован",
      `Дальность подтверждена: ${rangeKm} км`, "Обнаружено 5 отражений",
      "Классификация целей по RCS", "Обновление карты отражений",
    ],
    thermal: [
      "Охлаждение матрицы до -10°C", "Калибровка по ЧТ 35°C",
      "Обнаружен тепловой аномалий +22°C", "NUC-коррекция применена",
      "Аномальная точка: 58.4°C", "Тепловая карта экспортирована",
    ],
    multispectral: [
      "Синхронизация 5 каналов", "Геопривязка к GNSS",
      "NDVI рассчитывается...", "Обнаружены стрессовые зоны",
      "Хлорофилл: 42 мкг/см²", "Карта NDVI записана",
    ],
    sar: [
      "Синтез апертуры 512 м", "Подавление помех",
      "Сквозь облачность: активно", "Разрешение 25 см подтверждено",
      "Обнаружены металлические объекты", "SAR-мозаика построена",
    ],
  };
}
