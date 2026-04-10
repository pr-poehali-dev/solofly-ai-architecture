import Icon from "@/components/ui/icon";

const models = [
  { name: "PathNet v4.2", type: "Планирование траекторий", accuracy: 96.8, cycles: 1247, status: "active", updated: "8 мин назад" },
  { name: "VisionCore v7.1", type: "Компьютерное зрение", accuracy: 97.4, cycles: 3812, status: "active", updated: "14 мин назад" },
  { name: "ThreatDetect v2.0", type: "Обнаружение угроз", accuracy: 94.1, cycles: 892, status: "training", updated: "Обучается..." },
  { name: "WeatherAdapt v1.4", type: "Погодная адаптация", accuracy: 91.3, cycles: 421, status: "active", updated: "2 ч назад" },
];

const learningEvents = [
  { model: "PathNet", event: "Улучшена огибание препятствий на высокой скорости", delta: "+0.3%", time: "8 мин" },
  { model: "VisionCore", event: "Добавлен класс объекта: «Транспортный узел»", delta: "Новый", time: "14 мин" },
  { model: "ThreatDetect", event: "Обновлены веса по 1 200 примерам из SF-004", delta: "+1.2%", time: "21 мин" },
  { model: "PathNet", event: "Оптимизация энергопотребления на крейсерской скорости", delta: "-8% заряд", time: "1 ч" },
  { model: "WeatherAdapt", event: "Калибровка при боковом ветре > 12 м/с", delta: "+0.8%", time: "2 ч" },
];

export default function AIPage() {
  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ИИ-ядро SoloFly</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Самообучающиеся модели · Цикл #{1247}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="FileDown" size={13} />
            Экспорт отчёта
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Активных моделей", val: "4", icon: "Brain", color: "var(--electric)" },
          { label: "Всего циклов ИИ", val: "6 372", icon: "RefreshCw", color: "var(--signal-green)" },
          { label: "Ср. точность", val: "94.9%", icon: "Target", color: "var(--signal-green)" },
          { label: "Новых классов объектов", val: "147", icon: "Layers", color: "var(--electric)" },
        ].map((s) => (
          <div key={s.label} className="panel p-5 rounded-xl">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Activity" size={16} style={{ color: s.color }} />
            </div>
            <div className="hud-value text-2xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Models */}
      <div className="panel rounded-xl p-5">
        <h2 className="font-semibold text-sm mb-4">Нейросетевые модели</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((m) => (
            <div key={m.name} className="p-4 rounded-xl" style={{ background: "hsl(var(--input))" }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm">{m.name}</div>
                  <div className="hud-label mt-0.5">{m.type}</div>
                </div>
                <span className={`tag ${m.status === "active" ? "tag-green" : "tag-warning"}`}>
                  {m.status === "active" ? "Активна" : "Обучается"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                <div>
                  <div className="hud-label mb-0.5">Точность</div>
                  <div className="hud-value text-sm" style={{ color: "var(--signal-green)" }}>{m.accuracy}%</div>
                </div>
                <div>
                  <div className="hud-label mb-0.5">Циклов</div>
                  <div className="hud-value text-sm">{m.cycles.toLocaleString()}</div>
                </div>
                <div>
                  <div className="hud-label mb-0.5">Обновлена</div>
                  <div className="hud-value text-xs text-muted-foreground">{m.updated}</div>
                </div>
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${m.accuracy}%`, background: m.status === "active" ? "var(--signal-green)" : "var(--warning)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Журнал самообучения</h2>
            <button className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
              <Icon name="Download" size={12} />
              CSV
            </button>
          </div>
          <div className="space-y-3">
            {learningEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,212,255,0.1)" }}>
                  <Icon name="Brain" size={13} style={{ color: "var(--electric)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="tag tag-electric" style={{ fontSize: 9 }}>{e.model}</span>
                    <span className="tag tag-green" style={{ fontSize: 9 }}>{e.delta}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{e.event}</p>
                </div>
                <span className="hud-label shrink-0">{e.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Динамика точности</h2>
          {/* Mini chart */}
          <div className="flex items-end gap-1 h-32 mb-3">
            {[88, 89.2, 89.8, 90.1, 91, 91.4, 92, 92.8, 93.5, 94, 94.5, 94.9].map((v, i) => (
              <div key={i} className="flex-1 rounded-t transition-all" style={{
                height: `${((v - 86) / 12) * 100}%`,
                background: i === 11
                  ? "linear-gradient(180deg, var(--signal-green), rgba(0,255,136,0.3))"
                  : "rgba(0,212,255,0.2)",
              }} />
            ))}
          </div>
          <div className="flex justify-between hud-label mb-5">
            <span>Янв</span><span>Фев</span><span>Мар</span><span>Апр</span>
          </div>

          <div className="space-y-2">
            {[
              { label: "PathNet: точность траектории", val: 96 },
              { label: "VisionCore: распознавание", val: 97 },
              { label: "ThreatDetect: угрозы", val: 94 },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="hud-label">{r.label}</span>
                  <span className="hud-value text-xs" style={{ color: "var(--signal-green)" }}>{r.val}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${r.val}%`, background: "var(--signal-green)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
