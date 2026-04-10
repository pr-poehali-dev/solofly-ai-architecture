import { useState } from "react";
import Icon from "@/components/ui/icon";

const endpoints = [
  { method: "GET", path: "/api/v1/users", desc: "Получить список пользователей", tag: "Users" },
  { method: "POST", path: "/api/v1/users", desc: "Создать нового пользователя", tag: "Users" },
  { method: "GET", path: "/api/v1/analytics/events", desc: "Получить события аналитики", tag: "Analytics" },
  { method: "POST", path: "/api/v1/export/csv", desc: "Экспортировать данные в CSV", tag: "Export" },
  { method: "POST", path: "/api/v1/export/pdf", desc: "Создать PDF отчёт", tag: "Export" },
  { method: "GET", path: "/api/v1/webhooks", desc: "Список активных webhooks", tag: "Webhooks" },
  { method: "DELETE", path: "/api/v1/webhooks/{id}", desc: "Удалить webhook", tag: "Webhooks" },
];

const methodColors: Record<string, string> = {
  GET: "#4ade80",
  POST: "var(--neon-cyan)",
  PUT: "var(--neon-purple)",
  DELETE: "#f87171",
  PATCH: "#facc15",
};

const codeExample = `curl -X GET "https://api.novasaas.ru/v1/users" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

const responseExample = `{
  "data": [
    {
      "id": "usr_01HZ9X",
      "email": "ivan@company.ru",
      "role": "admin",
      "created_at": "2026-04-10T12:00:00Z"
    }
  ],
  "meta": {
    "total": 1247,
    "page": 1,
    "per_page": 20
  }
}`;

export default function ApiDocsPage() {
  const [activeTag, setActiveTag] = useState("All");
  const [copied, setCopied] = useState(false);

  const tags = ["All", "Users", "Analytics", "Export", "Webhooks"];
  const filtered = activeTag === "All" ? endpoints : endpoints.filter(e => e.tag === activeTag);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black">API Документация</h1>
          <p className="text-muted-foreground text-sm mt-0.5">REST API v1.0 · Базовый URL: api.novasaas.ru</p>
        </div>
        <button className="glass-card px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
          <Icon name="FileDown" size={14} />
          Скачать OpenAPI
        </button>
      </div>

      {/* API Key */}
      <div className="glass-card rounded-2xl p-5 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Key" size={16} className="text-purple-400" />
          <h3 className="font-semibold text-sm">Ваш API ключ</h3>
          <span className="badge-pill bg-green-500/15 text-green-400">Активен</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 mono text-sm bg-black/30 rounded-xl px-4 py-3 text-cyan-400 overflow-hidden text-ellipsis">
            sk_live_nv_••••••••••••••••••••••••••••••••4521
          </div>
          <button className="glass-card px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
            <Icon name="Eye" size={14} />
            Показать
          </button>
          <button className="glass-card px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
            <Icon name="RefreshCw" size={14} />
            Обновить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Endpoints */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Эндпоинты</h2>
          </div>
          <div className="flex gap-2 flex-wrap mb-4">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${activeTag === t ? "gradient-btn" : "glass-card hover:bg-white/8"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map((ep) => (
              <div key={ep.path} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-all cursor-pointer group">
                <span
                  className="text-xs font-bold mono w-14 text-center py-0.5 rounded-md shrink-0"
                  style={{ color: methodColors[ep.method], background: `${methodColors[ep.method]}18` }}
                >
                  {ep.method}
                </span>
                <span className="mono text-sm text-cyan-400 flex-1 truncate">{ep.path}</span>
                <span className="text-xs text-muted-foreground hidden group-hover:block">{ep.desc}</span>
                <Icon name="ChevronRight" size={14} className="text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Code example */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Пример запроса</h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name={copied ? "Check" : "Copy"} size={13} />
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
            <pre className="mono text-xs leading-relaxed text-cyan-300 overflow-x-auto bg-black/30 rounded-xl p-4">
              {codeExample}
            </pre>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold mb-4">Ответ сервера</h2>
            <pre className="mono text-xs leading-relaxed text-green-300 overflow-x-auto bg-black/30 rounded-xl p-4">
              {responseExample}
            </pre>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-3">Лимиты запросов</h3>
            <div className="space-y-2">
              {[
                { label: "Использовано сегодня", used: 420000, max: 1000000, color: "var(--neon-purple)" },
                { label: "Лимит в минуту", used: 340, max: 1000, color: "var(--neon-cyan)" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium">{(r.used / 1000).toFixed(0)}K / {(r.max / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8">
                    <div className="h-full rounded-full" style={{ width: `${(r.used / r.max) * 100}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
