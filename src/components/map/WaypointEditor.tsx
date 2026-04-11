/**
 * WaypointEditor — интерактивный редактор маршрута на OSM-карте.
 * Клик по карте добавляет waypoint, drag перемещает, правый клик удаляет.
 * Маршрут рисуется линиями между точками, каждая точка пронумерована.
 */
import { useEffect, useRef, useCallback, useState } from "react";
import Icon from "@/components/ui/icon";
import {
  latLonToWorld,
  metersPerPixel,
  fitBounds,
  fmtCoord,
  TILE_CACHE,
} from "./mapUtils";

export interface Waypoint {
  lat: number;
  lon: number;
  action?: string; // "hover" | "photo" | "scan" | ""
}

interface WaypointEditorProps {
  waypoints: Waypoint[];
  onChange: (wps: Waypoint[]) => void;
  height?: number;
  initialCenter?: { lat: number; lon: number };
  initialZoom?: number;
}

const ACTION_LABELS: Record<string, string> = {
  "":       "Точка",
  hover:    "Зависание",
  photo:    "Фото",
  scan:     "Сканирование",
};

const WP_COLOR   = "#00d4ff";
const WP_DONE    = "#00ff88";
const ROUTE_CLR  = "rgba(0,212,255,0.6)";

export default function WaypointEditor({
  waypoints,
  onChange,
  height = 420,
  initialCenter = { lat: 55.751, lon: 37.618 },
  initialZoom   = 14,
}: WaypointEditorProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animRef    = useRef<number>(0);
  const tickRef    = useRef(0);

  const [center, setCenter] = useState(initialCenter);
  const [zoom,   setZoom]   = useState(initialZoom);
  const centerRef = useRef(center);
  const zoomRef   = useRef(zoom);
  centerRef.current = center;
  zoomRef.current   = zoom;

  // drag карты
  const dragRef  = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  // drag точки маршрута
  const dragWpRef = useRef<{ idx: number; startX: number; startY: number } | null>(null);
  // выбранная точка для редактирования действия
  const [selectedWp, setSelectedWp] = useState<number | null>(null);

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
  }, [waypoints]);

  // ── Хелперы ──────────────────────────────────────────────────────────────────
  const toPixel = useCallback((lat: number, lon: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const z = zoomRef.current;
    const cx = centerRef.current;
    const { wx: worldX, wy: worldY } = latLonToWorld(cx.lat, cx.lon, z);
    const { wx, wy } = latLonToWorld(lat, lon, z);
    return {
      x: canvas.width  / 2 + (wx - worldX),
      y: canvas.height / 2 + (wy - worldY),
    };
  }, []);

  const pixelToLatLon = useCallback((px: number, py: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { lat: 0, lon: 0 };
    const z   = zoomRef.current;
    const cx  = centerRef.current;
    const n   = Math.pow(2, z);
    const tSz = 256;
    const { wx: worldX, wy: worldY } = latLonToWorld(cx.lat, cx.lon, z);
    const wx = worldX + (px - canvas.width  / 2);
    const wy = worldY + (py - canvas.height / 2);
    const lon = (wx / (n * tSz)) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * wy / (n * tSz))));
    return { lat: latRad * 180 / Math.PI, lon };
  }, []);

  const wpAtPixel = useCallback((px: number, py: number): number | null => {
    for (let i = waypoints.length - 1; i >= 0; i--) {
      const p = toPixel(waypoints[i].lat, waypoints[i].lon);
      if (Math.hypot(px - p.x, py - p.y) < 14) return i;
    }
    return null;
  }, [waypoints, toPixel]);

  // ── Рендер ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W   = canvas.width;
    const H   = canvas.height;
    const cx  = centerRef.current;
    const z   = zoomRef.current;
    const tSz = 256;
    const n   = Math.pow(2, z);
    const { wx: worldX, wy: worldY } = latLonToWorld(cx.lat, cx.lon, z);

    ctx.clearRect(0, 0, W, H);

    // ── Тайлы ──
    const tX0    = Math.floor(worldX / tSz);
    const tY0    = Math.floor(worldY / tSz);
    const offX   = W / 2 - (worldX % tSz);
    const offY   = H / 2 - (worldY % tSz);
    const tilesX = Math.ceil(W / tSz) + 2;
    const tilesY = Math.ceil(H / tSz) + 2;

    for (let dy = -1; dy < tilesY; dy++) {
      for (let dx = -1; dx < tilesX; dx++) {
        const tx  = ((tX0 + dx) % n + n) % n;
        const ty  = tY0 + dy;
        if (ty < 0 || ty >= n) continue;
        const px  = offX + dx * tSz;
        const py  = offY + dy * tSz;
        const key = `${z}/${tx}/${ty}`;
        const cached = TILE_CACHE.get(key);
        if (cached?.complete && cached.naturalWidth > 0) {
          ctx.drawImage(cached, px, py, tSz, tSz);
          ctx.fillStyle = "rgba(5,9,14,0.48)";
          ctx.fillRect(px, py, tSz, tSz);
        } else {
          ctx.fillStyle = "hsl(210 20% 7%)";
          ctx.fillRect(px, py, tSz, tSz);
          if (!cached) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            const s = ["a","b","c"][(tx + ty) % 3];
            img.src = `https://${s}.tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
            img.onload  = () => { TILE_CACHE.set(key, img); };
            img.onerror = () => { TILE_CACHE.set(key, img); };
            TILE_CACHE.set(key, img);
          }
        }
      }
    }

    // ── toPixel inline (нет зависимости от state) ──
    const px = (lat: number, lon: number) => {
      const { wx, wy } = latLonToWorld(lat, lon, z);
      return { x: W / 2 + (wx - worldX), y: H / 2 + (wy - worldY) };
    };

    // ── Линии маршрута ──
    if (waypoints.length >= 2) {
      ctx.beginPath();
      const p0 = px(waypoints[0].lat, waypoints[0].lon);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < waypoints.length; i++) {
        const p = px(waypoints[i].lat, waypoints[i].lon);
        ctx.lineTo(p.x, p.y);
      }
      // Замыкаем маршрут
      ctx.lineTo(p0.x, p0.y);
      ctx.strokeStyle = ROUTE_CLR;
      ctx.lineWidth   = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Стрелки направления
      for (let i = 0; i < waypoints.length; i++) {
        const a = waypoints[i];
        const b = waypoints[(i + 1) % waypoints.length];
        const pa = px(a.lat, a.lon);
        const pb = px(b.lat, b.lon);
        const mx = (pa.x + pb.x) / 2;
        const my = (pa.y + pb.y) / 2;
        const angle = Math.atan2(pb.y - pa.y, pb.x - pa.x);
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-5, -4); ctx.lineTo(5, 0); ctx.lineTo(-5, 4);
        ctx.strokeStyle = "rgba(0,212,255,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // ── Waypoints ──
    const t = tickRef.current;
    waypoints.forEach((wp, i) => {
      const { x, y } = px(wp.lat, wp.lon);
      const isFirst    = i === 0;
      const isSelected = i === selectedWp;
      const color      = isFirst ? WP_DONE : WP_COLOR;

      // Пульсация выбранной/первой точки
      if (isFirst || isSelected) {
        const pulse = Math.sin(t * 0.07) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 16 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${isFirst ? "0,255,136" : "0,212,255"},${0.07 + pulse * 0.05})`;
        ctx.fill();
      }

      // Круг точки
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 10 : 8, 0, Math.PI * 2);
      ctx.fillStyle   = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = isSelected ? 14 : 8;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Обводка
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 10 : 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(5,9,14,0.8)";
      ctx.lineWidth   = 2;
      ctx.stroke();

      // Номер точки
      ctx.font      = "bold 9px monospace";
      ctx.fillStyle = "rgba(5,9,14,0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), x, y);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      // Метка действия
      if (wp.action && wp.action !== "") {
        const lbl = ACTION_LABELS[wp.action] ?? wp.action;
        ctx.font      = "9px monospace";
        const tw      = ctx.measureText(lbl).width;
        ctx.fillStyle = "rgba(5,9,14,0.8)";
        ctx.fillRect(x + 12, y - 10, tw + 8, 14);
        ctx.fillStyle = color;
        ctx.fillText(lbl, x + 16, y + 1);
      }
    });

    // ── Масштаб ──
    const mpp     = metersPerPixel(cx.lat, z);
    const targetM = [50,100,200,500,1000,2000,5000,10000,20000,50000,100000]
      .find(m => m / mpp >= 60) ?? 100000;
    const scalePx = targetM / mpp;
    ctx.strokeStyle = "rgba(0,212,255,0.7)"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(14, H - 14); ctx.lineTo(14 + scalePx, H - 14);
    ctx.moveTo(14, H - 19); ctx.lineTo(14, H - 9);
    ctx.moveTo(14 + scalePx, H - 19); ctx.lineTo(14 + scalePx, H - 9);
    ctx.stroke();
    ctx.fillStyle = "rgba(0,212,255,0.8)"; ctx.font = "10px monospace";
    ctx.fillText(targetM >= 1000 ? `${(targetM/1000).toFixed(0)} км` : `${targetM} м`, 14, H - 17);

    // ── Координаты ──
    const coord = fmtCoord(cx.lat, cx.lon);
    ctx.fillStyle = "rgba(0,212,255,0.4)"; ctx.font = "9px monospace";
    const cw = ctx.measureText(coord).width;
    ctx.fillText(coord, W - cw - 8, H - 6);

    tickRef.current++;
    animRef.current = requestAnimationFrame(draw);
  }, [waypoints, selectedWp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
    return () => { ro.disconnect(); cancelAnimationFrame(animRef.current); };
  }, [draw]);

  // ── Mouse events ─────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const px   = e.clientX - rect.left;
    const py   = e.clientY - rect.top;

    // Правый клик — удалить точку
    if (e.button === 2) {
      const idx = wpAtPixel(px, py);
      if (idx !== null) {
        const next = waypoints.filter((_, i) => i !== idx);
        onChange(next);
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
      const next = waypoints.map((wp, i) =>
        i === dragWpRef.current!.idx ? { ...wp, lat: ll.lat, lon: ll.lon } : wp
      );
      onChange(next);
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
      // Если почти не двигали — выделение без drag
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

  const onContextMenu = (e: React.MouseEvent) => { e.preventDefault(); };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(18, Math.max(2, z + (e.deltaY < 0 ? 1 : -1))));
  };

  // Fit по текущим точкам
  const fitAll = () => {
    if (waypoints.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { center: c, zoom: z } = fitBounds(waypoints, canvas.offsetWidth, canvas.offsetHeight, 80);
    setCenter(c);
    setZoom(z);
  };

  const totalDist = (() => {
    if (waypoints.length < 2) return 0;
    let d = 0;
    for (let i = 0; i < waypoints.length; i++) {
      const a = waypoints[i];
      const b = waypoints[(i + 1) % waypoints.length];
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

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0 flex-wrap"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <Icon name="MapPin" size={14} style={{ color: "var(--electric)" }} />
        <span className="text-xs font-semibold">Конструктор маршрута</span>
        <span className="tag tag-muted" style={{ fontSize: 9 }}>Клик — добавить · ПКМ — удалить · Drag — переместить</span>

        {waypoints.length > 0 && (
          <span className="tag tag-electric ml-1">{waypoints.length} точек</span>
        )}
        {totalDist > 0 && (
          <span className="tag tag-green">
            {totalDist >= 1000 ? `${(totalDist/1000).toFixed(2)} км` : `${Math.round(totalDist)} м`}
          </span>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {waypoints.length >= 2 && (
            <button onClick={fitAll} title="Показать маршрут"
              className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
              style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
              <Icon name="Maximize2" size={11} />
            </button>
          )}
          {waypoints.length > 0 && (
            <button onClick={() => { onChange([]); setSelectedWp(null); }}
              className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
              style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}>
              <Icon name="Trash2" size={11} /> Очистить
            </button>
          )}
          <button onClick={() => setZoom(z => Math.min(18, z + 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold">+</button>
          <span className="hud-label w-6 text-center">{zoom}</span>
          <button onClick={() => setZoom(z => Math.max(2, z - 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold">−</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "hsl(210 20% 7%)" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full select-none"
          style={{ cursor: "crosshair" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { dragRef.current = null; dragWpRef.current = null; }}
          onContextMenu={onContextMenu}
          onWheel={onWheel}
        />

        {/* Подсказка при пустой карте */}
        {waypoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-6 rounded-xl" style={{ background: "rgba(5,9,14,0.7)" }}>
              <Icon name="MousePointer" size={28} style={{ color: "var(--electric)", margin: "0 auto 8px" }} />
              <p className="text-sm font-semibold mb-1">Кликни по карте</p>
              <p className="text-xs text-muted-foreground">Каждый клик добавляет точку маршрута</p>
            </div>
          </div>
        )}
      </div>

      {/* Редактор действия выбранной точки */}
      {selectedWp !== null && waypoints[selectedWp] && (
        <div className="shrink-0 px-4 py-2 flex items-center gap-3 flex-wrap"
          style={{ borderTop: "1px solid hsl(var(--border))", background: "rgba(0,212,255,0.04)" }}>
          <span className="hud-label">Точка #{selectedWp + 1}:</span>
          <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>
            {fmtCoord(waypoints[selectedWp].lat, waypoints[selectedWp].lon)}
          </span>
          <span className="hud-label ml-2">Действие:</span>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                const next = waypoints.map((wp, i) =>
                  i === selectedWp ? { ...wp, action: key } : wp
                );
                onChange(next);
              }}
              className="px-2 py-1 rounded text-xs transition-all"
              style={waypoints[selectedWp].action === key
                ? { background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.4)" }
                : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {label}
            </button>
          ))}
          <button onClick={() => setSelectedWp(null)} className="ml-auto btn-ghost px-2 py-1 rounded text-xs">
            <Icon name="X" size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
