import { useState } from "react";
import Icon from "@/components/ui/icon";

const tickets = [
  { id: "TK-1042", subject: "Не работает экспорт в PDF", status: "open", priority: "high", date: "10 апр", unread: true },
  { id: "TK-1038", subject: "Вопрос по тарификации API", status: "pending", priority: "medium", date: "8 апр", unread: false },
  { id: "TK-1031", subject: "Настройка Webhook для Slack", status: "closed", priority: "low", date: "3 апр", unread: false },
  { id: "TK-1024", subject: "Ошибка при импорте CSV", status: "closed", priority: "medium", date: "28 мар", unread: false },
];

const faq = [
  { q: "Как получить API ключ?", a: "Перейдите в раздел API документации → нажмите «Показать» рядом с полем ключа." },
  { q: "Как экспортировать данные в PDF?", a: "В любом разделе с данными нажмите кнопку «Экспорт PDF» в верхнем правом углу." },
  { q: "Можно ли подключить свой домен?", a: "Да, в тарифе Enterprise доступен белый лейбл с кастомным доменом." },
  { q: "Как добавить пользователей в команду?", a: "Настройки → Команда → Пригласить пользователя. Доступно по тарифу." },
];

const statusInfo: Record<string, { label: string; cls: string }> = {
  open: { label: "Открыт", cls: "bg-green-500/15 text-green-400" },
  pending: { label: "Ожидает", cls: "bg-yellow-500/15 text-yellow-400" },
  closed: { label: "Закрыт", cls: "bg-white/10 text-muted-foreground" },
};

const priorityInfo: Record<string, { label: string; cls: string }> = {
  high: { label: "Высокий", cls: "text-red-400" },
  medium: { label: "Средний", cls: "text-yellow-400" },
  low: { label: "Низкий", cls: "text-muted-foreground" },
};

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"tickets" | "faq" | "contact">("tickets");

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black">Служба поддержки</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Среднее время ответа: <span className="text-green-400 font-semibold">~3 минуты</span></p>
        </div>
        <button className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Icon name="Plus" size={14} />
          Новый тикет
        </button>
      </div>

      {/* Status */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
        <div className="pulse-dot shrink-0"></div>
        <div>
          <span className="font-semibold text-sm">Все системы работают нормально</span>
          <span className="text-muted-foreground text-sm ml-2">· Проверено 10 апр 2026, 12:00</span>
        </div>
        <button className="ml-auto text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          Статус страница →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass-card rounded-xl p-1 w-fit">
        {(["tickets", "faq", "contact"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t ? "gradient-btn" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t === "tickets" ? "Тикеты" : t === "faq" ? "FAQ" : "Контакты"}
          </button>
        ))}
      </div>

      {activeTab === "tickets" && (
        <div className="glass-card rounded-2xl p-6">
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-4 p-4 rounded-xl hover:bg-white/4 transition-all cursor-pointer border ${t.unread ? "border-purple-500/30" : "border-transparent"}`}
              >
                {t.unread && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--neon-purple)" }} />}
                {!t.unread && <div className="w-2 h-2 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="mono text-xs text-muted-foreground">{t.id}</span>
                    <span className={`text-xs font-medium ${priorityInfo[t.priority].cls}`}>● {priorityInfo[t.priority].label}</span>
                  </div>
                  <div className="font-medium text-sm truncate">{t.subject}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`badge-pill ${statusInfo[t.status].cls}`}>{statusInfo[t.status].label}</span>
                  <span className="text-xs text-muted-foreground">{t.date}</span>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="glass-card rounded-2xl p-6 space-y-2">
          {faq.map((item, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/4 transition-all"
              >
                <span className="font-medium text-sm">{item.q}</span>
                <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground shrink-0" />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "contact" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "MessageCircle", title: "Live чат", desc: "Онлайн с 9:00 до 21:00 МСК", action: "Открыть чат", color: "var(--neon-purple)" },
            { icon: "Mail", title: "Email поддержка", desc: "support@novasaas.ru", action: "Написать письмо", color: "var(--neon-cyan)" },
            { icon: "Phone", title: "Звонок", desc: "Только Enterprise клиентам", action: "Запросить звонок", color: "var(--neon-pink)" },
          ].map((c) => (
            <div key={c.title} className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${c.color}20` }}>
                <Icon name={c.icon} fallback="HelpCircle" size={22} style={{ color: c.color }} />
              </div>
              <h3 className="font-bold mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground mb-5">{c.desc}</p>
              <button className="w-full gradient-btn py-2.5 rounded-xl text-sm font-semibold">{c.action}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
