import Icon from "@/components/ui/icon";

interface HeroUseCasesProps {
  onNavigate: (p: string) => void;
}

export default function HeroUseCases({ onNavigate }: HeroUseCasesProps) {
  return (
    <>
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
            { icon: "Factory",  industry: "Нефтегаз",      title: "Мониторинг объектов",  desc: "Автономный облёт трубопроводов и технологических площадок с автоматическим формированием отчётов.", stat: "−70%", statLabel: "времени инспекции" },
            { icon: "Zap",      industry: "Энергетика",    title: "Инспекция ЛЭП",        desc: "Патрулирование линий электропередачи сотнями километров без наземных бригад.", stat: "×4", statLabel: "скорость охвата" },
            { icon: "Wheat",    industry: "Агрохолдинги",  title: "Агромониторинг",        desc: "Картографирование угодий и мониторинг посевов по данным компьютерного зрения.", stat: "10к га", statLabel: "за 4 часа" },
            { icon: "Building2",industry: "Строительство", title: "Инспекция объектов",   desc: "Еженедельный облёт стройки, автоматическое 3D-моделирование и сравнение с проектом.", stat: "3D", statLabel: "модель автоматически" },
            { icon: "Shield",   industry: "Безопасность",  title: "Патрулирование",       desc: "Автономное охранное патрулирование периметра с детекцией вторжений.", stat: "24/7", statLabel: "без оператора" },
            { icon: "Map",      industry: "Геодезия",      title: "Картографирование",     desc: "Аэрофотосъёмка и создание ортофотопланов с сантиметровой точностью.", stat: "±3 см", statLabel: "точность" },
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
            { icon: "Brain",       title: "Адаптивное дообучение",    desc: "Контролируемое дообучение на основе накопленных телеметрических данных с последующей валидацией модели.", color: "var(--electric)",      tag: "ИИ-ядро"     },
            { icon: "Route",       title: "Планирование маршрутов",   desc: "Алгоритм строит маршруты с учётом рельефа, запретных зон и погодных условий в реальном времени.", color: "var(--signal-green)",  tag: "Навигация"   },
            { icon: "Eye",         title: "Компьютерное зрение",      desc: "Распознавание объектов и препятствий в реальном времени. В лабораторных тестах точность — 97.4%.", color: "var(--electric)",      tag: "CV"          },
            { icon: "Cpu",         title: "Бортовые вычисления",      desc: "Алгоритмы принятия решений выполняются на борту, снижая зависимость от канала связи. Отклик < 15 мс.", color: "var(--signal-green)",  tag: "Edge AI"    },
            { icon: "ShieldCheck", title: "Сценарии потери связи",    desc: "Верификация поведения системы при деградации канала — одно из ключевых направлений НИОКР.", color: "var(--electric)",      tag: "Надёжность"  },
            { icon: "Activity",    title: "Телеметрия и мониторинг",  desc: "Сбор и визуализация 300+ параметров в реальном времени. Основа обучающей выборки.", color: "var(--signal-green)",  tag: "Аналитика"   },
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
