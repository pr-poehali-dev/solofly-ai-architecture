import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

interface Props { onNavigate: (p: string) => void; }

const capabilities = [
  { icon: "Brain",     title: "Непрерывное самообучение",      desc: "ИИ-ядро обновляет модели после каждого полёта — без ручной разметки данных и участия оператора.", color: "var(--electric)" },
  { icon: "Radar",     title: "Автономное планирование миссий", desc: "Система самостоятельно строит маршруты с учётом рельефа, запретных зон, погоды и целей задания.", color: "var(--signal-green)" },
  { icon: "Eye",       title: "Компьютерное зрение 360°",      desc: "Реалтайм распознавание объектов, препятствий и целей с точностью 97.4% на скорости 120+ км/ч.", color: "var(--electric)" },
  { icon: "Cpu",       title: "Бортовой ИИ-процессор",         desc: "Все вычисления на борту — нет задержки на передачу данных. Полная автономность при потере связи.", color: "var(--signal-green)" },
  { icon: "Shield",    title: "Отказоустойчивость",            desc: "Тройное резервирование критических узлов. При любой аварии система выполняет безопасную посадку.", color: "var(--electric)" },
  { icon: "Activity",  title: "Телеметрия в реальном времени", desc: "300+ параметров полёта, состояния систем и ИИ-модели. Экспорт в CSV, PDF, JSON.", color: "var(--signal-green)" },
];

const stats = [
  { val: "97.4%", label: "Точность распознавания" },
  { val: "< 12ms", label: "Латентность решений" },
  { val: "0",      label: "Операторов требуется" },
  { val: "∞",      label: "Циклов самообучения" },
];

const testimonials = [
  { name: "Алексей Воронов", role: "Начальник отдела разведки", org: "Силовые структуры РФ", text: "SoloFly полностью заменил операторов на рутинных маршрутах. Дроны летают сами, мы только смотрим на дашборд. Экономия — 3 штатных единицы.", stars: 5 },
  { name: "Марина Соколова", role: "Технический директор", org: "Агрохолдинг «Сибирь»", text: "Картографирование 10 000 га за 4 часа без единого оператора. Точность посадки ±30 см. Для сельского хозяйства это революция.", stars: 5 },
  { name: "Дмитрий Ларин", role: "Руководитель проектов", org: "Строительная группа «Монолит»", text: "Инспекция объектов раз в неделю. Дрон сам облетает, фотографирует, строит 3D-модель и присылает отчёт. Отличная работа.", stars: 5 },
];

const faqs = [
  {
    q: "Нужен ли оператор для управления дроном?",
    a: "Нет. SoloFly — полностью автономная система. Дрон самостоятельно взлетает, выполняет миссию и садится. Оператор может наблюдать в реальном времени через командный центр, но его участие необязательно.",
  },
  {
    q: "Как быстро ИИ принимает решения?",
    a: "Задержка принятия решений менее 12 мс. Все вычисления происходят на борту — без облака и задержки на передачу данных. Это критически важно при обходе препятствий на скорости 120+ км/ч.",
  },
  {
    q: "Поддерживается ли управление несколькими дронами?",
    a: "Да. Режим роя БПЛА позволяет координировать группу дронов: лидер распределяет задачи, дроны обмениваются данными и покрывают большие территории параллельно.",
  },
  {
    q: "Что происходит при потере связи?",
    a: "Дрон автономно завершает миссию или выполняет возврат на базу (RTB). Тройное резервирование навигационных систем исключает потерю управления.",
  },
  {
    q: "Какие данные хранятся и где?",
    a: "Все данные хранятся на серверах в РФ в соответствии с 152-ФЗ. Обрабатываются только данные аккаунта (email, имя) и телеметрия дронов. Никакой передачи третьим лицам.",
  },
];

