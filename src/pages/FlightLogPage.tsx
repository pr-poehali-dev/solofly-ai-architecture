import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useMissions } from "@/hooks/useMissions";
import type { Mission } from "@/lib/api";

const statusCls: Record<string, string> = {
  done: "tag-green", aborted: "tag-danger",
  active: "tag-electric", planned: "tag-muted",
};
const statusLabel: Record<string, string> = {
  done: "Завершена", aborted: "Прервана",
  active: "В полёте", planned: "Запланирована",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU");
}
function fmtDuration(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const diff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (diff < 0) return "—";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}

export default function FlightLogPage() {
  const { data, loading } = useMissions({}, 10000);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const allMissions = data?.missions ?? [];

  const filtered = allMissions.filter(m => {
    const matchSearch = !search ||
      (m.name.toLowerCase().includes(search.toLowerCase())) ||
      (m.drone_name ?? m.drone_id).toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalDist = allMissions.reduce((s, m) => s + Number(m.distance_km ?? 0), 0);
  const totalObstacles = allMissions.reduce((s, m) => s + (m.obstacles_avoided ?? 0), 0);
  const successRate = allMissions.length > 0
    ? Math.round(allMissions.filter(m => m.status === "done").length / allMissions.length * 100)
    : 0;

  const handleExportCSV = () => {
    const headers = ["Код", "Название", "Дрон", "Статус", "Прогресс", "Дата", "Дистанция км", "Препятствий"];
    const rows = filtered.map((m: Mission) => [
      m.code, m.name, m.drone_name ?? m.drone_id,
      statusLabel[m.status] ?? m.status,
      `${m.progress}%`,
      fmtDate(m.created_at),
      m.distance_km,
      m.obstacles_avoided,
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `solofly_missions_${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">История полётов</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Данные из БД · {allMissions.length} записей</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="FileText" size={13} /> CSV
          </button>
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Table" size={13} /> XLSX
          </button>
          <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="FileDown" size={13} /> PDF-отчёт
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Всего миссий", val: loading ? "…" : String(allMissions.length), color: "var(--electric)" },
          { label: "Общий налёт км", val: loading ? "…" : totalDist.toFixed(1), color: "var(--signal-green)" },
          { label: "Объездов препятствий", val: loading ? "…" : String(totalObstacles), color: "var(--electric)" },
          { label: "Успешность", val: loading ? "…" : `${successRate}%`, color: successRate >= 80 ? "var(--signal-green)" : "var(--warning)" },
        ].map(s => (
          <div key={s.label} className="panel p-5 rounded-xl">
            <div className="hud-value text-2xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="panel rounded-xl overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 p-4 border-b flex-wrap" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "hsl(var(--input))" }}>
            <Icon name="Search" size={13} className="text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию, дрону, коду…"
              className="bg-transparent text-xs outline-none w-44 placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-transparent border text-xs rounded-lg px-3 py-2 outline-none text-muted-foreground"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            <option value="all">Все статусы</option>
            <option value="done">Завершены</option>
            <option value="active">В полёте</option>
            <option value="planned">Запланированы</option>
            <option value="aborted">Прерваны</option>
          </select>
          <span className="ml-auto hud-label">{filtered.length} записей</span>
        </div>

        {loading && allMissions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm animate-pulse">Загрузка из БД…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Ничего не найдено</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                {["Код", "Дрон", "Миссия", "Дата", "Длит.", "Дистанция", "Препятствий", "Статус", ""].map(h => (
                  <th key={h} className="hud-label text-left px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: Mission) => (
                <tr key={m.id} className="border-b hover:bg-white/2 transition-all cursor-pointer" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="px-4 py-3.5">
                    <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>{m.code}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-medium">{m.drone_name ?? m.drone_id}</td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground max-w-[160px] truncate">{m.name}</td>
                  <td className="px-4 py-3.5 hud-label whitespace-nowrap">{fmtDate(m.created_at)}</td>
                  <td className="px-4 py-3.5 hud-value text-xs">{fmtDuration(m.start_time, m.ended_at)}</td>
                  <td className="px-4 py-3.5 hud-value text-xs">{m.distance_km ? `${m.distance_km} км` : "—"}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="hud-value text-xs" style={{ color: "var(--signal-green)" }}>{m.obstacles_avoided}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`tag ${statusCls[m.status] ?? "tag-muted"}`}>{statusLabel[m.status] ?? m.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="Download" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
