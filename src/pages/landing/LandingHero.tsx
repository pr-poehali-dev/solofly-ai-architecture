import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { useCountUp } from "./landingData";

interface LandingHeroProps {
  onNavigate: (p: string) => void;
  onOpenDemo: () => void;
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.6,
  dur: Math.random() * 10 + 7,
  delay: Math.random() * 6,
}));

export default function LandingHero({ onNavigate, onOpenDemo }: LandingHeroProps) {
  const { count: missionsCount, ref: missionsRef } = useCountUp(1247);
  const { count: hoursCount, ref: hoursRef } = useCountUp(3840);
  const { count: accuracyCount, ref: accuracyRef } = useCountUp(974);
  const { count: dronesCount, ref: dronesRef } = useCountUp(47);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = (canvas.width = canvas.offsetWidth);
    const H = (canvas.height = canvas.offsetHeight);
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() / 1000;
    const nodes = [
      { x: W * 0.12, y: H * 0.25 },
      { x: W * 0.3, y: H * 0.65 },
      { x: W * 0.52, y: H * 0.2 },
      { x: W * 0.72, y: H * 0.72 },
      { x: W * 0.88, y: H * 0.4 },
      { x: W * 0.48 + Math.sin(t * 0.4) * 55, y: H * 0.5 + Math.cos(t * 0.3) * 38 },
      { x: W * 0.22 + Math.cos(t * 0.5) * 35, y: H * 0.78 + Math.sin(t * 0.4) * 25 },
      { x: W * 0.65 + Math.sin(t * 0.35) * 40, y: H * 0.3 + Math.cos(t * 0.45) * 30 },
    ];
    ctx.lineWidth = 0.6;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          const alpha = (1 - dist / 300) * 0.15;
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,212,255,0.45)";
      ctx.fill();
    });
  }, [tick]);

  return (
    <>
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 90% 70% at 50% -5%, rgba(0,212,255,0.09) 0%, transparent 65%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 50% at 85% 85%, rgba(0,255,136,0.05) 0%, transparent 60%)",
          }} />
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.035 }}>
            <defs>
              <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(0,212,255,1)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}
          />
          {PARTICLES.map((p) => (
            <div key={p.id} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size, borderRadius: "50%",
              background: "rgba(0,212,255,0.55)",
              animation: `floatParticle ${p.dur}s ${p.delay}s infinite ease-in-out alternate`,
            }} />
          ))}
          <div className="scan-line" style={{ top: 0 }} />
        </div>

        <div className="relative px-6 pt-32 pb-8 max-w-7xl mx-auto w-full">
          {/* Badge */}
          <div className="flex justify-center mb-8 fade-up">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
              style={{
                background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.22)",
                color: "var(--electric)",
              }}>
              <span className="dot-online" />
              Открытое бета-тестирование · v0.9-beta
              <span style={{
                background: "rgba(0,255,136,0.15)", color: "var(--signal-green)",
                border: "1px solid rgba(0,255,136,0.3)", padding: "1px 8px", borderRadius: 99, fontSize: 9,
              }}>NEW</span>
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center max-w-5xl mx-auto mb-6 fade-up">
            <h1 style={{
              fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 900,
              lineHeight: 1.05, letterSpacing: "-0.035em",
            }}>
              <span className="gradient-text">Замените 3 оператора</span>
              <br />
              <span style={{ color: "hsl(var(--foreground))" }}>одной платформой</span>
            </h1>
          </div>

          <p className="text-center max-w-2xl mx-auto mb-4 leading-relaxed fade-up"
            style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "hsl(var(--muted-foreground))" }}>
            SoloFly автоматизирует инспекцию, мониторинг и картографирование для нефтегаза,
            энергетики, АПК, строительства и охраны. До 85% полётов — без участия человека.
          </p>

          {/* Industry quick-links */}
          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap fade-up">
            {[
              { label: "Нефтегаз", icon: "Flame" },
              { label: "Энергетика", icon: "Zap" },
              { label: "АПК", icon: "Wheat" },
              { label: "Строительство", icon: "Building2" },
              { label: "Безопасность", icon: "Shield" },
              { label: "Логистика", icon: "Package" },
            ].map(item => (
              <span key={item.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(0,212,255,0.07)",
                  border: "1px solid rgba(0,212,255,0.18)",
                  color: "var(--electric)",
                }}>
                <Icon name={item.icon} fallback="Check" size={11} />
                {item.label}
              </span>
            ))}
          </div>

          <p className="text-center text-xs mb-10 fade-up"
            style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>
            Ardupilot · PX4 · MAVLink v2 · YOLO11 · Данные в России · 152-ФЗ
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3 mb-16 flex-wrap fade-up">
            <button onClick={() => onNavigate("dashboard")}
              className="btn-electric px-9 py-4 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.03] transition-all"
              style={{ boxShadow: "0 0 32px rgba(0,212,255,0.25)" }}>
              <Icon name="Rocket" size={16} />
              Запустить систему
            </button>
            <button onClick={onOpenDemo}
              className="px-8 py-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: "hsl(var(--foreground))",
              }}>
              <Icon name="Play" size={15} style={{ color: "var(--electric)" }} />
              Смотреть демо
            </button>
            <button onClick={() => onNavigate("dronebuilder")}
              className="px-7 py-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-80"
              style={{ color: "hsl(var(--muted-foreground))" }}>
              <Icon name="Wrench" size={14} />
              Конструктор БПЛА
              <span style={{
                fontSize: 9, background: "rgba(0,255,136,0.15)", color: "var(--signal-green)",
                border: "1px solid rgba(0,255,136,0.3)", padding: "1px 6px", borderRadius: 99,
              }}>Бесплатно</span>
            </button>
          </div>

          {/* Hero screen */}
          <div className="relative max-w-5xl mx-auto mb-14 fade-up">
            <div style={{
              position: "absolute", inset: "-50px",
              background: "radial-gradient(ellipse at center, rgba(0,212,255,0.13) 0%, transparent 65%)",
              filter: "blur(50px)", pointerEvents: "none",
            }} />
            <div className="relative rounded-2xl overflow-hidden" style={{
              aspectRatio: "16/9",
              border: "1px solid rgba(0,212,255,0.28)",
              boxShadow: "0 0 80px rgba(0,212,255,0.09), 0 40px 90px rgba(0,0,0,0.55)",
            }}>
              <img
                src="https://cdn.poehali.dev/projects/5ef72b5b-2023-4dff-b313-89105094219f/files/ef12817c-6954-4f4e-ab4a-34ef3b34cbd0.jpg"
                alt="SoloFly — командный центр управления автономными дронами"
                className="w-full h-full object-cover"
                style={{ opacity: 0.85 }}
              />
              <div className="absolute inset-0 pointer-events-none" style={{
                background: "linear-gradient(to bottom, transparent 55%, rgba(5,9,14,0.85) 100%)",
              }} />
              <div className="absolute bottom-5 left-5 flex items-center gap-3">
                <span className="dot-online" />
                <span className="text-sm font-semibold" style={{ color: "var(--signal-green)" }}>
                  Система активна · 2 дрона в полёте
                </span>
              </div>
              <div className="absolute top-5 right-5">
                <span className="tag tag-electric" style={{ fontSize: 10 }}>Live · ИИ-ядро v2.4.1</span>
              </div>
              <div style={{
                position: "absolute", top: 0, left: 0, width: 28, height: 28,
                borderTop: "2px solid rgba(0,212,255,0.55)", borderLeft: "2px solid rgba(0,212,255,0.55)",
              }} />
              <div style={{
                position: "absolute", bottom: 0, right: 0, width: 28, height: 28,
                borderBottom: "2px solid rgba(0,212,255,0.55)", borderRight: "2px solid rgba(0,212,255,0.55)",
              }} />
            </div>
          </div>

          {/* Counters strip */}
          <div className="max-w-3xl mx-auto rounded-2xl mb-10 fade-up" style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          }}>
            {[
              { ref: missionsRef, count: missionsCount, label: "Миссий выполнено", fmt: (v: number) => v.toLocaleString("ru-RU") },
              { ref: hoursRef, count: hoursCount, label: "Часов автополёта", fmt: (v: number) => v.toLocaleString("ru-RU") },
              { ref: accuracyRef, count: accuracyCount / 10, label: "Точность ИИ", fmt: (v: number) => v.toFixed(1) + "%" },
              { ref: dronesRef, count: dronesCount, label: "Дронов онлайн", fmt: (v: number) => v.toLocaleString("ru-RU") },
            ].map((item, i) => (
              <div key={i} ref={item.ref} className="p-5 text-center"
                style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
                <div className="gradient-text font-black mb-1" style={{ fontSize: "1.85rem", lineHeight: 1 }}>
                  {item.fmt(item.count)}
                </div>
                <div className="hud-label" style={{ fontSize: 10 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ПРИМЕНЕНИЕ ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-green mb-4">Применение</div>
          <h2 className="text-4xl font-bold mb-4">
            Где работает <span className="gradient-text">SoloFly</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Промышленные, инфраструктурные и аграрные сценарии эксплуатации автономных БПЛА.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "Factory", industry: "Нефтегаз", title: "Мониторинг объектов", desc: "Автономный облёт трубопроводов и технологических площадок с автоматическим формированием отчётов.", stat: "−70%", statLabel: "времени инспекции" },
            { icon: "Zap", industry: "Энергетика", title: "Инспекция ЛЭП", desc: "Патрулирование линий электропередачи сотнями километров без наземных бригад.", stat: "×4", statLabel: "скорость охвата" },
            { icon: "Wheat", industry: "Агрохолдинги", title: "Агромониторинг", desc: "Картографирование угодий и мониторинг посевов по данным компьютерного зрения.", stat: "10к га", statLabel: "за 4 часа" },
            { icon: "Building2", industry: "Строительство", title: "Инспекция объектов", desc: "Еженедельный облёт стройки, автоматическое 3D-моделирование и сравнение с проектом.", stat: "3D", statLabel: "модель автоматически" },
            { icon: "Shield", industry: "Безопасность", title: "Патрулирование", desc: "Автономное охранное патрулирование периметра с детекцией вторжений.", stat: "24/7", statLabel: "без оператора" },
            { icon: "Map", industry: "Геодезия", title: "Картографирование", desc: "Аэрофотосъёмка и создание ортофотопланов с сантиметровой точностью.", stat: "±3 см", statLabel: "точность" },
          ].map((uc) => (
            <div key={uc.title} className="rounded-2xl p-6 transition-all hover:scale-[1.015]"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <Icon name={uc.icon} fallback="Target" size={16} style={{ color: "var(--electric)" }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>{uc.industry}</span>
              </div>
              <h3 className="font-bold text-sm mb-2">{uc.title}</h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>{uc.desc}</p>
              <div className="flex items-end gap-1.5 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-bold text-lg gradient-text">{uc.stat}</span>
                <span className="text-xs mb-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{uc.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ЭКОСИСТЕМА ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-electric mb-4">Архитектура</div>
          <h2 className="text-4xl font-bold mb-4">
            Три уровня <span className="gradient-text">единой экосистемы</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            От датчика на борту до командного центра — все компоненты работают как единый организм.
          </p>
        </div>

        <div className="relative">
          {/* Connection lines */}
          <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
            <div style={{
              position: "absolute", top: "50%", left: "calc(33.33% - 1px)", width: "33.33%",
              height: 1, background: "linear-gradient(90deg, rgba(0,212,255,0.3), rgba(0,255,136,0.3))",
            }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "Cpu", num: "01", title: "Бортовой модуль",
                color: "var(--electric)", tagColor: "rgba(0,212,255,0.15)",
                items: ["Pixhawk / Cube Orange", "Ardupilot или PX4", "Jetson Nano / RPi", "MAVLink v2 телеметрия", "4G/LTE или радиоканал"],
                badge: "Edge",
              },
              {
                icon: "Cloud", num: "02", title: "Облачная платформа",
                color: "var(--signal-green)", tagColor: "rgba(0,255,136,0.12)",
                items: ["Приём телеметрии realtime", "ИИ-ядро: маршруты и миссии", "Компьютерное зрение 97.4%", "Управление роем БПЛА", "REST API + MAVLink-прокси"],
                badge: "Cloud",
              },
              {
                icon: "Monitor", num: "03", title: "Командный центр",
                color: "var(--warning)", tagColor: "rgba(255,170,0,0.12)",
                items: ["Веб-интерфейс без установки", "Live-карта позиций дронов", "Телеметрия 300+ параметров", "Конструктор миссий + waypoint", "Журнал и архив полётов"],
                badge: "Web",
              },
            ].map((block, i) => (
              <div key={block.title} className="rounded-2xl p-6" style={{
                background: `${block.color}06`,
                border: `1px solid ${block.color}20`,
              }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: block.tagColor, border: `1px solid ${block.color}25` }}>
                      <Icon name={block.icon} fallback="Cpu" size={18} style={{ color: block.color }} />
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: block.color, opacity: 0.7 }}>{block.num}</div>
                      <div className="font-bold text-sm">{block.title}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9, background: block.tagColor, color: block.color,
                    border: `1px solid ${block.color}30`, padding: "2px 8px", borderRadius: 99, fontWeight: 700,
                  }}>{block.badge}</span>
                </div>
                <ul className="space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <div style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: block.color, flexShrink: 0, opacity: 0.7,
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
                {i < 2 && (
                  <div className="flex justify-end mt-5 md:hidden">
                    <Icon name="ArrowDown" size={16} style={{ color: block.color, opacity: 0.4 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ВОЗМОЖНОСТИ ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-electric mb-4">Технические направления</div>
          <h2 className="text-4xl font-bold mb-4">
            Ключевые компоненты{" "}
            <span className="gradient-text">разрабатываемой системы</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Каждое направление — самостоятельная исследовательская задача НИОКР 2026.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "Brain", title: "Адаптивное дообучение", desc: "Контролируемое дообучение на основе накопленных телеметрических данных с последующей валидацией модели.", color: "var(--electric)", tag: "ИИ-ядро" },
            { icon: "Route", title: "Планирование маршрутов", desc: "Алгоритм строит маршруты с учётом рельефа, запретных зон и погодных условий в реальном времени.", color: "var(--signal-green)", tag: "Навигация" },
            { icon: "Eye", title: "Компьютерное зрение", desc: "Распознавание объектов и препятствий в реальном времени. В лабораторных тестах точность — 97.4%.", color: "var(--electric)", tag: "CV" },
            { icon: "Cpu", title: "Бортовые вычисления", desc: "Алгоритмы принятия решений выполняются на борту, снижая зависимость от канала связи. Отклик < 15 мс.", color: "var(--signal-green)", tag: "Edge AI" },
            { icon: "ShieldCheck", title: "Сценарии потери связи", desc: "Верификация поведения системы при деградации канала — одно из ключевых направлений НИОКР.", color: "var(--electric)", tag: "Надёжность" },
            { icon: "Activity", title: "Телеметрия и мониторинг", desc: "Сбор и визуализация 300+ параметров в реальном времени. Основа обучающей выборки.", color: "var(--signal-green)", tag: "Аналитика" },
          ].map((cap) => (
            <div key={cap.title} className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${cap.color}18`,
                position: "relative", overflow: "hidden",
              }}>
              <div style={{
                position: "absolute", top: 0, right: 0, width: 80, height: 80,
                background: `radial-gradient(circle at top right, ${cap.color}0c, transparent 70%)`,
              }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${cap.color}14`, border: `1px solid ${cap.color}22` }}>
                  <Icon name={cap.icon} fallback="Zap" size={18} style={{ color: cap.color }} />
                </div>
                <span style={{
                  fontSize: 9, background: `${cap.color}14`, color: cap.color,
                  border: `1px solid ${cap.color}30`, padding: "2px 8px", borderRadius: 99, fontWeight: 700,
                }}>{cap.tag}</span>
              </div>
              <h3 className="font-bold text-sm mb-2">{cap.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КОНСТРУКТОР БПЛА баннер ── */}
      <section className="px-6 pb-8 max-w-6xl mx-auto">
        <div className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, rgba(0,255,136,0.06) 0%, rgba(0,212,255,0.04) 100%)",
            border: "1px solid rgba(0,255,136,0.18)",
          }}>
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.25)" }}>
              <Icon name="Wrench" size={22} style={{ color: "var(--signal-green)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base">Конструктор БПЛА</span>
                <span style={{
                  fontSize: 9, background: "rgba(0,255,136,0.15)", color: "var(--signal-green)",
                  border: "1px solid rgba(0,255,136,0.3)", padding: "2px 8px", borderRadius: 99, fontWeight: 700,
                }}>Бесплатно</span>
              </div>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                30+ статей по сборке, подбор компонентов, настройка Ardupilot/PX4 и законодательство РФ — без регистрации
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate("dronebuilder")}
            className="px-7 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all hover:scale-[1.03]"
            style={{
              background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)",
              color: "var(--signal-green)",
            }}>
            Открыть конструктор
            <Icon name="ChevronRight" size={15} />
          </button>
        </div>
      </section>
    </>
  );
}