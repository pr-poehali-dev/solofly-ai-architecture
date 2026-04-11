import { useState } from "react";
import Icon from "@/components/ui/icon";

const MODELS = [
  {
    id: "yolo11",
    name: "YOLO11",
    badge: "Новейшая",
    badgeColor: "var(--electric)",
    task: "Детекция объектов",
    desc: "Новейшая версия YOLO. Одновременно предсказывает координаты рамок и классы объектов. Работает в реальном времени на Jetson Nano.",
    metrics: { accuracy: 97.4, fps: 45, latency: "< 22 мс" },
    tags: ["Люди", "Транспорт", "Животные", "Объекты"],
    icon: "ScanSearch",
    color: "var(--electric)",
  },
  {
    id: "seg",
    name: "Segmentation",
    badge: "Рекомендуем",
    badgeColor: "var(--signal-green)",
    task: "Семантическая сегментация",
    desc: "Попиксельное разделение сцены на классы. Идеально для картографирования, анализа посевов и обнаружения повреждений.",
    metrics: { accuracy: 94.2, fps: 28, latency: "< 36 мс" },
    tags: ["Посевы", "Дороги", "Здания", "Вода"],
    icon: "Layers",
    color: "var(--signal-green)",
  },
  {
    id: "track",
    name: "Multi-Tracker",
    badge: "Популярная",
    badgeColor: "var(--warning)",
    task: "Отслеживание объектов",
    desc: "Сопровождение множества объектов одновременно с сохранением идентификаторов. Работает при перекрытии и быстром движении.",
    metrics: { accuracy: 91.8, fps: 35, latency: "< 28 мс" },
    tags: ["Патрулирование", "Охрана", "Стройка", "Трафик"],
    icon: "Crosshair",
    color: "var(--warning)",
  },
  {
    id: "anomaly",
    name: "AnomalyNet",
    badge: "Уникальная",
    badgeColor: "var(--electric)",
    task: "Детекция аномалий",
    desc: "Обнаружение нештатных ситуаций без обучения на отрицательных примерах. Пожары, утечки, повреждения инфраструктуры.",
    metrics: { accuracy: 89.5, fps: 30, latency: "< 33 мс" },
    tags: ["Пожары", "Утечки", "Повреждения", "Вторжение"],
    icon: "AlertTriangle",
    color: "var(--electric)",
  },
  {
    id: "3d",
    name: "DepthEstimator",
    badge: "Edge AI",
    badgeColor: "var(--signal-green)",
    task: "Оценка глубины",
    desc: "Моно-камерная оценка расстояния до объектов. Основа для навигации без GPS и обхода препятствий в замкнутых пространствах.",
    metrics: { accuracy: 92.1, fps: 20, latency: "< 50 мс" },
    tags: ["Навигация", "Склады", "Тоннели", "Лес"],
    icon: "Box",
    color: "var(--signal-green)",
  },
  {
    id: "custom",
    name: "Custom Model",
    badge: "Ваша модель",
    badgeColor: "hsl(var(--muted-foreground))",
    task: "Загрузите свою",
    desc: "Загрузите собственные веса нейросети. Поддерживаются форматы ONNX, TensorRT, PyTorch. Интеграция за несколько кликов.",
    metrics: { accuracy: 0, fps: 0, latency: "—" },
    tags: ["ONNX", "TensorRT", "PyTorch", "Custom"],
    icon: "Upload",
    color: "hsl(var(--muted-foreground))",
    isCustom: true,
  },
];

export default function LandingAIBank() {
  const [activeModel, setActiveModel] = useState(MODELS[0]);

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <div className="tag tag-electric mb-4">Банк нейросетей</div>
        <h2 className="text-4xl font-bold mb-4">
          Готовые ИИ-модели для{" "}
          <span className="gradient-text">любой задачи</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
          Библиотека нейросетевых моделей — используйте готовые или загружайте свои.
          YOLO11, сегментация, трекинг и детекция аномалий работают прямо на борту дрона.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Model list */}
        <div className="lg:col-span-2 space-y-2">
          {MODELS.map(model => (
            <button key={model.id} onClick={() => setActiveModel(model)}
              className="w-full text-left rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{
                background: activeModel.id === model.id ? `${model.color}10` : "rgba(255,255,255,0.025)",
                border: `1px solid ${activeModel.id === model.id ? model.color + "35" : "rgba(255,255,255,0.07)"}`,
              }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: activeModel.id === model.id ? `${model.color}18` : "rgba(255,255,255,0.05)",
                  }}>
                  <Icon name={model.icon} fallback="Cpu" size={15}
                    style={{ color: activeModel.id === model.id ? model.color : "rgba(255,255,255,0.35)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{model.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold shrink-0"
                      style={{
                        background: `${model.badgeColor}15`,
                        color: model.badgeColor,
                        border: `1px solid ${model.badgeColor}30`,
                        fontSize: 9,
                      }}>{model.badge}</span>
                  </div>
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{model.task}</span>
                </div>
                {activeModel.id === model.id && (
                  <Icon name="ChevronRight" size={14} style={{ color: model.color, flexShrink: 0 }} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Model detail */}
        <div className="lg:col-span-3 rounded-2xl p-7 flex flex-col justify-between"
          style={{
            background: activeModel.isCustom ? "rgba(255,255,255,0.02)" : `${activeModel.color}06`,
            border: `1px solid ${activeModel.color}25`,
          }}>
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-2xl">{activeModel.name}</h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: `${activeModel.badgeColor}15`,
                      color: activeModel.badgeColor,
                      border: `1px solid ${activeModel.badgeColor}30`,
                    }}>{activeModel.badge}</span>
                </div>
                <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{activeModel.task}</span>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${activeModel.color}15`, border: `1px solid ${activeModel.color}25` }}>
                <Icon name={activeModel.icon} fallback="Cpu" size={22} style={{ color: activeModel.color }} />
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              {activeModel.desc}
            </p>

            {!activeModel.isCustom && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Точность", val: `${activeModel.metrics.accuracy}%` },
                  { label: "FPS на Jetson", val: `${activeModel.metrics.fps}` },
                  { label: "Задержка", val: activeModel.metrics.latency },
                ].map(m => (
                  <div key={m.label} className="text-center p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="font-bold text-base mb-0.5" style={{ color: activeModel.color }}>{m.val}</div>
                    <div className="hud-label" style={{ fontSize: 8 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="hud-label mb-2" style={{ fontSize: 9 }}>СЦЕНАРИИ ПРИМЕНЕНИЯ</div>
              <div className="flex flex-wrap gap-1.5">
                {activeModel.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      background: `${activeModel.color}10`,
                      color: activeModel.color,
                      border: `1px solid ${activeModel.color}20`,
                    }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 flex items-center gap-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {activeModel.isCustom ? (
              <>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                    color: "hsl(var(--foreground))",
                  }}>
                  <Icon name="Upload" size={14} />
                  Загрузить модель
                </button>
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  ONNX · TensorRT · PyTorch
                </span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="dot-online" />
                  <span className="text-xs" style={{ color: "var(--signal-green)" }}>Доступна в платформе</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Icon name="Cpu" size={12} style={{ color: "hsl(var(--muted-foreground))" }} />
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Jetson Nano / Xavier / Orin
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="mt-8 p-4 rounded-xl flex items-start gap-3"
        style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
        <Icon name="Info" size={15} style={{ color: "var(--electric)", flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
          Все модели выполняются непосредственно на бортовом компьютере дрона (Edge AI) без передачи данных в облако.
          Это обеспечивает работу при нестабильном канале связи и минимальную задержку реакции системы.
        </p>
      </div>
    </section>
  );
}
