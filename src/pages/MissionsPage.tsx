import { useState } from "react";
import Icon from "@/components/ui/icon";

const missions = [
  {
    id: "MSN-047", name: "Патруль периметра А", drone: "Орёл-1",
    status: "active", progress: 68, start: "13:10", eta: "14:45",
    type: "patrol", waypoints: 12,
    tasks: ["Видеосъёмка", "Мониторинг периметра"],
    weather: { wind: 8, vis: "хорошая", temp: 12, risk: "low" },
    obstaclesAvoided: 3, routeAdjustments: 1,
  },
  {
    id: "MSN-048", name: "Картографирование B2", drone: "Сокол-1",
    status: "active", progress: 34, start: "13:52", eta: "16:10",
    type: "mapping", waypoints: 24,
    tasks: ["3D-картография", "Фотограмметрия"],
    weather: { wind: 14, vis: "умеренная", temp: 9, risk: "medium" },
    obstaclesAvoided: 1, routeAdjustments: 2,
  },
  {
    id: "MSN-049", name: "Доставка груза С3", drone: "Орёл-2",
    status: "planned", progress: 0, start: "15:00", eta: "16:00",
    type: "delivery", waypoints: 6,
    tasks: ["Доставка", "Подтверждение получения"],
    weather: { wind: 11, vis: "хорошая", temp: 11, risk: "low" },
    obstaclesAvoided: 0, routeAdjustments: 0,
  },
  {
    id: "MSN-046", name: "Обзор-14", drone: "Орёл-3",
    status: "done", progress: 100, start: "11:00", eta: "12:42",
    type: "recon", waypoints: 18,
    tasks: ["Разведка", "Тепловизор"],
    weather: { wind: 6, vis: "хорошая", temp: 13, risk: "low" },
    obstaclesAvoided: 5, routeAdjustments: 3,
  },
];

const typeIcon: Record<string, string> = {
  patrol: "Shield", mapping: "Map", inspection: "Search",
  recon: "Eye", delivery: "Package",
};
const typeName: Record<string, string> = {
  patrol: "Патруль", mapping: "Картография", inspection: "Инспекция",
  recon: "Разведка", delivery: "Доставка",
};
const statusCls: Record<string, string> = {
  active: "tag-green", planned: "tag-electric", done: "tag-muted", aborted: "tag-danger",
};
const statusLabel: Record<string, string> = {
  active: "Выполняется", planned: "Запланирована", done: "Завершена", aborted: "Прервана",
};
const riskCls: Record<string, string> = {
  low: "tag-green", medium: "tag-warning", high: "tag-danger",
};
const riskLabel: Record<string, string> = {
  low: "Низкий риск", medium: "Средний риск", high: "Высокий риск",
};

const missionTypes = [
  { key: "patrol", icon: "Shield", label: "Патруль" },
  { key: "mapping", icon: "Map", label: "Картография" },
  { key: "delivery", icon: "Package", label: "Доставка" },
  { key: "recon", icon: "Eye", label: "Разведка" },
  { key: "inspection", icon: "Search", label: "Инспекция" },
];

