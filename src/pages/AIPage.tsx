import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { events } from "@/lib/api";
import { useLiveFleet } from "@/hooks/useLiveFleet";
import AIExplainPanel from "@/components/AIExplainPanel";

const FRAMEWORK_MAP: Record<string, string> = {
  "PathNet":     "PyTorch",
  "VisionCore":  "TensorFlow Lite",
  "ThreatDetect":"ONNX",
  "WeatherAdapt":"PyTorch",
  "DecisionNet": "PyTorch",
  "Transfer3D":  "ONNX",
};
const SIZE_MAP: Record<string, string> = {
  "PathNet":     "12.4 MB",
  "VisionCore":  "28.1 MB",
  "ThreatDetect":"18.7 MB",
  "WeatherAdapt":"4.2 MB",
  "DecisionNet": "8.9 MB",
  "Transfer3D":  "31.4 MB",
};
const TYPE_MAP: Record<string, string> = {
  "PathNet":     "Планирование траекторий (RL)",
  "VisionCore":  "Компьютерное зрение (CNN)",
  "ThreatDetect":"Обнаружение угроз (YOLO)",
  "WeatherAdapt":"Погодная адаптация (LSTM)",
  "DecisionNet": "Принятие решений (DQN)",
  "Transfer3D":  "Трансфер из симуляции (SIM2REAL)",
};

