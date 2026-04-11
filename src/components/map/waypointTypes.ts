// ─── Типы и константы редактора маршрута ──────────────────────────────────────

export interface Waypoint {
  lat: number;
  lon: number;
  action?: string; // "hover" | "photo" | "scan" | ""
}

export interface WaypointEditorProps {
  waypoints: Waypoint[];
  onChange: (wps: Waypoint[]) => void;
  height?: number;
  initialCenter?: { lat: number; lon: number };
  initialZoom?: number;
}

export const ACTION_LABELS: Record<string, string> = {
  "":    "Точка",
  hover: "Зависание",
  photo: "Фото",
  scan:  "Сканирование",
};

export const WP_COLOR  = "#00d4ff";
export const WP_DONE   = "#00ff88";
export const ROUTE_CLR = "rgba(0,212,255,0.6)";
