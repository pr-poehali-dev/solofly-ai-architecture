import { useState } from "react";
import Icon from "@/components/ui/icon";

const integrations = [
  { id: "slack", name: "Slack", desc: "Уведомления и алерты в Slack-каналы", category: "Коммуникации", connected: true, icon: "MessageSquare", color: "#4ade80" },
  { id: "notion", name: "Notion", desc: "Синхронизация данных с базами Notion", category: "Продуктивность", connected: true, icon: "BookOpen", color: "var(--neon-cyan)" },
  { id: "hubspot", name: "HubSpot", desc: "Передача лидов и сделок в CRM", category: "CRM", connected: false, icon: "Target", color: "#fb923c" },
  { id: "salesforce", name: "Salesforce", desc: "Двусторонняя синхронизация CRM", category: "CRM", connected: false, icon: "Cloud", color: "#60a5fa" },
  { id: "zapier", name: "Zapier", desc: "Автоматизация 5000+ приложений", category: "Автоматизация", connected: true, icon: "Zap", color: "#facc15" },
  { id: "telegram", name: "Telegram Bot", desc: "Уведомления через Telegram-бота", category: "Коммуникации", connected: false, icon: "Send", color: "var(--neon-cyan)" },
  { id: "google", name: "Google Sheets", desc: "Авто-экспорт данных в таблицы", category: "Экспорт", connected: false, icon: "Table", color: "#4ade80" },
  { id: "webhook", name: "Custom Webhook", desc: "Подключить любой REST API", category: "Разработка", connected: false, icon: "Webhook", color: "var(--neon-purple)" },
];

export default function IntegrationsPage() {
  const [filter, setFilter] = useState("Все");
  const [search, setSearch] = useState("");

  const categories = ["Все", "Коммуникации", "CRM", "Продуктивность", "Автоматизация", "Экспорт", "Разработка"];

  const filtered = integrations.filter((i) => {
    const matchCat = filter === "Все" || i.category === filter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black">Интеграции</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Подключено: <span className="text-green-400 font-semibold">{connectedCount}</span> из {integrations.length}</p>
        </div>
        <button className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Icon name="Plus" size={14} />
          Добавить своё
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Подключено", val: connectedCount, color: "var(--neon-green)" },
          { label: "События сегодня", val: "12 438", color: "var(--neon-purple)" },
          { label: "Ошибок", val: "0", color: "var(--neon-cyan)" },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.val}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-2">
          <Icon name="Search" size={14} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск интеграций..."
            className="bg-transparent text-sm outline-none w-44 placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === cat ? "gradient-btn" : "glass-card hover:bg-white/8"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`glass-card rounded-2xl p-5 flex flex-col border transition-all hover:bg-white/5 ${item.connected ? "border-green-500/25" : "border-border"}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}20` }}>
                <Icon name={item.icon} fallback="Plug" size={20} style={{ color: item.color }} />
              </div>
              {item.connected && (
                <span className="badge-pill bg-green-500/15 text-green-400">● Активно</span>
              )}
            </div>
            <div className="font-bold text-sm mb-1">{item.name}</div>
            <div className="text-xs text-muted-foreground flex-1 leading-relaxed mb-4">{item.desc}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{item.category}</span>
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${item.connected ? "bg-white/10 text-muted-foreground hover:bg-red-500/15 hover:text-red-400" : "gradient-btn"}`}
              >
                {item.connected ? "Отключить" : "Подключить"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook builder */}
      <div className="glass-card rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
            <Icon name="Code" size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="font-bold">Конструктор Webhook</h2>
            <p className="text-xs text-muted-foreground">Подключите любой внешний сервис через HTTP</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Событие</label>
            <select className="w-full glass-card rounded-xl px-3 py-2.5 text-sm outline-none border border-border">
              <option>Новая подписка</option>
              <option>Платёж получен</option>
              <option>Пользователь создан</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">URL</label>
            <input
              placeholder="https://example.com/webhook"
              className="w-full glass-card rounded-xl px-3 py-2.5 text-sm outline-none border border-border placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full gradient-btn py-2.5 rounded-xl text-sm font-semibold">
              Сохранить Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
