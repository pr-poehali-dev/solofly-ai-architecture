import Icon from "@/components/ui/icon";

const drones = [
  { id: "SF-001", name: "Орёл-1", status: "flight", battery: 74, altitude: 128, speed: 42, mission: "Патруль периметра А" },
  { id: "SF-002", name: "Орёл-2", status: "standby", battery: 98, altitude: 0, speed: 0, mission: "Ожидает задания" },
  { id: "SF-003", name: "Орёл-3", status: "charging", battery: 31, altitude: 0, speed: 0, mission: "Зарядка" },
  { id: "SF-004", name: "Сокол-1", status: "flight", battery: 52, altitude: 85, speed: 67, mission: "Картографирование B2" },
];

const alerts = [
  { type: "warning", msg: "SF-003: заряд < 35%", time: "2 мин" },
  { type: "info", msg: "SF-001: обновлена модель ИИ (цикл #1247)", time: "8 мин" },
  { type: "success", msg: "Миссия «Обзор-14» завершена успешно", time: "14 мин" },
  { type: "info", msg: "SF-004: обнаружен новый объект, добавлен в датасет", time: "21 мин" },
];

const statusMap: Record<string, { label: string; dot: string; cls: string }> = {
  flight: { label: "В полёте", dot: "dot-online", cls: "tag-green" },
  standby: { label: "Готов", dot: "dot-online", cls: "tag-electric" },
  charging: { label: "Зарядка", dot: "dot-warning", cls: "tag-warning" },
  error: { label: "Ошибка", dot: "dot-danger", cls: "tag-danger" },
};

export default function DashboardPage() {
  const flying = drones.filter(d => d.status === "flight").length;

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Командный центр</h1>
          <p className="text-muted-foreground hud-label mt-0.5">
            10 APR 2026 · 14:32 UTC+3 · ВСЕ СИСТЕМЫ В НОРМЕ
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: "Navigation", label: "В полёте", val: String(flying), color: "var(--signal-green)", sub: `из ${drones.length} дронов` },
          { icon: "Brain", label: "Циклов ИИ за сутки", val: "1 247", color: "var(--electric)", sub: "+84 за час" },
          { icon: "Target", label: "Миссий сегодня", val: "14", color: "var(--electric)", sub: "12 успешных" },
          { icon: "Zap", label: "Мин. до посадки", val: "18", color: "var(--warning)", sub: "SF-001" },
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
        <div className="lg:col-span-2 panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Флот БПЛА</h2>
            <span className="tag tag-electric">{flying} в воздухе</span>
          </div>
          <div className="space-y-3">
            {drones.map((d) => (
              <div key={d.id} className="p-4 rounded-xl" style={{ background: "hsl(var(--input))" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={statusMap[d.status].dot} />
                    <div>
                      <span className="font-semibold text-sm">{d.name}</span>
                      <span className="hud-label ml-2">{d.id}</span>
                    </div>
                  </div>
                  <span className={`tag ${statusMap[d.status].cls}`}>{statusMap[d.status].label}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Заряд", val: `${d.battery}%` },
                    { label: "Высота", val: `${d.altitude}м` },
                    { label: "Скорость", val: `${d.speed}км/ч` },
                    { label: "Миссия", val: d.mission.length > 14 ? d.mission.slice(0, 14) + "…" : d.mission },
                  ].map((info) => (
                    <div key={info.label}>
                      <div className="hud-label mb-0.5">{info.label}</div>
                      <div className="hud-value text-xs">{info.val}</div>
                    </div>
                  ))}
                </div>
                {d.status === "flight" && (
                  <div className="mt-3 bar-track">
                    <div className="bar-fill" style={{ width: `${d.battery}%`, background: d.battery > 40 ? "var(--signal-green)" : "var(--warning)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Системные события</h2>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {a.type === "warning" && <Icon name="AlertTriangle" size={14} style={{ color: "var(--warning)" }} />}
                    {a.type === "info" && <Icon name="Info" size={14} style={{ color: "var(--electric)" }} />}
                    {a.type === "success" && <Icon name="CheckCircle" size={14} style={{ color: "var(--signal-green)" }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs leading-relaxed">{a.msg}</p>
                    <span className="hud-label">{a.time} назад</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">ИИ-активность</h2>
            <div className="space-y-3">
              {[
                { label: "Точность распознавания", val: 97, color: "var(--signal-green)" },
                { label: "Загрузка CPU борта", val: 64, color: "var(--electric)" },
                { label: "Уверенность траектории", val: 89, color: "var(--electric)" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1">
                    <span className="hud-label">{m.label}</span>
                    <span className="hud-value text-xs" style={{ color: m.color }}>{m.val}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${m.val}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
