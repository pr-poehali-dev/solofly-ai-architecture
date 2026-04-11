import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useLiveFleet } from "@/hooks/useLiveFleet";
import { scanning as scanningApi } from "@/lib/api";
import { SENSOR_MODES, getScanLogMessages, type SensorModeId, type ScanLogEntry } from "./scanning/scanningTypes";
import ScanVisualizer from "./scanning/ScanVisualizer";
import ScanSidebar from "./scanning/ScanSidebar";

export default function ScanningPage({ onNavigate }: { onNavigate?: (page: string) => void } = {}) {
  const { data: fleet } = useLiveFleet(5000);
  const [modeId, setModeId] = useState<SensorModeId>("lidar_terrain");
  const [droneId, setDroneId] = useState("SF-001");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);

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
    const msgs = getScanLogMessages(id, mode.range_m / 1000);
    const arr = msgs[id];
    return arr[Math.floor((p / 100) * arr.length)] ?? arr[arr.length - 1];
  }

  const handleStart = async () => {
    setProgress(0);
    setScanLog([]);
    setSavedUrl(null);
    setScanning(true);
    addLog(`Запуск сканирования · ${mode.label} · дрон ${droneId}`, mode.color);
    // Создаём сессию в БД
    try {
      const res = await scanningApi.create({ mode: modeId, drone_id: droneId });
      setActiveSessionId(res.id);
      addLog(`Сессия ${res.code} создана в системе`, "var(--electric)");
    } catch {
      addLog("Сессия создана локально (БД недоступна)", "var(--warning)");
    }
  };

  const handleStop = () => {
    setScanning(false);
    addLog("Сканирование прервано оператором", "var(--warning)");
  };

  const handleSaveToCloud = async () => {
    if (progress < 1) return;
    setSaving(true);
    addLog("Сохранение результатов в облако…", "var(--electric)");
    try {
      const logStrings = scanLog.map(l => `[${l.ts}] ${l.msg}`);
      const idToSave   = activeSessionId;
      if (!idToSave) {
        // Создаём сессию на лету если не создана
        const res = await scanningApi.create({ mode: modeId, drone_id: droneId });
        setActiveSessionId(res.id);
        const saved = await scanningApi.save(res.id, logStrings, Math.round(progress));
        setSavedUrl(saved.url);
        addLog(`Сохранено: ${saved.code} · ${saved.size_kb} КБ`, "var(--signal-green)");
      } else {
        const saved = await scanningApi.save(idToSave, logStrings, Math.round(progress));
        setSavedUrl(saved.url);
        addLog(`Сохранено: ${saved.code} · ${saved.size_kb} КБ`, "var(--signal-green)");
      }
    } catch {
      addLog("Ошибка сохранения в облако", "var(--danger)");
    } finally {
      setSaving(false);
    }
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
          <button
            onClick={handleSaveToCloud}
            disabled={progress === 0 || scanning || saving || !!savedUrl}
            className="px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all disabled:opacity-40"
            style={savedUrl
              ? { background: "rgba(0,255,136,0.1)", color: "var(--signal-green)", border: "1px solid rgba(0,255,136,0.3)" }
              : { background: "rgba(0,212,255,0.1)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.25)" }
            }
          >
            <Icon name={savedUrl ? "CloudCheck" : saving ? "Loader" : "Cloud"} fallback="Cloud" size={13}
              className={saving ? "animate-spin" : ""} />
            {savedUrl ? "Сохранено" : saving ? "Сохраняю…" : "Сохранить в облако"}
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
        <ScanSidebar
          mode={mode}
          scanLog={scanLog}
          savedUrl={savedUrl}
          onClearLog={() => setScanLog([])}
          onNavigateArchive={onNavigate ? () => onNavigate("scanarchive") : undefined}
        />
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