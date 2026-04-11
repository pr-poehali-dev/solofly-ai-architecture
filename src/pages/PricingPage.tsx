import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { billing, type Plan } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const PLAN_ICONS: Record<string, string> = {
  free:       "Zap",
  pro:        "Rocket",
  team:       "Users",
  enterprise: "Building2",
};

const PLAN_COLORS: Record<string, string> = {
  free:       "var(--muted-foreground)",
  pro:        "var(--electric)",
  team:       "var(--signal-green)",
  enterprise: "#a78bfa",
};

function formatPrice(p: number) {
  if (p === 0) return "Бесплатно";
  return `${p.toLocaleString("ru-RU")} ₽`;
}

function formatLimit(n: number, unit: string) {
  return n === -1 ? `Без ограничений (${unit})` : `${n} ${unit}`;
}

interface PricingPageProps {
  onNavigate?: (p: string) => void;
  standalone?: boolean; // true = страница внутри системы, false = лендинг
}

export default function PricingPage({ onNavigate, standalone = true }: PricingPageProps) {
  const { user } = useAuth();
  const [plans,    setPlans]    = useState<Plan[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [billing2, setBilling2] = useState<"month" | "year">("month");
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [myPlanId, setMyPlanId] = useState<string>("free");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    billing.getPlans()
      .then(r => setPlans(r.plans))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user) {
      billing.getMyPlan()
        .then(r => setMyPlanId(r.plan.plan_id))
        .catch(() => {});
    }
  }, [user]);

  const handleUpgrade = async (planId: string) => {
    if (!user) { onNavigate?.("dashboard"); return; }
    if (planId === "enterprise") {
      window.open("mailto:sales@solofly.dev?subject=Enterprise тариф SoloFly", "_blank");
      return;
    }
    setUpgrading(planId);
    setMsg(null);
    try {
      await billing.upgrade(planId, billing2);
      setMyPlanId(planId);
      setMsg({ ok: true, text: `Тариф «${plans.find(p => p.id === planId)?.name}» активирован` });
      setTimeout(() => setMsg(null), 4000);
    } catch {
      setMsg({ ok: false, text: "Ошибка при смене тарифа" });
    } finally {
      setUpgrading(null);
    }
  };

  const yearSaving = (p: Plan) => {
    if (!p.price_month || !p.price_year) return 0;
    return Math.round((1 - p.price_year / (p.price_month * 12)) * 100);
  };

  return (
    <div className={standalone ? "p-6 fade-up max-w-5xl mx-auto" : "px-6 py-20 max-w-5xl mx-auto"}>
      {/* Заголовок */}
      <div className="text-center mb-10">
        {standalone
          ? <h1 className="text-xl font-bold mb-1">Тарифные планы</h1>
          : (
            <>
              <div className="tag tag-electric mb-4">Цены</div>
              <h2 className="text-4xl font-bold mb-3">Простые и честные тарифы</h2>
            </>
          )
        }
        <p className="text-muted-foreground text-sm mt-1">
          Начните бесплатно. Переходите на платный план по мере роста.
        </p>

        {/* Тоггл месяц/год */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className="text-sm" style={{ color: billing2 === "month" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
            Ежемесячно
          </span>
          <button
            onClick={() => setBilling2(b => b === "month" ? "year" : "month")}
            className="relative w-12 h-6 rounded-full transition-all"
            style={{ background: billing2 === "year" ? "var(--electric)" : "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}
          >
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{
                background: "white",
                left: billing2 === "year" ? "calc(100% - 22px)" : "2px",
              }} />
          </button>
          <span className="text-sm flex items-center gap-1.5" style={{ color: billing2 === "year" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
            Ежегодно
            <span className="tag tag-green" style={{ fontSize: 9 }}>−30%</span>
          </span>
        </div>
      </div>

      {/* Сообщение */}
      {msg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm"
          style={{
            background: msg.ok ? "rgba(0,255,136,0.1)" : "rgba(255,59,48,0.1)",
            color:      msg.ok ? "var(--signal-green)"  : "var(--danger)",
            border:     `1px solid ${msg.ok ? "rgba(0,255,136,0.25)" : "rgba(255,59,48,0.2)"}`,
          }}>
          <Icon name={msg.ok ? "CheckCircle" : "AlertCircle"} size={15} />
          {msg.text}
        </div>
      )}

      {/* Карточки планов */}
      {loading
        ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="panel rounded-2xl animate-pulse" style={{ height: 420 }} />)}
          </div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => {
              const color     = PLAN_COLORS[plan.id] ?? "var(--electric)";
              const isCurrent = plan.id === myPlanId;
              const price     = billing2 === "year" && plan.price_year > 0
                ? plan.price_year
                : plan.price_month;
              const saving    = yearSaving(plan);

              return (
                <div
                  key={plan.id}
                  className="panel rounded-2xl p-6 flex flex-col transition-all"
                  style={{
                    border: plan.is_popular
                      ? `2px solid ${color}`
                      : isCurrent
                        ? `1px solid ${color}60`
                        : "1px solid hsl(var(--border))",
                    position: "relative",
                  }}
                >
                  {/* Популярный бейдж */}
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="tag tag-electric px-3 py-1 text-xs font-bold">Популярный</span>
                    </div>
                  )}
                  {isCurrent && !plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="tag tag-green px-3 py-1 text-xs font-bold">Ваш план</span>
                    </div>
                  )}

                  {/* Иконка и название */}
                  <div className="flex items-center gap-3 mb-4 mt-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18` }}>
                      <Icon name={PLAN_ICONS[plan.id] ?? "Zap"} fallback="Zap" size={18} style={{ color }} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{plan.name}</div>
                      <div className="hud-label" style={{ fontSize: 9 }}>
                        {plan.id === "enterprise" ? "Индивидуально" : plan.max_drones === -1 ? "Без ограничений" : `до ${plan.max_drones} дронов`}
                      </div>
                    </div>
                  </div>

                  {/* Цена */}
                  <div className="mb-1">
                    <span className="text-3xl font-bold" style={{ color }}>
                      {plan.id === "enterprise" ? "от 49 000 ₽" : formatPrice(price)}
                    </span>
                    {price > 0 && plan.id !== "enterprise" && (
                      <span className="text-xs text-muted-foreground ml-1">
                        /{billing2 === "year" ? "год" : "мес"}
                      </span>
                    )}
                  </div>
                  {billing2 === "year" && saving > 0 && (
                    <div className="text-xs mb-4" style={{ color: "var(--signal-green)" }}>
                      Экономия {saving}% · {(plan.price_month * 12 - plan.price_year).toLocaleString("ru-RU")} ₽/год
                    </div>
                  )}

                  {/* Лимиты */}
                  <div className="space-y-1 mb-4 pb-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="Navigation" size={11} style={{ color }} />
                      {formatLimit(plan.max_drones, "дронов")}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="Target" size={11} style={{ color }} />
                      {plan.max_missions === -1 ? "Неограниченные миссии" : `${plan.max_missions} миссий/мес`}
                    </div>
                  </div>

                  {/* Фичи */}
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Icon name="CheckCircle" size={12} style={{ color, flexShrink: 0, marginTop: 1 }} />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Кнопка */}
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || upgrading === plan.id}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    style={
                      isCurrent
                        ? { background: `${color}15`, color, cursor: "default", border: `1px solid ${color}30` }
                        : plan.is_popular
                          ? { background: color, color: "hsl(210 25% 4%)" }
                          : { background: `${color}15`, color, border: `1px solid ${color}30` }
                    }
                  >
                    {upgrading === plan.id
                      ? <><Icon name="Loader" size={13} className="animate-spin" /> Активируем…</>
                      : isCurrent
                        ? <><Icon name="CheckCircle" size={13} /> Текущий план</>
                        : plan.id === "enterprise"
                          ? <><Icon name="Mail" size={13} /> Связаться с нами</>
                          : plan.id === "free"
                            ? <><Icon name="ArrowDown" size={13} /> Перейти на Старт</>
                            : <><Icon name="Rocket" size={13} /> Выбрать план</>
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Сравнительная таблица краткая */}
      <div className="mt-10 panel rounded-2xl p-6">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Icon name="BarChart2" size={15} style={{ color: "var(--electric)" }} />
          Все планы включают
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "Shield",    text: "Хранение данных в РФ (152-ФЗ)" },
            { icon: "Lock",      text: "Шифрование и безопасность" },
            { icon: "Headphones",text: "Техническая поддержка" },
            { icon: "RefreshCw", text: "Обновления без доплат" },
          ].map(i => (
            <div key={i.text} className="flex items-start gap-2 text-xs">
              <Icon name={i.icon} fallback="Check" size={13} style={{ color: "var(--signal-green)", flexShrink: 0, marginTop: 1 }} />
              <span className="text-muted-foreground">{i.text}</span>
            </div>
          ))}
        </div>
      </div>

      {!user && onNavigate && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          Уже есть аккаунт?{" "}
          <button onClick={() => onNavigate("dashboard")} className="underline" style={{ color: "var(--electric)" }}>
            Войти
          </button>
        </p>
      )}
    </div>
  );
}
