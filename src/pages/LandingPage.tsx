import Icon from "@/components/ui/icon";

interface Props { onNavigate: (p: string) => void; }

const capabilities = [
  { icon: "Brain", title: "Непрерывное самообучение", desc: "ИИ-ядро обновляет модели после каждого полёта — без ручной разметки данных и участия оператора.", color: "var(--electric)" },
  { icon: "Radar", title: "Автономное планирование миссий", desc: "Система самостоятельно строит маршруты с учётом рельефа, запретных зон, погоды и целей задания.", color: "var(--signal-green)" },
  { icon: "Eye", title: "Компьютерное зрение 360°", desc: "Реалтайм распознавание объектов, препятствий и целей с точностью 97.4% на скорости 120+ км/ч.", color: "var(--electric)" },
  { icon: "Cpu", title: "Бортовой ИИ-процессор", desc: "Все вычисления на борту — нет задержки на передачу данных. Полная автономность при потере связи.", color: "var(--signal-green)" },
  { icon: "Shield", title: "Отказоустойчивость", desc: "Тройное резервирование критических узлов. При любой аварии система выполняет безопасную посадку.", color: "var(--electric)" },
  { icon: "Activity", title: "Телеметрия в реальном времени", desc: "300+ параметров полёта, состояния систем и ИИ-модели. Экспорт в CSV, PDF, JSON.", color: "var(--signal-green)" },
];

const stats = [
  { val: "97.4%", label: "Точность распознавания" },
  { val: "< 12ms", label: "Латентность решений" },
  { val: "0", label: "Операторов требуется" },
  { val: "∞", label: "Циклов самообучения" },
];

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen grid-bg">
      {/* Hero */}
      <section className="relative radar-bg overflow-hidden px-6 pt-28 pb-24 max-w-6xl mx-auto text-center fade-up">
        {/* Scan line */}
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

        <div className="flex items-center justify-center gap-4 mb-16">
          <button onClick={() => onNavigate("dashboard")} className="btn-electric px-8 py-3.5 rounded-lg text-sm">
            Запустить систему →
          </button>
          <button className="btn-ghost px-8 py-3.5 rounded-lg text-sm">
            Смотреть демо полёт
          </button>
        </div>

        {/* Drone SVG schematic */}
        <div className="relative w-64 h-64 mx-auto mb-16">
          <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(0,212,255,0.12)", animation: "droneSpin 20s linear infinite" }} />
          <div className="absolute inset-4 rounded-full" style={{ border: "1px dashed rgba(0,212,255,0.08)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center panel-glow">
              <Icon name="Navigation" size={40} style={{ color: "var(--electric)" }} />
            </div>
          </div>
          {/* Corner rotors */}
          {["-top-2 -left-2", "-top-2 -right-2", "-bottom-2 -left-2", "-bottom-2 -right-2"].map((pos, i) => (
            <div key={i} className={`absolute ${pos} w-8 h-8 rounded-full flex items-center justify-center`} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
              <div className="w-3 h-3 rounded-full" style={{ background: "var(--electric)", boxShadow: "0 0 8px var(--electric)" }} />
            </div>
          ))}
          {/* Orbit dot */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ background: "var(--signal-green)", boxShadow: "0 0 8px var(--signal-green)" }} />
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

      {/* Capabilities */}
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
            <div key={c.title} className="panel p-6 rounded-xl hover:border-[rgba(0,212,255,0.2)] transition-all group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${c.color}15` }}>
                <Icon name={c.icon} fallback="Cpu" size={20} style={{ color: c.color }} />
              </div>
              <h3 className="font-semibold mb-2 text-sm">{c.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI learning loop */}
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
                { step: "01", label: "Полёт", desc: "Система выполняет миссию" },
                { step: "02", label: "Сбор данных", desc: "Телеметрия + видео + решения" },
                { step: "03", label: "Анализ ИИ", desc: "Оценка оптимальности траекторий" },
                { step: "04", label: "Обновление модели", desc: "Веса нейросети обновлены" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 panel rounded-xl">
                  <span className="hud-value text-sm" style={{ color: "var(--electric)" }}>{s.step}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                  {i < 3 && <Icon name="ArrowDown" size={14} className="text-muted-foreground" />}
                  {i === 3 && <span className="dot-online" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Готовы к первому автономному полёту?</h2>
        <p className="text-muted-foreground mb-8">Запустите систему и наблюдайте — оператор больше не нужен.</p>
        <button onClick={() => onNavigate("dashboard")} className="btn-electric px-10 py-4 rounded-lg font-bold">
          Войти в систему
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--electric)" }}>
              <Icon name="Navigation" size={14} style={{ color: "hsl(210 25% 4%)" }} />
            </div>
            <span className="font-bold text-sm tracking-tight">Solo<span className="gradient-text">Fly</span></span>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-xs text-muted-foreground">
              Продукт компании{" "}
              <a
                href="https://mat-labs.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-80"
                style={{ color: "var(--electric)" }}
              >
                ООО МАТ-Лабс
              </a>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              © {new Date().getFullYear()} mat-labs.ru · Все права защищены
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}