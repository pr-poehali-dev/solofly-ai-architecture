import Icon from "@/components/ui/icon";

export default function LandingInfo() {
  return (
    <>
      {/* ── НИОКР ── */}
      <section id="rnd" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-green mb-4">НИОКР · 2026</div>
          <h2 className="text-4xl font-bold mb-4">Научно-исследовательские работы</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            В 2026 году ООО «МАТ-Лабс» приступило к выполнению НИОКР по созданию экспериментального образца программного комплекса автономного управления БПЛА нового поколения.
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
          ].map(item => (
            <div key={item.num} className="panel rounded-2xl p-6"
              style={{ border: `1px solid ${item.color}22` }}>
              <div className="flex items-start gap-4">
                <span className="text-2xl font-bold shrink-0" style={{ color: item.color }}>{item.num}</span>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-sm">{item.title}</span>
                    <span className="tag text-xs px-2 py-0.5 rounded-md"
                      style={{
                        background: `${item.color}14`,
                        color: item.color,
                        border: `1px solid ${item.color}33`,
                        fontSize: 9,
                      }}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed"
          style={{ border: "1px solid rgba(0,255,136,0.15)", background: "rgba(0,255,136,0.02)" }}>
          <strong className="text-foreground block mb-1">Цель НИОКР</strong>
          Создание экспериментального образца программного комплекса, обеспечивающего автономное выполнение полётных миссий БПЛА с минимизацией операторской нагрузки и соответствием требованиям безопасности воздушного пространства РФ.
        </div>
      </section>

      {/* ── О проекте ── */}
      <section id="about" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-electric mb-4">О проекте</div>
          <h2 className="text-4xl font-bold mb-4">Что такое SoloFly</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">SoloFly</strong> — экспериментальная программная платформа для управления БПЛА (беспилотными летательными аппаратами) с минимизацией операторской нагрузки, разработанная российской компанией ООО «МАТ-Лабс». Система планирует маршруты, выполняет полёты, анализирует телеметрические данные и адаптирует модели принятия решений на основе накопленного опыта.
            </p>
            <p>
              Платформа ориентирована на профессиональные применения: мониторинг объектов, патрулирование территорий, аэрофотосъёмка, картографирование, инспекция инфраструктуры. Работает с дронами на базе Ardupilot и PX4 через протокол MAVLink v2.
            </p>
            <p>
              Проект основан в 2026 году и находится в стадии активной разработки. Платформа запущена в режиме открытого бета-тестирования — первые пользователи уже подключают реальные дроны и тестируют автономные сценарии полётов.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Год основания", val: "2026" },
              { label: "Правовая форма", val: "ООО «МАТ-Лабс»" },
              { label: "Страна", val: "Россия" },
              { label: "Поддерживаемые прошивки", val: "Ardupilot, PX4" },
              { label: "Протокол связи", val: "MAVLink v2" },
              { label: "Соответствие законодательству", val: "152-ФЗ, Воздушный кодекс РФ" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 px-4 panel rounded-xl">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold">{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Технология ── */}
      <section id="technology" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-green mb-4">Технология</div>
          <h2 className="text-4xl font-bold mb-4">Как это работает</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            SoloFly — это облачная система, которая получает телеметрию с борта дрона, обрабатывает её в реальном времени и отправляет управляющие команды обратно. Все вычисления критического пути выполняются на борту.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: "Cpu",
              title: "Бортовой модуль",
              color: "var(--electric)",
              items: [
                "Полётный контроллер Pixhawk / Cube Orange",
                "Ardupilot или PX4 в качестве прошивки",
                "Onboard-компьютер Raspberry Pi / Jetson Nano",
                "MAVLink v2 для обмена телеметрией",
                "Передача данных по 4G/LTE или радиоканалу",
              ],
            },
            {
              icon: "Cloud",
              title: "Облачная платформа",
              color: "var(--signal-green)",
              items: [
                "Приём и хранение телеметрии в реальном времени",
                "ИИ-ядро: планирование маршрутов и миссий",
                "Компьютерное зрение: обнаружение объектов 97.4%",
                "Управление роем: координация нескольких БПЛА",
                "REST API и MAVLink-прокси для интеграций",
              ],
            },
            {
              icon: "Monitor",
              title: "Командный центр",
              color: "var(--warning)",
              items: [
                "Веб-интерфейс без установки ПО",
                "Live-карта с позициями всех дронов",
                "Телеметрия: заряд, скорость, высота, курс",
                "Конструктор миссий с waypoint-маршрутами",
                "Журнал полётов и архив данных",
              ],
            },
          ].map(block => (
            <div key={block.title} className="panel rounded-2xl p-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${block.color}14` }}>
                <Icon name={block.icon} fallback="Cpu" size={18} style={{ color: block.color }} />
              </div>
              <h3 className="font-bold text-sm mb-3">{block.title}</h3>
              <ul className="space-y-2">
                {block.items.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-snug">
                    <Icon name="ChevronRight" size={12} className="shrink-0 mt-0.5" style={{ color: block.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="panel rounded-2xl p-6 text-sm leading-relaxed text-muted-foreground"
          style={{ border: "1px solid rgba(0,212,255,0.15)" }}>
          <strong className="text-foreground block mb-2">Стек технологий</strong>
          Frontend: React, TypeScript, Vite. Backend: Python 3.11, облачные функции. База данных: PostgreSQL. Карты: Leaflet + OpenStreetMap. Телеметрия: MAVLink 2, pymavlink. ИИ-ядро: PyTorch, ONNX Runtime. Хранилище: S3-совместимое объектное хранилище. Оплата: ЮKassa (54-ФЗ).
        </div>
      </section>

      {/* ── Команда ── */}
      <section id="team" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-electric mb-4">Команда</div>
          <h2 className="text-4xl font-bold mb-4">Кто создаёт SoloFly</h2>
          <p className="text-muted-foreground text-sm">ООО «МАТ-Лабс» — российская технологическая компания, специализирующаяся на автономных системах и ИИ</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { name: "Тюрин Максим", role: "Генеральный директор, CEO, сооснователь", area: "Стратегия, авиационное право, бизнес-развитие", icon: "User" },
            { name: "Тюрин Александр", role: "CTO, сооснователь", area: "Архитектура системы, MAVLink-интеграция, бортовое ПО", icon: "Code" },
            { name: "Петрушкин Олег", role: "Lead ML Engineer", area: "ИИ-ядро, компьютерное зрение, алгоритмы планирования", icon: "Brain" },
            { name: "Красильников Данила", role: "Head of Product", area: "UX, тестирование с клиентами, конструктор БПЛА", icon: "Layers" },
          ].map(member => (
            <div key={member.name} className="panel rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Icon name={member.icon} fallback="User" size={20} style={{ color: "var(--electric)" }} />
              </div>
              <div className="font-bold text-sm mb-0.5">{member.name}</div>
              <div className="text-xs mb-2" style={{ color: "var(--electric)" }}>{member.role}</div>
              <div className="text-xs text-muted-foreground leading-snug">{member.area}</div>
            </div>
          ))}
        </div>
        <div className="panel rounded-2xl p-6 text-sm text-muted-foreground leading-relaxed"
          style={{ border: "1px solid rgba(0,255,136,0.12)", background: "rgba(0,255,136,0.02)" }}>
          <strong className="text-foreground block mb-2">О компании</strong>
          ООО «МАТ-Лабс» зарегистрировано в России. Команда включает инженеров в области встраиваемых систем, машинного обучения и авиационной электроники. Мы не используем зарубежные облачные сервисы для хранения данных клиентов — вся инфраструктура размещена на серверах в РФ.
        </div>
      </section>

      {/* ── Контакты ── */}
      <section id="contacts" className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-green mb-4">Контакты</div>
          <h2 className="text-4xl font-bold mb-4">Свяжитесь с нами</h2>
          <p className="text-muted-foreground text-sm">Для вопросов по платформе, партнёрству или корпоративным внедрениям</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: "MessageCircle",
              title: "Telegram-сообщество",
              desc: "Обсуждение платформы, помощь от других пользователей, анонсы обновлений",
              link: "https://t.me/+QgiLIa1gFRY4Y2Iy",
              linkLabel: "Открыть в Telegram",
              color: "var(--electric)",
            },
            {
              icon: "HelpCircle",
              title: "Центр поддержки",
              desc: "Тикетная система для технических вопросов, багов и предложений по продукту",
              link: "https://poehali.dev/help",
              linkLabel: "Написать в поддержку",
              color: "var(--signal-green)",
            },
            {
              icon: "Building2",
              title: "Корпоративные запросы",
              desc: "Enterprise-внедрения, on-premise установка, кастомные интеграции, SLA",
              link: "https://mat-labs.ru",
              linkLabel: "mat-labs.ru",
              color: "var(--warning)",
            },
          ].map(c => (
            <div key={c.title} className="panel rounded-2xl p-5 flex flex-col">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${c.color}14` }}>
                <Icon name={c.icon} fallback="Mail" size={18} style={{ color: c.color }} />
              </div>
              <div className="font-bold text-sm mb-2">{c.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{c.desc}</div>
              <a href={c.link} target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: c.color }}>
                {c.linkLabel} <Icon name="ExternalLink" size={10} />
              </a>
            </div>
          ))}
        </div>
        <div className="panel rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed"
          style={{ border: "1px solid hsl(var(--border))" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong className="text-foreground block mb-1">Юридическое лицо</strong>
              ООО «МАТ-Лабс», Россия<br />
              Сайт: <a href="https://mat-labs.ru" target="_blank" rel="noopener noreferrer"
                className="hover:opacity-80" style={{ color: "var(--electric)" }}>mat-labs.ru</a>
            </div>
            <div>
              <strong className="text-foreground block mb-1">Соответствие требованиям</strong>
              Федеральный закон № 152-ФЗ «О персональных данных»<br />
              Воздушный кодекс Российской Федерации<br />
              Приказ Минтранса РФ № 494 (регистрация БПЛА)
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
