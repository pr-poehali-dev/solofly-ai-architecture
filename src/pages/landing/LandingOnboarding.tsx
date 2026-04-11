import { useState } from "react";
import Icon from "@/components/ui/icon";

const STEPS = [
  {
    num: "01",
    icon: "UserPlus",
    title: "Регистрация за 30 секунд",
    desc: "Укажите email и придумайте пароль. Карта не нужна. Сразу получаете полный доступ к командному центру, конструктору миссий и ИИ-ядру.",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.07)",
    border: "rgba(0,212,255,0.22)",
    details: [
      "Только email и пароль",
      "Никаких данных карты",
      "Полный доступ ко всем модулям",
      "Тариф «Про» активируется автоматически",
    ],
    badge: "Бесплатно",
    badgeColor: "var(--signal-green)",
    visual: "register",
  },
  {
    num: "02",
    icon: "Wifi",
    title: "Подключите дрон",
    desc: "Установите SoloFly-агент на бортовой компьютер (Raspberry Pi, Jetson Nano). Дрон появится в командном центре через 2 минуты.",
    color: "var(--signal-green)",
    accent: "rgba(0,255,136,0.05)",
    border: "rgba(0,255,136,0.22)",
    details: [
      "Ardupilot и PX4 из коробки",
      "MAVLink v2 через 4G или радиоканал",
      "Пошаговая инструкция в приложении",
      "Конструктор БПЛА с подбором компонентов",
    ],
    badge: "2 минуты",
    badgeColor: "var(--electric)",
    visual: "connect",
  },
  {
    num: "03",
    icon: "Target",
    title: "Запустите первую миссию",
    desc: "Нарисуйте маршрут на карте, задайте высоту и скорость — и нажмите «Старт». ИИ-ядро возьмёт управление, а вы наблюдаете в реальном времени.",
    color: "var(--warning)",
    accent: "rgba(255,149,0,0.05)",
    border: "rgba(255,149,0,0.22)",
    details: [
      "Waypoint-редактор прямо на карте",
      "Автономный полёт без оператора",
      "Live-телеметрия 300+ параметров",
      "Отчёт и архив — автоматически",
    ],
    badge: "Автономно",
    badgeColor: "var(--warning)",
    visual: "mission",
  },
];

function RegisterVisual() {
  return (
    <div className="rounded-xl p-4 space-y-2"
      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,212,255,0.15)" }}>
      <div className="hud-label mb-3" style={{ fontSize: 8, color: "var(--electric)" }}>РЕГИСТРАЦИЯ</div>
      {[
        { label: "Email", placeholder: "pilot@company.ru", type: "email" },
        { label: "Пароль", placeholder: "••••••••", type: "password" },
      ].map(f => (
        <div key={f.label}>
          <div className="text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>{f.label}</div>
          <div className="px-3 py-2 rounded-lg text-xs font-mono"
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,212,255,0.2)",
              color: "hsl(var(--muted-foreground))",
            }}>
            {f.placeholder}
          </div>
        </div>
      ))}
      <div className="mt-3 py-2.5 rounded-lg text-xs font-bold text-center"
        style={{ background: "var(--electric)", color: "hsl(210 25% 4%)" }}>
        Начать бесплатно →
      </div>
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <Icon name="Shield" size={9} style={{ color: "var(--signal-green)" }} />
        <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>Данные хранятся в РФ · 152-ФЗ</span>
      </div>
    </div>
  );
}

