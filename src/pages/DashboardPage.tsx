import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useLiveFleet } from "@/hooks/useLiveFleet";
import { useEvents } from "@/hooks/useEvents";
import LiveMap, { type MapDrone } from "@/components/LiveMap";

const statusMap: Record<string, { label: string; dot: string; cls: string }> = {
  flight:  { label: "В полёте",  dot: "dot-online",  cls: "tag-green"   },
  standby: { label: "Готов",     dot: "dot-online",  cls: "tag-electric" },
  charging:{ label: "Зарядка",   dot: "dot-warning", cls: "tag-warning"  },
  offline: { label: "Офлайн",    dot: "dot-offline", cls: "tag-muted"    },
  error:   { label: "Ошибка",    dot: "dot-danger",  cls: "tag-danger"   },
};

const levelIcon: Record<string, string> = {
  warning: "AlertTriangle", error: "AlertOctagon",
  info: "Info", success: "CheckCircle",
};
const levelColor: Record<string, string> = {
  warning: "var(--warning)", error: "var(--danger)",
  info: "var(--electric)", success: "var(--signal-green)",
};

function relTime(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "только что";
  if (diff < 60) return `${diff} мин назад`;
  return `${Math.floor(diff / 60)} ч назад`;
}

export default function DashboardPage() {
  const { data: fleet, loading: fleetLoading, error: fleetErr } = useLiveFleet(3000);
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [operatorPos, setOperatorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");

  const requestGeo = () => {
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      p => { setOperatorPos({ lat: p.coords.latitude, lon: p.coords.longitude }); setGeoStatus("ok"); },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  const { data: eventsData } = useEvents(8000);

  const drones = fleet?.drones ?? [];
  const flying = fleet?.flying ?? 0;
  const evList = eventsData?.events.slice(0, 5) ?? [];

  // ИИ-метрики из телеметрии летящих дронов
  const flyingDrones = drones.filter(d => d.status === "flight");

  const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Командный центр</h1>
          <p className="hud-label mt-0.5">
            {today} · {now} UTC+3
            {fleetErr
              ? <span className="text-red-400 ml-2">⚠ Ошибка связи с бэкендом</span>
              : <span className="ml-2" style={{ color: "var(--signal-green)" }}>● LIVE</span>
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Download" size={13} />
            Отчёт PDF
          </button>
          <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Plus" size={13} />
            Новая миссия
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: "Navigation", label: "В полёте",
            val: fleetLoading ? "—" : String(flying),
            color: "var(--signal-green)",
            sub: fleetLoading ? "загрузка…" : `из ${drones.length} дронов`,
          },
          {
            icon: "Brain", label: "Циклов ИИ за сутки",
            val: eventsData ? String(eventsData.total) : "—",
            color: "var(--electric)",
            sub: `${eventsData?.unresolved ?? 0} нерешённых`,
          },
          {
            icon: "Target", label: "Миссий активно",
            val: drones.filter(d => d.current_mission?.status === "active").length > 0
              ? String(drones.filter(d => d.current_mission?.status === "active").length)
              : "—",
            color: "var(--electric)",
            sub: "из БД в реальном времени",
          },
          {
            icon: "Zap", label: "Мин. заряд в воздухе",
            val: flyingDrones.length
              ? String(Math.min(...flyingDrones.map(d => d.battery))) + "%"
              : "—",
            color: flyingDrones.some(d => d.battery < 30) ? "var(--danger)" : "var(--warning)",
            sub: flyingDrones.length ? flyingDrones.reduce((m, d) => d.battery < m.battery ? d : m, flyingDrones[0])?.id : "нет полётов",
          },
        ].map((s) => (
          <div key={s.label} className="panel p-5 rounded-xl">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Circle" size={16} style={{ color: s.color }} />
            </div>
            <div className="hud-value text-2xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label mb-0.5">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Fleet live */}
        <div className="lg:col-span-2 panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Флот БПЛА</h2>
            {fleetLoading
              ? <span className="hud-label animate-pulse">обновляется…</span>
              : <span className="tag tag-electric">{flying} в воздухе · обновляется каждые 3 сек</span>
            }
          </div>
          <div className="space-y-3">
            {fleetLoading && drones.length === 0
              ? [1,2,3,4].map(i => (
                  <div key={i} className="p-4 rounded-xl animate-pulse" style={{ background: "hsl(var(--input))", height: 88 }} />
                ))
              : drones.map((d) => {
                  const sm = statusMap[d.status] ?? statusMap.offline;
                  const missionName = d.current_mission?.name ?? (d.status === "charging" ? "Зарядка" : "Ожидает задания");
                  return (
                    <div key={d.id} className="p-4 rounded-xl" style={{ background: "hsl(var(--input))" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={sm.dot} />
                          <div>
                            <span className="font-semibold text-sm">{d.name}</span>
                            <span className="hud-label ml-2">{d.id}</span>
                          </div>
                        </div>
                        <span className={`tag ${sm.cls}`}>{sm.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {[
                          { label: "Заряд",    val: `${d.battery}%` },
                          { label: "Высота",   val: `${Number(d.altitude).toFixed(0)}м` },
                          { label: "Скорость", val: `${Number(d.speed).toFixed(0)}км/ч` },
                          { label: "Миссия",   val: missionName.length > 14 ? missionName.slice(0,14)+"…" : missionName },
                        ].map((info) => (
                          <div key={info.label}>
                            <div className="hud-label mb-0.5">{info.label}</div>
                            <div className="hud-value text-xs">{info.val}</div>
                          </div>
                        ))}
                      </div>
                      {d.status === "flight" && (
                        <div className="mt-3 bar-track">
                          <div className="bar-fill" style={{
                            width: `${d.battery}%`,
                            background: d.battery > 40 ? "var(--signal-green)" : "var(--warning)",
                            transition: "width 1s ease",
                          }} />
                        </div>
                      )}
                    </div>
                  );
                })
            }
          </div>
        </div>

        <div className="space-y-4">
          {/* Live events */}
          <div className="panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Системные события</h2>
              {(eventsData?.unresolved ?? 0) > 0 && (
                <span className="tag tag-warning">{eventsData!.unresolved} активных</span>
              )}
            </div>
            <div className="space-y-3">
              {evList.length === 0
                ? <p className="text-xs text-muted-foreground">Нет событий</p>
                : evList.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3">
                      <Icon
                        name={levelIcon[ev.level] ?? "Info"}
                        fallback="Info"
                        size={14}
                        style={{ color: levelColor[ev.level] ?? "var(--electric)" }}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs leading-relaxed">{ev.message}</p>
                        <span className="hud-label">{relTime(ev.ts)}</span>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>

          {/* AI activity from real drones */}
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">ИИ-активность (борт)</h2>
            <div className="space-y-3">
              {flyingDrones.length === 0
                ? <p className="text-xs text-muted-foreground">Нет летящих дронов</p>
                : flyingDrones.slice(0, 2).map(d => (
                    <div key={d.id}>
                      <div className="hud-label mb-2" style={{ color: "var(--electric)" }}>{d.name} ({d.ai_model})</div>
                      {[
                        { label: "Заряд АКБ", val: d.battery, color: d.battery > 40 ? "var(--signal-green)" : "var(--warning)" },
                        { label: "Скорость", val: Math.min(100, Math.round(Number(d.speed) / d.hw_max_speed * 100)), color: "var(--electric)" },
                      ].map(m => (
                        <div key={m.label} className="mb-2">
                          <div className="flex justify-between mb-1">
                            <span className="hud-label">{m.label}</span>
                            <span className="hud-value text-xs" style={{ color: m.color }}>{m.val}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${m.val}%`, background: m.color, transition: "width 1s ease" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Карта БПЛА */}
      <div className="panel rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={14} style={{ color: "var(--electric)" }} />
            <span className="font-semibold text-sm">Позиции дронов · Live GPS</span>
          </div>
          <button
            onClick={requestGeo}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all"
            style={
              geoStatus === "ok"
                ? { background: "rgba(255,59,48,0.1)", color: "#ff3b30", border: "1px solid rgba(255,59,48,0.25)" }
                : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
            }
          >
            <Icon
              name={geoStatus === "loading" ? "Loader" : geoStatus === "ok" ? "Navigation" : "MapPin"}
              size={12}
              className={geoStatus === "loading" ? "animate-spin" : ""}
            />
            {geoStatus === "ok" ? "Моё место на карте" : geoStatus === "denied" ? "Геолокация запрещена" : "Показать моё место"}
          </button>
        </div>
        <LiveMap
          drones={drones.filter(d => Number(d.lat) && Number(d.lon)).map(d => ({
            id: d.id, name: d.name, status: d.status,
            lat: Number(d.lat), lon: Number(d.lon),
            altitude: Number(d.altitude), heading: Number(d.heading),
            speed: Number(d.speed), battery: d.battery,
          }) satisfies MapDrone)}
          height={340}
          operatorPos={operatorPos}
          selectedDroneId={selectedDroneId}
          onSelectDrone={setSelectedDroneId}
          showOperatorGeo
        />
      </div>
    </div>
  );
}