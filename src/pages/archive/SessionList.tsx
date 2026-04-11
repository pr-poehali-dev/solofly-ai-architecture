import Icon from "@/components/ui/icon";
import type { ScanSession } from "@/lib/api";
import { MODE_LABEL, MODE_ICON, MODE_COLOR, STATUS_CLS, STATUS_LABEL, fmtDate } from "./archiveTypes";

interface SessionListProps {
  sessions: ScanSession[];
  filtered: ScanSession[];
  loading: boolean;
  selectedId: number | null;
  search: string;
  filterMode: string;
  filterStatus: string;
  savedCount: number;
  onSelect: (id: number | null) => void;
  onSearchChange: (v: string) => void;
  onFilterModeChange: (v: string) => void;
  onFilterStatusChange: (v: string) => void;
}

export default function SessionList({
  sessions,
  filtered,
  loading,
  selectedId,
  search,
  filterMode,
  filterStatus,
  savedCount,
  onSelect,
  onSearchChange,
  onFilterModeChange,
  onFilterStatusChange,
}: SessionListProps) {
  return (
    <div className="space-y-3">
      {/* Фильтры */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "hsl(var(--input))" }}>
          <Icon name="Search" size={13} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Код, дрон, режим…"
            className="bg-transparent text-xs outline-none w-36 placeholder:text-muted-foreground"
          />
        </div>
        <select value={filterMode} onChange={e => onFilterModeChange(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}>
          <option value="all">Все режимы</option>
          {Object.entries(MODE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => onFilterStatusChange(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}>
          <option value="all">Все статусы</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <span className="ml-auto hud-label">{filtered.length} записей</span>
      </div>

      {/* Таблица */}
      <div className="panel rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm animate-pulse">Загрузка…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Ничего не найдено</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {filtered.map(s => {
              const color      = MODE_COLOR[s.scan_mode] ?? "var(--electric)";
              const isSelected = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(isSelected ? null : s.id)}
                  className="w-full text-left px-5 py-4 hover:bg-white/2 transition-all flex items-center gap-4"
                  style={isSelected ? { background: `${color}08`, borderLeft: `3px solid ${color}` } : {}}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}14` }}>
                    <Icon name={MODE_ICON[s.scan_mode] ?? "Scan"} fallback="Scan" size={15} style={{ color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm" style={{ color }}>{s.code}</span>
                      <span className="hud-label">{s.drone_name ?? s.drone_id}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{MODE_LABEL[s.scan_mode] ?? s.scan_mode}</span>
                      <span>·</span>
                      <span>{fmtDate(s.finished_at ?? s.created_at)}</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-right shrink-0">
                    <div>
                      <div className="hud-value text-xs">{s.area_km2} км²</div>
                      <div className="hud-label" style={{ fontSize: 9 }}>площадь</div>
                    </div>
                    <div>
                      <div className="hud-value text-xs">{s.coverage_pct}%</div>
                      <div className="hud-label" style={{ fontSize: 9 }}>покрытие</div>
                    </div>
                    <span className={`tag ${STATUS_CLS[s.status] ?? "tag-muted"}`}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </span>
                    {s.result_url
                      ? <Icon name="CloudCheck" fallback="CheckCircle" size={16} style={{ color: "var(--signal-green)" }} />
                      : <Icon name="CloudOff" size={16} className="text-muted-foreground opacity-40" />
                    }
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Диаграмма по режимам */}
      {!loading && sessions.length > 0 && (
        <div className="panel rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Распределение по режимам</h2>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(
              sessions.reduce<Record<string, number>>((acc, s) => {
                const key = MODE_LABEL[s.scan_mode] ?? s.scan_mode;
                acc[key] = (acc[key] ?? 0) + 1;
                return acc;
              }, {})
            ).map(([mode, count]) => {
              const modeKey = Object.keys(MODE_LABEL).find(k => MODE_LABEL[k] === mode) ?? mode;
              const color   = MODE_COLOR[modeKey] ?? "var(--electric)";
              const pct     = Math.round((count / sessions.length) * 100);
              return (
                <div key={mode} className="flex-1 min-w-32 p-4 rounded-xl" style={{ background: "hsl(var(--input))" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name={MODE_ICON[modeKey] ?? "Scan"} fallback="Scan" size={13} style={{ color }} />
                    <span className="text-xs font-medium">{mode}</span>
                  </div>
                  <div className="bar-track mb-1">
                    <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="hud-value text-xs" style={{ color }}>{count} сессий</span>
                    <span className="hud-label">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Пустой детейл-плейсхолдер (когда ничего не выбрано — в мобильном скрыт) */}
      {!loading && sessions.length === 0 && (
        <div className="panel rounded-xl p-8 text-center text-muted-foreground text-sm">
          Нет сессий в архиве
        </div>
      )}

      {/* Invisible sentinel: savedCount используется снаружи */}
      <span style={{ display: "none" }}>{savedCount}</span>
    </div>
  );
}