function ConnectVisual() {
  const [progress, setProgress] = useState(78);
  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,255,136,0.15)" }}>
      <div className="hud-label mb-2" style={{ fontSize: 8, color: "var(--signal-green)" }}>ПОДКЛЮЧЕНИЕ ДРОНА</div>
      {[
        { label: "Устройство", val: "SF-ALPHA-01", ok: true },
        { label: "Прошивка", val: "ArduCopter 4.5", ok: true },
        { label: "Протокол", val: "MAVLink v2", ok: true },
        { label: "Канал связи", val: "4G · 98 Мбит/с", ok: true },
      ].map(row => (
        <div key={row.label} className="flex items-center justify-between px-2 py-1.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{row.label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono" style={{ color: "var(--signal-green)" }}>{row.val}</span>
            <Icon name="Check" size={10} style={{ color: "var(--signal-green)" }} />
          </div>
        </div>
      ))}
      <div>
        <div className="flex justify-between mb-1">
          <span style={{ fontSize: 9, color: "hsl(var(--muted-foreground))" }}>Инициализация</span>
          <span style={{ fontSize: 9, color: "var(--signal-green)" }}>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--signal-green), var(--electric))",
              boxShadow: "0 0 6px rgba(0,255,136,0.5)",
            }} />
        </div>
      </div>
      <button
        className="w-full text-center text-xs py-1"
        onClick={() => setProgress(Math.min(100, progress + 10))}
        style={{ color: "var(--signal-green)", cursor: "pointer" }}>
        {progress < 100 ? "Подключение..." : "✓ Дрон онлайн"}
      </button>
    </div>
  );
}

function MissionVisual() {
  const [launched, setLaunched] = useState(false);
  return (
    <div className="rounded-xl p-4"
      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,149,0,0.15)" }}>
      <div className="hud-label mb-3" style={{ fontSize: 8, color: "var(--warning)" }}>ПЕРВАЯ МИССИЯ</div>
      {/* Mini map */}
      <div className="rounded-lg mb-3 relative overflow-hidden"
        style={{ height: 80, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}>
        <svg viewBox="0 0 200 80" style={{ width: "100%", height: "100%" }}>
          <path d="M 20 60 L 50 30 L 100 45 L 150 20 L 180 40"
            fill="none" stroke="var(--electric)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
          {[[20,60],[50,30],[100,45],[150,20],[180,40]].map(([x,y], i) => (
            <circle key={i} cx={x} cy={y} r="3"
              fill={i === 0 ? "var(--signal-green)" : i === 4 ? "var(--warning)" : "var(--electric)"}
              opacity="0.8" />
          ))}
          {launched && (
            <circle cx="75" cy="38" r="4" fill="var(--electric)" opacity="0.9">
              <animate attributeName="cx" values="20;50;100;150;180" dur="4s" repeatCount="indefinite" />
              <animate attributeName="cy" values="60;30;45;20;40" dur="4s" repeatCount="indefinite" />
            </circle>
          )}
          <text x="15" y="72" fontSize="6" fill="rgba(0,255,136,0.6)" fontFamily="monospace">СТАРТ</text>
          <text x="165" y="52" fontSize="6" fill="rgba(255,149,0,0.6)" fontFamily="monospace">ЦЕЛЬ</text>
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Точки", val: "5" },
          { label: "Дист.", val: "2.4 км" },
          { label: "Время", val: "~12 мин" },
        ].map(m => (
          <div key={m.label} className="text-center py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs font-bold" style={{ color: "var(--warning)" }}>{m.val}</div>
            <div style={{ fontSize: 8, color: "hsl(var(--muted-foreground))" }}>{m.label}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setLaunched(!launched)}
        className="w-full py-2.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]"
        style={{
          background: launched ? "rgba(0,255,136,0.15)" : "var(--warning)",
          color: launched ? "var(--signal-green)" : "hsl(210 25% 4%)",
          border: launched ? "1px solid rgba(0,255,136,0.3)" : "none",
        }}>
        {launched ? "✓ Миссия выполняется..." : "▶ Запустить миссию"}
      </button>
    </div>
  );
}

const VISUALS: Record<string, JSX.Element> = {
  register: <RegisterVisual />,
  connect: <ConnectVisual />,
  mission: <MissionVisual />,
};

