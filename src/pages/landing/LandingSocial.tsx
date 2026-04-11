import { useState } from "react";
import Icon from "@/components/ui/icon";
import { testimonials, faqs } from "./landingData";

const PLANS = [
  {
    id: "pro", name: "Про", price_month: 2900, price_year: 24900, popular: true,
    features: ["5 дронов", "Неограниченные миссии", "ИИ-ядро", "Управление роем", "Сканирование", "История полётов"],
  },
  {
    id: "team", name: "Команда", price_month: 7900, price_year: 69900, popular: false,
    features: ["20 дронов", "Совместная работа", "API доступ", "Мониторинг и отчёты", "Приоритетная поддержка", "Все функции Про"],
  },
  {
    id: "enterprise", name: "Enterprise", price_month: 49000, price_year: 0, popular: false,
    features: ["Без ограничений", "On-premise", "SLA 99.9%", "Выделенный менеджер", "Кастомная интеграция", "Обучение команды"],
  },
];

interface LandingSocialProps {
  onNavigate: (p: string) => void;
}

export default function LandingSocial({ onNavigate }: LandingSocialProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [period, setPeriod]   = useState<"month" | "year">("month");

  return (
    <>
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

      {/* ── Тарифы ── */}
      <section id="pricing" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="tag tag-electric mb-4">Тарифы</div>
          <h2 className="text-4xl font-bold mb-3">Простые и прозрачные цены</h2>
          <p className="text-muted-foreground">Платите только за то, что используете. Отмена в любой момент.</p>
        </div>

        {/* Переключатель период */}
        <div className="flex justify-center mb-8">
          <div className="flex p-1 rounded-xl" style={{ background: "hsl(var(--input))" }}>
            <button
              onClick={() => setPeriod("month")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${period === "month" ? "btn-electric" : "text-muted-foreground hover:text-foreground"}`}
            >
              Месяц
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${period === "year" ? "btn-electric" : "text-muted-foreground hover:text-foreground"}`}
            >
              Год
              <span className="tag tag-green" style={{ fontSize: 9 }}>−30%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const price = period === "year" && plan.price_year > 0 ? plan.price_year : plan.price_month;
            const isEnterprise = plan.id === "enterprise";
            return (
              <div key={plan.id}
                className="panel rounded-2xl p-6 flex flex-col transition-all"
                style={{
                  border: plan.popular
                    ? "1px solid rgba(0,212,255,0.4)"
                    : "1px solid hsl(var(--border))",
                  boxShadow: plan.popular ? "0 0 32px rgba(0,212,255,0.07)" : undefined,
                  position: "relative",
                }}
              >
                {plan.popular && (
                  <div className="tag tag-electric mb-3" style={{ width: "fit-content" }}>Популярный</div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <div className="mb-5">
                  {isEnterprise ? (
                    <div className="text-2xl font-bold">По запросу</div>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">{price.toLocaleString("ru-RU")} ₽</span>
                      <span className="text-muted-foreground text-sm ml-1">
                        / {period === "year" ? "год" : "мес"}
                      </span>
                      {period === "year" && plan.price_year > 0 && (
                        <div className="text-xs mt-1" style={{ color: "var(--signal-green)" }}>
                          Экономия {(plan.price_month * 12 - plan.price_year).toLocaleString("ru-RU")} ₽
                        </div>
                      )}
                    </>
                  )}
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Icon name="Check" size={13} style={{ color: "var(--signal-green)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${plan.popular ? "btn-electric" : "btn-ghost"}`}
                  style={!plan.popular ? { border: "1px solid hsl(var(--border))" } : undefined}
                >
                  {isEnterprise ? "Связаться с нами" : "Начать →"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Безопасная оплата через ЮKassa · SSL шифрование · Отмена в любое время
        </p>
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
              <strong className="text-foreground">SoloFly</strong> — программная платформа для автономного управления БПЛА (беспилотными летательными аппаратами), разработанная российской компанией ООО «МАТ-Лабс». Система позволяет эксплуатировать дроны без постоянного участия оператора: планирует маршруты, выполняет полёты, анализирует данные и самообучается после каждой миссии.
            </p>
            <p>
              Платформа создана для профессиональных применений: мониторинг объектов, патрулирование территорий, аэрофотосъёмка, картографирование, инспекция инфраструктуры. Работает с дронами на базе Ardupilot и PX4 через протокол MAVLink.
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
            { name: "Михаил Антонов", role: "CEO, сооснователь", area: "Стратегия, авиационное право, бизнес-развитие", icon: "User" },
            { name: "Алина Тихова", role: "CTO, сооснователь", area: "Архитектура системы, MAVLink-интеграция, бортовое ПО", icon: "Code" },
            { name: "Дмитрий Ершов", role: "Lead ML Engineer", area: "ИИ-ядро, компьютерное зрение, алгоритмы планирования", icon: "Brain" },
            { name: "Наталья Федосова", role: "Head of Product", area: "UX, тестирование с клиентами, конструктор БПЛА", icon: "Layers" },
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
    </>
  );
}