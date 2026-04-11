/**
 * LiveMap — интерактивная карта OSM с дронами и геолокацией оператора.
 * Canvas-рендер, без сторонних зависимостей.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import type { Drone } from "@/lib/api";

// ─── Тайловые утилиты ─────────────────────────────────────────────────────────

function latLonToWorld(lat: number, lon: number, zoom: number) {
  const n   = Math.pow(2, zoom);
  const tSz = 256;
  const wx  = ((lon + 180) / 360) * n * tSz;
  const lr  = (lat * Math.PI) / 180;
  const wy  = (1 - Math.log(Math.tan(lr) + 1 / Math.cos(lr)) / Math.PI) / 2 * n * tSz;
  return { wx, wy };
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
  zoom: zoomProp = 14,
  height = 320,
  operatorPos,
  selectedDroneId,
  onSelectDrone,
  showOperatorGeo = false,
  className = "",
}: LiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const dragRef   = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const tickRef   = useRef(0);

  // Центр: первый летящий дрон → все дроны → Москва
  const defaultCenter = useCallback(() => {
    const flying = drones.find(d => d.status === "flight" && d.lat && d.lon);
    if (flying) return { lat: flying.lat, lon: flying.lon };
    const withPos = drones.find(d => d.lat && d.lon);
    if (withPos) return { lat: withPos.lat, lon: withPos.lon };
    return { lat: 55.751, lon: 37.618 };
  }, [drones]);

  const [center, setCenter]  = useState(() => centerProp ?? defaultCenter());
  const [zoom,   setZoom]    = useState(zoomProp);
  const centerRef = useRef(center);
  const zoomRef   = useRef(zoom);
  centerRef.current = center;
  zoomRef.current   = zoom;

  // При смене drones, если нет явного центра — пересчитать
  useEffect(() => {
    if (!centerProp) setCenter(defaultCenter());
  }, [centerProp, defaultCenter]);

  // ── Рендер ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W  = canvas.width;
    const H  = canvas.height;
    const cx = centerRef.current;
    const z  = zoomRef.current;
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

        const px = offX + dx * tSz;
        const py = offY + dy * tSz;
        const key = `${z}/${tx}/${ty}`;

        const cached = TILE_CACHE.get(key);
        if (cached?.complete && cached.naturalWidth > 0) {
          ctx.drawImage(cached, px, py, tSz, tSz);
          // тёмный фильтр под тему
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

      const color    = STATUS_COLOR[drone.status] ?? "#64748b";
      const isSelected = drone.id === selectedDroneId;
      const flying   = drone.status === "flight";

      // Пульсация для летящих
      if (flying) {
        const pulse = (Math.sin(t * 0.06 + drones.indexOf(drone)) * 0.5 + 0.5);
        const r     = 18 + pulse * 8;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color === "#00ff88" ? "0,255,136" : "0,212,255"},${0.06 + pulse * 0.04})`;
        ctx.fill();
      }

      // Вектор курса
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

      // Выделение
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Иконка дрона (ромб)
      const sz = flying ? 9 : 7;
      ctx.beginPath();
      ctx.moveTo(x, y - sz);
      ctx.lineTo(x + sz * 0.7, y);
      ctx.lineTo(x, y + sz);
      ctx.lineTo(x - sz * 0.7, y);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = flying ? 12 : 6;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Метка
      const label = drone.name;
      const altStr = flying ? ` ${drone.altitude.toFixed(0)}м` : "";
      const fullLabel = label + altStr;
      ctx.font      = isSelected ? "bold 11px monospace" : "10px monospace";
      const tw      = ctx.measureText(fullLabel).width;
      const lx      = x - tw / 2;
      const ly      = y + sz + 16;

      ctx.fillStyle = "rgba(5,9,14,0.8)";
      ctx.fillRect(lx - 4, ly - 11, tw + 8, 15);
      ctx.fillStyle = color;
      ctx.fillText(fullLabel, lx, ly);

      // Батарея (для летящих)
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
        ctx.fillStyle = "rgba(255,59,48,0.07)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#ff3b30";
        ctx.shadowColor = "#ff3b30";
        ctx.shadowBlur  = 10;
        ctx.fill();
        ctx.shadowBlur  = 0;

        ctx.font      = "10px monospace";
        ctx.fillStyle = "#ff3b30";
        ctx.fillText("ВЫ", x + 10, y + 4);
      }
    }

    // ── Перекрестие центра ──
    ctx.strokeStyle = "rgba(0,212,255,0.2)";
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(W/2 - 12, H/2); ctx.lineTo(W/2 + 12, H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2, H/2 - 12); ctx.lineTo(W/2, H/2 + 12); ctx.stroke();

    // ── Масштаб ──
    const scaleM  = Math.round(500 * Math.pow(2, 14 - z));
    const { wx: wx1 } = latLonToWorld(cx.lat, cx.lon - (scaleM / 111320), z);
    const { wx: wx2 } = latLonToWorld(cx.lat, cx.lon + (scaleM / 111320), z);
    const scalePx = Math.abs(wx2 - wx1);
    const scaleX  = 14;
    const scaleY  = H - 14;
    ctx.strokeStyle = "rgba(0,212,255,0.7)";
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(scaleX, scaleY);
    ctx.lineTo(scaleX + scalePx, scaleY);
    ctx.stroke();
    ctx.fillStyle = "rgba(0,212,255,0.8)";
    ctx.font      = "10px monospace";
    const scaleLabel = scaleM >= 1000 ? `${(scaleM/1000).toFixed(1)} км` : `${scaleM} м`;
    ctx.fillText(scaleLabel, scaleX, scaleY - 5);

    // ── Координаты ──
    ctx.fillStyle = "rgba(0,212,255,0.45)";
    ctx.font      = "9px monospace";
    ctx.fillText(`${cx.lat.toFixed(5)}°N  ${cx.lon.toFixed(5)}°E`, W - 168, H - 6);

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
    dragRef.current = {
      x: e.clientX, y: e.clientY,
      cx: centerRef.current.lat,
      cy: centerRef.current.lon,
    };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const z    = zoomRef.current;
    const n    = Math.pow(2, z);
    const tSz  = 256;
    const dx   = e.clientX - dragRef.current.x;
    const dy   = e.clientY - dragRef.current.y;
    const dLon = -(dx / (n * tSz)) * 360;
    const dLat =  (dy / (n * tSz)) * 180;
    setCenter({ lat: dragRef.current.cx + dLat, lon: dragRef.current.cy + dLon });
  };
  const onMouseUp = () => { dragRef.current = null; };

  // ── Zoom wheel ───────────────────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(18, Math.max(10, z + (e.deltaY < 0 ? 1 : -1))));
  };

  const centerOnDrone = (drone: MapDrone) => {
    setCenter({ lat: drone.lat, lon: drone.lon });
    onSelectDrone?.(drone.id);
  };

  const flyingDrones = drones.filter(d => d.status === "flight");

  return (
    <div className={`flex flex-col ${className}`} style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <Icon name="Map" size={14} style={{ color: "var(--electric)" }} />
        <span className="text-xs font-semibold">Карта БПЛА</span>
        {flyingDrones.length > 0 && (
          <span className="tag tag-green flex items-center gap-1.5 ml-1">
            <span className="dot-online" /> {flyingDrones.length} в воздухе
          </span>
        )}

        {/* Быстрый переход к дрону */}
        <div className="flex gap-1 ml-2">
          {drones.filter(d => d.lat && d.lon).map(d => (
            <button
              key={d.id}
              onClick={() => centerOnDrone(d)}
              className="px-2 py-1 rounded text-xs transition-all"
              style={selectedDroneId === d.id
                ? { background: `${STATUS_COLOR[d.status] ?? "#00d4ff"}20`, color: STATUS_COLOR[d.status] ?? "#00d4ff", border: `1px solid ${STATUS_COLOR[d.status] ?? "#00d4ff"}50` }
                : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {d.name.split("-")[0]}-{d.id.split("-")[1]}
            </button>
          ))}
        </div>

        {/* Зум */}
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setZoom(z => Math.min(18, z + 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold hover:opacity-80">+</button>
          <span className="hud-label w-6 text-center">{zoom}</span>
          <button onClick={() => setZoom(z => Math.max(10, z - 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold hover:opacity-80">−</button>
        </div>

        {/* Кнопка геолокации */}
        {showOperatorGeo && operatorPos && (
          <button
            onClick={() => setCenter(operatorPos)}
            className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
            style={{ background: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.25)" }}
          >
            <Icon name="Navigation" size={11} /> Я
          </button>
        )}
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
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="hud-label" style={{ fontSize: 9 }}>Оператор</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
