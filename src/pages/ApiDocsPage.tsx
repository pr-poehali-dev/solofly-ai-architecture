import { useState } from "react";
import Icon from "@/components/ui/icon";

const endpoints = [
  { method: "GET", path: "/api/v1/fleet", desc: "Состояние всего флота БПЛА" },
  { method: "GET", path: "/api/v1/drones/{id}/telemetry", desc: "Телеметрия конкретного дрона" },
  { method: "POST", path: "/api/v1/missions", desc: "Создать новую миссию" },
  { method: "GET", path: "/api/v1/missions/{id}", desc: "Статус и прогресс миссии" },
  { method: "POST", path: "/api/v1/missions/{id}/abort", desc: "Прервать миссию" },
  { method: "GET", path: "/api/v1/ai/models", desc: "Список ИИ-моделей и их метрики" },
  { method: "GET", path: "/api/v1/ai/learning-log", desc: "Журнал обучения моделей" },
  { method: "POST", path: "/api/v1/export/pdf", desc: "Сформировать PDF-отчёт" },
  { method: "POST", path: "/api/v1/export/csv", desc: "Экспорт телеметрии в CSV" },
];

const methodColors: Record<string, string> = {
  GET: "var(--signal-green)",
  POST: "var(--electric)",
  DELETE: "var(--danger)",
  PATCH: "var(--warning)",
};

const curlExample = `curl -X GET "https://api.solofly.ai/v1/fleet" \\
  -H "Authorization: Bearer SF_KEY_••••••••" \\
  -H "Accept: application/json"`;

const jsonResponse = `{
  "fleet": [
    {
      "id": "SF-001",
      "name": "Орёл-1",
      "status": "flight",
      "position": {
        "lat": 55.7558, "lon": 37.6176, "alt": 128
      },
      "battery": 74,
      "speed_kmh": 42,
      "ai_model_version": "PathNet-v4.2",
      "mission_id": "MSN-047"
    }
  ],
  "total": 4,
  "online": 2
}`;

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const methods = ["ALL", "GET", "POST", "DELETE"];
  const filtered = filter === "ALL" ? endpoints : endpoints.filter(e => e.method === filter);

  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">API SoloFly</h1>
          <p className="text-muted-foreground text-sm mt-0.5">REST API v1 · api.solofly.ai</p>
        </div>
        <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <Icon name="Download" size={13} />
          OpenAPI spec
        </button>
      </div>

      <div className="panel-glow rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Key" size={15} style={{ color: "var(--electric)" }} />
          <h3 className="font-semibold text-sm">API ключ</h3>
          <span className="tag tag-green">Активен</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 font-mono text-xs rounded-lg px-4 py-2.5 truncate" style={{ background: "hsl(var(--input))", color: "var(--signal-green)" }}>
            SF_KEY_live_••••••••••••••••••••••••••••7f3a
          </div>
          <button className="btn-ghost px-3 py-2 rounded-lg text-xs">
            <Icon name="Eye" size={13} />
          </button>
          <button className="btn-ghost px-3 py-2 rounded-lg text-xs">
            <Icon name="RefreshCw" size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {methods.map(m => (
              <button
                key={m}
                onClick={() => setFilter(m)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filter === m ? "btn-electric" : "panel"}`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map((ep, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/3 transition-all cursor-pointer">
                <span
                  className="font-mono text-xs font-bold w-14 text-center py-0.5 rounded shrink-0"
                  style={{ color: methodColors[ep.method], background: `${methodColors[ep.method]}15` }}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs flex-1 truncate" style={{ color: "var(--electric)" }}>{ep.path}</span>
                <Icon name="ChevronRight" size={13} className="text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Запрос</h2>
              <button onClick={copy} className="flex items-center gap-1.5 hud-label hover:text-foreground transition-colors">
                <Icon name={copied ? "Check" : "Copy"} size={13} />
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
            <pre className="font-mono text-xs leading-relaxed overflow-x-auto p-4 rounded-lg" style={{ background: "hsl(var(--input))", color: "var(--electric)" }}>
              {curlExample}
            </pre>
          </div>

          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-3">Ответ</h2>
            <pre className="font-mono text-xs leading-relaxed overflow-x-auto p-4 rounded-lg" style={{ background: "hsl(var(--input))", color: "var(--signal-green)" }}>
              {jsonResponse}
            </pre>
          </div>

          <div className="panel rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-3">Лимиты</h2>
            {[
              { label: "Запросов в минуту", used: 48, max: 600 },
              { label: "Запросов сегодня", used: 4200, max: 50000 },
            ].map((r) => (
              <div key={r.label} className="mb-3 last:mb-0">
                <div className="flex justify-between hud-label mb-1">
                  <span>{r.label}</span>
                  <span>{r.used.toLocaleString()} / {r.max.toLocaleString()}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(r.used / r.max) * 100}%`, background: "var(--electric)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
