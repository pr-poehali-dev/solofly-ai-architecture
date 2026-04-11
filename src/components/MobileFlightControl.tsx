/**
 * MobileFlightControl — мобильный пульт управления дроном.
 * Оптимизирован для управления одной рукой: большие кнопки, важная телеметрия.
 */
import { useState } from "react";
import Icon from "@/components/ui/icon";
import { fleet } from "@/lib/api";
import type { Drone } from "@/lib/api";

interface MobileFlightControlProps {
  drone:       Drone | null;
  loading:     boolean;
  drones:      Drone[];
  selDroneId:  string;
  onSelectDrone: (id: string) => void;
}

const MANEUVERS = [
  { id: "hover", label: "Зависание",    icon: "Pause",      color: "var(--electric)" },
  { id: "orbit", label: "Облёт",        icon: "RefreshCw",  color: "var(--electric)" },
  { id: "climb", label: "Набор высоты", icon: "TrendingUp", color: "var(--signal-green)" },
  { id: "scan",  label: "Сканирование", icon: "Scan",       color: "var(--signal-green)" },
  { id: "rtb",   label: "На базу",      icon: "Home",       color: "var(--warning)" },
  { id: "land",  label: "Посадка",      icon: "ArrowDown",  color: "var(--danger)" },
];

export default function MobileFlightControl({
  drone, loading, drones, selDroneId, onSelectDrone,
}: MobileFlightControlProps) {
  const [activeManeuver, setActiveManeuver]   = useState<string | null>(null);
  const [cmdLoading, setCmdLoading]           = useState(false);
  const [cmdResult, setCmdResult]             = useState<{ ok: boolean; msg: string } | null>(null);
  const [vibrating, setVibrating]             = useState(false);

  const sendManeuver = async (maneuver: string) => {
    if (cmdLoading || !drone) return;

    // Тактильный отклик (вибрация) если поддерживается
    if ("vibrate" in navigator) {
      navigator.vibrate(maneuver === "land" ? [100, 50, 100] : [40]);
    }
    setVibrating(true);
    setTimeout(() => setVibrating(false), 200);

    setCmdLoading(true);
    setCmdResult(null);
    try {
      await fleet.command(selDroneId, maneuver);
      setActiveManeuver(maneuver);
      setCmdResult({ ok: true,  msg: "Отправлено" });
    } catch {
      setCmdResult({ ok: false, msg: "Ошибка" });
    } finally {
      setCmdLoading(false);
      setTimeout(() => setCmdResult(null), 2500);
    }
  };

  const battery     = drone ? drone.battery : 0;
  const altitude    = drone ? Number(drone.altitude) : 0;
  const speed       = drone ? Number(drone.speed) : 0;
  const wind        = drone ? Number(drone.wind) : 0;
  const isFlying    = drone?.status === "flight";
  const batteryColor = battery > 40 ? "var(--signal-green)" : battery > 20 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="flex flex-col h-full select-none">

      {/* Селектор дрона */}
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto">
        {drones.map(d => (
          <button
            key={d.id}
            onClick={() => onSelectDrone(d.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl shrink-0 transition-all active:scale-95"
            style={selDroneId === d.id
              ? { background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.5)", color: "var(--electric)" }
              : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
            }
          >
            <span className={d.status === "flight" ? "dot-online" : "dot-offline"} />
            <span className="text-xs font-semibold">{d.name}</span>
          </button>
        ))}
      </div>

      {loading && !drone ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="hud-label animate-pulse">Загрузка…</span>
        </div>
      ) : !drone ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="hud-label">Нет данных о дроне</span>
        </div>
      ) : (
        <>
          {/* HUD — главные показатели */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-3">
            {[
              { icon: "TrendingUp", label: "Высота",    val: `${altitude.toFixed(0)}м`, color: "var(--electric)" },
              { icon: "Zap",        label: "Скорость",  val: `${speed.toFixed(0)}км/ч`, color: "hsl(var(--foreground))" },
              { icon: "Wind",       label: "Ветер",     val: `${wind.toFixed(0)}м/с`,   color: wind > 10 ? "var(--warning)" : "hsl(var(--foreground))" },
              { icon: "Battery",    label: "Заряд",     val: `${battery}%`,              color: batteryColor },
            ].map(s => (
              <div key={s.label} className="panel rounded-xl p-2.5 text-center">
                <Icon name={s.icon} fallback="Activity" size={14} style={{ color: s.color, margin: "0 auto 2px" }} />
                <div className="hud-value text-sm leading-none mb-0.5" style={{ color: s.color }}>{s.val}</div>
                <div className="hud-label" style={{ fontSize: 8 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Полоса заряда */}
          <div className="mx-4 mb-3">
            <div className="bar-track" style={{ height: 4, borderRadius: 2 }}>
              <div className="bar-fill" style={{
                width: `${battery}%`,
                background: batteryColor,
                transition: "width 1s ease",
                borderRadius: 2,
              }} />
            </div>
          </div>

          {/* Статус + результат команды */}
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <span className={isFlying ? "dot-online" : "dot-offline"} />
              <span className="text-xs font-semibold">
                {drone.name} · {isFlying ? "В полёте" : drone.status === "standby" ? "Готов" : drone.status}
              </span>
            </div>
            {cmdResult && (
              <span className={`tag ${cmdResult.ok ? "tag-green" : "tag-danger"} transition-all`}
                style={{ fontSize: 10 }}>
                {cmdResult.msg}
              </span>
            )}
          </div>

          {/* Кнопки манёвров — большие, для пальца */}
          <div className="grid grid-cols-3 gap-3 px-4 flex-1 content-start">
            {MANEUVERS.map(m => {
              const isActive = activeManeuver === m.id;
              const isDanger = m.id === "land" || m.id === "rtb";
              return (
                <button
                  key={m.id}
                  onPointerDown={() => sendManeuver(m.id)}
                  disabled={cmdLoading}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl transition-all active:scale-95 ${vibrating && isActive ? "scale-95" : ""}`}
                  style={{
                    minHeight: 88,
                    background: isActive
                      ? `${m.color}20`
                      : isDanger
                        ? "rgba(255,59,48,0.06)"
                        : "hsl(var(--input))",
                    border: isActive
                      ? `2px solid ${m.color}`
                      : isDanger
                        ? "1px solid rgba(255,59,48,0.2)"
                        : "1px solid hsl(var(--border))",
                    opacity: cmdLoading && !isActive ? 0.5 : 1,
                    boxShadow: isActive ? `0 0 20px ${m.color}30` : "none",
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: isActive ? `${m.color}25` : "rgba(255,255,255,0.05)" }}>
                    <Icon
                      name={cmdLoading && isActive ? "Loader" : m.icon}
                      fallback="Navigation"
                      size={22}
                      className={cmdLoading && isActive ? "animate-spin" : ""}
                      style={{ color: isActive ? m.color : isDanger ? "var(--danger)" : "hsl(var(--muted-foreground))" }}
                    />
                  </div>
                  <span className="text-xs font-semibold leading-tight text-center px-1"
                    style={{ color: isActive ? m.color : isDanger ? "var(--danger)" : "hsl(var(--foreground))" }}>
                    {m.label}
                  </span>
                  {isActive && (
                    <span className="tag tag-green" style={{ fontSize: 8, paddingTop: 1, paddingBottom: 1 }}>
                      Активен
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* GPS координаты */}
          {Number(drone.lat) !== 0 && (
            <div className="mx-4 mt-3 mb-2 p-2.5 rounded-xl flex items-center gap-2"
              style={{ background: "hsl(var(--input))" }}>
              <Icon name="MapPin" size={13} style={{ color: "var(--electric)", flexShrink: 0 }} />
              <span className="hud-label font-mono text-xs">
                {Math.abs(Number(drone.lat)).toFixed(5)}°{Number(drone.lat) >= 0 ? "N" : "S"}
                {" "}{Math.abs(Number(drone.lon)).toFixed(5)}°{Number(drone.lon) >= 0 ? "E" : "W"}
                {" "}↑{altitude.toFixed(0)}м
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
