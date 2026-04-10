import Icon from "@/components/ui/icon";

const stats = [
  { label: "Выручка за месяц", value: "₽ 2 847 300", change: "+18.4%", up: true, icon: "TrendingUp", color: "var(--neon-purple)" },
  { label: "Активных подписок", value: "1 247", change: "+32", up: true, icon: "Users", color: "var(--neon-cyan)" },
  { label: "API вызовов сегодня", value: "4.2M", change: "-3.1%", up: false, icon: "Activity", color: "var(--neon-pink)" },
  { label: "Хранилище", value: "68.4 ГБ", change: "из 100 ГБ", up: true, icon: "HardDrive", color: "#4ade80" },
];

const recentActivity = [
  { action: "Новая подписка", user: "ООО Ромашка", plan: "Бизнес", time: "2 мин назад", type: "new" },
  { action: "Экспорт данных", user: "АО Техпром", plan: "CSV, 3.4MB", time: "15 мин назад", type: "export" },
  { action: "Обновление плана", user: "ИП Козлов", plan: "Старт → Бизнес", time: "1 час назад", type: "upgrade" },
  { action: "Оплата получена", user: "ГК Цифра", plan: "₽ 34 900", time: "2 часа назад", type: "payment" },
  { action: "Новый тикет", user: "Сервис Плюс", plan: "API ключи", time: "3 часа назад", type: "support" },
];

const typeColors: Record<string, string> = {
  new: "#4ade80",
  export: "var(--neon-cyan)",
  upgrade: "var(--neon-purple)",
  payment: "#facc15",
  support: "var(--neon-pink)",
};

const typeIcons: Record<string, string> = {
  new: "UserPlus",
  export: "FileDown",
  upgrade: "ArrowUpCircle",
  payment: "CreditCard",
  support: "MessageCircle",
};

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black">Обзор платформы</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Последнее обновление: только что</p>
        </div>
        <div className="flex gap-2">
          <button className="glass-card px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
            <Icon name="Download" size={14} />
            Экспорт PDF
          </button>
          <button className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Icon name="Plus" size={14} />
            Добавить
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}20` }}
              >
                <Icon name={s.icon} fallback="BarChart2" size={18} style={{ color: s.color }} />
              </div>
              <span
                className={`badge-pill text-xs ${s.up ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}
              >
                {s.change}
              </span>
            </div>
            <div className="text-2xl font-black mb-1">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart placeholder */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold">Выручка по месяцам</h2>
            <select className="bg-transparent text-sm text-muted-foreground border border-border rounded-lg px-2 py-1">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <div className="flex items-end gap-2 h-40">
            {[45, 62, 58, 75, 80, 95, 88, 102, 98, 115, 108, 124].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${(h / 130) * 100}%`,
                    background: i === 11
                      ? "linear-gradient(180deg, var(--neon-purple), var(--neon-cyan))"
                      : "rgba(168,85,247,0.25)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Top plans */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-bold mb-5">Популярность тарифов</h2>
          <div className="space-y-4">
            {[
              { name: "Бизнес", pct: 62, color: "var(--neon-purple)" },
              { name: "Старт", pct: 28, color: "var(--neon-cyan)" },
              { name: "Enterprise", pct: 10, color: "var(--neon-pink)" },
            ].map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${p.pct}%`, background: p.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">Последние события</h2>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Все события →</button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/4 transition-all">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${typeColors[a.type]}18` }}
              >
                <Icon name={typeIcons[a.type]} fallback="Bell" size={16} style={{ color: typeColors[a.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{a.action}</div>
                <div className="text-xs text-muted-foreground">{a.user} · {a.plan}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
