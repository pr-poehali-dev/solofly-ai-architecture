import { useEffect, useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { events, missions, type SystemEvent } from "@/lib/api";

const levelIcon:  Record<string, string> = { error: "AlertOctagon", warning: "AlertTriangle", info: "Info" };
const levelColor: Record<string, string> = { error: "var(--danger)", warning: "var(--warning)", info: "var(--electric)" };
const levelCls:   Record<string, string> = { error: "tag-danger",   warning: "tag-warning",   info: "tag-electric" };

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function MonitoringPage() {
  const [eventsData, setEventsData] = useState<{ events: SystemEvent[]; total: number; unresolved: number } | null>(null);
  const [missionsData, setMissionsData] = useState<{ total: number; stats: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [ev, ms] = await Promise.all([
        events.getAll(),
        missions.getAll(),
      ]);
      setEventsData(ev);
      setMissionsData(ms);
      setLoadError(null);
    } catch {
      setLoadError("Нет соединения с сервером. Повторная попытка...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 10000);
    return () => clearInterval(t);
  }, []);

  const resolveEvent = async (id: number) => {
    await events.resolve(id);
    await loadData();
  };

  // Только критические и нерешённые алерты вверху
  const sortedEvents = useMemo(() => {
    if (!eventsData?.events) return [];
    return [...eventsData.events].sort((a, b) => {
      if (!a.resolved && b.resolved) return -1;
      if (a.resolved && !b.resolved) return 1;
      const levelOrder: Record<string, number> = { error: 0, warning: 1, info: 2 };
      return (levelOrder[a.level] ?? 3) - (levelOrder[b.level] ?? 3);
    });
  }, [eventsData]);

  const unresolved = eventsData?.unresolved ?? 0;
  const totalEvents = eventsData?.total ?? 0;
  const doneMissions = missionsData?.stats?.done ?? 0;
  const activeMissions = missionsData?.stats?.active ?? 0;

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Мониторинг и отчётность</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Системные события · Аналитика миссий · Уведомления
            {!loading && <span className="ml-2" style={{ color: "var(--signal-green)" }}>● LIVE</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="RefreshCw" size={13} /> Обновить
          </button>
          <button
            onClick={() => {
              const w = window.open("", "_blank");
              if (!w) return;
              const now = new Date().toLocaleString("ru-RU");
              const evRows = sortedEvents.map(e =>
                `<tr style="border-bottom:1px solid #eee">
                  <td style="padding:6px">${e.level.toUpperCase()}</td>
                  <td style="padding:6px">${e.drone_id ?? "—"}</td>
                  <td style="padding:6px">${e.message}</td>
                  <td style="padding:6px">${e.resolved ? "✓" : "⚠"}</td>
                  <td style="padding:6px">${new Date(e.ts).toLocaleString("ru-RU")}</td>
                </tr>`
              ).join("");
              w.document.write(`<!DOCTYPE html><html><head><title>SoloFly Отчёт ${now}</title>
                <style>body{font-family:Arial,sans-serif;padding:24px}h1{color:#05090e}table{width:100%;border-collapse:collapse}th{background:#05090e;color:white;padding:8px;text-align:left}</style>
                </head><body>
                <h1>SoloFly — Мониторинг</h1>
                <p>Сформирован: ${now}</p>
                <h2>Сводка</h2>
                <p>Событий всего: <b>${totalEvents}</b> · Нерешённых: <b>${unresolved}</b> · Миссий активно: <b>${activeMissions}</b> · Завершено: <b>${doneMissions}</b></p>
                <h2>Системные события</h2>
                <table><thead><tr><th>Уровень</th><th>Дрон</th><th>Событие</th><th>Статус</th><th>Время</th></tr></thead>
                <tbody>${evRows}</tbody></table>
                </body></html>`);
              w.document.close();
              w.print();
            }}
            className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2"
          >
            <Icon name="FileDown" size={13} /> Сводный PDF
          </button>
        </div>
      </div>

      {/* Баннер ошибки */}
      {loadError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(255,59,48,0.08)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}>
          <Icon name="WifiOff" size={14} />
          {loadError}
        </div>
      )}

      {/* Live metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Активных алертов",   val: loading ? "…" : String(unresolved),                                         icon: "Bell",     color: unresolved > 0 ? "var(--warning)" : "var(--signal-green)" },
          { label: "Событий за день",    val: loading ? "…" : String(totalEvents),                                        icon: "Activity", color: "var(--electric)" },
          { label: "Миссий завершено",   val: loading ? "…" : String(doneMissions),                                       icon: "CheckCircle", color: "var(--signal-green)" },
          { label: "Миссий активно",     val: loading ? "…" : String(activeMissions),                                     icon: "Navigation", color: activeMissions > 0 ? "var(--electric)" : "hsl(var(--muted-foreground))" },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Activity" size={14} style={{ color: s.color }} />
            </div>
            <div className="hud-value text-xl mb-0.5" style={{ color: s.color }}>
              {loading ? <span className="animate-pulse">…</span> : s.val}
            </div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Статистика миссий */}
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Статистика миссий</h2>
            <span className="tag tag-electric">{missionsData?.total ?? 0} всего</span>
          </div>
          {loading
            ? <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "hsl(var(--input))" }} />)}</div>
            : (
              <div className="space-y-3">
                {[
                  { label: "Активных",     val: missionsData?.stats?.active  ?? 0, color: "var(--signal-green)", icon: "Navigation" },
                  { label: "Запланировано",val: missionsData?.stats?.planned ?? 0, color: "var(--electric)",     icon: "Calendar" },
                  { label: "Завершено",    val: missionsData?.stats?.done    ?? 0, color: "var(--muted)",        icon: "CheckCircle" },
                  { label: "Прервано",     val: missionsData?.stats?.aborted ?? 0, color: "var(--danger)",       icon: "XCircle" },
                ].map(s => {
                  const total = missionsData?.total ?? 1;
                  const pct   = Math.round((s.val / total) * 100);
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon name={s.icon} fallback="Circle" size={13} style={{ color: s.color }} />
                          <span className="text-xs">{s.label}</span>
                        </div>
                        <span className="hud-value text-xs" style={{ color: s.color }}>{s.val}</span>
                      </div>
                      <div className="bar-track" style={{ height: 3 }}>
                        <div className="bar-fill" style={{ width: `${pct}%`, background: s.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

        {/* Системные события из БД */}
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Системные события</h2>
            {unresolved > 0
              ? <span className="tag tag-warning">{unresolved} активных</span>
              : <span className="tag tag-green">Всё в норме</span>
            }
          </div>
          {loading
            ? <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "hsl(var(--input))" }} />)}</div>
            : sortedEvents.length === 0
              ? <p className="text-xs text-muted-foreground py-4 text-center">Нет событий</p>
              : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {sortedEvents.map(ev => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl"
                      style={{
                        background:  ev.resolved ? "hsl(var(--input))" : `${levelColor[ev.level] ?? "var(--electric)"}10`,
                        border:      ev.resolved ? "1px solid transparent" : `1px solid ${levelColor[ev.level] ?? "var(--electric)"}30`,
                        opacity:     ev.resolved ? 0.65 : 1,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          name={levelIcon[ev.level] ?? "Info"}
                          fallback="Info"
                          size={15}
                          style={{ color: levelColor[ev.level] ?? "var(--electric)" }}
                          className="shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={`tag ${levelCls[ev.level] ?? "tag-electric"}`} style={{ fontSize: 9 }}>{ev.level.toUpperCase()}</span>
                            {ev.drone_id && <span className="tag tag-muted" style={{ fontSize: 9 }}>{ev.drone_id}</span>}
                            <span className="tag tag-muted" style={{ fontSize: 9 }}>{ev.category}</span>
                            {ev.resolved && <span className="tag tag-muted" style={{ fontSize: 9 }}>Решено</span>}
                          </div>
                          <p className="text-xs leading-relaxed">{ev.message}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hud-label">{fmtTime(ev.ts)}</span>
                          {!ev.resolved && (
                            <button
                              onClick={() => resolveEvent(ev.id)}
                              className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                              style={{ background: "rgba(0,212,255,0.1)", color: "var(--electric)" }}
                            >
                              ✓
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
          }
        </div>
      </div>

      {/* Визуализация */}
      <div className="panel rounded-xl p-5">
        <h2 className="font-semibold text-sm mb-4">Визуализация данных</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Тепловая карта миссий",  desc: "Плотность полётов по зонам, распределение объектов", icon: "MapPin",    color: "var(--electric)" },
            { title: "Графики телеметрии",     desc: "Батарея, высота, скорость — в динамике за полёт",    icon: "TrendingUp",color: "var(--signal-green)" },
            { title: "Видео с аннотациями",    desc: "Кадры с AI-разметкой: боксы, классы, уверенность",  icon: "Video",    color: "var(--warning)" },
          ].map(v => (
            <div key={v.title} className="p-5 rounded-xl flex flex-col items-center text-center" style={{ background: "hsl(var(--input))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${v.color}15` }}>
                <Icon name={v.icon} fallback="BarChart2" size={20} style={{ color: v.color }} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{v.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{v.desc}</p>
              <button className="btn-electric w-full py-2 rounded-lg text-xs font-semibold">Открыть</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}