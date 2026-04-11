// Shared dictionaries, helpers and types for the Scan Archive module

export const MODE_LABEL: Record<string, string> = {
  lidar_terrain: "LiDAR · Рельеф",  lidar_objects: "LiDAR · Объекты",
  lidar:         "LiDAR",            radar_long:    "Радар · 15 км",
  radar:         "Радар",            thermal:       "Тепловизор",
  multispectral: "Мультиспектр",    sar:           "SAR · Синтетика",
};

export const MODE_ICON: Record<string, string> = {
  lidar_terrain: "Mountain", lidar_objects: "Scan",   lidar: "Layers3",
  radar_long:    "Radio",    radar:         "Radio",   thermal: "Flame",
  multispectral: "Layers",   sar:           "Aperture",
};

export const MODE_COLOR: Record<string, string> = {
  lidar_terrain: "var(--signal-green)", lidar_objects: "var(--electric)",
  lidar:         "var(--signal-green)", radar_long:    "#a78bfa",
  radar:         "#a78bfa",             thermal:       "#f97316",
  multispectral: "#22d3ee",             sar:           "#e879f9",
};

export const STATUS_CLS: Record<string, string> = {
  done: "tag-green", active: "tag-electric", scanning: "tag-electric",
  planned: "tag-muted", aborted: "tag-danger",
};

export const STATUS_LABEL: Record<string, string> = {
  done: "Завершён", active: "Активен", scanning: "Сканирует",
  planned: "Запланирован", aborted: "Прерван",
};

export function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function fmtDur(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const m = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (m < 60) return `${m} мин`;
  return `${Math.floor(m / 60)}ч ${m % 60}м`;
}

export function fmtNum(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU");
}

export interface ScanResultJson {
  version: string;
  generated_at: string;
  session: {
    code: string; drone_id: string; drone_name?: string;
    scan_mode: string; sensor: string; range_m: number;
    resolution_cm: number; frequency_hz: number; fov_deg: number;
  };
  results: {
    coverage_pct: number; area_km2: number; points_total: number;
    objects_found: number; accuracy_m: number;
    started_at: string; finished_at: string;
  };
  log: string[];
}
