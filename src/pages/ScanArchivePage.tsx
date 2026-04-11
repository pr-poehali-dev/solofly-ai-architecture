import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { scanning, type ScanSession } from "@/lib/api";

// ─── Справочники ──────────────────────────────────────────────────────────────

const MODE_LABEL: Record<string, string> = {
  lidar_terrain: "LiDAR · Рельеф",  lidar_objects: "LiDAR · Объекты",
  lidar:         "LiDAR",            radar_long:    "Радар · 15 км",
  radar:         "Радар",            thermal:       "Тепловизор",
  multispectral: "Мультиспектр",    sar:           "SAR · Синтетика",
};
const MODE_ICON: Record<string, string> = {
  lidar_terrain: "Mountain", lidar_objects: "Scan",   lidar: "Layers3",
  radar_long:    "Radio",    radar:         "Radio",   thermal: "Flame",
  multispectral: "Layers",   sar:           "Aperture",
};
const MODE_COLOR: Record<string, string> = {
  lidar_terrain: "var(--signal-green)", lidar_objects: "var(--electric)",
  lidar:         "var(--signal-green)", radar_long:    "#a78bfa",
  radar:         "#a78bfa",             thermal:       "#f97316",
  multispectral: "#22d3ee",             sar:           "#e879f9",
};
const STATUS_CLS: Record<string, string> = {
  done: "tag-green", active: "tag-electric", scanning: "tag-electric",
  planned: "tag-muted", aborted: "tag-danger",
};
const STATUS_LABEL: Record<string, string> = {
  done: "Завершён", active: "Активен", scanning: "Сканирует",
  planned: "Запланирован", aborted: "Прерван",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
function fmtDur(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const m = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (m < 60) return `${m} мин`;
  return `${Math.floor(m / 60)}ч ${m % 60}м`;
}
function fmtNum(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("ru-RU");
}

// ─── Просмотр содержимого JSON из S3 ─────────────────────────────────────────

interface ScanResultJson {
  version: string;
  generated_at: string;
  session: {
    code: string; drone_id: string; drone_name?: string;
    scan_mode: string; sensor: string; range_m: number;
    resolution_cm: number; frequency_hz: number; fov_deg: number;
  };
  results: {
    coverage_pct: number; area_km2: number; points_total: number;
    objects_found: number; accuracy_m: number;
    started_at: string; finished_at: string;
  };
  log: string[];
}

function FileViewer({ url, onClose }: { url: string; onClose: () => void }) {
  const [data, setData] = useState<ScanResultJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"summary" | "log" | "raw">("summary");

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,9,14,0.85)" }}>
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden panel"
        style={{ border: "1px solid rgba(0,212,255,0.2)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2">
            <Icon name="FileJson" fallback="File" size={16} style={{ color: "var(--electric)" }} />
            <span className="font-semibold text-sm">Просмотр результата скана</span>
            {data && <span className="hud-label">{data.session.code}</span>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center p-12 text-muted-foreground text-sm animate-pulse">
            Загрузка из облака…
          </div>
        )}
        {error && (
          <div className="flex-1 flex items-center justify-center p-12 text-sm" style={{ color: "var(--danger)" }}>
            Ошибка загрузки: {error}
          </div>
        )}
        {data && (
          <>
            {/* Tabs */}
            <div className="flex shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              {(["summary", "log", "raw"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2.5 text-xs font-semibold transition-all"
                  style={tab === t
                    ? { color: "var(--electric)", borderBottom: "2px solid var(--electric)" }
                    : { color: "hsl(var(--muted-foreground))" }
                  }>
                  {t === "summary" ? "Итоги" : t === "log" ? `Лог (${data.log?.length ?? 0})` : "JSON"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === "summary" && (
                <div className="space-y-4">
                  {/* Сенсор */}
                  <div>
                    <div className="hud-label mb-2">Сенсор</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Режим",     val: MODE_LABEL[data.session.scan_mode] ?? data.session.scan_mode },
                        { label: "Сенсор",    val: data.session.sensor },
                        { label: "Дальность", val: data.session.range_m >= 1000 ? `${data.session.range_m / 1000} км` : `${data.session.range_m} м` },
                        { label: "Разрешение",val: `${data.session.resolution_cm} см` },
                        { label: "Частота",   val: `${data.session.frequency_hz} Гц` },
                        { label: "Угол FOV",  val: `${data.session.fov_deg}°` },
                      ].map(i => (
                        <div key={i.label} className="p-2.5 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                          <div className="hud-label mb-0.5">{i.label}</div>
                          <div className="hud-value text-xs">{i.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Результаты */}
                  <div>
                    <div className="hud-label mb-2">Результаты</div>
                    <div className="space-y-2">
                      {[
                        { icon: "CheckCircle", label: "Покрытие",       val: `${data.results.coverage_pct}%`,         color: data.results.coverage_pct === 100 ? "var(--signal-green)" : "var(--warning)" },
                        { icon: "MapPin",      label: "Площадь",        val: `${data.results.area_km2} км²`,          color: "var(--electric)" },
                        { icon: "Layers3",     label: "Точек собрано",  val: fmtNum(data.results.points_total),       color: "var(--signal-green)" },
                        { icon: "Target",      label: "Объектов",       val: fmtNum(data.results.objects_found),      color: "#a78bfa" },
                        { icon: "Crosshair",   label: "Точность",       val: data.results.accuracy_m ? `±${data.results.accuracy_m} м` : "—", color: "var(--electric)" },
                        { icon: "Clock",       label: "Длительность",   val: fmtDur(data.results.started_at, data.results.finished_at), color: "var(--electric)" },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between py-1.5 border-b last:border-0"
                          style={{ borderColor: "hsl(var(--border))" }}>
                          <div className="flex items-center gap-2">
                            <Icon name={r.icon} fallback="Circle" size={12} style={{ color: r.color }} />
                            <span className="hud-label">{r.label}</span>
                          </div>
                          <span className="hud-value text-xs" style={{ color: r.color }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground pt-2"
                    style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <span>Сгенерирован: {fmtDate(data.generated_at)}</span>
                    <span>Версия: {data.version}</span>
                  </div>
                </div>
              )}

              {tab === "log" && (
                <div className="space-y-1.5">
                  {(!data.log || data.log.length === 0)
                    ? <p className="text-xs text-muted-foreground">Лог пуст</p>
                    : data.log.map((line, i) => (
                        <div key={i} className="text-xs font-mono py-1 border-b last:border-0"
                          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                          <span style={{ color: "var(--electric)" }}>
                            {line.match(/\[\d{2}:\d{2}:\d{2}\]/)?.[0]}
                          </span>
                          {" "}{line.replace(/\[\d{2}:\d{2}:\d{2}\]\s*/, "")}
                        </div>
                      ))
                  }
                </div>
              )}

              {tab === "raw" && (
                <pre className="text-xs font-mono overflow-x-auto leading-relaxed"
                  style={{ color: "hsl(var(--muted-foreground))", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <span className="hud-label">{url.split("/").slice(-1)[0]}</span>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
                <Icon name="Download" size={12} /> Скачать файл
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Карточка деталей сессии ──────────────────────────────────────────────────

function SessionDetail({ session, onClose, onDelete, onView }: {
  session: ScanSession;
  onClose: () => void;
  onDelete: (id: number) => void;
  onView: (url: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const color = MODE_COLOR[session.scan_mode] ?? "var(--electric)";

  const handleDelete = async () => {
    if (!confirm(`Удалить ${session.code} из архива и облака?`)) return;
    setDeleting(true);
    await scanning.remove(session.id);
    onDelete(session.id);
  };

  return (
    <div className="panel rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon name={MODE_ICON[session.scan_mode] ?? "Scan"} fallback="Scan" size={16} style={{ color }} />
          </div>
          <div>
            <span className="font-bold text-sm" style={{ color }}>{session.code}</span>
            <div className="hud-label">{MODE_LABEL[session.scan_mode] ?? session.scan_mode}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`tag ${STATUS_CLS[session.status] ?? "tag-muted"}`}>
            {STATUS_LABEL[session.status] ?? session.status}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Дрон",       val: session.drone_name ?? session.drone_id },
            { label: "Цель",       val: session.target_mode },
            { label: "Дальность",  val: session.range_m >= 1000 ? `${session.range_m / 1000} км` : `${session.range_m} м` },
            { label: "Разрешение", val: `${session.resolution_cm} см` },
            { label: "Частота",    val: `${session.frequency_hz} Гц` },
            { label: "Угол",       val: `${session.fov_deg}°` },
          ].map(i => (
            <div key={i.label} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
              <div className="hud-label mb-0.5">{i.label}</div>
              <div className="hud-value text-xs">{i.val}</div>
            </div>
          ))}
        </div>

        {/* Результаты */}
        <div>
          <div className="hud-label mb-2">Результаты сканирования</div>
          <div className="space-y-2">
            {[
              { icon: "MapPin",      label: "Площадь",        val: `${session.area_km2} км²`,                color: "var(--electric)" },
              { icon: "Layers3",     label: "Точек собрано",  val: fmtNum(session.points_total),             color: "var(--signal-green)" },
              { icon: "Target",      label: "Объектов",       val: fmtNum(session.objects_found),            color: "#a78bfa" },
              { icon: "CheckCircle", label: "Покрытие",       val: `${session.coverage_pct}%`,               color: session.coverage_pct === 100 ? "var(--signal-green)" : "var(--warning)" },
              { icon: "Clock",       label: "Длительность",   val: fmtDur(session.started_at, session.finished_at), color: "var(--electric)" },
              { icon: "Crosshair",   label: "Точность",       val: session.accuracy_m ? `±${session.accuracy_m} м` : "—", color: "var(--signal-green)" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-1.5 border-b last:border-0"
                style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex items-center gap-2">
                  <Icon name={r.icon} fallback="Circle" size={13} style={{ color: r.color }} />
                  <span className="hud-label">{r.label}</span>
                </div>
                <span className="hud-value text-xs" style={{ color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Временная метка */}
        <div>
          <div className="hud-label mb-2">Временная метка</div>
          <div className="space-y-1.5 text-xs">
            {[
              { label: "Создан",   val: fmtDate(session.created_at) },
              { label: "Запущен",  val: fmtDate(session.started_at) },
              { label: "Завершён", val: fmtDate(session.finished_at) },
            ].map(t => (
              <div key={t.label} className="flex justify-between">
                <span className="text-muted-foreground">{t.label}</span>
                <span className="hud-value font-mono">{t.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Файл в облаке */}
        {session.result_url ? (
          <div className="p-4 rounded-xl" style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Cloud" size={14} style={{ color: "var(--electric)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--electric)" }}>Файл в облаке</span>
              <span className="hud-label ml-auto">{session.result_size_kb} КБ</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono truncate mb-3 leading-relaxed">
              {session.result_url.split("/").slice(-2).join("/")}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onView(session.result_url!)}
                className="flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 font-semibold transition-all"
                style={{ background: "rgba(0,212,255,0.12)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }}
              >
                <Icon name="Eye" size={12} /> Просмотреть
              </button>
              <a
                href={session.result_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }}
              >
                <Icon name="Download" size={12} />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Icon name="CloudOff" size={13} />
              Результат не сохранён в облаке
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 flex gap-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        {session.result_url && (
          <button
            onClick={() => onView(session.result_url!)}
            className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2"
          >
            <Icon name="FileSearch" fallback="Eye" size={13} /> Открыть результат
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
          style={{ background: "rgba(255,59,48,0.08)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}
        >
          <Icon name="Trash2" size={13} /> {deleting ? "Удаление…" : "Удалить"}
        </button>
      </div>
    </div>
  );
}

// ─── Главная страница ─────────────────────────────────────────────────────────

export default function ScanArchivePage() {
  const [sessions, setSessions]     = useState<ScanSession[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewUrl, setViewUrl]       = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    try {
      const res = await scanning.getAll();
      setSessions(res.sessions);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || s.code.toLowerCase().includes(q)
      || (s.drone_name ?? s.drone_id).toLowerCase().includes(q)
      || (MODE_LABEL[s.scan_mode] ?? s.scan_mode).toLowerCase().includes(q);
    const matchMode   = filterMode   === "all" || s.scan_mode === filterMode;
    const matchStatus = filterStatus === "all" || s.status    === filterStatus;
    return matchSearch && matchMode && matchStatus;
  });

  const selected    = sessions.find(s => s.id === selectedId) ?? null;
  const totalPoints = sessions.reduce((a, s) => a + (s.points_total ?? 0), 0);
  const totalArea   = sessions.reduce((a, s) => a + (Number(s.area_km2) || 0), 0);
  const savedCount  = sessions.filter(s => s.result_url).length;

  return (
    <div className="p-6 space-y-5 fade-up">
      {/* FileViewer modal */}
      {viewUrl && <FileViewer url={viewUrl} onClose={() => setViewUrl(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">Архив сканирований</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {sessions.length} сессий · {savedCount} сохранено в облаке
          </p>
        </div>
        <button onClick={load} className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <Icon name="RefreshCw" size={13} /> Обновить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: "Database", label: "Всего сессий",  val: sessions.length,      color: "var(--electric)"     },
          { icon: "Cloud",    label: "В облаке",       val: savedCount,           color: "var(--signal-green)" },
          { icon: "Layers3",  label: "Точек собрано",  val: fmtNum(totalPoints),  color: "var(--electric)"     },
          { icon: "MapPin",   label: "Площадь, км²",   val: totalArea.toFixed(1), color: "#a78bfa"             },
        ].map(s => (
          <div key={s.label} className="panel p-5 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Circle" size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="hud-value text-lg" style={{ color: s.color }}>{s.val}</div>
              <div className="hud-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Список */}
        <div className="lg:col-span-3 space-y-3">
          {/* Фильтры */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "hsl(var(--input))" }}>
              <Icon name="Search" size={13} className="text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Код, дрон, режим…"
                className="bg-transparent text-xs outline-none w-36 placeholder:text-muted-foreground"
              />
            </div>
            <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}>
              <option value="all">Все режимы</option>
              {Object.entries(MODE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
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
                      onClick={() => setSelectedId(isSelected ? null : s.id)}
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
        </div>

        {/* Детали */}
        <div className="lg:col-span-2">
          {selected ? (
            <SessionDetail
              session={selected}
              onClose={() => setSelectedId(null)}
              onDelete={id => { setSessions(prev => prev.filter(s => s.id !== id)); setSelectedId(null); }}
              onView={url => setViewUrl(url)}
            />
          ) : (
            <div className="panel rounded-xl h-full flex flex-col items-center justify-center p-10 text-center gap-4"
              style={{ minHeight: 320 }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(0,212,255,0.08)" }}>
                <Icon name="Archive" size={28} style={{ color: "var(--electric)" }} />
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">Выберите запись</div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  Нажмите на сессию слева,<br />чтобы просмотреть результат
                </div>
              </div>
              <div className="hud-label">{savedCount} файлов в облаке</div>
            </div>
          )}
        </div>
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
    </div>
  );
}
