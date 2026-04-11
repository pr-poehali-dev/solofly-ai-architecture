import Icon from "@/components/ui/icon";
import { capabilities, stats, useCountUp } from "./landingData";

interface LandingHeroProps {
  onNavigate:   (p: string) => void;
  onOpenDemo:   () => void;
}

export default function LandingHero({ onNavigate, onOpenDemo }: LandingHeroProps) {
  const { count: missionsCount, ref: missionsRef } = useCountUp(1247);
  const { count: hoursCount,    ref: hoursRef }    = useCountUp(3840);
  const { count: accuracyCount, ref: accuracyRef } = useCountUp(974);

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative radar-bg overflow-hidden px-6 pt-28 pb-24 max-w-6xl mx-auto text-center fade-up">
        <div className="absolute inset-x-0 top-0 h-64 overflow-hidden pointer-events-none">
          <div className="scan-line" />
        </div>

        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full panel-glow text-xs font-semibold tracking-widest uppercase">
          <span className="dot-online" />
          <span style={{ color: "var(--electric)" }}>Открытое бета-тестирование · v0.9-beta</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
          <span className="gradient-text">SoloFly</span><br />
          <span className="text-4xl md:text-5xl font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
            Интеллектуальная система автономного управления беспилотным летательным аппаратом
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Разработка алгоритмов адаптивной навигации и автономного принятия решений для промышленного применения.
          Платформа построена на базе открытых стандартов MAVLink, Ardupilot и PX4.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
          <button onClick={() => onNavigate("dashboard")}
            className="btn-electric px-8 py-3.5 rounded-lg text-sm font-bold">
            Запустить систему →
          </button>
          <button
            onClick={() => onNavigate("dronebuilder")}
            className="px-8 py-3.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.03]"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.35)",
              color: "var(--electric)",
            }}
          >
            <Icon name="Wrench" size={15} />
            Конструктор БПЛА
          </button>
          <button
            onClick={onOpenDemo}
            className="btn-ghost px-8 py-3.5 rounded-lg text-sm flex items-center gap-2"
          >
            <Icon name="Play" size={15} style={{ color: "var(--electric)" }} />
            Смотреть демо
          </button>
        </div>

        {/* Hero image */}
        <div className="relative max-w-3xl mx-auto mb-16">
          <div className="absolute inset-0 rounded-2xl" style={{
            background: "radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
          }} />
          <div className="relative rounded-2xl overflow-hidden panel-glow" style={{ aspectRatio: "16/9" }}>
            <img
              src="https://cdn.poehali.dev/projects/5ef72b5b-2023-4dff-b313-89105094219f/files/ef12817c-6954-4f4e-ab4a-34ef3b34cbd0.jpg"
              alt="SoloFly — командный центр управления автономными дронами"
              className="w-full h-full object-cover"
              style={{ opacity: 0.92 }}
            />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(5,9,14,0.7) 100%)" }} />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="dot-online" />
              <span className="text-xs font-semibold" style={{ color: "var(--signal-green)" }}>Система активна · 2 дрона в полёте</span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="tag tag-electric" style={{ fontSize: 10 }}>Live · ИИ-ядро v2.4.1</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="panel-glow p-5 rounded-xl text-center">
              <div className="hud-value text-2xl gradient-text mb-1">{s.val}</div>
              <div className="hud-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Живые счётчики ── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div ref={missionsRef} className="panel rounded-2xl p-6">
            <div className="hud-value text-4xl font-bold gradient-text mb-2">{missionsCount.toLocaleString("ru-RU")}</div>
            <div className="hud-label">Миссий выполнено</div>
          </div>
          <div ref={hoursRef} className="panel rounded-2xl p-6">
            <div className="hud-value text-4xl font-bold gradient-text mb-2">{hoursCount.toLocaleString("ru-RU")}</div>
            <div className="hud-label">Часов автополёта</div>
          </div>
          <div ref={accuracyRef} className="panel rounded-2xl p-6">
            <div className="hud-value text-4xl font-bold gradient-text mb-2">{(accuracyCount / 10).toFixed(1)}%</div>
            <div className="hud-label">Точность ИИ</div>
          </div>
        </div>
      </section>

      {/* ── Конструктор БПЛА ── */}
      <section className="px-6 pb-4 max-w-5xl mx-auto">
        <div
          className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:scale-[1.01] transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(0,255,136,0.05) 100%)",
            border: "1px solid rgba(0,212,255,0.25)",
          }}
          onClick={() => onNavigate("dronebuilder")}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.2)" }}>
              <Icon name="Wrench" size={26} style={{ color: "var(--electric)" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">Конструктор БПЛА</span>
                <span className="tag tag-green" style={{ fontSize: 10 }}>Бесплатно</span>
              </div>
              <p className="text-muted-foreground text-sm">
                30+ статей по сборке, выбор компонентов, настройка Ardupilot/PX4, техобслуживание и законодательство РФ — без регистрации
              </p>
            </div>
          </div>
          <button
            className="shrink-0 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap"
            style={{
              background: "rgba(0,212,255,0.12)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--electric)",
            }}
          >
            Открыть <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </section>

      {/* ── Возможности ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-electric mb-4">Технические направления</div>
          <h2 className="text-4xl font-bold mb-4">
            Ключевые компоненты<br /><span className="gradient-text">разрабатываемой системы</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Каждое направление является самостоятельной исследовательской задачей в рамках НИОКР 2026 года.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((c) => (
            <div key={c.title} className="panel p-6 rounded-xl hover:border-[rgba(0,212,255,0.2)] transition-all">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${c.color}15` }}>
                <Icon name={c.icon} fallback="Cpu" size={20} style={{ color: c.color }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm">{c.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Самообучение ── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="panel-glow rounded-2xl p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="tag tag-green mb-4">Адаптивное дообучение</div>
              <h2 className="text-3xl font-bold mb-4">Накопление данных — основа улучшений</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Система использует механизм контролируемого адаптивного дообучения на основе накопленных телеметрических данных с последующей валидацией модели. Обновление применяется только при прохождении автоматических контрольных порогов качества.
              </p>
              <div className="space-y-3">
                {["Обнаружение паттернов в новых условиях полёта", "Повышение точности при повторных миссиях", "Адаптация к изменяющимся погодным условиям", "Оптимизация расхода энергии по накопленным данным"].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <Icon name="CheckCircle" size={15} style={{ color: "var(--signal-green)" }} className="shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { step: "01", label: "Полёт",             desc: "Система выполняет миссию" },
                { step: "02", label: "Сбор данных",       desc: "Телеметрия + видео + решения" },
                { step: "03", label: "Анализ ИИ",         desc: "Оценка оптимальности траекторий" },
                { step: "04", label: "Обновление модели", desc: "Веса нейросети обновлены" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 panel rounded-xl">
                  <span className="hud-value text-sm" style={{ color: "var(--electric)" }}>{s.step}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  {i < 3 ? <Icon name="ArrowDown" size={14} className="text-muted-foreground" /> : <span className="dot-online" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}