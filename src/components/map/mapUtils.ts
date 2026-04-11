// ─── Типы ─────────────────────────────────────────────────────────────────────

export interface MapDrone {
  id: string;
  name: string;
  status: string;
  lat: number;
  lon: number;
  altitude: number;
  heading: number;
  speed: number;
  battery?: number;
}

export const STATUS_COLOR: Record<string, string> = {
  flight:   "#00ff88",
  standby:  "#00d4ff",
  charging: "#f97316",
  offline:  "#64748b",
  error:    "#ff3b30",
};

export const TILE_CACHE = new Map<string, HTMLImageElement>();

// ─── Тайловые утилиты (WGS-84 → Web Mercator) ─────────────────────────────────

export function latLonToWorld(lat: number, lon: number, zoom: number) {
  const n   = Math.pow(2, zoom);
  const tSz = 256;
  const wx  = ((lon + 180) / 360) * n * tSz;
  const lr  = (lat * Math.PI) / 180;
  const wy  = (1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2 * n * tSz;
  return { wx, wy };
}

/** Реальные метры на пиксель для данной широты и зума */
export function metersPerPixel(lat: number, zoom: number) {
  const earthCirc = 40075016.686;
  return (earthCirc * Math.cos((lat * Math.PI) / 180)) / (256 * Math.pow(2, zoom));
}

/**
 * Вычисляет центр и зум так, чтобы все точки влезали в viewport с padding.
 * Возвращает { center, zoom } для любой точки Земли.
 */
export function fitBounds(
  points: { lat: number; lon: number }[],
  viewW: number,
  viewH: number,
  paddingPx = 60
): { center: { lat: number; lon: number }; zoom: number } {
  if (points.length === 0) return { center: { lat: 0, lon: 0 }, zoom: 2 };
  if (points.length === 1) return { center: { lat: points[0].lat, lon: points[0].lon }, zoom: 14 };

  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  // Подбираем зум при котором все точки влезают
  let bestZoom = 2;
  for (let z = 18; z >= 2; z--) {
    const { wx: wx1, wy: wy1 } = latLonToWorld(maxLat, minLon, z);
    const { wx: wx2, wy: wy2 } = latLonToWorld(minLat, maxLon, z);
    const spanX = Math.abs(wx2 - wx1);
    const spanY = Math.abs(wy2 - wy1);
    if (spanX <= viewW - paddingPx * 2 && spanY <= viewH - paddingPx * 2) {
      bestZoom = z;
      break;
    }
  }

  return { center: { lat: centerLat, lon: centerLon }, zoom: bestZoom };
}

/** Красивая строка координат с N/S и E/W для любой точки мира */
export function fmtCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}°${latDir}  ${Math.abs(lon).toFixed(5)}°${lonDir}`;
}
