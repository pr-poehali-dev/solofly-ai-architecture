import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useLiveFleet } from "@/hooks/useLiveFleet";
import { useEvents } from "@/hooks/useEvents";
import LiveMap, { type MapDrone } from "@/components/LiveMap";

const ROLE_COLORS: Record<string, string> = {
  leader:  "var(--electric)",
  scout:   "var(--signal-green)",
  mapper:  "var(--warning)",
  relay:   "#a78bfa",
  default: "var(--electric)",
};
const ROLE_LABELS: Record<string, string> = {
  leader: "Лидер роя", scout: "Разведчик",
  mapper: "Картограф", relay: "Ретранслятор",
};
const EVENT_ICON: Record<string, string> = {
  command: "CheckSquare", telemetry: "Activity",
  alert: "AlertTriangle", info: "Info",
};

function roleColor(role: string) {
  return ROLE_COLORS[role] ?? ROLE_COLORS.default;
}

export default function SwarmPage() {
  const { data: fleet, loading, refresh } = useLiveFleet(4000);
  const { data: eventsData } = useEvents(8000);
  const [selected, setSelected] = useState<string | null>(null);

  const drones = fleet?.drones ?? [];
  const flying  = fleet?.flying ?? 0;

  // Позиции на визуализации — распределяем дронов по кругу/сетке
  const dronePositions = useMemo(() => {
    const total = drones.length;
    return drones.map((d, i) => {
      const angle = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
      const r = total <= 1 ? 0 : 36;
      return {
        ...d,
        x: 50 + Math.cos(angle) * r,
        y: 50 + Math.sin(angle) * r,
      };
    });
  }, [drones]);

  const sel = drones.find(d => d.id === (selected ?? drones[0]?.id));

  // Соседние дроны (в рое — все остальные летящие)
  const linked = drones
    .filter(d => d.id !== sel?.id && d.status === "flight")
    .map(d => d.id);

  // MapDrones для LiveMap — реальные координаты
  const mapDrones = useMemo<MapDrone[]>(() =>
    drones
      .filter(d => Number(d.lat) && Number(d.lon))
      .map(d => ({
        id: d.id, name: d.name, status: d.status,
        lat: Number(d.lat), lon: Number(d.lon),
        altitude: Number(d.altitude), heading: Number(d.heading),
        speed: Number(d.speed), battery: d.battery,
        is_real: d.is_real, flight_mode: d.flight_mode,
      })),
    [drones]
  );

  // Последние события роя из БД
  const swarmEvents = useMemo(() => {
    const evs = eventsData?.events ?? [];
    return evs.slice(0, 6);
  }, [eventsData]);

  // Покрытие зоны: % летящих от общего
  const coverage = drones.length > 0
    ? Math.round((flying / drones.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Управление роем БПЛА</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Координация · Распределение задач · Обмен данными
            {!loading && <span className="ml-2" style={{ color: "var(--signal-green)" }}>● LIVE</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="RefreshCw" size={13} /> Обновить
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "В рое",             val: loading ? "…" : `${flying}/${drones.length}`, color: "var(--signal-green)" },
          { label: "Активных событий",  val: loading ? "…" : String(eventsData?.unresolved ?? 0), color: "var(--electric)" },
          { label: "Задач активно",     val: loading ? "…" : String(drones.filter(d => d.current_mission?.status === "active").length), color: "var(--electric)" },
          { label: "Дронов в воздухе",  val: loading ? "…" : `${coverage}%`, color: coverage > 50 ? "var(--signal-green)" : "var(--warning)" },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl text-center">
            <div className="hud-value text-2xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Swarm map — реальная карта OSM */}
        <div className="lg:col-span-3 panel rounded-xl overflow-hidden">
          <LiveMap
            drones={mapDrones}
            height={320}
            selectedDroneId={selected ?? drones[0]?.id ?? null}
            onSelectDrone={setSelected}
          />

          {/* Детали выбранного дрона */}
          {sel && (
            <div className="p-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={sel.status === "flight" ? "dot-online" : sel.status === "error" ? "dot-danger" : "dot-warning"} />
                  <span className="font-semibold text-sm">{sel.name}</span>
                  <span className="tag" style={{ background: `${roleColor(sel.role)}18`, color: roleColor(sel.role) }}>
                    {ROLE_LABELS[sel.role] ?? sel.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 hud-label">
                  <span>АКБ {sel.battery}%</span>
                  {sel.altitude > 0 && <span>{sel.altitude.toFixed(0)} м</span>}
                </div>
              </div>
              {sel.current_mission && (
                <div className="text-xs text-muted-foreground mb-2">
                  Миссия: <span className="text-foreground">{sel.current_mission.name}</span>
                  {" · "}{sel.current_mission.progress}%
                </div>
              )}
              {linked.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="hud-label">Связан с:</span>
                  {linked.map(lid => (
                    <span key={lid} className="tag tag-muted" style={{ fontSize: 9 }}>{lid}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Правая панель */}
        <div className="lg:col-span-2 space-y-4">
          {/* События роя из БД */}
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Обмен данными роя</h2>
            {swarmEvents.length === 0
              ? <p className="text-xs text-muted-foreground text-center py-4">Нет событий</p>
              : (
                <div className="space-y-3">
                  {swarmEvents.map(e => (
                    <div key={e.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(0,212,255,0.1)" }}>
                        <Icon
                          name={EVENT_ICON[e.category] ?? "Radio"}
                          fallback="Radio"
                          size={13}
                          style={{ color: e.level === "error" ? "var(--danger)" : e.level === "warning" ? "var(--warning)" : "var(--electric)" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {e.drone_id && (
                            <span className="tag tag-electric" style={{ fontSize: 9 }}>{e.drone_id}</span>
                          )}
                          <span className="tag tag-muted" style={{ fontSize: 9 }}>{e.category}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{e.message}</p>
                      </div>
                      <span className="hud-label shrink-0">
                        {new Date(e.ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Распределение задач */}
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Распределение задач</h2>
            {loading && drones.length === 0
              ? [1,2,3].map(i => (
                  <div key={i} className="h-10 rounded-lg animate-pulse mb-2" style={{ background: "hsl(var(--input))" }} />
                ))
              : (
                <div className="space-y-2">
                  {drones.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: roleColor(d.role) }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{d.name}</div>
                        <div className="hud-label truncate">
                          {d.current_mission?.name ?? (d.status === "charging" ? "Зарядка" : d.status === "standby" ? "Ожидание" : "Нет задачи")}
                        </div>
                      </div>
                      <div className="bar-track w-12">
                        <div className="bar-fill" style={{
                          width: `${d.battery}%`,
                          background: d.battery > 40 ? roleColor(d.role) : "var(--danger)"
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}