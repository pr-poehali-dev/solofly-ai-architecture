import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const AI_FEATURES = [
  { icon: "Eye",         label: "Компьютерное зрение",    desc: "Анализ изображения с камер в реальном времени. Распознавание объектов, людей, транспорта и аномалий." },
  { icon: "MapPin",      label: "Навигация без GPS",       desc: "Определение местоположения по визуальным ориентирам. Работает в тоннелях, лесах, закрытых помещениях." },
  { icon: "ShieldAlert", label: "Обход препятствий",       desc: "Автоматическое обнаружение и облёт препятствий. Принятие решений на борту за < 15 мс." },
  { icon: "Route",       label: "Многоэтапные миссии",     desc: "Последовательные сложные сценарии с несколькими целями. Автономное переключение этапов миссии." },
  { icon: "Brain",       label: "Бортовой ИИ",             desc: "Нейросетевые вычисления на Jetson Nano / Xavier. Работа без постоянного канала связи." },
  { icon: "RefreshCw",   label: "Адаптация в реальном времени", desc: "Корректировка поведения при изменении условий: ветер, туман, потеря цели." },
];

const CMD_FEATURES = [
  { icon: "LayoutDashboard", label: "Командный центр",      desc: "Единый интерфейс управления всем парком. Статус каждого аппарата на одном экране." },
  { icon: "Map",             label: "Планирование миссий",  desc: "Конструктор маршрутов прямо на карте. Waypoint-редактор с привязкой к местности." },
  { icon: "Activity",        label: "Live телеметрия",      desc: "300+ параметров в реальном времени. Заряд, скорость, высота, курс, видеопоток." },
  { icon: "Sliders",         label: "Корректировка курса",  desc: "Изменение маршрута и целей прямо во время выполнения миссии без прерывания полёта." },
  { icon: "Video",           label: "Видеопотоки",          desc: "Просмотр изображения с камер дронов в реальном времени. Запись и архивация." },
  { icon: "BarChart2",       label: "Аналитика данных",     desc: "Накопление и анализ телеметрии. Оптимизация маршрутов и сценариев на основе истории." },
];

function AIVisualizer() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Захват кадра", color: "var(--electric)", icon: "Camera" },
    { label: "Детекция объектов", color: "var(--signal-green)", icon: "ScanSearch" },
    { label: "Оценка дистанции", color: "var(--electric)", icon: "Ruler" },
    { label: "Решение: облёт", color: "var(--signal-green)", icon: "Navigation" },
    { label: "Манёвр выполнен", color: "var(--signal-green)", icon: "CheckCircle" },
  ];
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 1000);
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <div className="rounded-2xl p-5 h-full flex flex-col justify-between"
      style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="dot-online" />
        <span className="hud-label text-xs" style={{ color: "var(--electric)" }}>AI CAPTAIN · REALTIME</span>
      </div>
      <div className="space-y-1.5 flex-1">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-500"
            style={{
              background: i === step ? `${s.color}12` : "transparent",
              border: `1px solid ${i === step ? s.color + "30" : "transparent"}`,
            }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
              style={{ background: i <= step ? `${s.color}20` : "rgba(255,255,255,0.04)" }}>
              <Icon name={s.icon} fallback="Cpu" size={11}
                style={{ color: i <= step ? s.color : "rgba(255,255,255,0.2)" }} />
            </div>
            <span className="text-xs font-mono"
              style={{ color: i === step ? s.color : i < step ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)" }}>
              {s.label}
            </span>
            {i < step && (
              <Icon name="Check" size={10} style={{ color: "var(--signal-green)", marginLeft: "auto" }} />
            )}
            {i === step && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{
                background: s.color, animation: "pulse 0.8s infinite",
              }} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}>
        <span className="hud-label" style={{ fontSize: 8 }}>ВРЕМЯ РЕАКЦИИ</span>
        <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>&lt; 15 мс</span>
      </div>
    </div>
  );
}

