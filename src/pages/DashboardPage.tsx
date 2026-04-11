import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { useLiveFleet } from "@/hooks/useLiveFleet";
import { useEvents } from "@/hooks/useEvents";
import LiveMap, { type MapDrone } from "@/components/LiveMap";
import { useOperatorPresence } from "@/hooks/useOperatorPresence";
import { useIsMobile } from "@/hooks/use-mobile";

// Быстрые ссылки конструктора для виджета на главной
const BUILDER_QUICK = [
  { icon: "Box",          label: "Рамы",              cat: "frames"  },
  { icon: "Zap",          label: "Моторы",             cat: "motors"  },
  { icon: "Cpu",          label: "Полётный контроллер",cat: "fc"      },
  { icon: "Battery",      label: "АКБ и питание",      cat: "power"   },
  { icon: "Crosshair",    label: "Сенсоры",            cat: "sensors" },
  { icon: "Wrench",       label: "Техобслуживание",    cat: "maintenance" },
] as const;

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

export default function DashboardPage({ onNavigate }: { onNavigate?: (page: string) => void } = {}) {
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

  // Совместная работа операторов
  const { operators: remoteOperators, total: remoteTotal } = useOperatorPresence({
    publish:   geoStatus === "ok",
    myPos:     operatorPos,
    page:      "dashboard",
    publishMs: 5000,
    pollMs:    5000,
  });

  const drones = fleet?.drones ?? [];
  const flying = fleet?.flying ?? 0;
  const evList = eventsData?.events.slice(0, 5) ?? [];

  // Мемоизируем тяжёлые вычисления
  const flyingDrones   = useMemo(() => drones.filter(d => d.status === "flight"), [drones]);
  const activeMissions = useMemo(() => drones.filter(d => d.current_mission?.status === "active").length, [drones]);
  const minBattery     = useMemo(() => flyingDrones.length ? Math.min(...flyingDrones.map(d => d.battery)) : null, [flyingDrones]);
  const minBattDrone   = useMemo(() => flyingDrones.length ? flyingDrones.reduce((m, d) => d.battery < m.battery ? d : m, flyingDrones[0]) : null, [flyingDrones]);

  const realDronesCount = useMemo(() => drones.filter(d => d.is_real).length, [drones]);

  const mapDrones = useMemo<MapDrone[]>(() =>
    drones
      .filter(d => Number(d.lat) && Number(d.lon))
      .map(d => ({
        id: d.id, name: d.name, status: d.status,
        lat: Number(d.lat), lon: Number(d.lon),
        altitude: Number(d.altitude), heading: Number(d.heading),
        speed: Number(d.speed), battery: d.battery,
        is_real: d.is_real,
        flight_mode: d.flight_mode,
        gps_sats: d.gps_sats,
      })),
    [drones]
  );

  const isMobile = useIsMobile();
  const now   = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div className={`${isMobile ? "p-3" : "p-6"} space-y-4 fade-up`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${isMobile ? "text-lg" : "text-xl"} font-bold`}>Командный центр</h1>
          <p className="hud-label mt-0.5">
            {isMobile ? now : `${today} · ${now}`} UTC+3
            {fleetErr
              ? <span className="text-red-400 ml-2">⚠ Ошибка</span>
              : <span className="ml-2" style={{ color: "var(--signal-green)" }}>● LIVE</span>
            }
          </p>
        </div>
        {!isMobile && (
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
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
            val: activeMissions > 0 ? String(activeMissions) : "—",
            color: "var(--electric)",
            sub: "из БД в реальном времени",
          },
          {
            icon: "Zap", label: "Мин. заряд в воздухе",
            val: minBattery !== null ? `${minBattery}%` : "—",
            color: minBattery !== null && minBattery < 30 ? "var(--danger)" : "var(--warning)",
            sub: minBattDrone?.id ?? "нет полётов",
          },
          {
            icon: "Wifi", label: "Реальных дронов",
            val: realDronesCount > 0 ? String(realDronesCount) : "—",
            color: realDronesCount > 0 ? "var(--signal-green)" : "var(--muted-foreground)",
            sub: realDronesCount > 0 ? "MAVLink онлайн" : "только симуляция",
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
                    <div key={d.id} className="p-4 rounded-xl transition-all"
                      style={{
                        background: "hsl(var(--input))",
                        border: d.is_real ? "1px solid rgba(0,255,136,0.25)" : "1px solid transparent",
                      }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={sm.dot} />
                          <div>
                            <span className="font-semibold text-sm">{d.name}</span>
                            <span className="hud-label ml-2">{d.id}</span>
                            {d.is_real && (
                              <span className="ml-2 tag tag-green" style={{ fontSize: 8, padding: "1px 5px" }}>
                                ● LIVE
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {d.flight_mode && d.is_real && (
                            <span className="hud-label px-1.5 py-0.5 rounded" style={{ background: "rgba(0,212,255,0.1)", color: "var(--electric)", fontSize: 9 }}>
                              {d.flight_mode}
                            </span>
                          )}
                          <span className={`tag ${sm.cls}`}>{sm.label}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {[
                          { label: "Заряд",    val: `${d.battery}%` },
                          { label: "Высота",   val: `${Number(d.altitude).toFixed(0)}м` },
                          { label: "Скорость", val: `${Number(d.speed).toFixed(0)}км/ч` },
                          { label: d.is_real ? "GPS сат." : "Миссия",
                            val: d.is_real
                              ? `${d.gps_sats ?? "—"} сат`
                              : (missionName.length > 14 ? missionName.slice(0,14)+"…" : missionName) },
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

      {/* Виджет: Конструктор БПЛА */}
      <div className="panel rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(0,212,255,0.12)" }}>
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.1)" }}>
              <Icon name="Wrench" size={14} style={{ color: "var(--electric)" }} />
            </div>
            <div>
              <span className="font-semibold text-sm">Конструктор БПЛА</span>
              <span className="hud-label ml-2">Руководства по сборке и обслуживанию</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="tag tag-green" style={{ fontSize: 9 }}>Бесплатно</span>
            <button
              onClick={() => onNavigate?.("dronebuilder")}
              className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
            >
              Открыть <Icon name="ChevronRight" size={12} />
            </button>
          </div>
        </div>

        <div className={`grid gap-3 p-4 ${isMobile ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-6"}`}>
          {BUILDER_QUICK.map(item => (
            <button
              key={item.cat}
              onClick={() => onNavigate?.("dronebuilder")}
              className="flex flex-col items-start gap-2 p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(0,212,255,0.08)" }}>
                <Icon name={item.icon} fallback="BookOpen" size={14} style={{ color: "var(--electric)" }} />
              </div>
              <span className="text-xs font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-5 py-3 flex items-center gap-2"
          style={{ borderTop: "1px solid hsl(var(--border))", background: "rgba(0,212,255,0.02)" }}>
          <Icon name="BookOpen" size={12} style={{ color: "hsl(var(--muted-foreground))" }} />
          <span className="text-xs text-muted-foreground">
            15 статей · выбор компонентов, настройка Ardupilot/PX4, MAVLink, ТО и законодательство РФ
          </span>
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
                ? { background: "rgba(0,255,136,0.1)", color: "var(--signal-green)", border: "1px solid rgba(0,255,136,0.3)" }
                : geoStatus === "denied"
                  ? { background: "rgba(255,59,48,0.08)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }
                  : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
            }
          >
            <Icon
              name={geoStatus === "loading" ? "Loader" : geoStatus === "ok" ? "MapPin" : geoStatus === "denied" ? "MapPinOff" : "MapPin"}
              fallback="MapPin"
              size={12}
              className={geoStatus === "loading" ? "animate-spin" : ""}
            />
            {geoStatus === "ok" ? "Геолокация активна" : geoStatus === "denied" ? "Геолокация запрещена" : "Показать моё место"}
          </button>
          {remoteTotal > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", color: "var(--signal-green)" }}>
              <Icon name="Users" size={11} />
              {remoteTotal} онлайн
            </div>
          )}
        </div>
        <LiveMap
          drones={mapDrones}
          height={isMobile ? 260 : 340}
          operatorPos={operatorPos}
          remoteOperators={remoteOperators}
          selectedDroneId={selectedDroneId}
          onSelectDrone={setSelectedDroneId}
          showOperatorGeo
        />
      </div>
    </div>
  );
}