import Icon from "@/components/ui/icon";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const features = [
  { icon: "Zap", title: "Молниеносная скорость", desc: "API отвечает за < 50мс. Обрабатываем до 10 млн запросов в день без деградации." },
  { icon: "Shield", title: "Безопасность уровня Enterprise", desc: "SOC 2 Type II, ISO 27001, E2E шифрование, 2FA, SSO и аудит всех действий." },
  { icon: "BarChart3", title: "Аналитика в реальном времени", desc: "Дашборды, воронки, когортный анализ — всё в одном интерфейсе." },
  { icon: "Plug", title: "200+ интеграций", desc: "Slack, Notion, Salesforce, HubSpot и любой REST/GraphQL API через конструктор." },
  { icon: "FileDown", title: "Экспорт в любом формате", desc: "PDF, CSV, XLSX, JSON — автоматически по расписанию или по запросу." },
  { icon: "Headphones", title: "Поддержка 24/7", desc: "Среднее время ответа — 3 минуты. Персональный менеджер в тарифе Enterprise." },
];

const plans = [
  {
    name: "Старт",
    price: "990",
    desc: "Для малого бизнеса",
    features: ["5 пользователей", "10 ГБ хранилища", "API 100к запросов/мес", "Email поддержка"],
    accent: "border-border",
    badge: null,
  },
  {
    name: "Бизнес",
    price: "3 490",
    desc: "Для растущих команд",
    features: ["50 пользователей", "100 ГБ хранилища", "API 1М запросов/мес", "Приоритетная поддержка", "Экспорт PDF/CSV/XLSX"],
    accent: "border-purple-500/50",
    badge: "Популярный",
  },
  {
    name: "Enterprise",
    price: "Индивид.",
    desc: "Для корпораций",
    features: ["Безлимит пользователей", "Безлимит хранилища", "SLA 99.99%", "Персональный менеджер", "On-premise"],
    accent: "border-cyan-500/30",
    badge: null,
  },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen mesh-bg">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 text-center max-w-5xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-8 text-sm text-muted-foreground">
          <span className="pulse-dot"></span>
          Более 14 000 компаний уже на борту
        </div>
        <h1 className="text-6xl font-black leading-tight mb-6">
          Платформа, которая<br />
          <span className="gradient-text">масштабирует бизнес</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          NovaSaaS объединяет аналитику, автоматизацию и интеграции в едином рабочем пространстве. Начните за 5 минут.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className="gradient-btn px-8 py-3.5 rounded-xl font-semibold text-base"
          >
            Начать бесплатно
          </button>
          <button className="glass-card px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/8 transition-all">
            Смотреть демо →
          </button>
        </div>

        {/* Floating stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
          {[
            { val: "99.99%", label: "Uptime SLA" },
            { val: "< 50ms", label: "API латентность" },
            { val: "14K+", label: "Клиентов" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5">
              <div className="text-3xl font-black gradient-text">{s.val}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">Всё что нужно — <span className="gradient-text-pink">в одном месте</span></h2>
          <p className="text-muted-foreground text-lg">Никакого зоопарка сервисов. Один продукт — все инструменты.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="stat-card rounded-2xl">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(168,85,247,0.15)" }}>
                <Icon name={f.icon} fallback="Star" size={20} className="text-purple-400" />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">Прозрачные <span className="gradient-text">тарифы</span></h2>
          <p className="text-muted-foreground">Без скрытых платежей. Отмена в один клик.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`glass-card rounded-2xl p-6 border ${p.accent} relative flex flex-col ${p.badge ? "glow-purple" : ""}`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-pill" style={{ background: "var(--neon-purple)", color: "white" }}>{p.badge}</span>
                </div>
              )}
              <div className="mb-5">
                <div className="text-sm text-muted-foreground mb-1">{p.name}</div>
                <div className="text-4xl font-black mb-1">
                  {p.price !== "Индивид." ? `${p.price}₽` : p.price}
                </div>
                <div className="text-sm text-muted-foreground">{p.desc}</div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm">
                    <Icon name="Check" size={14} className="text-green-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate("subscriptions")}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${p.badge ? "gradient-btn" : "glass-card hover:bg-white/8"}`}
              >
                {p.price === "Индивид." ? "Связаться с нами" : "Выбрать тариф"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="glass-card rounded-3xl p-12 glow-purple border border-purple-500/20">
          <h2 className="text-4xl font-black mb-4">Готовы к запуску?</h2>
          <p className="text-muted-foreground text-lg mb-8">14 дней бесплатно. Без привязки карты.</p>
          <button onClick={() => onNavigate("dashboard")} className="gradient-btn px-10 py-4 rounded-xl font-bold text-lg">
            Создать аккаунт →
          </button>
        </div>
      </section>
    </div>
  );
}