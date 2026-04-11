import { useState } from "react";
import Icon from "@/components/ui/icon";

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

interface LandingPricingProps {
  onNavigate: (p: string) => void;
}

export default function LandingPricing({ onNavigate }: LandingPricingProps) {
  const [period, setPeriod] = useState<"month" | "year">("month");

  return (
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
      <div className="mt-5 panel rounded-xl p-4 text-center text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto"
        style={{ border: "1px solid rgba(0,212,255,0.12)" }}>
        Текущая версия платформы является MVP. В рамках НИОКР 2026 года разрабатывается новое поколение автономного алгоритмического ядра с расширенными возможностями адаптации и верифицированными показателями безопасности.
      </div>
    </section>
  );
}
