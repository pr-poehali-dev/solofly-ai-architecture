import Icon from "@/components/ui/icon";
import type { SensorMode, ScanLogEntry } from "./scanningTypes";

interface ScanSidebarProps {
  mode: SensorMode;
  scanLog: ScanLogEntry[];
  savedUrl: string | null;
  autoSaveStatus: "idle" | "saving" | "done" | "error";
  onClearLog: () => void;
  onNavigateArchive?: () => void;
}

export default function ScanSidebar({ mode, scanLog, savedUrl, autoSaveStatus, onClearLog, onNavigateArchive }: ScanSidebarProps) {
  return (
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

      {/* Автосохранение — индикатор в процессе */}
      {autoSaveStatus === "saving" && (
        <div className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)" }}>
          <Icon name="Loader" size={15} style={{ color: "var(--electric)" }} className="animate-spin shrink-0" />
          <div>
            <div className="text-xs font-semibold" style={{ color: "var(--electric)" }}>Автосохранение…</div>
            <div className="hud-label mt-0.5">Результаты загружаются в облако</div>
          </div>
        </div>
      )}

      {/* Ошибка автосохранения */}
      {autoSaveStatus === "error" && !savedUrl && (
        <div className="p-4 rounded-xl flex items-center gap-3"
          style={{ background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.2)" }}>
          <Icon name="CloudOff" size={15} style={{ color: "var(--danger)" }} className="shrink-0" />
          <div>
            <div className="text-xs font-semibold" style={{ color: "var(--danger)" }}>Ошибка автосохранения</div>
            <div className="hud-label mt-0.5">Нажмите «Сохранить в облако» вручную</div>
          </div>
        </div>
      )}

      {/* Cloud save banner */}
      {savedUrl && (
        <div className="p-4 rounded-xl" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="CloudCheck" fallback="CheckCircle" size={14} style={{ color: "var(--signal-green)" }} />
            <span className="text-xs font-semibold" style={{ color: "var(--signal-green)" }}>Сохранено в облаке</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono truncate mb-3">{savedUrl.split("/").slice(-2).join("/")}</div>
          <div className="flex gap-2">
            <a href={savedUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-xs flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{ background: "rgba(0,255,136,0.1)", color: "var(--signal-green)", border: "1px solid rgba(0,255,136,0.25)" }}>
              <Icon name="ExternalLink" size={11} /> Открыть файл
            </a>
            {onNavigateArchive && (
              <button
                onClick={onNavigateArchive}
                className="flex-1 text-xs flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
                style={{ background: "rgba(0,212,255,0.08)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.2)" }}
              >
                <Icon name="Archive" size={11} /> В архив
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scan log */}
      <div className="panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Лог сканирования</h2>
          {scanLog.length > 0 && (
            <button onClick={onClearLog} className="hud-label hover:text-foreground transition-colors">
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
  );
}