import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { billing, type Plan } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface PaywallPageProps {
  onSuccess?: () => void;
}

export default function PaywallPage({ onSuccess }: PaywallPageProps) {
  const { user } = useAuth();
  const [plans, setPlans]         = useState<Plan[]>([]);
  const [period, setPeriod]       = useState<"month" | "year">("month");
  const [loading, setLoading]     = useState(true);
  const [paying, setPaying]       = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    billing.getPlans()
      .then(r => setPlans(r.plans.filter(p => p.id !== "free")))
      .catch(() => setError("Не удалось загрузить тарифы"))
      .finally(() => setLoading(false));
  }, []);

  // Проверяем ?paid=1 — пользователь вернулся с платёжной страницы
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("paid") === "1") {
      // Даём webhook время обработаться, потом обновляем сессию
      setTimeout(() => onSuccess?.(), 3000);
    }
  }, [onSuccess]);

  const handleBuy = async (plan: Plan) => {
    if (!user) return;
    setPaying(plan.id);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/?paid=1`;
      const res = await billing.createPayment({ plan_id: plan.id, billing: period, return_url: returnUrl });
      if (res.payment_url) {
        window.location.href = res.payment_url;
      }
    } catch {
      setError("Ошибка создания платежа. Попробуйте ещё раз.");
      setPaying(null);
    }
  };

  const price = (plan: Plan) => period === "year" ? plan.price_year : plan.price_month;
  const discount = (plan: Plan) => plan.price_year > 0 && plan.price_month > 0
    ? Math.round((1 - plan.price_year / (plan.price_month * 12)) * 100)
    : 0;

  const expiresLabel = user?.plan_expires_at
    ? new Date(user.plan_expires_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const daysLeft = user?.plan_expires_at
    ? Math.ceil((new Date(user.plan_expires_at).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className={showCurrentPlan ? "p-6 space-y-5 fade-up" : "min-h-screen grid-bg flex items-center justify-center p-6"}>
      <div className={showCurrentPlan ? "" : "w-full max-w-3xl fade-up"}>

        {/* Текущий план — только внутри приложения */}
        {showCurrentPlan && user?.plan_id && user.plan_id !== "free" && (
          <div className="panel rounded-2xl p-5" style={{ border: "1px solid rgba(0,255,136,0.2)" }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="hud-label mb-1">Активная подписка</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  {user.plan_id.charAt(0).toUpperCase() + user.plan_id.slice(1)}
                  <span className="tag tag-green">Активна</span>
                </div>
                {expiresLabel && (
                  <div className="text-sm mt-1" style={{ color: daysLeft !== null && daysLeft <= 7 ? "var(--warning)" : "var(--muted-foreground)" }}>
                    {daysLeft !== null && daysLeft <= 7
                      ? `⚠ Истекает ${expiresLabel} — через ${daysLeft} дн.`
                      : `Действует до ${expiresLabel}`}
                  </div>
                )}
              </div>
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                {user.plan_billing === "year" ? "Годовая" : "Месячная"} подписка
              </div>
            </div>
          </div>
        )}

        {/* Заголовок */}
        <div className={showCurrentPlan ? "" : "text-center mb-8"}>
          {!showCurrentPlan && (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}>
              <Icon name="Lock" size={24} style={{ color: "var(--electric)" }} />
            </div>
          )}
          <h1 className={`font-bold mb-1 ${showCurrentPlan ? "text-xl" : "text-2xl text-center"}`}>
            {showCurrentPlan ? "Тарифные планы" : "Активируйте доступ"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {showCurrentPlan
              ? "Выберите план или продлите подписку"
              : "Полный доступ к платформе SoloFly — управление БПЛА, миссии, ИИ-ядро"}
          </p>
        </div>

        {/* Переключатель период */}
        <div className="flex justify-center mb-6">
          <div className="flex p-1 rounded-xl" style={{ background: "hsl(var(--input))" }}>
            <button
              onClick={() => setPeriod("month")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${period === "month" ? "btn-electric" : "text-muted-foreground"}`}
            >
              Месяц
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${period === "year" ? "btn-electric" : "text-muted-foreground"}`}
            >
              Год
              {period !== "year" && <span className="tag tag-green" style={{ fontSize: 9 }}>−30%</span>}
            </button>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: "rgba(255,59,48,0.08)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}>
            <Icon name="AlertCircle" size={14} />
            {error}
          </div>
        )}

        {/* Карточки планов */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="panel rounded-2xl p-6 animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => {
              const p = price(plan);
              const d = discount(plan);
              const isPopular = plan.is_popular;
              return (
                <div key={plan.id}
                  className="panel rounded-2xl p-6 flex flex-col transition-all"
                  style={{
                    border: isPopular
                      ? "1px solid rgba(0,212,255,0.4)"
                      : "1px solid hsl(var(--border))",
                    boxShadow: isPopular ? "0 0 24px rgba(0,212,255,0.06)" : undefined,
                  }}>
                  {isPopular && (
                    <div className="tag tag-electric mb-3" style={{ width: "fit-content" }}>Популярный</div>
                  )}
                  <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{p.toLocaleString("ru-RU")} ₽</span>
                    <span className="text-muted-foreground text-sm ml-1">
                      / {period === "year" ? "год" : "месяц"}
                    </span>
                    {period === "year" && d > 0 && (
                      <span className="tag tag-green ml-2" style={{ fontSize: 9 }}>−{d}%</span>
                    )}
                  </div>
                  <ul className="space-y-1.5 flex-1 mb-5">
                    {plan.features.slice(0, 5).map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Icon name="Check" size={13} style={{ color: "var(--signal-green)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleBuy(plan)}
                    disabled={!!paying}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${isPopular ? "btn-electric" : "btn-ghost border"}`}
                    style={!isPopular ? { border: "1px solid hsl(var(--border))" } : undefined}
                  >
                    {paying === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⟳</span> Переход к оплате…
                      </span>
                    ) : `Выбрать ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Безопасность */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Icon name="Shield" size={12} style={{ color: "var(--signal-green)" }} /> Безопасная оплата YooKassa
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="RefreshCw" size={12} /> Отмена в любой момент
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="Lock" size={12} /> SSL шифрование
          </span>
        </div>
      </div>
    </div>
  );
}