function CMDVisualizer() {
  const [activeDrone, setActiveDrone] = useState(0);
  const drones = [
    { id: "SF-01", status: "Миссия", bat: 87, alt: 85, speed: 12, color: "var(--signal-green)" },
    { id: "SF-02", status: "Возврат", bat: 43, alt: 40, speed: 8, color: "var(--warning)" },
    { id: "SF-03", status: "Ожидание", bat: 100, alt: 0, speed: 0, color: "hsl(var(--muted-foreground))" },
  ];
  useEffect(() => {
    const id = setInterval(() => setActiveDrone(d => (d + 1) % drones.length), 1800);
    return () => clearInterval(id);
  }, [drones.length]);
  const d = drones[activeDrone];
  return (
    <div className="rounded-2xl p-5 h-full flex flex-col"
      style={{ background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.15)" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="dot-online" style={{ background: "var(--signal-green)" }} />
        <span className="hud-label text-xs" style={{ color: "var(--signal-green)" }}>COMMAND CENTER · LIVE</span>
      </div>
      <div className="flex gap-1.5 mb-4">
        {drones.map((dr, i) => (
          <button key={dr.id} onClick={() => setActiveDrone(i)}
            className="flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
            style={{
              background: i === activeDrone ? `${dr.color}18` : "rgba(255,255,255,0.03)",
              border: `1px solid ${i === activeDrone ? dr.color + "40" : "rgba(255,255,255,0.06)"}`,
              color: i === activeDrone ? dr.color : "rgba(255,255,255,0.3)",
            }}>
            {dr.id}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-2">
        {[
          { label: "СТАТУС", val: d.status, color: d.color },
          { label: "АКБ", val: `${d.bat}%`, color: d.bat > 60 ? "var(--signal-green)" : d.bat > 30 ? "var(--warning)" : "var(--danger)" },
          { label: "ВЫСОТА", val: `${d.alt} м`, color: "var(--electric)" },
          { label: "СКОРОСТЬ", val: `${d.speed} м/с`, color: "var(--electric)" },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-3 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="hud-label" style={{ fontSize: 8 }}>{row.label}</span>
            <span className="hud-value text-xs font-bold" style={{ color: row.color }}>{row.val}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(0,255,136,0.1)" }}>
        <Icon name="Wifi" size={11} style={{ color: "var(--signal-green)" }} />
        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>4G/LTE · 98%</span>
        <span className="ml-auto text-xs font-mono" style={{ color: "var(--signal-green)" }}>3 онлайн</span>
      </div>
    </div>
  );
}

export default function LandingAICapitan({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [active, setActive] = useState<"captain" | "command">("captain");

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <div className="tag tag-electric mb-4">Архитектура платформы</div>
        <h2 className="text-4xl font-bold mb-4">
          Два мозга — <span className="gradient-text">одна система</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
          AI Captain работает на борту и принимает решения за миллисекунды.
          Command Center даёт операторам полный контроль с любой точки планеты.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center mb-10">
        <div className="flex p-1 rounded-xl gap-1"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {[
            { key: "captain" as const, label: "AI Captain", icon: "Brain", color: "var(--electric)" },
            { key: "command" as const, label: "Command Center", icon: "LayoutDashboard", color: "var(--signal-green)" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActive(tab.key)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
              style={{
                background: active === tab.key ? `${tab.color}15` : "transparent",
                border: `1px solid ${active === tab.key ? tab.color + "35" : "transparent"}`,
                color: active === tab.key ? tab.color : "hsl(var(--muted-foreground))",
              }}>
              <Icon name={tab.icon} fallback="Cpu" size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(active === "captain" ? AI_FEATURES : CMD_FEATURES).map(feat => (
            <div key={feat.label}
              className="rounded-xl p-4 transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${active === "captain" ? "rgba(0,212,255,0.1)" : "rgba(0,255,136,0.1)"}`,
              }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: active === "captain" ? "rgba(0,212,255,0.12)" : "rgba(0,255,136,0.1)" }}>
                  <Icon name={feat.icon} fallback="Cpu" size={13}
                    style={{ color: active === "captain" ? "var(--electric)" : "var(--signal-green)" }} />
                </div>
                <span className="font-bold text-xs">{feat.label}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* Live visualizer */}
        <div className="h-full min-h-[340px]">
          {active === "captain" ? <AIVisualizer /> : <CMDVisualizer />}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 flex justify-center">
        <button onClick={() => onNavigate("dashboard")}
          className="btn-electric px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2">
          <Icon name="Rocket" size={15} />
          Попробовать Command Center
        </button>
      </div>
    </section>
  );
}
