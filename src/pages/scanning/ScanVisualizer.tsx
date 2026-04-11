import { useEffect, useRef } from "react";
import { SENSOR_MODES, type SensorModeId } from "./scanningTypes";

interface ScanVisualizerProps {
  modeId: SensorModeId;
  active: boolean;
  progress: number;
}

export default function ScanVisualizer({ modeId, active, progress }: ScanVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2;

    const mode = SENSOR_MODES.find(m => m.id === modeId)!;
    const color = mode.color;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(0,212,255,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const t = tickRef.current;

      if (modeId === "lidar_terrain" || modeId === "lidar_objects") {
        // Облако точек — рельеф
        const seed = 42;
        const pts = 600;
        for (let i = 0; i < pts; i++) {
          const px = ((Math.sin(i * 2.3 + seed) * 0.5 + 0.5)) * W;
          const py = ((Math.cos(i * 1.7 + seed) * 0.3 + 0.5 + Math.sin(i * 0.3) * 0.15)) * H;
          const val = (Math.sin(i * 0.5) * 0.5 + 0.5);
          const done = (i / pts) * 100 < progress;
          const scan = active && Math.abs((i / pts) * 100 - progress) < 3;
          if (!done && !scan) continue;
          ctx.beginPath();
          ctx.arc(px, py, scan ? 2.5 : 1.5, 0, Math.PI * 2);
          const r = scan ? color : `rgba(${modeId === "lidar_terrain" ? "0,255,136" : "0,212,255"},${0.3 + val * 0.6})`;
          ctx.fillStyle = r;
          if (scan) ctx.shadowColor = color;
          if (scan) ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Линия скана
        if (active) {
          const scanY = (progress / 100) * H;
          ctx.beginPath();
          ctx.moveTo(0, scanY);
          ctx.lineTo(W, scanY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.6 + Math.sin(t * 0.1) * 0.3;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      } else if (modeId === "radar_long" || modeId === "sar") {
        // Радарный веер
        const rings = 5;
        for (let r = 1; r <= rings; r++) {
          const radius = (r / rings) * Math.min(W, H) * 0.45;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(167,139,250,${0.08 + (r === rings ? 0.1 : 0)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Вращающийся луч
        const angle = active ? (t * 0.03) % (Math.PI * 2) : 0;
        const fov = (SENSOR_MODES.find(m => m.id === modeId)!.fov_deg * Math.PI) / 180 / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, Math.min(W, H) * 0.45, angle - fov, angle + fov);
        ctx.closePath();
        ctx.fillStyle = "rgba(167,139,250,0.08)";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * Math.min(W, H) * 0.46, cy + Math.sin(angle) * Math.min(W, H) * 0.46);
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = active ? 0.9 : 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Обнаруженные объекты
        const objs = [
          { a: 0.8, r: 0.25 }, { a: 2.1, r: 0.38 }, { a: 3.5, r: 0.3 },
          { a: 4.9, r: 0.42 }, { a: 5.6, r: 0.2 },
        ];
        for (const o of objs) {
          const dist = o.r * Math.min(W, H) * 0.45;
          const ox = cx + Math.cos(o.a) * dist;
          const oy = cy + Math.sin(o.a) * dist;
          ctx.beginPath();
          ctx.arc(ox, oy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#a78bfa";
          ctx.shadowColor = "#a78bfa";
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (modeId === "thermal") {
        // Тепловая карта
        const rows = 12, cols = 18;
        const cw = W / cols, ch = H / rows;
        const thermal = [
          [10,12,15,18,22,28,35,38,36,30,24,18,14,12,11,10,10,9],
          [11,13,16,20,26,34,45,52,48,38,28,20,15,12,11,10,10,9],
          [12,14,18,24,30,38,48,58,55,42,32,22,17,13,12,11,10,9],
          [11,14,17,22,28,35,44,52,50,38,29,21,16,13,11,11,10,9],
          [10,13,15,19,24,30,38,44,42,33,25,19,15,12,11,10,10,9],
          [10,12,14,17,20,25,31,36,34,27,21,16,13,12,11,10,9,9],
          [9,11,13,15,18,22,27,30,28,22,18,14,12,11,10,9,9,8],
          [9,10,12,14,16,19,23,26,24,19,16,13,11,10,10,9,9,8],
          [8,10,11,13,15,17,20,22,21,17,14,12,10,9,9,8,8,7],
          [8,9,10,12,13,15,18,19,18,15,12,11,9,9,8,8,7,7],
          [7,8,9,10,11,13,15,16,15,13,11,10,9,8,8,7,7,6],
          [7,7,8,9,10,11,13,14,13,11,10,9,8,7,7,7,6,6],
        ];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const v = (thermal[r][c] - 6) / 52;
            const done = ((r * cols + c) / (rows * cols)) * 100 < progress;
            if (!done) continue;
            const red = Math.round(v * 255);
            const blue = Math.round((1 - v) * 180);
            ctx.fillStyle = `rgba(${red},${Math.round(v * 80)},${blue},0.75)`;
            ctx.fillRect(c * cw, r * ch, cw - 1, ch - 1);
          }
        }
        // Горячая точка
        if (progress > 40) {
          ctx.beginPath();
          ctx.arc(W * 0.44, H * 0.35, 8 + Math.sin(t * 0.08) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = "#f97316";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(249,115,22,0.15)";
          ctx.fill();
          ctx.fillStyle = "#f97316";
          ctx.font = "10px monospace";
          ctx.fillText("58.4°C", W * 0.44 + 12, H * 0.35 + 4);
        }
      } else if (modeId === "multispectral") {
        // NDVI карта
        const rows = 14, cols = 20;
        const cw = W / cols, ch = H / rows;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const done = ((r * cols + c) / (rows * cols)) * 100 < progress;
            if (!done) continue;
            const v = Math.sin(r * 0.7 + c * 0.5) * 0.5 + 0.5;
            const v2 = Math.cos(r * 0.4 + c * 0.8) * 0.3 + 0.5;
            const ndvi = v * v2;
            const g = Math.round(80 + ndvi * 175);
            const rb = Math.round(20 + (1 - ndvi) * 60);
            ctx.fillStyle = `rgba(${rb},${g},${rb},0.8)`;
            ctx.fillRect(c * cw, r * ch, cw - 1, ch - 1);
          }
        }
        // NDVI шкала
        if (progress > 20) {
          const grd = ctx.createLinearGradient(W - 20, 10, W - 20, H - 10);
          grd.addColorStop(0, "rgb(220,20,60)");
          grd.addColorStop(0.5, "rgb(255,200,50)");
          grd.addColorStop(1, "rgb(0,180,50)");
          ctx.fillStyle = grd;
          ctx.fillRect(W - 16, 10, 8, H - 20);
          ctx.fillStyle = "rgba(0,212,255,0.8)";
          ctx.font = "9px monospace";
          ctx.fillText("1.0", W - 14, 20);
          ctx.fillText("0.0", W - 14, H - 12);
        }
      }

      // Центр
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      tickRef.current++;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [modeId, active, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