function relTime(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} с назад`;
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  return `${Math.floor(s / 3600)} ч назад`;
}

type TabType = "models" | "explain";

export default function AIPage() {
  const [tab, setTab] = useState<TabType>("models");
  const [explainManeuver, setExplainManeuver] = useState("hover");
  const { data: fleet } = useLiveFleet(0);
  const firstDroneId = fleet?.drones?.[0]?.id ?? "SF-001";

  const [aiData, setAiData] = useState<{
    models: { id: number; name: string; accuracy: number; cycles: number; updated_at: string }[];
    avg_accuracy: number;
    total_cycles: number;
    total_models: number;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  useEffect(() => {
    events.getAIModels()
      .then(d => setAiData(d))
      .catch(() => {/* используем fallback */})
      .finally(() => setLoadingAi(false));
    const t = setInterval(() => {
      events.getAIModels().then(d => setAiData(d)).catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, []);

  // Обогащаем модели из БД статическими метаданными
  const models = useMemo(() => {
    if (!aiData?.models) return [];
    return aiData.models.map(m => {
      const key = Object.keys(FRAMEWORK_MAP).find(k => m.name.includes(k)) ?? m.name;
      return {
        ...m,
        type:      TYPE_MAP[key]      ?? "ИИ-модель",
        framework: FRAMEWORK_MAP[key] ?? "PyTorch",
        size:      SIZE_MAP[key]      ?? "—",
        status:    m.accuracy > 90 ? "active" : "training",
        updated:   relTime(m.updated_at),
      };
    });
  }, [aiData]);

  const avgAccuracy = aiData?.avg_accuracy
    ? Number(aiData.avg_accuracy).toFixed(1)
    : "—";
  const totalCycles = aiData?.total_cycles
    ? Number(aiData.total_cycles).toLocaleString("ru-RU")
    : "—";

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ИИ-ядро SoloFly</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Компьютерное зрение · Решения · Самообучение · Трансфер из симуляции</p>
        </div>
        <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <Icon name="FileDown" size={13} />
          Экспорт отчёта
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Моделей",       val: loadingAi ? "…" : String(aiData?.total_models ?? models.length), color: "var(--electric)",     icon: "Brain" },
          { label: "Циклов обучения", val: loadingAi ? "…" : totalCycles,                                  color: "var(--signal-green)", icon: "RefreshCw" },
          { label: "Ср. точность",  val: loadingAi ? "…" : `${avgAccuracy}%`,                              color: "var(--signal-green)", icon: "Target" },
          { label: "Статус ядра",   val: "Активно",                                                        color: "var(--signal-green)", icon: "Zap" },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Activity" size={14} style={{ color: s.color }} />
            </div>
            <div className="hud-value text-xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto" style={{ background: "hsl(var(--input))", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {([
          { key: "models",  label: "Модели" },
          { key: "explain", label: "🔍 Объяснения" },
        ] as { key: TabType; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${tab === t.key ? "btn-electric" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- MODELS --- */}
      {tab === "models" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingAi && models.length === 0
            ? [1,2,3,4,5,6].map(i => (
                <div key={i} className="panel rounded-xl p-5 animate-pulse" style={{ height: 160 }} />
              ))
            : models.map(m => (
            <div key={m.name} className="panel rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-sm">{m.name}</div>
                  <div className="hud-label mt-0.5">{m.type}</div>
                </div>
                <span className={`tag ${m.status === "active" ? "tag-green" : "tag-warning"}`}>
                  {m.status === "active" ? "Активна" : "Обучается"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                <div className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="hud-label mb-0.5">Точность</div>
                  <div className="hud-value text-sm" style={{ color: "var(--signal-green)" }}>{m.accuracy}%</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="hud-label mb-0.5">Циклов</div>
                  <div className="hud-value text-sm">{m.cycles.toLocaleString()}</div>
                </div>
              </div>
              <div className="bar-track mb-3">
                <div className="bar-fill" style={{ width: `${m.accuracy}%`, background: m.status === "active" ? "var(--signal-green)" : "var(--warning)" }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="tag tag-muted" style={{ fontSize: 9 }}>{m.framework}</span>
                  <span className="tag tag-muted" style={{ fontSize: 9 }}>{m.size}</span>
                </div>
                <span className="hud-label">{m.updated}</span>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* --- RL TRAINING (удалено — симуляция) --- */}
      {tab === "rl_disabled" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-1">Обучение с подкреплением</h2>
            <p className="text-xs text-muted-foreground mb-2">Алгоритмы PPO и SAC · Среда: Gazebo / AirSim → Real</p>
            <div className="mb-3 text-xs px-2 py-1.5 rounded-lg" style={{ background: "rgba(0,212,255,0.06)", color: "var(--muted-foreground)", border: "1px solid rgba(0,212,255,0.12)" }}>
              Демо-данные — интеграция с обучающей средой в разработке
            </div>
            <div className="flex items-end gap-1 h-28 mb-3">
              {[88, 89, 89.5, 90.2, 91, 91.8, 92.1, 92.8, 93.2, 93.4, 93.9, 94.2].map((v, i) => (
                <div key={i} className="flex-1 rounded-t transition-all" style={{
                  height: `${((v - 86) / 10) * 100}%`,
                  background: i === 11
                    ? "linear-gradient(180deg, var(--signal-green), rgba(0,255,136,0.25))"
                    : "rgba(0,212,255,0.2)",
                }} />
              ))}
            </div>
            <div className="flex justify-between hud-label mb-4">
              {["#1236", "", "", "#1239", "", "", "#1242", "", "", "#1245", "", "#1247"].map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
            <div className="space-y-3">
              {[
                { label: "Текущая награда", val: "94.2 / 100", color: "var(--signal-green)" },
                { label: "Метод", val: "PPO (Proximal Policy Optimization)", color: "hsl(var(--foreground))" },
                { label: "Шаг обучения", val: "3e-4", color: "hsl(var(--foreground))" },
                { label: "Буфер опыта", val: "1 200 эпизодов", color: "var(--electric)" },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-1.5 border-b last:border-0" style={{ borderColor: "hsl(var(--border))" }}>
                  <span className="hud-label">{r.label}</span>
                  <span className="hud-value text-xs" style={{ color: r.color }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Журнал эпизодов RL</h2>
            <div className="space-y-3">
              {rlLog.map(e => (
                <div key={e.ep} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>Эп. #{e.ep}</span>
                    <div className="flex items-center gap-2">
                      <span className="tag tag-muted" style={{ fontSize: 9 }}>{e.method}</span>
                      <span className="tag tag-green" style={{ fontSize: 9 }}>R={e.reward}</span>
                      <span className="hud-value text-xs" style={{ color: e.improvement !== "+0.0" ? "var(--signal-green)" : "hsl(var(--muted-foreground))" }}>{e.improvement}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SIM2REAL TRANSFER (удалено — симуляция) --- */}
      {tab === "transfer_disabled" && (
        <div className="space-y-4">
          <div className="panel-glow rounded-xl p-6">
            <h2 className="font-semibold text-sm mb-1">Трансферное обучение: Симуляция → Реальный полёт</h2>
            <p className="text-xs text-muted-foreground mb-5">Transfer3D v1.0 · Симуляторы: Gazebo, AirSim, PX4 SITL</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {[
                { env: "Gazebo", missions: 4820, transfer_loss: "3.1%", status: "active" },
                { env: "AirSim", missions: 2340, transfer_loss: "4.8%", status: "active" },
                { env: "PX4 SITL", missions: 1120, transfer_loss: "2.4%", status: "active" },
              ].map(e => (
                <div key={e.env} className="panel p-4 rounded-xl text-center">
                  <div className="font-semibold text-sm mb-1" style={{ color: "var(--electric)" }}>{e.env}</div>
                  <div className="hud-value text-lg mb-0.5">{e.missions.toLocaleString()}</div>
                  <div className="hud-label mb-2">симул. миссий</div>
                  <span className="tag tag-green">Потеря при переносе: {e.transfer_loss}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[
                "Domain randomization — случайные параметры физики в симуляции",
                "Адаптация к реальным шумам датчиков через aug-модуль",
                "Progressive Sim2Real Transfer — поэтапное увеличение реальных данных",
                "Валидация на 100 реальных полётах перед деплоем",
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <Icon name="CheckCircle" size={13} style={{ color: "var(--signal-green)" }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- ONLINE ADAPTATION (удалено — симуляция) --- */}
      {tab === "online_disabled" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-1">Онлайн-обучение (Online ML)</h2>
            <p className="text-xs text-muted-foreground mb-4">Адаптация к новым условиям без полного переобучения</p>
            <div className="space-y-3">
              {[
                { trigger: "Новый тип препятствия", action: "Few-shot обновление VisionCore (< 5 примеров)", time: "2.3 сек" },
                { trigger: "Изменение конфигурации БПЛА", action: "Перекалибровка ПИД через PathNet", time: "0.8 сек" },
                { trigger: "Нетипичная погодная аномалия", action: "Дообучение WeatherAdapt на 1 эпизоде", time: "4.1 сек" },
                { trigger: "Новая зона полёта", action: "Построение локальной карты + обновление pathfinder", time: "1.2 сек" },
              ].map(e => (
                <div key={e.trigger} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">{e.trigger}</span>
                    <span className="tag tag-electric" style={{ fontSize: 9 }}>{e.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.action}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Порог автообновления моделей</h2>
            <div className="space-y-4">
              {[
                { model: "PathNet", threshold: 500, current: 423, unit: "новых эпизодов" },
                { model: "VisionCore", threshold: 200, current: 187, unit: "новых объектов" },
                { model: "ThreatDetect", threshold: 100, current: 98, unit: "аномалий" },
              ].map(m => (
                <div key={m.model}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">{m.model}</span>
                    <span className="hud-value text-xs" style={{ color: m.current / m.threshold > 0.9 ? "var(--warning)" : "var(--signal-green)" }}>
                      {m.current} / {m.threshold} {m.unit}
                    </span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(m.current / m.threshold) * 100}%`, background: m.current / m.threshold > 0.9 ? "var(--warning)" : "var(--signal-green)" }} />
                  </div>
                  {m.current / m.threshold > 0.9 && (
                    <div className="text-xs mt-1" style={{ color: "var(--warning)" }}>Обновление скоро запустится автоматически</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 p-3 rounded-lg" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
              <div className="hud-label mb-1">Консистентность моделей</div>
              <div className="text-xs text-muted-foreground">Все обновления проходят shadow-testing на симуляторе перед деплоем на борт.</div>
            </div>
          </div>
        </div>
      )}

      {/* --- ОБЪЯСНЕНИЯ ИИ --- */}
      {tab === "explain" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Левая панель: выбор дрона и манёвра */}
          <div className="space-y-4">
            <div className="panel rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Icon name="Brain" size={14} style={{ color: "var(--electric)" }} />
                Объяснимый ИИ
              </h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Выбери манёвр — и ИИ объяснит, какие факторы повлияли на решение,
                какая модель его приняла и какие альтернативы были отклонены.
              </p>

              <div className="mb-4">
                <div className="hud-label mb-2">Дрон</div>
                <select
                  className="w-full px-3 py-2 rounded-lg text-xs"
                  style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  defaultValue={firstDroneId}
                  disabled
                >
                  <option>{firstDroneId}</option>
                </select>
              </div>

              <div className="hud-label mb-2">Манёвр для анализа</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "hover",  label: "Зависание",       icon: "Pause" },
                  { id: "orbit",  label: "Облёт",            icon: "RefreshCw" },
                  { id: "land",   label: "Посадка",          icon: "ArrowDown" },
                  { id: "rtb",    label: "Возврат на базу",  icon: "Home" },
                  { id: "climb",  label: "Набор высоты",     icon: "TrendingUp" },
                  { id: "scan",   label: "Скан-паттерн",     icon: "Scan" },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setExplainManeuver(m.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                    style={explainManeuver === m.id
                      ? { background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.4)" }
                      : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
                    }
                  >
                    <Icon name={m.icon} fallback="Navigation" size={12} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Принципы XAI */}
            <div className="panel rounded-xl p-5">
              <div className="hud-label mb-3">Принципы объяснимости</div>
              <div className="space-y-2">
                {[
                  { icon: "Eye",         text: "Все решения логируются в БД" },
                  { icon: "GitBranch",   text: "Показываем отклонённые альтернативы" },
                  { icon: "BarChart2",   text: "Факторы взвешены по важности" },
                  { icon: "Clock",       text: "Время принятия решения < 15 мс" },
                ].map(p => (
                  <div key={p.text} className="flex items-center gap-2 text-xs">
                    <Icon name={p.icon} fallback="Check" size={12} style={{ color: "var(--electric)", flexShrink: 0 }} />
                    <span className="text-muted-foreground">{p.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Правая панель: живое объяснение */}
          <div className="lg:col-span-2">
            <AIExplainPanel
              key={`${firstDroneId}-${explainManeuver}`}
              droneId={firstDroneId}
              maneuver={explainManeuver}
              label={[
                { id: "hover", label: "Зависание" }, { id: "orbit", label: "Облёт объекта" },
                { id: "land",  label: "Безопасная посадка" }, { id: "rtb", label: "Возврат на базу" },
                { id: "climb", label: "Набор высоты" }, { id: "scan", label: "Скан-паттерн" },
              ].find(m => m.id === explainManeuver)?.label ?? explainManeuver}
              onClose={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}