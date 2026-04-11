import {
  latLonToWorld,
  metersPerPixel,
  fmtCoord,
  STATUS_COLOR,
  TILE_CACHE,
  type MapDrone,
} from "./mapUtils";

interface DrawMapCanvasOptions {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  center: { lat: number; lon: number };
  zoom: number;
  drones: MapDrone[];
  operatorPos?: { lat: number; lon: number } | null;
  selectedDroneId?: string | null;
  tick: number;
  onTileLoad: () => void;
}

export function drawMapCanvas({
  ctx,
  W,
  H,
  center: cx,
  zoom: z,
  drones,
  operatorPos,
  selectedDroneId,
  tick: t,
  onTileLoad,
}: DrawMapCanvasOptions) {
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
          img.onload  = () => { TILE_CACHE.set(key, img); onTileLoad(); };
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
    ctx.fillStyle   = color;
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
  const mpp     = metersPerPixel(cx.lat, z);
  const targetM = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]
    .find(m => m / mpp >= 60) ?? 100000;
  const scalePx = targetM / mpp;
  const scaleX  = 14;
  const scaleY  = H - 14;
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
}
