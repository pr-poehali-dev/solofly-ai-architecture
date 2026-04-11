import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { scanning, type ScanSession } from "@/lib/api";
import { MODE_LABEL, fmtNum } from "./archive/archiveTypes";
import FileViewer from "./archive/FileViewer";
import SessionDetail from "./archive/SessionDetail";
import SessionList from "./archive/SessionList";

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
        <div className="lg:col-span-3">
          <SessionList
            sessions={sessions}
            filtered={filtered}
            loading={loading}
            selectedId={selectedId}
            search={search}
            filterMode={filterMode}
            filterStatus={filterStatus}
            savedCount={savedCount}
            onSelect={setSelectedId}
            onSearchChange={setSearch}
            onFilterModeChange={setFilterMode}
            onFilterStatusChange={setFilterStatus}
          />
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
    </div>
  );
}
