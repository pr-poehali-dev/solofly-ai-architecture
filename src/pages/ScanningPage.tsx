import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { useLiveFleet } from "@/hooks/useLiveFleet";

// ─── Режимы сенсоров ────────────────────────────────────────────────────────

const SENSOR_MODES = [
  {
    id: "lidar_terrain",
    label: "LiDAR · Рельеф",
    icon: "Mountain",
    color: "var(--signal-green)",
    sensor: "LiDAR",
    range_m: 500,
    resolution_cm: 2,
    freq_hz: 20,
    fov_deg: 120,
    desc: "Высокоточная 3D-топография, облако точек, построение ЦМР",
    tag: "tag-green",
    pointDensity: "150 тч/м²",
    accuracy: "±2 см",
    scanPattern: "Зигзаг",
  },
  {
    id: "lidar_objects",
    label: "LiDAR · Объекты",
    icon: "Scan",
    color: "var(--electric)",
    sensor: "LiDAR",
    range_m: 300,
    resolution_cm: 1,
    freq_hz: 40,
    fov_deg: 90,
    desc: "Обнаружение и классификация объектов, 3D-профилирование",
    tag: "tag-electric",
    pointDensity: "320 тч/м²",
    accuracy: "±1 см",
    scanPattern: "Спираль",
  },
  {
    id: "radar_long",
    label: "Радар · Дальний",
    icon: "Radio",
    color: "#a78bfa",
    sensor: "Радар SAR",
    range_m: 15000,
    resolution_cm: 50,
    freq_hz: 1,
    fov_deg: 30,
    desc: "Обнаружение объектов и поверхностей на расстоянии до 15 км",
    tag: "tag-muted",
    pointDensity: "4 тч/м²",
    accuracy: "±50 см",
    scanPattern: "Секторный",
  },
  {
    id: "thermal",
    label: "Тепловизор",
    icon: "Flame",
    color: "#f97316",
    sensor: "FLIR",
    range_m: 5000,
    resolution_cm: 10,
    freq_hz: 30,
    fov_deg: 60,
    desc: "Тепловое картирование, поиск живых объектов, мониторинг инфраструктуры",
    tag: "tag-warning",
    pointDensity: "—",
    accuracy: "±0.1°C",
    scanPattern: "Полосовой",
  },
  {
    id: "multispectral",
    label: "Мультиспектр",
    icon: "Layers",
    color: "#22d3ee",
    sensor: "MS-камера",
    range_m: 1000,
    resolution_cm: 5,
    freq_hz: 10,
    fov_deg: 75,
    desc: "Анализ растительности (NDVI), состояние почвы, мониторинг посевов",
    tag: "tag-electric",
    pointDensity: "80 тч/м²",
    accuracy: "±5 см",
    scanPattern: "Полосовой",
  },
  {
    id: "sar",
    label: "SAR · Синтетика",
    icon: "Aperture",
    color: "#e879f9",
    sensor: "SAR X-band",
    range_m: 15000,
    resolution_cm: 25,
    freq_hz: 2,
    fov_deg: 45,
    desc: "Радиолокационная съёмка сквозь облака и ночью, до 15 000 м",
    tag: "tag-muted",
    pointDensity: "10 тч/м²",
    accuracy: "±25 см",
    scanPattern: "Боковой обзор",
  },
] as const;

type SensorModeId = typeof SENSOR_MODES[number]["id"];

// ─── Визуализация скана ─────────────────────────────────────────────────────

