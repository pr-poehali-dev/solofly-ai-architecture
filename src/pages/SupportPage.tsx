import { useState } from "react";
import Icon from "@/components/ui/icon";

const tickets = [
  { id: "TK-204", subject: "PathNet не огибает новый тип препятствий", status: "open", priority: "high", date: "10 апр", drone: "SF-004" },
  { id: "TK-203", subject: "Сбой WebSocket при скорости > 90 км/ч", status: "pending", priority: "medium", date: "9 апр", drone: "SF-001" },
  { id: "TK-202", subject: "Экспорт CSV не включает GPS-координаты", status: "closed", priority: "low", date: "7 апр", drone: "—" },
];

const faq = [
  { q: "Как добавить новый БПЛА в флот?", a: "Перейдите в «Флот» → «Добавить дрон», введите серийный номер и установите прошивку SoloFly Agent." },
  { q: "Что происходит при потере связи с дроном?", a: "Бортовой ИИ переходит в автономный режим, завершает задание и выполняет посадку в ближайшей безопасной точке." },
  { q: "Как экспортировать телеметрию в CSV?", a: "В разделе «История полётов» выберите записи и нажмите кнопку CSV вверху страницы." },
  { q: "Как часто обновляются ИИ-модели?", a: "После каждого полёта автоматически. Крупные обновления архитектуры проходят ревью перед деплоем." },
  { q: "Можно ли работать без интернета?", a: "Да. Бортовой ИИ полностью автономен. Интернет нужен только для синхронизации моделей в облако." },
];

const statusCls: Record<string, string> = { open: "tag-green", pending: "tag-warning", closed: "tag-muted" };
const statusLabel: Record<string, string> = { open: "Открыт", pending: "В работе", closed: "Закрыт" };

export default function SupportPage() {
  const [tab, setTab] = useState<"tickets" | "faq" | "contact">("tickets");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Служба поддержки</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Среднее время ответа: <span style={{ color: "var(--signal-green)" }}>~15 мин</span>
          </p>
        </div>
        <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <Icon name="Plus" size={13} />
          Новый тикет
        </button>
      </div>

      <div className="panel-success rounded-xl p-4 flex items-center gap-3">
        <span className="dot-online" />
        <span className="text-sm font-medium">Все системы работают штатно</span>
        <span className="text-muted-foreground text-xs ml-auto">10 апр, 14:30</span>
      </div>

      <div className="flex gap-1" style={{ background: "hsl(var(--input))", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["tickets", "faq", "contact"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t ? "btn-electric" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "tickets" ? "Тикеты" : t === "faq" ? "FAQ" : "Контакты"}
          </button>
        ))}
      </div>

      {tab === "tickets" && (
        <div className="panel rounded-xl overflow-hidden">
          {tickets.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-all cursor-pointer ${i < tickets.length - 1 ? "border-b" : ""}`}
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <Icon
                name={t.priority === "high" ? "AlertCircle" : t.priority === "medium" ? "AlertTriangle" : "Info"}
                fallback="Info"
                size={15}
                style={{ color: t.priority === "high" ? "var(--danger)" : t.priority === "medium" ? "var(--warning)" : "var(--electric)" }}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs" style={{ color: "var(--electric)" }}>{t.id}</span>
                  {t.drone !== "—" && <span className="tag tag-electric">{t.drone}</span>}
                </div>
                <div className="font-medium text-sm truncate">{t.subject}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`tag ${statusCls[t.status]}`}>{statusLabel[t.status]}</span>
                <span className="hud-label">{t.date}</span>
                <Icon name="ChevronRight" size={13} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "faq" && (
        <div className="panel rounded-xl overflow-hidden">
          {faq.map((item, i) => (
            <div key={i} className={i < faq.length - 1 ? "border-b" : ""} style={{ borderColor: "hsl(var(--border))" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-all"
              >
                <span className="font-medium text-sm">{item.q}</span>
                <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} size={15} className="text-muted-foreground shrink-0" />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground border-t" style={{ borderColor: "hsl(var(--border))" }}>
                  <p className="pt-3 leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "contact" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "MessageCircle", title: "Чат инженера", desc: "Прямая линия с разработчиками SoloFly", action: "Открыть чат", color: "var(--electric)" },
            { icon: "Mail", title: "Email", desc: "support@solofly.ai · ответ до 4 ч", action: "Написать", color: "var(--signal-green)" },
            { icon: "Phone", title: "Горячая линия", desc: "Для критических инцидентов 24/7", action: "Позвонить", color: "var(--warning)" },
          ].map((c) => (
            <div key={c.title} className="panel rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${c.color}15` }}>
                <Icon name={c.icon} fallback="HelpCircle" size={20} style={{ color: c.color }} />
              </div>
              <h3 className="font-semibold mb-1 text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground mb-5 leading-relaxed">{c.desc}</p>
              <button className="w-full btn-electric py-2 rounded-lg text-xs font-semibold">{c.action}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