export default function MissionsPage() {
  const [selected, setSelected] = useState<string | null>("MSN-047");
  const [tab, setTab] = useState<"map" | "tasks" | "weather" | "obstacles">("map");

  const sel = missions.find(m => m.id === selected);

  return (
    <div className="p-6 fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Планирование миссий</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Автономный ИИ-планировщик · Мультизадачность · Динамическая коррекция</p>
        </div>
        <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <Icon name="Plus" size={13} />
          Новая миссия
        </button>
      </div>

      {/* Mission type quick-select */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {missionTypes.map(t => (
          <div key={t.key} className="panel rounded-xl px-4 py-3 flex items-center gap-2 shrink-0 cursor-pointer hover:border-[rgba(0,212,255,0.2)] transition-all" style={{ minWidth: 120 }}>
            <Icon name={t.icon} fallback="Navigation" size={15} style={{ color: "var(--electric)" }} />
            <span className="text-xs font-medium">{t.label}</span>
          </div>
        ))}
        <div className="panel rounded-xl px-4 py-3 flex items-center gap-2 shrink-0 cursor-pointer hover:border-[rgba(0,212,255,0.2)] transition-all" style={{ minWidth: 100, borderStyle: "dashed" }}>
          <Icon name="Plus" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Свой тип</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Mission list */}
        <div className="lg:col-span-2 space-y-3">
          {missions.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className="w-full text-left p-4 rounded-xl panel transition-all"
              style={selected === m.id ? { borderColor: "rgba(0,212,255,0.35)" } : {}}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,212,255,0.1)" }}>
                    <Icon name={typeIcon[m.type]} fallback="Navigation" size={14} style={{ color: "var(--electric)" }} />
                  </div>
                  <div>
                    <span className="font-semibold text-sm">{m.name}</span>
                    <div className="hud-label mt-0.5">{m.drone} · {typeName[m.type]}</div>
                  </div>
                </div>
                <span className={`tag ${statusCls[m.status]}`}>{statusLabel[m.status]}</span>
              </div>

              <div className="flex items-center gap-3 mb-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Wind" size={11} />
                  {m.weather.wind} м/с
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Icon name="Navigation" size={11} />
                  {m.waypoints} точек
                </span>
                {m.obstaclesAvoided > 0 && (
                  <span className="flex items-center gap-1" style={{ color: "var(--warning)" }}>
                    <Icon name="AlertTriangle" size={11} />
                    {m.obstaclesAvoided} препятствий
                  </span>
                )}
              </div>

              {/* Tasks pills */}
              <div className="flex gap-1 flex-wrap mb-2">
                {m.tasks.map(t => (
                  <span key={t} className="tag tag-muted" style={{ fontSize: 9 }}>{t}</span>
                ))}
              </div>

              {m.status === "active" && (
                <>
                  <div className="bar-track mb-1">
                    <div className="bar-fill" style={{ width: `${m.progress}%`, background: "var(--signal-green)" }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="hud-label">{m.progress}%</span>
                    <span className="hud-label">ETA {m.eta}</span>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3 panel rounded-xl overflow-hidden">
          {sel ? (
            <>
              {/* Fake map */}
              <div className="relative h-56 grid-bg radar-bg flex items-center justify-center overflow-hidden">
                <div className="scan-line" />
                {Array.from({ length: sel.waypoints }).map((_, i) => {
                  const angle = (i / sel.waypoints) * Math.PI * 2;
                  const r = 70 + Math.sin(i * 1.7) * 35;
                  const x = 50 + Math.cos(angle) * r * 0.42;
                  const y = 50 + Math.sin(angle) * r * 0.42;
                  const done = (i / sel.waypoints) * 100 < sel.progress;
                  return (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%`, background: done ? "var(--signal-green)" : "rgba(0,212,255,0.4)", boxShadow: done ? "0 0 6px var(--signal-green)" : "none" }}
                    />
                  );
                })}
                {/* Obstacle markers */}
                {sel.obstaclesAvoided > 0 && [{ x: 35, y: 40 }, { x: 65, y: 55 }].slice(0, sel.obstaclesAvoided).map((pos, i) => (
                  <div key={i} className="absolute w-4 h-4 rounded -translate-x-1/2 -translate-y-1/2 flex items-center justify-center" style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: "rgba(255,149,0,0.2)", border: "1px solid var(--warning)" }}>
                    <Icon name="X" size={8} style={{ color: "var(--warning)" }} />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center z-10" style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.4)" }}>
                  <Icon name="Navigation" size={20} style={{ color: "var(--electric)" }} />
                </div>
                <div className="absolute top-3 left-3">
                  <span className="tag tag-electric">{sel.id}</span>
                </div>
                {sel.status === "active" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 tag tag-green">
                    <span className="dot-online" /> Live
                  </div>
                )}
                {sel.routeAdjustments > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 tag tag-warning">
                    <Icon name="RefreshCw" size={10} /> {sel.routeAdjustments} коррекций маршрута
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                {(["map", "tasks", "weather", "obstacles"] as const).map(t => (
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
                {tab === "map" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Дрон", val: sel.drone },
                        { label: "Начало", val: sel.start },
                        { label: "ETA", val: sel.eta },
                      ].map(i => (
                        <div key={i.label} className="text-center p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                          <div className="hud-label mb-1">{i.label}</div>
                          <div className="hud-value text-sm">{i.val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="hud-label mb-2">Возможности ИИ-планировщика</div>
                      {[
                        "Автоматический обход запретных зон",
                        "Оптимизация по расходу заряда АКБ",
                        "Учёт ветровой нагрузки и турбулентности",
                        "Резервный маршрут посадки",
                        "Динамическая коррекция в реальном времени",
                      ].map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs">
                          <Icon name="CheckCircle" size={13} style={{ color: "var(--signal-green)" }} />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "tasks" && (
                  <div className="space-y-3">
                    <div className="hud-label mb-2">Активные задачи в миссии</div>
                    {sel.tasks.map((task, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "rgba(0,212,255,0.12)" }}>
                            <Icon name="CheckSquare" size={13} style={{ color: "var(--electric)" }} />
                          </div>
                          <span className="text-sm font-medium">{task}</span>
                        </div>
                        <span className={`tag ${sel.status === "done" ? "tag-green" : sel.status === "active" ? "tag-electric" : "tag-muted"}`}>
                          {sel.status === "done" ? "Выполнено" : sel.status === "active" ? "Активна" : "Ожидает"}
                        </span>
                      </div>
                    ))}
                    <div className="p-3 rounded-lg border border-dashed text-center text-xs text-muted-foreground" style={{ borderColor: "hsl(var(--border))" }}>
                      + Добавить задачу в миссию
                    </div>
                  </div>
                )}

                {tab === "weather" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="hud-label">Погодные условия</span>
                      <span className={`tag ${riskCls[sel.weather.risk]}`}>{riskLabel[sel.weather.risk]}</span>
                    </div>
                    {[
                      { icon: "Wind", label: "Скорость ветра", val: `${sel.weather.wind} м/с`, ok: sel.weather.wind < 12 },
                      { icon: "Eye", label: "Видимость", val: sel.weather.vis, ok: sel.weather.vis === "хорошая" },
                      { icon: "Thermometer", label: "Температура", val: `${sel.weather.temp}°C`, ok: true },
                      { icon: "Navigation", label: "Работа ИИ WeatherAdapt", val: "Активна", ok: true },
                    ].map(w => (
                      <div key={w.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                        <div className="flex items-center gap-3">
                          <Icon name={w.icon} fallback="Cloud" size={15} style={{ color: w.ok ? "var(--electric)" : "var(--warning)" }} />
                          <span className="text-sm">{w.label}</span>
                        </div>
                        <span className={`hud-value text-xs ${w.ok ? "" : ""}`} style={{ color: w.ok ? "hsl(var(--foreground))" : "var(--warning)" }}>{w.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "obstacles" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="hud-label">Обнаружение и обход препятствий</span>
                      <span className="tag tag-green">{sel.obstaclesAvoided} объездов</span>
                    </div>
                    {sel.obstaclesAvoided === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        Препятствий не обнаружено
                      </div>
                    ) : (
                      [
                        { type: "Движущийся объект", dist: "12м", action: "Обход справа", time: "13:24" },
                        { type: "Здание (незарегистр.)", dist: "8м", action: "Маршрут пересчитан", time: "13:31" },
                        { type: "Птица, стая", dist: "5м", action: "Снижение высоты", time: "13:38" },
                      ].slice(0, sel.obstaclesAvoided).map((o, i) => (
                        <div key={i} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{o.type}</span>
                            <span className="hud-label">{o.time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Дистанция: {o.dist}</span>
                            <Icon name="ArrowRight" size={11} />
                            <span style={{ color: "var(--signal-green)" }}>{o.action}</span>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="p-3 rounded-lg" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.12)" }}>
                      <div className="hud-label mb-1">Прогноз столкновений (ИИ)</div>
                      <div className="text-xs text-muted-foreground">Обнаружено 0 потенциальных угроз на следующих 4 точках маршрута</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                  {sel.status === "active" && (
                    <button className="btn-ghost flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
                      <Icon name="Pause" size={13} /> Пауза
                    </button>
                  )}
                  {sel.status === "planned" && (
                    <button className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
                      <Icon name="Play" size={13} /> Запустить
                    </button>
                  )}
                  <button className="panel px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 hover:border-[rgba(0,212,255,0.2)] transition-all">
                    <Icon name="Download" size={13} /> CSV
                  </button>
                  <button className="panel px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 hover:border-[rgba(0,212,255,0.2)] transition-all">
                    <Icon name="FileDown" size={13} /> PDF
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground p-10 text-sm">
              Выберите миссию для просмотра деталей
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
