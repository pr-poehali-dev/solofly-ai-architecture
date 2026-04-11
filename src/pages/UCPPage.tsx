import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { fleet, type Drone, type FleetAnalytics } from "@/lib/api";
import LiveMap, { type MapDrone } from "@/components/LiveMap";
import { DroneCard, DroneDetail } from "./ucp/DronePanel";
import RegisterTab from "./ucp/RegisterTab";
import AnalyticsTab from "./ucp/AnalyticsTab";

type Tab = "fleet" | "register" | "analytics" | "map";

export default function UCPPage() {
  const [tab, setTab]                 = useState<Tab>("fleet");
  const [drones, setDrones]           = useState<Drone[]>([]);
  const [analytics, setAnalytics]     = useState<FleetAnalytics | null>(null);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [operatorPos, setOperatorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus]     = useState<"idle" | "loading" | "ok" | "denied">("idle");

  const load = useCallback(async () => {
    try {
      const [fleetRes, analyticsRes] = await Promise.all([
        fleet.getAll(),
        fleet.getAnalytics(),
      ]);
      setDrones(fleetRes.drones);
      setAnalytics(analyticsRes);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Автообновление каждые 5 сек
  useEffect(() => {
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const requestGeo = () => {
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      p => { setOperatorPos({ lat: p.coords.latitude, lon: p.coords.longitude }); setGeoStatus("ok"); },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const selectedDrone = drones.find(d => d.id === selectedId) ?? null;
  const stats  = analytics?.stats;
  const flying = stats?.flying ?? 0;

  const mapDrones: MapDrone[] = drones
    .filter(d => Number(d.lat) && Number(d.lon))
    .map(d => ({
      id: d.id, name: d.name, status: d.status,
      lat: Number(d.lat), lon: Number(d.lon),
      altitude: Number(d.altitude), heading: Number(d.heading),
      speed: Number(d.speed), battery: d.battery,
    }));

  return (
    <div className="p-6 space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">ЦУП — Центр управления полётами</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Регистрация БПЛА · Телеметрия · Аналитика флота
            {!loading && <span className="ml-2" style={{ color: "var(--signal-green)" }}>● LIVE</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={requestGeo}
            className="panel px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all"
            style={geoStatus === "ok" ? { borderColor: "rgba(255,59,48,0.4)", color: "#ff3b30" } : {}}>
            <Icon name={geoStatus === "loading" ? "Loader" : "MapPin"} size={13}
              className={geoStatus === "loading" ? "animate-spin" : ""} />
            {geoStatus === "ok" ? "Геолокация активна" : "Геолокация"}
          </button>
          <button onClick={load} className="btn-ghost px-3 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="RefreshCw" size={13} /> Обновить
          </button>
          <button onClick={() => setTab("register")} className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Plus" size={13} /> Подключить БПЛА
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: "Navigation",      label: "В полёте", val: flying,                                       color: "var(--signal-green)" },
          { icon: "Zap",             label: "Готово",   val: stats?.standby ?? 0,                          color: "var(--electric)"     },
          { icon: "BatteryCharging", label: "Зарядка",  val: stats?.charging ?? 0,                         color: "#f97316"             },
          { icon: "WifiOff",         label: "Офлайн",   val: (stats?.offline ?? 0) + (stats?.errors ?? 0), color: "var(--muted)"        },
          { icon: "Database",        label: "Всего",    val: drones.length,                                color: "#a78bfa"             },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Circle" size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="hud-value text-xl" style={{ color: s.color }}>{loading ? "—" : s.val}</div>
              <div className="hud-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 panel rounded-xl p-1" style={{ width: "fit-content" }}>
        {([["fleet", "Флот", "Layers3"], ["register", "Регистрация", "PlusCircle"],
           ["analytics", "Аналитика", "BarChart2"], ["map", "Карта", "Map"]] as const).map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
            style={tab === id
              ? { background: "rgba(0,212,255,0.12)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }
              : { color: "hsl(var(--muted-foreground))" }}>
            <Icon name={icon} size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── FLEET ── */}
      {tab === "fleet" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {loading
              ? [1,2,3,4].map(i => <div key={i} className="panel rounded-xl h-36 animate-pulse" />)
              : drones.map(d => (
                  <DroneCard key={d.id} drone={d} selected={selectedId === d.id}
                    onClick={async () => {
                      if (selectedId === d.id) { setSelectedId(null); return; }
                      const res = await fleet.getOne(d.id);
                      setDrones(prev => prev.map(x => x.id === d.id ? { ...x, ...res.drone } : x));
                      setSelectedId(d.id);
                    }} />
                ))
            }
          </div>
          <div className="lg:col-span-2">
            {selectedDrone
              ? <DroneDetail drone={selectedDrone} onClose={() => setSelectedId(null)}
                  onDelete={id => { setDrones(prev => prev.filter(d => d.id !== id)); setSelectedId(null); }}
                  onRefresh={load} />
              : (
                <div className="panel rounded-xl h-full flex flex-col items-center justify-center p-10 text-center gap-4"
                  style={{ minHeight: 280 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(0,212,255,0.08)" }}>
                    <Icon name="Navigation" size={28} style={{ color: "var(--electric)" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">Выберите БПЛА</div>
                    <div className="text-muted-foreground text-xs">Нажмите на карточку для просмотра паспорта и телеметрии</div>
                  </div>
                  <div className="hud-label">{drones.length} борт{drones.length !== 1 ? "ов" : ""} в системе</div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* ── REGISTER ── */}
      {tab === "register" && (
        <RegisterTab
          drones={drones}
          onDone={() => { load(); setTab("fleet"); }}
          onCancel={() => setTab("fleet")}
        />
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && analytics && (
        <AnalyticsTab
          analytics={analytics}
          onSelectDrone={id => { setSelectedId(id); setTab("fleet"); }}
        />
      )}

      {/* ── MAP ── */}
      {tab === "map" && (
        <div className="panel rounded-xl overflow-hidden">
          <LiveMap
            drones={mapDrones}
            height={520}
            operatorPos={operatorPos}
            selectedDroneId={selectedId}
            onSelectDrone={id => { setSelectedId(id); if (id) setTab("fleet"); }}
            showOperatorGeo
          />
        </div>
      )}
    </div>
  );
}
