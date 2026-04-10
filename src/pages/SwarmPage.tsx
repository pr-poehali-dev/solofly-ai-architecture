import { useState } from "react";
import Icon from "@/components/ui/icon";

const swarmDrones = [
  { id: "SF-001", name: "Орёл-1", role: "leader", status: "flight", battery: 74, task: "Координация роя", x: 50, y: 40, linked: ["SF-002", "SF-003"] },
  { id: "SF-002", name: "Орёл-2", role: "scout", status: "flight", battery: 81, task: "Разведка правого фланга", x: 70, y: 30, linked: ["SF-001"] },
  { id: "SF-003", name: "Орёл-3", role: "mapper", status: "flight", battery: 65, task: "3D-картографирование", x: 35, y: 55, linked: ["SF-001", "SF-004"] },
  { id: "SF-004", name: "Сокол-1", role: "relay", status: "standby", battery: 92, task: "Ретранслятор связи", x: 60, y: 65, linked: ["SF-003"] },
];

const roleColors: Record<string, string> = {
  leader: "var(--electric)",
  scout: "var(--signal-green)",
  mapper: "var(--warning)",
  relay: "#a78bfa",
};

const roleLabel: Record<string, string> = {
  leader: "Лидер роя",
  scout: "Разведчик",
  mapper: "Картограф",
  relay: "Ретранслятор",
};

const sharedEvents = [
  { from: "SF-002", type: "object", msg: "Обнаружен новый объект: транспортное средство (x=128, y=445)", time: "2 мин" },
  { from: "SF-001", type: "route", msg: "Маршрут роя скорректирован: обход зоны с помехами", time: "5 мин" },
  { from: "SF-003", type: "map", msg: "3D-карта секции B2 обновлена: +240 точек облака", time: "8 мин" },
  { from: "SF-001", type: "task", msg: "SF-004 назначена задача: ретрансляция (замена SF-002 на 15 мин)", time: "12 мин" },
];

const eventIcon: Record<string, string> = {
  object: "Eye", route: "Navigation", map: "Map", task: "CheckSquare",
};

export default function SwarmPage() {
  const [selected, setSelected] = useState<string | null>("SF-001");
  const sel = swarmDrones.find(d => d.id === selected);

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Управление роем БПЛА</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Координация · Распределение задач · Обмен данными (раздел 3.6)</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Download" size={13} />
            CSV-отчёт
          </button>
          <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Plus" size={13} />
            Добавить в рой
          </button>
        </div>
      </div>

      {/* Swarm stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "В рое", val: `${swarmDrones.filter(d => d.status === "flight").length}/${swarmDrones.length}`, color: "var(--signal-green)" },
          { label: "Сообщений/мин", val: "847", color: "var(--electric)" },
          { label: "Задач распределено", val: "4", color: "var(--electric)" },
          { label: "Покрытие зоны", val: "68%", color: "var(--signal-green)" },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl text-center">
            <div className="hud-value text-2xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Swarm map */}
        <div className="lg:col-span-3 panel rounded-xl overflow-hidden">
          <div className="relative h-72 grid-bg radar-bg">
            <div className="scan-line" />
            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
              {swarmDrones.flatMap(d =>
                d.linked.map(lid => {
                  const target = swarmDrones.find(t => t.id === lid);
                  if (!target || d.id > lid) return null;
                  return (
                    <line
                      key={`${d.id}-${lid}`}
                      x1={`${d.x}%`} y1={`${d.y}%`}
                      x2={`${target.x}%`} y2={`${target.y}%`}
                      stroke="rgba(0,212,255,0.2)" strokeWidth="1" strokeDasharray="4,4"
                    />
                  );
                }).filter(Boolean)
              )}
            </svg>
            {/* Drones */}
            {swarmDrones.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: selected === d.id ? `${roleColors[d.role]}25` : "rgba(0,0,0,0.5)",
                    border: `2px solid ${roleColors[d.role]}`,
                    boxShadow: selected === d.id ? `0 0 16px ${roleColors[d.role]}60` : "none",
                  }}
                >
                  <Icon name="Navigation" size={16} style={{ color: roleColors[d.role] }} />
                </div>
                <div className="text-center mt-1 hud-label" style={{ fontSize: 9, color: roleColors[d.role] }}>{d.id}</div>
              </button>
            ))}
            <div className="absolute top-3 left-3 tag tag-electric">Карта роя · Live</div>
            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
              {Object.entries(roleColors).map(([role, color]) => (
                <span key={role} className="flex items-center gap-1.5 text-xs" style={{ color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {roleLabel[role]}
                </span>
              ))}
            </div>
          </div>
          {/* Selected drone detail */}
          {sel && (
            <div className="p-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="dot-online" />
                  <span className="font-semibold text-sm">{sel.name}</span>
                  <span className="tag" style={{ background: `${roleColors[sel.role]}18`, color: roleColors[sel.role] }}>{roleLabel[sel.role]}</span>
                </div>
                <span className="hud-label">АКБ {sel.battery}%</span>
              </div>
              <div className="text-xs text-muted-foreground mb-2">{sel.task}</div>
              {sel.linked.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="hud-label">Связан с:</span>
                  {sel.linked.map(lid => (
                    <span key={lid} className="tag tag-muted" style={{ fontSize: 9 }}>{lid}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shared data feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Обмен данными роя</h2>
            <div className="space-y-3">
              {sharedEvents.map((e, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,212,255,0.1)" }}>
                    <Icon name={eventIcon[e.type]} fallback="Radio" size={13} style={{ color: "var(--electric)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="tag tag-electric" style={{ fontSize: 9 }}>{e.from}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{e.msg}</p>
                  </div>
                  <span className="hud-label shrink-0">{e.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Распределение задач</h2>
            <div className="space-y-2">
              {swarmDrones.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: roleColors[d.role] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{d.name}</div>
                    <div className="hud-label truncate">{d.task}</div>
                  </div>
                  <div className="bar-track w-12">
                    <div className="bar-fill" style={{ width: `${d.battery}%`, background: roleColors[d.role] }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 panel py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2">
              <Icon name="RefreshCw" size={12} />
              Перераспределить задачи (ИИ)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
