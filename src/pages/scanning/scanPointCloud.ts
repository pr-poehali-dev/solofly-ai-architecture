// Типы, гео-конвертация и генерация облака точек для ScanModel3D

import type { SensorModeId } from "./scanningTypes";

// Метаданные сессии сканирования для вшивания в экспорт
export interface ScanMeta {
  code?:            string;   // SCN-0042
  drone_id?:        string;   // SF-001
  drone_name?:      string;   // Орёл-1
  scan_mode?:       string;   // lidar_terrain
  sensor?:          string;   // LiDAR
  range_m?:         number;   // 500
  resolution_cm?:   number;   // 2
  frequency_hz?:    number;   // 20
  fov_deg?:         number;   // 120
  accuracy_m?:      number;   // 0.02
  area_km2?:        number;   // 12.5
  points_total?:    number;   // 1875000
  objects_found?:   number;
  coverage_pct?:    number;
  lat?:             number;   // координата дрона
  lon?:             number;
  altitude_m?:      number;
  started_at?:      string;
  finished_at?:     string;
  elevation_min_m?: number;
  elevation_max_m?: number;
}

// scale: сколько метров в одной единице локальной системы координат
export const LOCAL_SCALE_M = 20; // 1 unit = 20 м → диапазон -5..5 unit = 100×100 м

/** Локальные (dx, dz) в метрах → (lat, lon) */
export function localToGeo(
  dxMeters: number,
  dzMeters: number,
  baseLat: number,
  baseLon: number
): { lat: number; lon: number } {
  const R = 6378137; // радиус Земли, м
  const dLat = dzMeters / R;
  const dLon = dxMeters / (R * Math.cos((baseLat * Math.PI) / 180));
  return {
    lat: baseLat + (dLat * 180) / Math.PI,
    lon: baseLon + (dLon * 180) / Math.PI,
  };
}

export function buildPointCloud(
  mode: SensorModeId,
  progress: number,
  meta?: ScanMeta
): { positions: Float32Array; colors: Float32Array; geo: Float64Array; count: number } {
  const total = Math.floor(4000 * (progress / 100));

  const positions = new Float32Array(total * 3);
  const colors    = new Float32Array(total * 3);
  // geo[i*3+0] = longitude, geo[i*3+1] = latitude, geo[i*3+2] = altitude_m
  const geo       = new Float64Array(total * 3);

  const baseLat = meta?.lat        ?? 55.751244;
  const baseLon = meta?.lon        ?? 37.618423;
  const baseAlt = meta?.altitude_m ?? 0;

  const rng = (a: number, b: number) => a + Math.random() * (b - a);

  for (let i = 0; i < total; i++) {
    const i3 = i * 3;

    if (mode === "lidar_terrain") {
      // Рельеф: холмистая поверхность
      const x = rng(-5, 5);
      const z = rng(-5, 5);
      const y = Math.sin(x * 0.7) * Math.cos(z * 0.5) * 1.5
               + Math.sin(x * 1.3 + z * 0.9) * 0.6
               + rng(-0.05, 0.05);
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Цвет по высоте: синий (низко) → зелёный → белый (высоко)
      const t = (y + 2) / 4;
      colors[i3]     = t > 0.7 ? 1 : t * 0.3;
      colors[i3 + 1] = 0.3 + t * 0.5;
      colors[i3 + 2] = t < 0.4 ? 1 - t * 1.5 : 0.1;

    } else if (mode === "lidar_objects") {
      // Объекты: несколько кластеров (здания, машины)
      const cluster = Math.floor(rng(0, 5));
      const cx = [-3, -1, 1.5, 3, -2][cluster];
      const cz = [-2, 2, -3, 1, 0][cluster];
      const h  = [2, 0.8, 3, 1.2, 1.6][cluster];
      const x = cx + rng(-0.4, 0.4);
      const z = cz + rng(-0.4, 0.4);
      const y = rng(0, h);
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Цвет по кластеру
      const hues = [[0,0.8,1],[1,0.5,0],[0.5,1,0.5],[1,1,0],[0.8,0,1]];
      const c = hues[cluster];
      colors[i3] = c[0]; colors[i3+1] = c[1]; colors[i3+2] = c[2];

    } else if (mode === "thermal") {
      // Тепловая карта: плоскость с цветом по температуре
      const x = rng(-5, 5);
      const z = rng(-5, 5);
      // Горячие пятна
      const d1 = Math.sqrt((x - 1) ** 2 + (z + 1) ** 2);
      const d2 = Math.sqrt((x + 2) ** 2 + (z - 2) ** 2);
      const temp = Math.max(0, 1 - d1 * 0.35) + Math.max(0, 0.7 - d2 * 0.4);
      const y = temp * 0.3 + rng(-0.02, 0.02);
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Холодный синий → тёплый жёлтый → горячий красный
      const t = Math.min(1, temp);
      colors[i3]     = t;
      colors[i3 + 1] = Math.max(0, 0.5 - Math.abs(t - 0.5));
      colors[i3 + 2] = 1 - t;

    } else if (mode === "multispectral") {
      // NDVI: плоскость с зонами растительности
      const x = rng(-5, 5);
      const z = rng(-5, 5);
      const ndvi = Math.sin(x * 0.8) * 0.4 + Math.cos(z * 0.6) * 0.4 + 0.3 + rng(-0.1, 0.1);
      const y = ndvi * 0.2;
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Красный (стресс) → жёлтый → зелёный (здоровая растительность)
      const t = Math.min(1, Math.max(0, ndvi));
      colors[i3]     = t < 0.5 ? 1 : 2 * (1 - t);
      colors[i3 + 1] = t < 0.5 ? 2 * t : 1;
      colors[i3 + 2] = 0.1;

    } else if (mode === "radar_long" || mode === "sar") {
      // Радар/SAR: веер с отражениями
      const angle = rng(0, Math.PI);
      const r     = rng(1, 5);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r * 0.6;
      const intensity = rng(0, 1) < 0.05 ? rng(0.8, 1) : rng(0, 0.3); // редкие яркие цели
      const y = intensity * 0.5;
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Пурпурный → белый для интенсивных целей
      colors[i3]     = 0.6 + intensity * 0.4;
      colors[i3 + 1] = intensity;
      colors[i3 + 2] = 1;
    }

    // Геопривязка: пересчёт локальных координат в реальные WGS-84
    {
      const dxM = positions[i3]     * LOCAL_SCALE_M;
      const dzM = positions[i3 + 2] * LOCAL_SCALE_M;
      const dyM = positions[i3 + 1] * LOCAL_SCALE_M; // высота относительно дрона
      const { lat, lon } = localToGeo(dxM, dzM, baseLat, baseLon);
      geo[i3]     = lon;
      geo[i3 + 1] = lat;
      geo[i3 + 2] = baseAlt + dyM;
    }
  }

  return { positions, colors, geo, count: total };
}
