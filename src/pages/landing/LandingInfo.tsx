import Icon from "@/components/ui/icon";

export default function LandingInfo() {
  return (
    <>
      {/* ── НИОКР ── */}
      <section id="rnd" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-green mb-4">НИОКР · 2026</div>
          <h2 className="text-4xl font-bold mb-4">Научно-исследовательские работы</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            В 2026 году ООО «МАТ-Лабс» приступило к выполнению НИОКР по созданию экспериментального образца
            программного комплекса автономного управления БПЛА нового поколения.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            {
              num: "01",
              title: "Математическая модель адаптивной маршрутизации",
              desc: "Разработка формальной модели планирования траектории с учётом динамически изменяющихся ограничений: рельефа, погодных условий, зон ограничения полётов и технического состояния аппарата.",
              status: "В разработке",
              color: "var(--electric)",
            },
            {
              num: "02",
              title: "Алгоритм автономного принятия решений",
              desc: "Создание алгоритмического ядра, обеспечивающего выбор оптимального действия в нештатных ситуациях без участия оператора. Основа — нейросетевая архитектура с механизмом объяснимости решений.",
              status: "В разработке",
              color: "var(--electric)",
            },
            {
              num: "03",
              title: "Моделирование сценариев потери связи",
              desc: "Систематизация и формализация сценариев деградации канала управления. Разработка и верификация алгоритмов автономного завершения миссии при полном или частичном отсутствии связи.",
              status: "Планируется",
              color: "var(--warning)",
            },
            {
              num: "04",
              title: "Экспериментальная верификация алгоритмов",
              desc: "Стендовые испытания и лётные эксперименты на тестовом полигоне. Сбор статистики и валидация соответствия расчётных показателей реальным результатам.",
              status: "Планируется",
              color: "var(--warning)",
            },
          ].map((item) => (
            <div key={item.num}
              className="rounded-2xl p-6 transition-all hover:scale-[1.01]"
              style={{
                background: `${item.color}05`,
                border: `1px solid ${item.color}20`,
                position: "relative", overflow: "hidden",
              }}>
              <div style={{
                position: "absolute", top: 0, right: 0, width: 100, height: 100,
                background: `radial-gradient(circle at top right, ${item.color}08, transparent 70%)`,
              }} />
              <div className="flex items-start gap-4 relative">
                <span className="text-3xl font-black shrink-0" style={{ color: item.color, opacity: 0.25, lineHeight: 1 }}>
                  {item.num}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-sm">{item.title}</span>
                    <span style={{
                      fontSize: 9, background: `${item.color}14`, color: item.color,
                      border: `1px solid ${item.color}33`, padding: "2px 8px", borderRadius: 99, fontWeight: 700,
                    }}>{item.status}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 text-sm leading-relaxed"
          style={{ border: "1px solid rgba(0,255,136,0.18)", background: "rgba(0,255,136,0.03)" }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.25)" }}>
              <Icon name="Target" size={15} style={{ color: "var(--signal-green)" }} />
            </div>
            <div>
              <strong className="block mb-1" style={{ color: "hsl(var(--foreground))" }}>Цель НИОКР</strong>
              <span style={{ color: "hsl(var(--muted-foreground))" }}>
                Создание экспериментального образца программного комплекса, обеспечивающего автономное выполнение полётных миссий БПЛА с минимизацией операторской нагрузки и соответствием требованиям безопасности воздушного пространства РФ.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── О ПРОЕКТЕ ── */}
      <section id="about" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-electric mb-4">О проекте</div>
          <h2 className="text-4xl font-bold mb-4">Что такое SoloFly</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
            <p>
              <strong style={{ color: "hsl(var(--foreground))" }}>SoloFly</strong> — экспериментальная программная
              платформа для управления БПЛА с минимизацией операторской нагрузки, разработанная ООО «МАТ-Лабс».
              Система планирует маршруты, выполняет полёты, анализирует телеметрию и адаптирует модели принятия
              решений на основе накопленного опыта.
            </p>
            <p>
              Платформа ориентирована на профессиональные применения: мониторинг объектов, патрулирование территорий,
              аэрофотосъёмка, картографирование, инспекция инфраструктуры. Работает с дронами на базе Ardupilot и PX4
              через протокол MAVLink v2.
            </p>
            <p>
              Проект основан в 2026 году и находится в стадии активной разработки. Платформа запущена в режиме
              открытого бета-тестирования — первые пользователи уже подключают реальные дроны и тестируют автономные
              сценарии полётов.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: "Год основания", val: "2026" },
              { label: "Правовая форма", val: "ООО «МАТ-Лабс»" },
              { label: "Страна", val: "Россия" },
              { label: "Поддерживаемые прошивки", val: "Ardupilot, PX4" },
              { label: "Протокол связи", val: "MAVLink v2" },
              { label: "Соответствие", val: "152-ФЗ, Воздушный кодекс РФ" },
            ].map((item) => (
              <div key={item.label}
                className="flex items-center justify-between py-3 px-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{item.label}</span>
                <span className="text-sm font-semibold">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ТЕХНОЛОГИЯ ── */}
      <section id="technology" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-green mb-4">Технология</div>
          <h2 className="text-4xl font-bold mb-4">Как это работает</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            SoloFly — облачная система, получающая телеметрию с борта дрона, обрабатывающая её в реальном времени
            и отправляющая управляющие команды обратно. Все вычисления критического пути выполняются на борту.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: "Cpu", title: "Бортовой модуль", color: "var(--electric)",
              items: [
                "Полётный контроллер Pixhawk / Cube Orange",
                "Ardupilot или PX4 в качестве прошивки",
                "Onboard-компьютер Raspberry Pi / Jetson Nano",
                "MAVLink v2 для обмена телеметрией",
                "Передача данных по 4G/LTE или радиоканалу",
              ],
            },
            {
              icon: "Cloud", title: "Облачная платформа", color: "var(--signal-green)",
              items: [
                "Приём и хранение телеметрии в реальном времени",
                "ИИ-ядро: планирование маршрутов и миссий",
                "Компьютерное зрение: обнаружение объектов 97.4%",
                "Управление роем: координация нескольких БПЛА",
                "REST API и MAVLink-прокси для интеграций",
              ],
            },
            {
              icon: "Monitor", title: "Командный центр", color: "var(--warning)",
              items: [
                "Веб-интерфейс без установки ПО",
                "Live-карта с позициями всех дронов",
                "Телеметрия: заряд, скорость, высота, курс",
                "Конструктор миссий с waypoint-маршрутами",
                "Журнал полётов и архив данных",
              ],
            },
          ].map((block) => (
            <div key={block.title} className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${block.color}14`, border: `1px solid ${block.color}22` }}>
                <Icon name={block.icon} fallback="Cpu" size={18} style={{ color: block.color }} />
              </div>
              <h3 className="font-bold text-sm mb-4">{block.title}</h3>
              <ul className="space-y-2.5">
                {block.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs"
                    style={{ color: "hsl(var(--muted-foreground))" }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${block.color}12` }}>
                      <Icon name="Check" size={9} style={{ color: block.color }} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-xs font-bold tracking-widest uppercase mb-4"
            style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>Технологический стек</div>
          <div className="flex flex-wrap gap-2">
            {[
              "Ardupilot", "PX4", "MAVLink v2", "Pixhawk", "Cube Orange",
              "Jetson Nano", "Raspberry Pi", "Python", "REST API", "4G/LTE",
              "PostgreSQL", "152-ФЗ",
            ].map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: "rgba(0,212,255,0.07)", color: "var(--electric)",
                  border: "1px solid rgba(0,212,255,0.15)",
                }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
