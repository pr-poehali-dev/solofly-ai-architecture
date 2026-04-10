import { useState } from "react";
import Icon from "@/components/ui/icon";

const plans = [
  {
    id: "start",
    name: "Старт",
    price: 990,
    period: "мес",
    features: ["5 пользователей", "10 ГБ хранилища", "100K API запросов/мес", "Email поддержка", "Базовая аналитика"],
    color: "var(--neon-cyan)",
    current: false,
  },
  {
    id: "business",
    name: "Бизнес",
    price: 3490,
    period: "мес",
    features: ["50 пользователей", "100 ГБ хранилища", "1M API запросов/мес", "Приоритетная поддержка", "Продвинутая аналитика", "Экспорт PDF/CSV/XLSX", "Webhooks"],
    color: "var(--neon-purple)",
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    period: "индивид.",
    features: ["Безлимит пользователей", "Безлимит хранилища", "SLA 99.99%", "Персональный менеджер", "On-premise вариант", "SSO / SAML", "Кастомный договор"],
    color: "var(--neon-pink)",
    current: false,
  },
];

const addons = [
  { name: "Дополнительные API запросы", desc: "+500K запросов/мес", price: "490 ₽", active: false },
  { name: "Расширенное хранилище", desc: "+50 ГБ", price: "290 ₽", active: true },
  { name: "Белый лейбл", desc: "Брендирование платформы", price: "1 990 ₽", active: false },
  { name: "Приоритетная очередь", desc: "API без ограничений скорости", price: "890 ₽", active: false },
];

export default function SubscriptionsPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black">Управление подпиской</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Текущий план: <span className="text-purple-400 font-semibold">Бизнес</span> · Следующее списание 15 мая 2026</p>
        </div>
        <button className="glass-card px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
          <Icon name="FileDown" size={14} />
          Скачать счёт
        </button>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Ежемесячно</span>
        <button
          onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
          className={`w-12 h-6 rounded-full transition-all duration-300 relative ${billing === "yearly" ? "" : "bg-white/15"}`}
          style={billing === "yearly" ? { background: "var(--neon-purple)" } : {}}
        >
          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${billing === "yearly" ? "left-7" : "left-1"}`} />
        </button>
        <span className={`text-sm font-medium ${billing === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
          Ежегодно
          <span className="ml-1.5 badge-pill bg-green-500/15 text-green-400">-20%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`glass-card rounded-2xl p-6 relative flex flex-col border transition-all ${p.current ? "border-purple-500/50 glow-purple" : "border-border"}`}
          >
            {p.current && (
              <div className="absolute -top-3 left-5">
                <span className="badge-pill" style={{ background: "var(--neon-purple)", color: "white" }}>Текущий</span>
              </div>
            )}
            <div className="mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${p.color}20` }}>
                <Icon name="Package" size={16} style={{ color: p.color }} />
              </div>
              <div className="text-lg font-black">{p.name}</div>
              <div className="mt-2">
                {p.price ? (
                  <span className="text-3xl font-black">
                    {billing === "yearly" ? Math.round(p.price * 0.8) : p.price} ₽
                    <span className="text-sm text-muted-foreground font-normal">/{p.period}</span>
                  </span>
                ) : (
                  <span className="text-2xl font-black">По запросу</span>
                )}
              </div>
            </div>
            <ul className="space-y-2 flex-1 mb-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={13} style={{ color: p.color }} className="shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${p.current ? "bg-white/10 text-muted-foreground cursor-default" : "gradient-btn"}`}
              disabled={p.current}
            >
              {p.current ? "Активный тариф" : p.price ? "Перейти на тариф" : "Связаться с нами"}
            </button>
          </div>
        ))}
      </div>

      {/* Add-ons */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-bold mb-5">Дополнения и надстройки</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addons.map((a) => (
            <div key={a.name} className="flex items-center justify-between p-4 rounded-xl bg-white/4 hover:bg-white/6 transition-all">
              <div>
                <div className="font-medium text-sm">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-muted-foreground">{a.price}</span>
                <button
                  className={`w-10 h-5 rounded-full transition-all duration-300 relative ${a.active ? "" : "bg-white/15"}`}
                  style={a.active ? { background: "var(--neon-purple)" } : {}}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-300 ${a.active ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel */}
      <div className="glass-card rounded-2xl p-6 border border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-red-400">Отменить подписку</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Доступ сохранится до конца оплаченного периода</p>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all">
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
}
