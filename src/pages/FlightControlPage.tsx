import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useLiveFleet } from "@/hooks/useLiveFleet";

const maneuvers = [
  { id: "hover", label: "Зависание", icon: "Pause" },
  { id: "orbit", label: "Облёт объекта", icon: "RefreshCw" },
  { id: "land", label: "Безопасная посадка", icon: "ArrowDown" },
  { id: "rtb", label: "Возврат на базу", icon: "Home" },
  { id: "climb", label: "Набор высоты", icon: "TrendingUp" },
  { id: "scan", label: "Скан-паттерн", icon: "Scan" },
];

export default function FlightControlPage() {
  const { data: fleet, loading } = useLiveFleet(3000);
  const [selDroneId, setSelDroneId] = useState("SF-001");
  const [activeManeuver, setActiveManeuver] = useState<string | null>(null);

  const drones = fleet?.drones ?? [];
  const flyingDrones = drones.filter(d => d.status === "flight" || d.status === "standby");
  const droneRaw = drones.find(d => d.id === selDroneId) ?? drones[0];

  if (!droneRaw && !loading) {
    return <div className="p-6 text-muted-foreground text-sm">Нет данных о дронах</div>;
  }

  // Адаптируем поля из БД к компоненту
  const drone = droneRaw ? {
    id: droneRaw.id,
    name: droneRaw.name,
    status: droneRaw.status,
    altitude: Number(droneRaw.altitude),
    speed: Number(droneRaw.speed),
    heading: Number(droneRaw.heading),
    battery: droneRaw.battery,
    temp: droneRaw.temperature,
    roll: 0,   // придёт из telemetry_history если есть
    pitch: 0,
    yaw: Number(droneRaw.heading),
    wind: Number(droneRaw.wind),
    vibration: droneRaw.vibration,
    gps: `${droneRaw.gps_sats} спутников`,
    hardware: {
      weight: Number(droneRaw.hw_weight),
      motors: droneRaw.hw_motors,
      battery_cap: droneRaw.hw_battery_cap,
      max_speed: droneRaw.hw_max_speed,
    },
  } : null;

  // Пытаемся взять roll/pitch из последней телеметрии
  if (drone && droneRaw?.telemetry_history && droneRaw.telemetry_history.length > 0) {
    const last = droneRaw.telemetry_history[0];
    drone.roll = Number(last.roll ?? 0);
    drone.pitch = Number(last.pitch ?? 0);
    drone.yaw = Number(last.yaw ?? drone.heading);
  }

  const selDrone = selDroneId;;

  return (
    <div className="p-6 fade-up space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Управление полётом</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Стабилизация · Манёвры · Адаптация под БПЛА</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {loading && drones.length === 0
            ? <span className="hud-label animate-pulse">загрузка…</span>
            : (flyingDrones.length > 0 ? flyingDrones : drones).map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelDroneId(d.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${selDrone === d.id ? "btn-electric" : "panel"}`}
                >
                  <span className={d.status === "flight" ? "dot-online" : "dot-offline"} />
                  {d.name}
                </button>
              ))
          }
        </div>
      </div>

      {!drone && (
        <div className="panel p-6 rounded-xl text-center text-muted-foreground text-sm animate-pulse">
          Загрузка данных дрона…
        </div>
      )}
      {/* Main HUD */}
      {drone && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Attitude indicator */}
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Авиагоризонт (ИМУ)</h2>
            <span className="tag tag-green">Стабильно</span>
          </div>
          <div className="relative w-40 h-40 mx-auto mb-4">
            {/* Artificial horizon */}
            <div className="absolute inset-0 rounded-full overflow-hidden" style={{ border: "2px solid rgba(0,212,255,0.3)" }}>
              <div
                className="absolute inset-0 transition-transform duration-300"
                style={{ transform: `rotate(${drone.roll}deg)` }}
              >
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #1a3a6b 50%, #5c3a1a 50%)" }} />
                <div className="absolute w-full" style={{ top: `calc(50% - ${drone.pitch * 2}px)`, height: 1, background: "rgba(255,255,255,0.6)" }} />
              </div>
              {/* Center mark */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-0.5 rounded" style={{ background: "var(--signal-green)" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--signal-green)" }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Крен", val: `${drone.roll}°` },
              { label: "Тангаж", val: `${drone.pitch}°` },
              { label: "Курс", val: `${drone.heading}°` },
            ].map(v => (
              <div key={v.label} className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                <div className="hud-label mb-0.5">{v.label}</div>
                <div className="hud-value text-xs">{v.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry */}
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Телеметрия</h2>
            <span className="tag tag-electric">300+ параметров</span>
          </div>
          <div className="space-y-3">
            {[
              { icon: "TrendingUp", label: "Высота", val: `${drone.altitude} м`, ok: true },
              { icon: "Zap", label: "Скорость", val: `${drone.speed} км/ч`, ok: drone.speed < 80 },
              { icon: "Battery", label: "Заряд АКБ", val: `${drone.battery}%`, ok: drone.battery > 40 },
              { icon: "Thermometer", label: "Темп. ESC", val: `${drone.temp}°C`, ok: drone.temp < 55 },
              { icon: "Wind", label: "Боковой ветер", val: `${drone.wind} м/с`, ok: drone.wind < 12 },
              { icon: "Wifi", label: "GPS", val: drone.gps, ok: true },
            ].map(t => (
              <div key={t.label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex items-center gap-2">
                  <Icon name={t.icon} fallback="Activity" size={13} style={{ color: t.ok ? "var(--electric)" : "var(--warning)" }} />
                  <span className="hud-label">{t.label}</span>
                </div>
                <span className="hud-value text-xs" style={{ color: t.ok ? "hsl(var(--foreground))" : "var(--warning)" }}>{t.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stabilization & mode */}
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Системы стабилизации</h2>
            <span className="tag tag-green">Активны</span>
          </div>
          <div className="space-y-2 mb-5">
            {[
              { label: "Удержание высоты (барометр)", active: true },
              { label: "Удержание позиции (GPS)", active: true },
              { label: "Компенсация ветра", active: true },
              { label: "Антивибрационный контур", active: drone.vibration !== "критическая" },
              { label: "Автоматическая коррекция крена", active: true },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 py-1.5">
                <Icon name={s.active ? "CheckCircle" : "XCircle"} size={13} style={{ color: s.active ? "var(--signal-green)" : "var(--danger)" }} />
                <span className="text-xs">{s.label}</span>
                <span className="ml-auto tag" style={{ fontSize: 9, background: s.active ? "rgba(0,255,136,0.1)" : "rgba(255,59,48,0.1)", color: s.active ? "var(--signal-green)" : "var(--danger)" }}>
                  {s.active ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg mb-3" style={{ background: "hsl(var(--input))" }}>
            <div className="hud-label mb-2">Профиль БПЛА</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Масса:</span> <span className="hud-value ml-1">{drone.hardware.weight} кг</span></div>
              <div><span className="text-muted-foreground">Моторов:</span> <span className="hud-value ml-1">{drone.hardware.motors}</span></div>
              <div><span className="text-muted-foreground">АКБ:</span> <span className="hud-value ml-1">{drone.hardware.battery_cap} мАч</span></div>
              <div><span className="text-muted-foreground">Vmax:</span> <span className="hud-value ml-1">{drone.hardware.max_speed} км/ч</span></div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">ИИ адаптирует ПИД-регуляторы под профиль БПЛА автоматически</div>
        </div>
      </div>}

      {/* Maneuvers */}
      {drone && <div className="panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Манёвры и режимы</h2>
          <span className="tag tag-electric">Автономный режим</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {maneuvers.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveManeuver(activeManeuver === m.id ? null : m.id)}
              className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all text-center ${activeManeuver === m.id ? "panel-glow" : "panel hover:border-[rgba(0,212,255,0.2)]"}`}
              style={activeManeuver === m.id ? { borderColor: "rgba(0,212,255,0.4)" } : {}}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: activeManeuver === m.id ? "rgba(0,212,255,0.15)" : "hsl(var(--input))" }}>
                <Icon name={m.icon} fallback="Navigation" size={18} style={{ color: activeManeuver === m.id ? "var(--electric)" : "hsl(var(--muted-foreground))" }} />
              </div>
              <span className="text-xs font-medium">{m.label}</span>
              {activeManeuver === m.id && <span className="tag tag-green" style={{ fontSize: 9 }}>Активен</span>}
            </button>
          ))}
        </div>
        {activeManeuver === "land" && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.2)" }}>
            <div className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: "var(--danger)" }}>
              <Icon name="AlertTriangle" size={15} />
              Инициирована безопасная посадка
            </div>
            <p className="text-xs text-muted-foreground">ИИ выбирает оптимальное место посадки: отсутствие людей, ровная поверхность, доступность для эвакуации.</p>
          </div>
        )}
        {activeManeuver === "rtb" && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)" }}>
            <div className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: "var(--electric)" }}>
              <Icon name="Home" size={15} />
              Возврат на базу инициирован
            </div>
            <p className="text-xs text-muted-foreground">Маршрут RTB построен с учётом остатка заряда {drone.battery}%. Расчётное время прибытия: 8 мин.</p>
          </div>
        )}
      </div>}

      {/* Emergency & Failure modes */}
      <div className="panel-danger rounded-xl p-5">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--danger)" }}>
          <Icon name="AlertOctagon" size={15} />
          Аварийные сценарии (раздел 3.4)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { scenario: "Потеря связи", action: "Автономное завершение миссии → RTB", status: "ready" },
            { scenario: "Критический заряд (< 15%)", action: "Немедленная посадка в безопасной точке", status: "ready" },
            { scenario: "Отказ мотора", action: "Аварийная посадка + сигнал оператору", status: "ready" },
            { scenario: "Вход в запрет. зону", action: "Экстренный разворот по безопасному маршруту", status: "ready" },
          ].map(s => (
            <div key={s.scenario} className="p-3 rounded-lg" style={{ background: "rgba(255,59,48,0.06)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="dot-online" style={{ background: "var(--signal-green)" }} />
                <span className="font-semibold text-xs">{s.scenario}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}