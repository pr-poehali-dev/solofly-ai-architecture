import { useState } from "react";
import Icon from "@/components/ui/icon";
import WaypointEditor from "@/components/map/WaypointEditor";
import type { Mission, Drone } from "@/lib/api";
import {
  statusCls, statusLabel, riskCls, riskLabel,
  fmtTime, type TabType,
} from "./missionsTypes";

interface MissionDetailProps {
  sel: Mission | undefined;
  loading: boolean;
  drones: Drone[];
  onStart: () => void;
  onPause: () => void;
  onAbort: () => void;
}

export default function MissionDetail({
  sel,
  loading,
  drones,
  onStart,
  onPause,
  onAbort,
}: MissionDetailProps) {
  const [tab, setTab] = useState<TabType>("map");

  if (!sel) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-10 text-sm">
        {loading ? "Загрузка миссий…" : "Выберите миссию"}
      </div>
    );
  }

  // Используем реальные координаты из БД, или генерируем по кругу как фолбэк
  const drone   = drones.find(d => d.id === sel.drone_id);
  const baseLat = drone ? Number(drone.lat) : 55.751;
  const baseLon = drone ? Number(drone.lon) : 37.618;

  const savedWps = (sel as Mission & { waypoints_json?: { lat: number; lon: number; action?: string | null }[] }).waypoints_json;
  const hasRealWps = Array.isArray(savedWps) && savedWps.length > 0;

  const previewWps = hasRealWps
    ? savedWps.map(w => ({ lat: w.lat, lon: w.lon, action: w.action ?? "" }))
    : Array.from({ length: sel.waypoints }).map((_, i) => {
        const angle = (i / Math.max(sel.waypoints, 1)) * Math.PI * 2;
        const r = 0.003 + Math.sin(i * 1.7) * 0.001;
        return {
          lat:    baseLat + Math.cos(angle) * r,
          lon:    baseLon + Math.sin(angle) * r,
          action: sel.tasks?.[i] ?? "",
        };
      });

  return (
    <>
      {/* Карта маршрута — WaypointEditor в режиме просмотра */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <WaypointEditor
          waypoints={previewWps}
          onChange={() => {}}
          height={220}
        />
        {/* Оверлей статуса */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span className="tag tag-electric">{sel.code}</span>
          {sel.status === "active" && (
            <span className="tag tag-green flex items-center gap-1.5">
              <span className="dot-online" /> Live · {sel.progress}%
            </span>
          )}
          {sel.route_adjustments > 0 && (
            <span className="tag tag-warning flex items-center gap-1">
              <Icon name="RefreshCw" size={10} /> {sel.route_adjustments} коррекций
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        {(["map", "tasks", "weather", "obstacles"] as TabType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold transition-all ${tab === t ? "" : "text-muted-foreground hover:text-foreground"}`}
            style={tab === t ? { color: "var(--electric)", borderBottom: "2px solid var(--electric)" } : {}}
          >
            {t === "map" ? "Маршрут" : t === "tasks" ? "Задачи" : t === "weather" ? "Погода" : "Препятствия"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Маршрут */}
        {tab === "map" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Дрон",      val: sel.drone_name ?? sel.drone_id },
                { label: "Старт",     val: fmtTime(sel.start_time) },
                { label: "Прогресс",  val: `${sel.progress}%` },
              ].map(i => (
                <div key={i.label} className="text-center p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="hud-label mb-1">{i.label}</div>
                  <div className="hud-value text-sm">{i.val}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                <span className="hud-label">Дистанция: </span>
                <span className="hud-value">{sel.distance_km} км</span>
              </div>
              <div className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                <span className="hud-label">Точек: </span>
                <span className="hud-value">{sel.waypoints}</span>
              </div>
            </div>

            {/* Точки маршрута с высотами */}
            {(sel as Mission & { waypoints_json?: { lat: number; lon: number; action?: string | null; altitude?: number | null }[] }).waypoints_json?.length ? (
              <div>
                <div className="hud-label mb-2 flex items-center gap-1.5">
                  <Icon name="MoveVertical" size={11} style={{ color: "var(--electric)" }} />
                  Точки маршрута и эшелоны
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {(sel as Mission & { waypoints_json?: { lat: number; lon: number; action?: string | null; altitude?: number | null }[] }).waypoints_json!.map((wp, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs" style={{ background: "hsl(var(--input))" }}>
                      <span className="text-muted-foreground">#{i + 1}</span>
                      <span style={{ color: "var(--electric)" }}>{wp.lat.toFixed(5)}, {wp.lon.toFixed(5)}</span>
                      {wp.action && <span className="tag tag-electric">{wp.action}</span>}
                      {wp.altitude
                        ? <span className="font-semibold" style={{ color: "var(--signal-green)" }}>{wp.altitude} м</span>
                        : <span className="text-muted-foreground">— м</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Задачи */}
        {tab === "tasks" && (
          <div className="space-y-2">
            {(sel.tasks ?? []).length === 0
              ? <p className="text-xs text-muted-foreground">Задачи не указаны</p>
              : (sel.tasks ?? []).map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                    <div className="flex items-center gap-2">
                      <Icon name="CheckSquare" size={13} style={{ color: "var(--electric)" }} />
                      <span className="text-sm font-medium">{task}</span>
                    </div>
                    <span className={`tag ${statusCls[sel.status] ?? "tag-muted"}`}>
                      {sel.status === "done" ? "Выполнено" : sel.status === "active" ? "Активна" : "Ожидает"}
                    </span>
                  </div>
                ))
            }
          </div>
        )}

        {/* Погода */}
        {tab === "weather" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="hud-label">Погодные условия</span>
              <span className={`tag ${riskCls[sel.weather_risk] ?? "tag-muted"}`}>
                {riskLabel[sel.weather_risk] ?? sel.weather_risk}
              </span>
            </div>
            {[
              { icon: "Wind",        label: "Ветер",       val: `${sel.weather_wind} м/с` },
              { icon: "Eye",         label: "Видимость",   val: sel.weather_vis },
              { icon: "Thermometer", label: "Температура", val: `${sel.weather_temp}°C` },
            ].map(w => (
              <div key={w.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                <div className="flex items-center gap-2">
                  <Icon name={w.icon} fallback="Cloud" size={14} style={{ color: "var(--electric)" }} />
                  <span className="text-sm">{w.label}</span>
                </div>
                <span className="hud-value text-xs">{w.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Препятствия */}
        {tab === "obstacles" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="hud-label">Объезды препятствий</span>
              <span className="tag tag-green">{sel.obstacles_avoided} объездов</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
              <span className="text-xs">Коррекций маршрута</span>
              <span className="hud-value text-xs">{sel.route_adjustments}</span>
            </div>
            {sel.obstacles_avoided === 0 && (
              <p className="text-xs text-muted-foreground pt-2">Препятствий не обнаружено</p>
            )}
          </div>
        )}

        {/* Кнопки управления */}
        <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
          {sel.status === "active" && (
            <button onClick={onPause} className="btn-ghost flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
              <Icon name="Pause" size={13} /> Пауза
            </button>
          )}
          {sel.status === "planned" && (
            <button onClick={onStart} className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
              <Icon name="Play" size={13} /> Запустить
            </button>
          )}
          {(sel.status === "active" || sel.status === "planned") && (
            <button
              onClick={onAbort}
              className="px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.25)" }}
            >
              <Icon name="X" size={12} /> Прервать
            </button>
          )}
          <button className="panel px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
            <Icon name="Download" size={12} /> CSV
          </button>
        </div>
      </div>
    </>
  );
}