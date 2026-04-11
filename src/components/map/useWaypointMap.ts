import { useState, useRef, useCallback, useEffect } from "react";
import { latLonToWorld, metersPerPixel, fitBounds } from "./mapUtils";
import type { Waypoint } from "./waypointTypes";

interface UseWaypointMapOptions {
  waypoints: Waypoint[];
  onChange: (wps: Waypoint[]) => void;
  initialCenter: { lat: number; lon: number };
  initialZoom: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setSelectedWp: (idx: number | null) => void;
  selectedWp: number | null;
}

export function useWaypointMap({
  waypoints,
  onChange,
  initialCenter,
  initialZoom,
  canvasRef,
  setSelectedWp,
  selectedWp,
}: UseWaypointMapOptions) {
  const [center, setCenter] = useState(initialCenter);
  const [zoom,   setZoom]   = useState(initialZoom);

  const centerRef = useRef(center);
  const zoomRef   = useRef(zoom);
  centerRef.current = center;
  zoomRef.current   = zoom;

  // drag карты
  const dragRef   = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  // drag точки маршрута
  const dragWpRef = useRef<{ idx: number; startX: number; startY: number } | null>(null);

  // Авто-fit если точки уже есть при открытии
  const fittedRef = useRef(false);
  useEffect(() => {
    if (!fittedRef.current && waypoints.length >= 2) {
      fittedRef.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { center: c, zoom: z } = fitBounds(
        waypoints, canvas.offsetWidth, canvas.offsetHeight, 80
      );
      setCenter(c);
      setZoom(z);
    }
  }, [waypoints, canvasRef]);

  // ── Хелперы ──────────────────────────────────────────────────────────────────

  const toPixel = useCallback((lat: number, lon: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const z  = zoomRef.current;
    const cx = centerRef.current;
    const { wx: worldX, wy: worldY } = latLonToWorld(cx.lat, cx.lon, z);
    const { wx, wy } = latLonToWorld(lat, lon, z);
    return {
      x: canvas.width  / 2 + (wx - worldX),
      y: canvas.height / 2 + (wy - worldY),
    };
  }, [canvasRef]);

  const pixelToLatLon = useCallback((px: number, py: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { lat: 0, lon: 0 };
    const z   = zoomRef.current;
    const cx  = centerRef.current;
    const n   = Math.pow(2, z);
    const tSz = 256;
    const { wx: worldX, wy: worldY } = latLonToWorld(cx.lat, cx.lon, z);
    const wx     = worldX + (px - canvas.width  / 2);
    const wy     = worldY + (py - canvas.height / 2);
    const lon    = (wx / (n * tSz)) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * wy / (n * tSz))));
    return { lat: latRad * 180 / Math.PI, lon };
  }, [canvasRef]);

  const wpAtPixel = useCallback((px: number, py: number): number | null => {
    for (let i = waypoints.length - 1; i >= 0; i--) {
      const p = toPixel(waypoints[i].lat, waypoints[i].lon);
      if (Math.hypot(px - p.x, py - p.y) < 14) return i;
    }
    return null;
  }, [waypoints, toPixel]);

  // ── Mouse events ─────────────────────────────────────────────────────────────

  const onMouseDown = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const px   = e.clientX - rect.left;
    const py   = e.clientY - rect.top;

    // Правый клик — удалить точку
    if (e.button === 2) {
      const idx = wpAtPixel(px, py);
      if (idx !== null) {
        onChange(waypoints.filter((_, i) => i !== idx));
        if (selectedWp === idx) setSelectedWp(null);
      }
      return;
    }

    // Попали в точку — начинаем drag точки
    const idx = wpAtPixel(px, py);
    if (idx !== null) {
      dragWpRef.current = { idx, startX: px, startY: py };
      setSelectedWp(idx);
      return;
    }

    setSelectedWp(null);
    // Начинаем drag карты
    dragRef.current = { x: e.clientX, y: e.clientY, cx: centerRef.current.lat, cy: centerRef.current.lon };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    // Drag точки
    if (dragWpRef.current) {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const px   = e.clientX - rect.left;
      const py   = e.clientY - rect.top;
      const ll   = pixelToLatLon(px, py);
      onChange(waypoints.map((wp, i) =>
        i === dragWpRef.current!.idx ? { ...wp, lat: ll.lat, lon: ll.lon } : wp
      ));
      return;
    }
    // Drag карты
    if (!dragRef.current) return;
    const z   = zoomRef.current;
    const mpp = metersPerPixel(dragRef.current.cx, z);
    const dx  = e.clientX - dragRef.current.x;
    const dy  = e.clientY - dragRef.current.y;
    const dLon = -(dx * mpp) / (111320 * Math.cos((dragRef.current.cx * Math.PI) / 180));
    const dLat =  (dy * mpp) / 111320;
    setCenter({
      lat: Math.max(-85, Math.min(85, dragRef.current.cx + dLat)),
      lon: ((dragRef.current.cy + dLon + 180) % 360 + 360) % 360 - 180,
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (dragWpRef.current) {
      dragWpRef.current = null;
      return;
    }
    if (dragRef.current) {
      const moved = Math.hypot(
        e.clientX - dragRef.current.x,
        e.clientY - dragRef.current.y
      );
      dragRef.current = null;
      // Если двигали меньше 5px — это клик → добавить waypoint
      if (moved < 5) {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const ll = pixelToLatLon(e.clientX - rect.left, e.clientY - rect.top);
        onChange([...waypoints, { lat: ll.lat, lon: ll.lon, action: "" }]);
      }
    }
  };

  const onMouseLeave = () => {
    dragRef.current   = null;
    dragWpRef.current = null;
  };

  const onContextMenu = (e: React.MouseEvent) => { e.preventDefault(); };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(18, Math.max(2, z + (e.deltaY < 0 ? 1 : -1))));
  };

  // ── Fit по текущим точкам ────────────────────────────────────────────────────

  const fitAll = () => {
    if (waypoints.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { center: c, zoom: z } = fitBounds(waypoints, canvas.offsetWidth, canvas.offsetHeight, 80);
    setCenter(c);
    setZoom(z);
  };

  // ── Общая длина маршрута (Haversine) ─────────────────────────────────────────

  const totalDist = (() => {
    if (waypoints.length < 2) return 0;
    let d = 0;
    for (let i = 0; i < waypoints.length; i++) {
      const a  = waypoints[i];
      const b  = waypoints[(i + 1) % waypoints.length];
      const R  = 6371000;
      const φ1 = a.lat * Math.PI / 180;
      const φ2 = b.lat * Math.PI / 180;
      const Δφ = (b.lat - a.lat) * Math.PI / 180;
      const Δλ = (b.lon - a.lon) * Math.PI / 180;
      const aa = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
      d += R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    }
    return d;
  })();

  return {
    center, setCenter,
    zoom, setZoom,
    centerRef, zoomRef,
    dragRef, dragWpRef,
    fitAll,
    totalDist,
    onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
    onContextMenu, onWheel,
  };
}
