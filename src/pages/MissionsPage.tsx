import { useState } from "react";
import Icon from "@/components/ui/icon";

const missions = [
  { id: "MSN-047", name: "Патруль периметра А", drone: "Орёл-1", status: "active", progress: 68, start: "13:10", eta: "14:45", type: "patrol", waypoints: 12 },
  { id: "MSN-048", name: "Картографирование B2", drone: "Сокол-1", status: "active", progress: 34, start: "13:52", eta: "16:10", type: "mapping", waypoints: 24 },
  { id: "MSN-046", name: "Инспекция объекта 7", drone: "Орёл-2", status: "planned", progress: 0, start: "15:00", eta: "16:30", type: "inspection", waypoints: 8 },
  { id: "MSN-045", name: "Обзор-14", drone: "Орёл-3", status: "done", progress: 100, start: "11:00", eta: "12:42", type: "recon", waypoints: 18 },
];

const typeIcon: Record<string, string> = {
  patrol: "Shield",
  mapping: "Map",
  inspection: "Search",
  recon: "Eye",
};

const statusCls: Record<string, string> = {
  active: "tag-green",
  planned: "tag-electric",
  done: "tag-muted",
  aborted: "tag-danger",
};

const statusLabel: Record<string, string> = {
  active: "Выполняется",
  planned: "Запланирована",
  done: "Завершена",
  aborted: "Прервана",
};

export default function MissionsPage() {
  const [selected, setSelected] = useState<string | null>("MSN-047");

  const sel = missions.find(m => m.id === selected);

  return (
    <div className="p-6 fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Управление миссиями</h1>
          <p className="text-muted-foreground text-sm mt-0.5">ИИ планирует маршруты автономно</p>
        </div>
        <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <Icon name="Plus" size={13} />
          Создать миссию
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Mission list */}
        <div className="lg:col-span-2 space-y-3">
          {missions.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`w-full text-left p-4 rounded-xl panel transition-all ${selected === m.id ? "border-[rgba(0,212,255,0.3)]" : ""}`}
              style={selected === m.id ? { borderColor: "rgba(0,212,255,0.3)" } : {}}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,255,0.1)" }}>
                    <Icon name={typeIcon[m.type]} fallback="Navigation" size={14} style={{ color: "var(--electric)" }} />
                  </div>
                  <span className="font-semibold text-sm">{m.name}</span>
                </div>
                <span className={`tag ${statusCls[m.status]}`}>{statusLabel[m.status]}</span>
              </div>
              <div className="hud-label mb-2">{m.drone} · {m.waypoints} точек маршрута</div>
              {m.status === "active" && (
                <>
                  <div className="bar-track mb-1">
                    <div className="bar-fill" style={{ width: `${m.progress}%`, background: "var(--signal-green)" }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="hud-label">{m.progress}% выполнено</span>
                    <span className="hud-label">ETA {m.eta}</span>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Mission detail / map placeholder */}
        <div className="lg:col-span-3 panel rounded-xl overflow-hidden">
          {sel ? (
            <>
              {/* Fake map */}
              <div className="relative h-64 grid-bg radar-bg flex items-center justify-center overflow-hidden">
                <div className="scan-line" />
                {/* Waypoint dots */}
                {Array.from({ length: sel.waypoints }).map((_, i) => {
                  const angle = (i / sel.waypoints) * Math.PI * 2;
                  const r = 80 + Math.sin(i * 1.7) * 30;
                  const x = 50 + Math.cos(angle) * r * 0.45;
                  const y = 50 + Math.sin(angle) * r * 0.45;
                  const done = i / sel.waypoints * 100 < sel.progress;
                  return (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%`, background: done ? "var(--signal-green)" : "rgba(0,212,255,0.5)", boxShadow: done ? "0 0 6px var(--signal-green)" : "none" }}
                    />
                  );
                })}
                {/* Drone position */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.4)" }}>
                  <Icon name="Navigation" size={20} style={{ color: "var(--electric)" }} />
                </div>
                <div className="absolute top-3 left-3 tag tag-electric">{sel.id}</div>
                {sel.status === "active" && <div className="absolute top-3 right-3 flex items-center gap-1.5 tag tag-green"><span className="dot-online" /> Live</div>}
              </div>

              {/* Detail */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">{sel.name}</h2>
                  <span className={`tag ${statusCls[sel.status]}`}>{statusLabel[sel.status]}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Дрон", val: sel.drone },
                    { label: "Начало", val: sel.start },
                    { label: "Точек", val: String(sel.waypoints) },
                  ].map((i) => (
                    <div key={i.label} className="text-center p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                      <div className="hud-label mb-1">{i.label}</div>
                      <div className="hud-value text-sm">{i.val}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-5">
                  <h3 className="hud-label">ИИ-планирование</h3>
                  {["Автоматический обход запретных зон", "Оптимизация по заряду АКБ", "Учёт ветровой нагрузки", "Резервный маршрут посадки"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs">
                      <Icon name="CheckCircle" size={13} style={{ color: "var(--signal-green)" }} />
                      {f}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {sel.status === "active" && (
                    <button className="btn-ghost flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
                      <Icon name="Pause" size={13} />
                      Пауза
                    </button>
                  )}
                  {sel.status === "planned" && (
                    <button className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
                      <Icon name="Play" size={13} />
                      Запустить
                    </button>
                  )}
                  <button className="panel px-4 py-2 rounded-lg text-xs flex items-center gap-2 hover:border-[rgba(0,212,255,0.2)] transition-all">
                    <Icon name="Download" size={13} />
                    CSV
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Выберите миссию
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