// Хук для анимации счётчика при попадании в viewport
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / duration, 1);
          setCount(Math.round(p * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { count, ref };
}

export default function LandingPage({ onNavigate }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPromo, setShowPromo] = useState(false);
  const [promoShown, setPromoShown] = useState(false);

  // Pop-up через 12 сек для посетителя (мероприятие по привлечению)
  useEffect(() => {
    if (promoShown) return;
    const t = setTimeout(() => { setShowPromo(true); setPromoShown(true); }, 12000);
    return () => clearTimeout(t);
  }, [promoShown]);

  const { count: missionsCount, ref: missionsRef } = useCountUp(1247);
  const { count: hoursCount,    ref: hoursRef }    = useCountUp(3840);
  const { count: accuracyCount, ref: accuracyRef } = useCountUp(974);

  return (
    <div className="min-h-screen grid-bg">

      {/* ── Pop-up: мероприятие по привлечению ── */}
      {showPromo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md panel rounded-2xl p-6 fade-up"
            style={{ border: "1px solid rgba(0,212,255,0.3)" }}>
            <button onClick={() => setShowPromo(false)}
              className="absolute top-4 right-4 btn-ghost p-1.5 rounded-lg">
              <Icon name="X" size={16} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,212,255,0.15)" }}>
                <Icon name="Zap" size={20} style={{ color: "var(--electric)" }} />
              </div>
              <div>
                <div className="font-bold text-sm">Бесплатный доступ</div>
                <div className="hud-label">Только сейчас — без ограничений</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Зарегистрируйтесь прямо сейчас и получите полный доступ к командному центру SoloFly —
              все модули, все дроны, весь ИИ. Бесплатно и без карты.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setShowPromo(false); onNavigate("dashboard"); }}
                className="btn-electric flex-1 py-2.5 rounded-lg text-sm font-semibold">
                Начать бесплатно →
              </button>
              <button onClick={() => setShowPromo(false)}
                className="btn-ghost px-4 py-2.5 rounded-lg text-sm">
                Позже
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="relative radar-bg overflow-hidden px-6 pt-28 pb-24 max-w-6xl mx-auto text-center fade-up">
        <div className="absolute inset-x-0 top-0 h-64 overflow-hidden pointer-events-none">
          <div className="scan-line" />
        </div>

        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full panel-glow text-xs font-semibold tracking-widest uppercase">
          <span className="dot-online" />
          <span style={{ color: "var(--electric)" }}>Система активна · v2.4.1</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
          <span className="gradient-text">SoloFly</span><br />
          <span className="text-4xl md:text-5xl font-normal" style={{ color: "hsl(var(--muted-foreground))" }}>
            БПЛА летит. Сам. Всегда.
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
          Автономная система управления дроном на базе ИИ — планирует маршруты, управляет полётом,
          анализирует среду и самообучается после каждой миссии. Без оператора.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
          <button onClick={() => onNavigate("dashboard")}
            className="btn-electric px-8 py-3.5 rounded-lg text-sm font-bold">
            Запустить систему →
          </button>
          <button className="btn-ghost px-8 py-3.5 rounded-lg text-sm">
            Смотреть демо полёт
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

      {/* ── Возможности ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-electric mb-4">Возможности системы</div>
          <h2 className="text-4xl font-bold mb-4">
            Полная автономность —<br /><span className="gradient-text">не маркетинг, а факт</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            SoloFly принимает все решения самостоятельно. От взлёта до посадки.
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
              <div className="tag tag-green mb-4">Самообучение</div>
              <h2 className="text-3xl font-bold mb-4">Каждый полёт делает систему умнее</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                После завершения миссии бортовой ИИ анализирует принятые решения, сравнивает с оптимальными траекториями и обновляет нейронную сеть. Без разметчиков, без датасетов, без инженеров.
              </p>
              <div className="space-y-3">
                {["Обнаружение паттернов в новых средах", "Улучшение точности при повторных миссиях", "Адаптация к погодным условиям", "Оптимизация расхода заряда АКБ"].map((f) => (
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

      {/* ── Отзывы ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-green mb-4">Отзывы клиентов</div>
          <h2 className="text-4xl font-bold mb-3">Что говорят операторы</h2>
          <p className="text-muted-foreground">Реальные результаты от реальных клиентов</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <article key={t.name} className="panel rounded-2xl p-6 flex flex-col gap-4"
              itemScope itemType="https://schema.org/Review">
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} style={{ color: "#eab308", fontSize: 16 }}>★</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1" itemProp="reviewBody">
                «{t.text}»
              </p>
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: "rgba(0,212,255,0.15)", color: "var(--electric)" }}>
                  {t.name.charAt(0)}
                </div>
                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                  <div className="font-semibold text-xs" itemProp="name">{t.name}</div>
                  <div className="hud-label">{t.role} · {t.org}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 max-w-3xl mx-auto" itemScope itemType="https://schema.org/FAQPage">
        <div className="text-center mb-12">
          <div className="tag tag-electric mb-4">Вопросы и ответы</div>
          <h2 className="text-4xl font-bold">Часто задаваемые вопросы</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="panel rounded-xl overflow-hidden"
              itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-80"
              >
                <span className="font-semibold text-sm pr-4" itemProp="name">{f.q}</span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className="shrink-0 transition-transform"
                  style={{
                    color: "var(--electric)",
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed"
                  itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA финальный ── */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <div className="panel-glow rounded-2xl p-12">
          <div className="tag tag-electric mb-6 mx-auto" style={{ width: "fit-content" }}>Бесплатно</div>
          <h2 className="text-4xl font-bold mb-4">Готовы к первому автономному полёту?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Зарегистрируйтесь за 30 секунд. Полный доступ ко всем модулям — командный центр,
            управление полётом, ИИ-ядро, рой БПЛА. Карта не нужна.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate("dashboard")}
              className="btn-electric px-10 py-4 rounded-lg font-bold text-sm">
              Начать бесплатно →
            </button>
            <a href="/?privacy=1" target="_blank" rel="noopener noreferrer"
              className="btn-ghost px-6 py-4 rounded-lg text-sm flex items-center justify-center gap-2">
              <Icon name="Shield" size={14} /> Политика конфиденциальности
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--electric)" }}>
              <Icon name="Navigation" size={14} style={{ color: "hsl(210 25% 4%)" }} />
            </div>
            <span className="font-bold text-sm tracking-tight">Solo<span className="gradient-text">Fly</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap justify-center">
            <a href="/?privacy=1" target="_blank" rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1">
              <Icon name="Shield" size={11} /> Конфиденциальность
            </a>
            <span>·</span>
            <span>152-ФЗ соблюдён</span>
            <span>·</span>
            <a href="https://mat-labs.ru" target="_blank" rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity" style={{ color: "var(--electric)" }}>
              ООО МАТ-Лабс
            </a>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} mat-labs.ru
          </div>
        </div>
      </footer>
    </div>
  );
}
