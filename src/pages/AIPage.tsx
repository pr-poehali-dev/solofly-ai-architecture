import { useState } from "react";
import Icon from "@/components/ui/icon";

const models = [
  { name: "PathNet v4.2", type: "Планирование траекторий (RL)", accuracy: 96.8, cycles: 1247, status: "active", framework: "PyTorch", size: "12.4 MB", updated: "8 мин назад" },
  { name: "VisionCore v7.1", type: "Компьютерное зрение (CNN)", accuracy: 97.4, cycles: 3812, status: "active", framework: "TensorFlow Lite", size: "28.1 MB", updated: "14 мин назад" },
  { name: "ThreatDetect v2.0", type: "Обнаружение угроз (YOLO)", accuracy: 94.1, cycles: 892, status: "training", framework: "ONNX", size: "18.7 MB", updated: "Обучается..." },
  { name: "WeatherAdapt v1.4", type: "Погодная адаптация (LSTM)", accuracy: 91.3, cycles: 421, status: "active", framework: "PyTorch", size: "4.2 MB", updated: "2 ч назад" },
  { name: "DecisionNet v3.0", type: "Принятие решений (DQN)", accuracy: 93.7, cycles: 674, status: "active", framework: "PyTorch", size: "8.9 MB", updated: "32 мин назад" },
  { name: "Transfer3D v1.0", type: "Трансфер из симуляции (SIM2REAL)", accuracy: 88.2, cycles: 156, status: "training", framework: "ONNX", size: "31.4 MB", updated: "Sim → Real..." },
];

const visionClasses = [
  { name: "Человек", count: 1847, confidence: 98.1, color: "var(--danger)" },
  { name: "Техника", count: 632, confidence: 96.4, color: "var(--warning)" },
  { name: "Здание", count: 2941, confidence: 99.2, color: "var(--electric)" },
  { name: "Препятствие", count: 1203, confidence: 95.8, color: "var(--signal-green)" },
  { name: "Транспорт", count: 489, confidence: 97.0, color: "var(--warning)" },
  { name: "Ландшафт", count: 5124, confidence: 99.6, color: "var(--electric)" },
];

const rlLog = [
  { ep: 1247, reward: 94.2, improvement: "+0.3", method: "PPO", note: "Улучшена огибание при ветре > 10 м/с" },
  { ep: 1246, reward: 93.9, improvement: "+0.1", method: "PPO", note: "Оптимизация расхода заряда на манёврах" },
  { ep: 1245, reward: 93.8, improvement: "+0.4", method: "PPO", note: "Посадка на движущуюся платформу (+12%)" },
  { ep: 1244, reward: 93.4, improvement: "+0.2", method: "SAC", note: "Адаптация к турбулентности класса B" },
  { ep: 1243, reward: 93.2, improvement: "+0.0", method: "SAC", note: "Без изменений — стабилизация" },
];

type TabType = "models" | "vision" | "rl" | "transfer" | "online";

export default function AIPage() {
  const [tab, setTab] = useState<TabType>("models");

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Моделей", val: models.length, color: "var(--electric)", icon: "Brain" },
          { label: "Циклов RL", val: "1 247", color: "var(--signal-green)", icon: "RefreshCw" },
          { label: "Ср. точность", val: "93.6%", color: "var(--signal-green)", icon: "Target" },
          { label: "Классов объектов", val: String(visionClasses.length), color: "var(--electric)", icon: "Layers" },
          { label: "Задержка инференса", val: "12 мс", color: "var(--signal-green)", icon: "Zap" },
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
          { key: "models", label: "Модели" },
          { key: "vision", label: "Зрение (3.3)" },
          { key: "rl", label: "RL Обучение (3.5)" },
          { key: "transfer", label: "SIM→REAL" },
          { key: "online", label: "Онлайн-адаптация" },
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
          {models.map(m => (
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

      {/* --- VISION --- */}
      {tab === "vision" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Классы распознавания (VisionCore)</h2>
              <span className="tag tag-electric">97.4% avg</span>
            </div>
            <div className="space-y-3">
              {visionClasses.map(c => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-sm flex-1">{c.name}</span>
                  <span className="hud-label">{c.count.toLocaleString()} объектов</span>
                  <span className="hud-value text-xs w-12 text-right" style={{ color: c.color }}>{c.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Сенсорный стек (3.3)</h2>
            <div className="space-y-2">
              {[
                { sensor: "Основная камера (4K, 60fps)", status: "active", latency: "8 мс" },
                { sensor: "Тепловизор (ночь/туман)", status: "active", latency: "12 мс" },
                { sensor: "Лидар (3D-карта)", status: "active", latency: "15 мс" },
                { sensor: "Радар (обнаружение в осадках)", status: "standby", latency: "—" },
                { sensor: "Стереокамера (глубина)", status: "active", latency: "10 мс" },
              ].map(s => (
                <div key={s.sensor} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="flex items-center gap-2">
                    <span className={s.status === "active" ? "dot-online" : "dot-offline"} />
                    <span className="text-xs">{s.sensor}</span>
                  </div>
                  <span className="hud-label">{s.latency}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <div className="hud-label mb-1">3D-карта окружения</div>
              <div className="text-xs text-muted-foreground">PCL + лидар обновляют 3D-карту со скоростью 30 Гц. Дальность: 120 м.</div>
            </div>
          </div>
        </div>
      )}

      {/* --- RL TRAINING --- */}
      {tab === "rl" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-1">Обучение с подкреплением</h2>
            <p className="text-xs text-muted-foreground mb-4">Алгоритмы PPO и SAC · Среда: Gazebo / AirSim → Real</p>
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

      {/* --- SIM2REAL TRANSFER --- */}
      {tab === "transfer" && (
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

      {/* --- ONLINE ADAPTATION --- */}
      {tab === "online" && (
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
    </div>
  );
}
