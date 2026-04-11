import {
  latLonToWorld,
  metersPerPixel,
  fmtCoord,
  TILE_CACHE,
} from "./mapUtils";
import { ACTION_LABELS, WP_COLOR, WP_DONE, ROUTE_CLR, type Waypoint } from "./waypointTypes";

interface DrawWaypointsOptions {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  center: { lat: number; lon: number };
  zoom: number;
  waypoints: Waypoint[];
  selectedWp: number | null;
  tick: number;
}

export function drawWaypoints({
  ctx,
  W,
  H,
  center: cx,
  zoom: z,
  waypoints,
  selectedWp,
  tick: t,
}: DrawWaypointsOptions) {
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

  // ── Inline toPixel (без зависимости от state) ──
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
      const a  = waypoints[i];
      const b  = waypoints[(i + 1) % waypoints.length];
      const pa = px(a.lat, a.lon);
      const pb = px(b.lat, b.lon);
      const mx    = (pa.x + pb.x) / 2;
      const my    = (pa.y + pb.y) / 2;
      const angle = Math.atan2(pb.y - pa.y, pb.x - pa.x);
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-5, -4); ctx.lineTo(5, 0); ctx.lineTo(-5, 4);
      ctx.strokeStyle = "rgba(0,212,255,0.5)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Waypoints ──
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
    ctx.strokeStyle  = "rgba(5,9,14,0.8)";
    ctx.lineWidth    = 2;
    ctx.stroke();

    // Номер точки
    ctx.font         = "bold 9px monospace";
    ctx.fillStyle    = "rgba(5,9,14,0.9)";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(i + 1), x, y);
    ctx.textAlign    = "left";
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
  ctx.strokeStyle = "rgba(0,212,255,0.7)";
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(14, H - 14); ctx.lineTo(14 + scalePx, H - 14);
  ctx.moveTo(14, H - 19); ctx.lineTo(14, H - 9);
  ctx.moveTo(14 + scalePx, H - 19); ctx.lineTo(14 + scalePx, H - 9);
  ctx.stroke();
  ctx.fillStyle = "rgba(0,212,255,0.8)";
  ctx.font      = "10px monospace";
  ctx.fillText(targetM >= 1000 ? `${(targetM/1000).toFixed(0)} км` : `${targetM} м`, 14, H - 17);

  // ── Координаты ──
  const coord = fmtCoord(cx.lat, cx.lon);
  ctx.fillStyle = "rgba(0,212,255,0.4)";
  ctx.font      = "9px monospace";
  const cw = ctx.measureText(coord).width;
  ctx.fillText(coord, W - cw - 8, H - 6);
}