export default function LandingOnboarding({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <div className="tag tag-electric mb-4">Быстрый старт</div>
        <h2 className="text-4xl font-bold mb-4">
          Первая миссия —
          <br />
          <span className="gradient-text">за 15 минут</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
          Три простых шага от регистрации до автономного полёта.
          Никакой долгой настройки — всё работает из браузера.
        </p>
      </div>

      {/* Step tabs */}
      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {STEPS.map((step, i) => (
          <button key={step.num} onClick={() => setActiveStep(i)}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
            style={{
              background: activeStep === i ? step.accent : "rgba(255,255,255,0.03)",
              border: `1px solid ${activeStep === i ? step.border : "rgba(255,255,255,0.07)"}`,
              color: activeStep === i ? step.color : "hsl(var(--muted-foreground))",
            }}>
            <span className="font-black text-xs opacity-50">{step.num}</span>
            <Icon name={step.icon} fallback="Check" size={15} />
            {step.title.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* Active step content */}
      {STEPS.map((step, i) => i === activeStep && (
        <div key={step.num} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: info */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: step.accent, border: `1px solid ${step.border}` }}>
                <Icon name={step.icon} fallback="Check" size={26} style={{ color: step.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-4xl" style={{ color: step.color, opacity: 0.18, lineHeight: 1 }}>
                    {step.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: `${step.badgeColor}15`,
                      color: step.badgeColor,
                      border: `1px solid ${step.badgeColor}30`,
                    }}>
                    {step.badge}
                  </span>
                </div>
                <h3 className="font-bold text-xl leading-snug">{step.title}</h3>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              {step.desc}
            </p>

            <ul className="space-y-3 mb-8">
              {step.details.map((d, j) => (
                <li key={j} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${step.color}15`, border: `1px solid ${step.color}25` }}>
                    <Icon name="Check" size={11} style={{ color: step.color }} />
                  </div>
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{d}</span>
                </li>
              ))}
            </ul>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              {i < STEPS.length - 1 ? (
                <button onClick={() => setActiveStep(i + 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{ background: step.color, color: "hsl(210 25% 4%)" }}>
                  Следующий шаг
                  <Icon name="ArrowRight" size={15} />
                </button>
              ) : (
                <button onClick={() => onNavigate("dashboard")}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: "var(--electric)", color: "hsl(210 25% 4%)",
                    boxShadow: "0 0 24px rgba(0,212,255,0.3)",
                  }}>
                  <Icon name="Rocket" size={15} />
                  Начать прямо сейчас
                </button>
              )}
              {i > 0 && (
                <button onClick={() => setActiveStep(i - 1)}
                  className="px-4 py-3 rounded-xl text-sm transition-all hover:opacity-80"
                  style={{ color: "hsl(var(--muted-foreground))" }}>
                  ← Назад
                </button>
              )}
            </div>
          </div>

          {/* Right: interactive visual */}
          <div className="max-w-sm mx-auto w-full">
            {VISUALS[step.visual]}
          </div>
        </div>
      ))}

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-10">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setActiveStep(i)}
            className="rounded-full transition-all"
            style={{
              width: activeStep === i ? 24 : 8,
              height: 8,
              background: activeStep === i ? "var(--electric)" : "rgba(255,255,255,0.15)",
            }} />
        ))}
      </div>

      {/* Bottom strip */}
      <div className="mt-14 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5"
        style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.14)" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}>
            <Icon name="BookOpen" size={18} style={{ color: "var(--electric)" }} />
          </div>
          <div>
            <div className="font-bold text-sm mb-0.5">Нужна помощь с подключением?</div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              Конструктор БПЛА — 30+ статей по сборке и настройке ArduPilot/PX4. Бесплатно, без регистрации.
            </div>
          </div>
        </div>
        <button onClick={() => onNavigate("dronebuilder")}
          className="px-6 py-3 rounded-xl text-sm font-bold shrink-0 transition-all hover:scale-[1.02]"
          style={{
            background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.3)",
            color: "var(--electric)",
          }}>
          Открыть конструктор →
        </button>
      </div>
    </section>
  );
}
