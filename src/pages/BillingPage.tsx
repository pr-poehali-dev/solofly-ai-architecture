import Icon from "@/components/ui/icon";

const invoices = [
  { id: "INV-2026-042", date: "01 апр 2026", desc: "Бизнес тариф + надстройка", amount: "₽ 3 780", status: "paid" },
  { id: "INV-2026-031", date: "01 мар 2026", desc: "Бизнес тариф", amount: "₽ 3 490", status: "paid" },
  { id: "INV-2026-021", date: "01 фев 2026", desc: "Бизнес тариф + хранилище", amount: "₽ 3 780", status: "paid" },
  { id: "INV-2026-011", date: "01 янв 2026", desc: "Бизнес тариф", amount: "₽ 3 490", status: "paid" },
  { id: "INV-2025-121", date: "01 дек 2025", desc: "Старт тариф", amount: "₽ 990", status: "paid" },
  { id: "INV-2025-111", date: "01 ноя 2025", desc: "Старт тариф", amount: "₽ 990", status: "failed" },
];

const statusStyles: Record<string, { label: string; cls: string }> = {
  paid: { label: "Оплачен", cls: "bg-green-500/15 text-green-400" },
  failed: { label: "Ошибка", cls: "bg-red-500/15 text-red-400" },
  pending: { label: "Ожидает", cls: "bg-yellow-500/15 text-yellow-400" },
};

export default function BillingPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black">История платежей</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Все транзакции и счета для бухгалтерии</p>
        </div>
        <div className="flex gap-2">
          <button className="glass-card px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
            <Icon name="FileText" size={14} />
            CSV
          </button>
          <button className="glass-card px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
            <Icon name="FileDown" size={14} />
            PDF
          </button>
          <button className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <Icon name="Table" size={14} />
            XLSX
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Оплачено за год", val: "₽ 38 940", icon: "Banknote", color: "var(--neon-green)" },
          { label: "Следующий платёж", val: "₽ 3 780", icon: "Calendar", color: "var(--neon-cyan)" },
          { label: "Способ оплаты", val: "Visa •••• 4521", icon: "CreditCard", color: "var(--neon-purple)" },
        ].map((c) => (
          <div key={c.label} className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.color}20` }}>
                <Icon name={c.icon} fallback="DollarSign" size={16} style={{ color: c.color }} />
              </div>
              <span className="text-sm text-muted-foreground">{c.label}</span>
            </div>
            <div className="text-2xl font-black">{c.val}</div>
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">Способы оплаты</h2>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5">
            <Icon name="Plus" size={14} />
            Добавить карту
          </button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-7 rounded flex items-center justify-center" style={{ background: "rgba(168,85,247,0.2)" }}>
              <span className="text-xs font-bold gradient-text">VISA</span>
            </div>
            <div>
              <div className="font-medium text-sm">Visa •••• 4521</div>
              <div className="text-xs text-muted-foreground">Истекает 08/2028</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-pill bg-green-500/15 text-green-400">Основная</span>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="MoreHorizontal" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Invoices table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">Счета и квитанции</h2>
          <div className="flex items-center gap-2 glass-card rounded-xl px-3 py-2">
            <Icon name="Search" size={14} className="text-muted-foreground" />
            <input
              placeholder="Поиск по счётам..."
              className="bg-transparent text-sm outline-none w-44 placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Номер", "Дата", "Описание", "Сумма", "Статус", ""].map((h) => (
                  <th key={h} className="text-left text-xs text-muted-foreground font-medium pb-3 pr-4 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-white/3 transition-all">
                  <td className="py-3.5 pr-4">
                    <span className="mono text-sm text-cyan-400">{inv.id}</span>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="py-3.5 pr-4 text-sm">{inv.desc}</td>
                  <td className="py-3.5 pr-4">
                    <span className="font-semibold text-sm">{inv.amount}</span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`badge-pill ${statusStyles[inv.status].cls}`}>
                      {statusStyles[inv.status].label}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button className="text-muted-foreground hover:text-purple-400 transition-colors">
                      <Icon name="Download" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