function ScanVisualizer({ modeId, active, progress }: { modeId: SensorModeId; active: boolean; progress: number }) {
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

// ─── Главная страница ───────────────────────────────────────────────────────

export default function ScanningPage() {
  const { data: fleet } = useLiveFleet(5000);
  const [modeId, setModeId] = useState<SensorModeId>("lidar_terrain");
  const [droneId, setDroneId] = useState("SF-001");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanLog, setScanLog] = useState<{ ts: string; msg: string; color: string }[]>([]);

  const mode = SENSOR_MODES.find(m => m.id === modeId)!;
  const drones = fleet?.drones ?? [];

  // Симуляция прогресса скана
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setScanning(false);
          addLog(`Сканирование завершено. Режим: ${mode.label}`, mode.color);
          return 100;
        }
        if (p % 20 < 1) {
          addLog(logMessages(modeId, p), mode.color);
        }
        return p + 0.4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [scanning, modeId]);

  function addLog(msg: string, color: string) {
    const ts = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setScanLog(prev => [{ ts, msg, color }, ...prev].slice(0, 20));
  }

  function logMessages(id: SensorModeId, p: number): string {
    const msgs: Record<SensorModeId, string[]> = {
      lidar_terrain: [
        "Калибровка IMU завершена", "Первый пролёт — линия 001",
        "Плотность точек в норме (150 тч/м²)", "Обнаружен перепад высот +12 м",
        "Построение ЦМР-сетки...", "Финальный пролёт — линия завершена",
      ],
      lidar_objects: [
        "Инициализация 40 Гц режима", "Обнаружен объект 0.8×1.2 м",
        "Классификация: транспортное средство", "3D-профиль записан",
        "Обнаружен объект: строение", "Экспорт облака точек...",
      ],
      radar_long: [
        "Синхронизация фазовой решётки", "Луч стабилизирован",
        `Дальность подтверждена: ${mode.range_m / 1000} км`, "Обнаружено 5 отражений",
        "Классификация целей по RCS", "Обновление карты отражений",
      ],
      thermal: [
        "Охлаждение матрицы до -10°C", "Калибровка по ЧТ 35°C",
        "Обнаружен тепловой аномалий +22°C", "NUC-коррекция применена",
        "Аномальная точка: 58.4°C", "Тепловая карта экспортирована",
      ],
      multispectral: [
        "Синхронизация 5 каналов", "Геопривязка к GNSS",
        "NDVI рассчитывается...", "Обнаружены стрессовые зоны",
        "Хлорофилл: 42 мкг/см²", "Карта NDVI записана",
      ],
      sar: [
        "Синтез апертуры 512 м", "Подавление помех",
        "Сквозь облачность: активно", "Разрешение 25 см подтверждено",
        "Обнаружены металлические объекты", "SAR-мозаика построена",
      ],
    };
    const arr = msgs[id];
    return arr[Math.floor((p / 100) * arr.length)] ?? arr[arr.length - 1];
  }

  const handleStart = () => {
    setProgress(0);
    setScanLog([]);
    setScanning(true);
    addLog(`Запуск сканирования · ${mode.label} · дрон ${droneId}`, mode.color);
  };

  const handleStop = () => {
    setScanning(false);
    addLog("Сканирование прервано оператором", "var(--warning)");
  };

  const handleExport = () => {
    const data = [
      `# SoloFly Scan Report`,
      `Режим: ${mode.label}`,
      `Сенсор: ${mode.sensor}`,
      `Дальность: ${mode.range_m >= 1000 ? `${mode.range_m / 1000} км` : `${mode.range_m} м`}`,
      `Точность: ${mode.accuracy}`,
      `Дрон: ${droneId}`,
      `Прогресс: ${progress.toFixed(1)}%`,
      ``,
      `Лог:`,
      ...scanLog.map(l => `[${l.ts}] ${l.msg}`),
    ].join("\n");
    const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan_${modeId}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Сканирование поверхности</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Мульти-сенсорный режим · LiDAR / Радар / SAR · до 15 000 м
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Выбор дрона */}
          <select
            value={droneId}
            onChange={e => setDroneId(e.target.value)}
            className="panel px-3 py-2 rounded-lg text-xs outline-none"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
          >
            {drones.length > 0
              ? drones.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)
              : <option value="SF-001">SF-001</option>
            }
          </select>
          <button onClick={handleExport} disabled={progress === 0} className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2 disabled:opacity-40">
            <Icon name="Download" size={13} /> Экспорт
          </button>
          {scanning
            ? <button onClick={handleStop} className="px-4 py-2 rounded-lg text-xs flex items-center gap-2" style={{ background: "rgba(255,59,48,0.12)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.3)" }}>
                <Icon name="Square" size={13} /> Стоп
              </button>
            : <button onClick={handleStart} className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
                <Icon name="Play" size={13} />
                {progress > 0 && progress < 100 ? "Продолжить" : "Начать скан"}
              </button>
          }
        </div>
      </div>

      {/* Sensor mode selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SENSOR_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => { setModeId(m.id); setProgress(0); setScanning(false); setScanLog([]); }}
            className={`p-4 rounded-xl flex flex-col items-start gap-2 transition-all text-left panel`}
            style={modeId === m.id
              ? { borderColor: m.color, background: `${m.color}0d` }
              : {}
            }
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: modeId === m.id ? `${m.color}20` : "hsl(var(--input))" }}>
              <Icon name={m.icon} fallback="Scan" size={16} style={{ color: modeId === m.id ? m.color : "hsl(var(--muted-foreground))" }} />
            </div>
            <div>
              <div className="text-xs font-semibold leading-tight">{m.label}</div>
              <div className="hud-label mt-0.5" style={{ color: modeId === m.id ? m.color : undefined }}>
                {m.range_m >= 1000 ? `${m.range_m / 1000} км` : `${m.range_m} м`}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Visualizer */}
        <div className="lg:col-span-2 panel rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${mode.color}18` }}>
                <Icon name={mode.icon} fallback="Scan" size={15} style={{ color: mode.color }} />
              </div>
              <div>
                <span className="font-semibold text-sm">{mode.label}</span>
                <span className="hud-label ml-2">{mode.sensor}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {scanning && <span className="tag tag-green flex items-center gap-1.5"><span className="dot-online" /> Активно</span>}
              {!scanning && progress > 0 && progress < 100 && <span className="tag tag-warning">Пауза</span>}
              {progress === 100 && <span className="tag tag-electric">Завершено</span>}
              {!scanning && progress === 0 && <span className="tag tag-muted">Ожидание</span>}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative" style={{ minHeight: 280, background: "hsl(210 25% 4%)" }}>
            <ScanVisualizer modeId={modeId} active={scanning} progress={progress} />

            {/* Overlay info */}
            <div className="absolute top-3 left-3 space-y-1">
              <div className="px-2 py-1 rounded text-xs font-mono" style={{ background: "rgba(5,9,14,0.8)", color: mode.color }}>
                {mode.range_m >= 1000 ? `RANGE: ${(mode.range_m / 1000).toFixed(0)} KM` : `RANGE: ${mode.range_m} M`}
              </div>
              <div className="px-2 py-1 rounded text-xs font-mono" style={{ background: "rgba(5,9,14,0.8)", color: "var(--electric)" }}>
                FOV: {mode.fov_deg}° · {mode.freq_hz} Hz
              </div>
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded text-xs font-mono" style={{ background: "rgba(5,9,14,0.8)", color: "var(--signal-green)" }}>
              DRONE: {droneId}
            </div>

            {progress > 0 && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex justify-between mb-1">
                  <span className="hud-label" style={{ fontSize: 10 }}>SCAN PROGRESS</span>
                  <span className="hud-value" style={{ fontSize: 10, color: mode.color }}>{progress.toFixed(1)}%</span>
                </div>
                <div className="bar-track" style={{ height: 3 }}>
                  <div className="bar-fill" style={{ width: `${progress}%`, background: mode.color, transition: "width 0.2s ease" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Sensor params */}
          <div className="panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Параметры сенсора</h2>
              <span className={`tag ${mode.tag}`}>{mode.sensor}</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Дальность", val: mode.range_m >= 1000 ? `${mode.range_m / 1000} км` : `${mode.range_m} м`, icon: "Maximize2" },
                { label: "Разрешение", val: `${mode.resolution_cm} см`, icon: "Crosshair" },
                { label: "Точность", val: mode.accuracy, icon: "Target" },
                { label: "Частота", val: `${mode.freq_hz} Гц`, icon: "Waves" },
                { label: "Угол обзора", val: `${mode.fov_deg}°`, icon: "Aperture" },
                { label: "Плотность", val: mode.pointDensity, icon: "Grid3x3" },
                { label: "Паттерн", val: mode.scanPattern, icon: "Route" },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="flex items-center gap-2">
                    <Icon name={p.icon} fallback="Circle" size={12} style={{ color: mode.color }} />
                    <span className="hud-label">{p.label}</span>
                  </div>
                  <span className="hud-value text-xs">{p.val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{mode.desc}</p>
          </div>

          {/* Scan log */}
          <div className="panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Лог сканирования</h2>
              {scanLog.length > 0 && (
                <button onClick={() => setScanLog([])} className="hud-label hover:text-foreground transition-colors">
                  очистить
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {scanLog.length === 0
                ? <p className="text-xs text-muted-foreground">Запустите сканирование</p>
                : scanLog.map((l, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="hud-label shrink-0 font-mono">{l.ts}</span>
                      <span style={{ color: l.color }}>{l.msg}</span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Режим",         val: mode.label,    icon: mode.icon,      color: mode.color         },
          { label: "Макс. дальность", val: mode.range_m >= 1000 ? `${mode.range_m / 1000} км` : `${mode.range_m} м`, icon: "Maximize2", color: "var(--electric)" },
          { label: "Разрешение",    val: mode.resolution_cm + " см", icon: "Crosshair", color: "var(--signal-green)" },
          { label: "Прогресс",      val: `${progress.toFixed(0)}%`, icon: "Activity",  color: scanning ? "var(--signal-green)" : "var(--electric)" },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Circle" size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="hud-value text-sm" style={{ color: s.color }}>{s.val}</div>
              <div className="hud-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
