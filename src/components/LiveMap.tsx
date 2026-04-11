/**
 * LiveMap — интерактивная карта OSM с дронами и геолокацией оператора.
 * Работает в любой точке мира: авто-fit по bbox дронов, корректный масштаб с учётом широты.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

// ─── Тайловые утилиты (WGS-84 → Web Mercator) ─────────────────────────────────

function latLonToWorld(lat: number, lon: number, zoom: number) {
  const n   = Math.pow(2, zoom);
  const tSz = 256;
  const wx  = ((lon + 180) / 360) * n * tSz;
  const lr  = (lat * Math.PI) / 180;
  const wy  = (1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2 * n * tSz;
  return { wx, wy };
}

/** Реальные метры на пиксель для данной широты и зума */
function metersPerPixel(lat: number, zoom: number) {
  const earthCirc = 40075016.686;
  return (earthCirc * Math.cos((lat * Math.PI) / 180)) / (256 * Math.pow(2, zoom));
}

/**
 * Вычисляет центр и зум так, чтобы все точки влезали в viewport с padding.
 * Возвращает { center, zoom } для любой точки Земли.
 */
function fitBounds(
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
function fmtCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}°${latDir}  ${Math.abs(lon).toFixed(5)}°${lonDir}`;
}

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

interface LiveMapProps {
  drones: MapDrone[];
  center?: { lat: number; lon: number };
  zoom?: number;
  height?: number;
  operatorPos?: { lat: number; lon: number } | null;
  selectedDroneId?: string | null;
  onSelectDrone?: (id: string | null) => void;
  showOperatorGeo?: boolean;
  className?: string;
}

const STATUS_COLOR: Record<string, string> = {
  flight:   "#00ff88",
  standby:  "#00d4ff",
  charging: "#f97316",
  offline:  "#64748b",
  error:    "#ff3b30",
};

const TILE_CACHE = new Map<string, HTMLImageElement>();

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function LiveMap({
  drones,
  center: centerProp,
  zoom: zoomProp,
  height = 320,
  operatorPos,
  selectedDroneId,
  onSelectDrone,
  showOperatorGeo = false,
  className = "",
}: LiveMapProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const animRef    = useRef<number>(0);
  const dragRef    = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const tickRef    = useRef(0);
  const fittedRef  = useRef(false); // авто-fit выполнен один раз

  const validDrones = drones.filter(d => d.lat && d.lon);

  // Начальный центр/зум — только от prop, позже пересчитывается fitAll
  const [center, setCenter] = useState<{ lat: number; lon: number }>(
    () => centerProp ?? { lat: 0, lon: 0 }
  );
  const [zoom, setZoom] = useState(zoomProp ?? 2);

  const centerRef = useRef(center);
  const zoomRef   = useRef(zoom);
  centerRef.current = center;
  zoomRef.current   = zoom;

  /** Вписать всех дронов (+ оператора) в viewport */
  const fitAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pts = [...validDrones.map(d => ({ lat: d.lat, lon: d.lon }))];
    if (operatorPos) pts.push(operatorPos);
    if (pts.length === 0) return;

    const { center: c, zoom: z } = fitBounds(pts, canvas.offsetWidth, canvas.offsetHeight, 70);
    setCenter(c);
    setZoom(z);
  }, [validDrones, operatorPos]);

  // Авто-fit при первом получении дронов
  useEffect(() => {
    if (!fittedRef.current && validDrones.length > 0) {
      fittedRef.current = true;
      fitAll();
    }
  }, [validDrones.length, fitAll]);

  // Если prop явно задан — следовать ему
  useEffect(() => {
    if (centerProp) setCenter(centerProp);
  }, [centerProp]);
  useEffect(() => {
    if (zoomProp != null) setZoom(zoomProp);
  }, [zoomProp]);

  // ── Рендер ──────────────────────────────────────────────────────────────────
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
        const tx = ((tX0 + dx) % n + n) % n;
        const ty = tY0 + dy;
        if (ty < 0 || ty >= n) continue;

        const px  = offX + dx * tSz;
        const py  = offY + dy * tSz;
        const key = `${z}/${tx}/${ty}`;

        const cached = TILE_CACHE.get(key);
        if (cached?.complete && cached.naturalWidth > 0) {
          ctx.drawImage(cached, px, py, tSz, tSz);
          ctx.fillStyle = "rgba(5,9,14,0.52)";
          ctx.fillRect(px, py, tSz, tSz);
        } else {
          ctx.fillStyle = "hsl(210 20% 7%)";
          ctx.fillRect(px, py, tSz, tSz);
          if (!cached) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            const s = ["a","b","c"][(tx + ty) % 3];
            img.src = `https://${s}.tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
            img.onload  = () => { TILE_CACHE.set(key, img); draw(); };
            img.onerror = () => { TILE_CACHE.set(key, img); };
            TILE_CACHE.set(key, img);
          }
        }
      }
    }

    // ── Сетка ──
    ctx.strokeStyle = "rgba(0,212,255,0.05)";
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // ── Хелпер: гео → пиксель ──
    const toPixel = (lat: number, lon: number) => {
      const { wx, wy } = latLonToWorld(lat, lon, z);
      return { x: W / 2 + (wx - worldX), y: H / 2 + (wy - worldY) };
    };

    const t = tickRef.current;

    // ── Дроны ──
    for (const drone of drones) {
      if (!drone.lat || !drone.lon) continue;
      const { x, y } = toPixel(drone.lat, drone.lon);
      if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;

      const color      = STATUS_COLOR[drone.status] ?? "#64748b";
      const isSelected = drone.id === selectedDroneId;
      const flying     = drone.status === "flight";

      if (flying) {
        const pulse = (Math.sin(t * 0.06 + drones.indexOf(drone)) * 0.5 + 0.5);
        const r     = 18 + pulse * 8;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color === "#00ff88" ? "0,255,136" : "0,212,255"},${0.06 + pulse * 0.04})`;
        ctx.fill();
      }

      if (flying && drone.heading != null) {
        const rad = (drone.heading - 90) * Math.PI / 180;
        const len = 28 + (drone.speed / 100) * 16;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(rad) * len, y + Math.sin(rad) * len);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1.5;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      const sz = flying ? 9 : 7;
      ctx.beginPath();
      ctx.moveTo(x, y - sz);
      ctx.lineTo(x + sz * 0.7, y);
      ctx.lineTo(x, y + sz);
      ctx.lineTo(x - sz * 0.7, y);
      ctx.closePath();
      ctx.fillStyle  = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = flying ? 12 : 6;
      ctx.fill();
      ctx.shadowBlur  = 0;

      const label     = drone.name;
      const altStr    = flying ? ` ${drone.altitude.toFixed(0)}м` : "";
      const fullLabel = label + altStr;
      ctx.font        = isSelected ? "bold 11px monospace" : "10px monospace";
      const tw        = ctx.measureText(fullLabel).width;
      const lx        = x - tw / 2;
      const ly        = y + sz + 16;

      ctx.fillStyle = "rgba(5,9,14,0.8)";
      ctx.fillRect(lx - 4, ly - 11, tw + 8, 15);
      ctx.fillStyle = color;
      ctx.fillText(fullLabel, lx, ly);

      if (flying && drone.battery != null) {
        const bw  = 28;
        const bh  = 4;
        const bx  = x - bw / 2;
        const by  = ly + 4;
        const pct = drone.battery / 100;
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = drone.battery > 40 ? "#00ff88" : "#f97316";
        ctx.fillRect(bx, by, bw * pct, bh);
      }
    }

    // ── Позиция оператора ──
    if (operatorPos) {
      const { x, y } = toPixel(operatorPos.lat, operatorPos.lon);
      if (x >= -20 && x <= W + 20 && y >= -20 && y <= H + 20) {
        const pulse = (Math.sin(t * 0.05) * 0.5 + 0.5);
        ctx.beginPath();
        ctx.arc(x, y, 20 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.07)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle   = "#00d4ff";
        ctx.shadowColor = "#00d4ff";
        ctx.shadowBlur  = 12;
        ctx.fill();
        ctx.shadowBlur  = 0;

        ctx.font      = "bold 10px monospace";
        ctx.fillStyle = "#00d4ff";
        ctx.fillText("ВЫ", x + 10, y + 4);
      }
    }

    // ── Перекрестие ──
    ctx.strokeStyle = "rgba(0,212,255,0.2)";
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(W/2 - 12, H/2); ctx.lineTo(W/2 + 12, H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2, H/2 - 12); ctx.lineTo(W/2, H/2 + 12); ctx.stroke();

    // ── Масштаб с учётом широты (haversine) ──
    const mpp      = metersPerPixel(cx.lat, z);
    const targetM  = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]
      .find(m => m / mpp >= 60) ?? 100000;
    const scalePx  = targetM / mpp;
    const scaleX   = 14;
    const scaleY   = H - 14;
    ctx.strokeStyle = "rgba(0,212,255,0.7)";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(scaleX, scaleY); ctx.lineTo(scaleX + scalePx, scaleY);
    ctx.moveTo(scaleX, scaleY - 5); ctx.lineTo(scaleX, scaleY + 5);
    ctx.moveTo(scaleX + scalePx, scaleY - 5); ctx.lineTo(scaleX + scalePx, scaleY + 5);
    ctx.stroke();
    ctx.fillStyle = "rgba(0,212,255,0.8)";
    ctx.font      = "10px monospace";
    const scaleLabel = targetM >= 1000 ? `${(targetM / 1000).toFixed(0)} км` : `${targetM} м`;
    ctx.fillText(scaleLabel, scaleX, scaleY - 7);

    // ── Координаты центра (N/S, E/W — любая точка мира) ──
    const coordStr = fmtCoord(cx.lat, cx.lon);
    ctx.fillStyle  = "rgba(0,212,255,0.45)";
    ctx.font       = "9px monospace";
    const cw = ctx.measureText(coordStr).width;
    ctx.fillText(coordStr, W - cw - 8, H - 6);

    tickRef.current++;
    animRef.current = requestAnimationFrame(draw);
  }, [drones, operatorPos, selectedDroneId]);

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

  // ── Drag to pan ──────────────────────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, cx: centerRef.current.lat, cy: centerRef.current.lon };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const z   = zoomRef.current;
    const n   = Math.pow(2, z);
    const tSz = 256;
    const dx  = e.clientX - dragRef.current.x;
    const dy  = e.clientY - dragRef.current.y;
    // Точный пересчёт пикселей в градусы с учётом широты
    const mpp  = metersPerPixel(dragRef.current.cx, z);
    const dLon = -(dx * mpp) / (111320 * Math.cos((dragRef.current.cx * Math.PI) / 180));
    const dLat =  (dy * mpp) / 111320;
    // Зажим: широта [-85, 85] (предел Web Mercator)
    const newLat = Math.max(-85, Math.min(85, dragRef.current.cx + dLat));
    const newLon = ((dragRef.current.cy + dLon + 180) % 360 + 360) % 360 - 180;
    setCenter({ lat: newLat, lon: newLon });
    // Подавляем неиспользуемую переменную
    void (n * tSz);
  };
  const onMouseUp = () => { dragRef.current = null; };

  // ── Touch support ────────────────────────────────────────────────────────────
  const touchRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, cx: centerRef.current.lat, cy: centerRef.current.lon };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    e.preventDefault();
    const t   = e.touches[0];
    const mpp = metersPerPixel(touchRef.current.cx, zoomRef.current);
    const dx  = t.clientX - touchRef.current.x;
    const dy  = t.clientY - touchRef.current.y;
    const dLon = -(dx * mpp) / (111320 * Math.cos((touchRef.current.cx * Math.PI) / 180));
    const dLat =  (dy * mpp) / 111320;
    const newLat = Math.max(-85, Math.min(85, touchRef.current.cx + dLat));
    const newLon = ((touchRef.current.cy + dLon + 180) % 360 + 360) % 360 - 180;
    setCenter({ lat: newLat, lon: newLon });
  };
  const onTouchEnd = () => { touchRef.current = null; };

  // ── Zoom wheel ───────────────────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(18, Math.max(2, z + (e.deltaY < 0 ? 1 : -1))));
  };

  const centerOnDrone = (drone: MapDrone) => {
    setCenter({ lat: drone.lat, lon: drone.lon });
    onSelectDrone?.(drone.id);
  };

  const flyingDrones = drones.filter(d => d.status === "flight");

  return (
    <div className={`flex flex-col ${className}`} style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0 flex-wrap"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <Icon name="Map" size={14} style={{ color: "var(--electric)" }} />
        <span className="text-xs font-semibold">Карта БПЛА</span>
        {flyingDrones.length > 0 && (
          <span className="tag tag-green flex items-center gap-1.5 ml-1">
            <span className="dot-online" /> {flyingDrones.length} в воздухе
          </span>
        )}

        {/* Быстрый переход к дрону */}
        <div className="flex gap-1 ml-2 flex-wrap">
          {validDrones.map(d => (
            <button
              key={d.id}
              onClick={() => centerOnDrone(d)}
              className="px-2 py-1 rounded text-xs transition-all"
              style={selectedDroneId === d.id
                ? { background: `${STATUS_COLOR[d.status] ?? "#00d4ff"}20`, color: STATUS_COLOR[d.status] ?? "#00d4ff", border: `1px solid ${STATUS_COLOR[d.status] ?? "#00d4ff"}50` }
                : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {/* Показать всех */}
          <button
            onClick={fitAll}
            title="Показать всех"
            className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
            style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
          >
            <Icon name="Maximize2" size={11} />
          </button>

          {/* Центр на операторе */}
          {showOperatorGeo && operatorPos && (
            <button
              onClick={() => setCenter(operatorPos)}
              title="Моя позиция"
              className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
              style={{ background: "rgba(0,212,255,0.1)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }}
            >
              <Icon name="Navigation" size={11} /> Я
            </button>
          )}

          {/* Зум */}
          <button onClick={() => setZoom(z => Math.min(18, z + 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold hover:opacity-80">+</button>
          <span className="hud-label w-6 text-center">{zoom}</span>
          <button onClick={() => setZoom(z => Math.max(2, z - 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold hover:opacity-80">−</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "hsl(210 20% 7%)" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* Легенда */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1"
          style={{ background: "rgba(5,9,14,0.85)", borderRadius: 8, padding: "8px 10px" }}>
          {Object.entries({ flight: "В полёте", standby: "Готов", charging: "Зарядка", offline: "Офлайн" }).map(([s, l]) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLOR[s] }} />
              <span className="hud-label" style={{ fontSize: 9 }}>{l}</span>
            </div>
          ))}
          {operatorPos && (
            <div className="flex items-center gap-2 mt-1 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--electric)" }} />
              <span className="hud-label" style={{ fontSize: 9 }}>Оператор</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
