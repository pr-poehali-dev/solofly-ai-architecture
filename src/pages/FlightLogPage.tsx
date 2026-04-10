import Icon from "@/components/ui/icon";

const logs = [
  { id: "FLT-0892", drone: "Орёл-1", mission: "Патруль периметра А", date: "10.04.2026", dur: "1ч 32м", dist: "48.2 км", status: "success", aiCycles: 14, events: 3 },
  { id: "FLT-0891", drone: "Сокол-1", mission: "Картографирование C1", date: "10.04.2026", dur: "2ч 18м", dist: "67.4 км", status: "success", aiCycles: 22, events: 1 },
  { id: "FLT-0890", drone: "Орёл-3", mission: "Обзор-14", date: "10.04.2026", dur: "1ч 42м", dist: "52.1 км", status: "success", aiCycles: 18, events: 0 },
  { id: "FLT-0889", drone: "Орёл-2", mission: "Инспекция объекта 6", date: "09.04.2026", dur: "0ч 54м", dist: "18.6 км", status: "aborted", aiCycles: 7, events: 5 },
  { id: "FLT-0888", drone: "Орёл-1", mission: "Разведка зоны D", date: "09.04.2026", dur: "2ч 05м", dist: "61.3 км", status: "success", aiCycles: 19, events: 2 },
];

const statusCls: Record<string, string> = {
  success: "tag-green",
  aborted: "tag-danger",
  partial: "tag-warning",
};

const statusLabel: Record<string, string> = {
  success: "Успешно",
  aborted: "Прервано",
  partial: "Частично",
};

export default function FlightLogPage() {
  const totalDist = logs.reduce((s, l) => s + parseFloat(l.dist), 0).toFixed(1);
  const totalCycles = logs.reduce((s, l) => s + l.aiCycles, 0);

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">История полётов</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Журнал всех миссий и телеметрии</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="FileText" size={13} />
            CSV
          </button>
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Table" size={13} />
            XLSX
          </button>
          <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="FileDown" size={13} />
            PDF-отчёт
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Полётов за 7 дней", val: String(logs.length), color: "var(--electric)" },
          { label: "Общий налёт км", val: totalDist, color: "var(--signal-green)" },
          { label: "Циклов ИИ в полётах", val: String(totalCycles), color: "var(--electric)" },
          { label: "Успешность", val: "93%", color: "var(--signal-green)" },
        ].map((s) => (
          <div key={s.label} className="panel p-5 rounded-xl">
            <div className="hud-value text-2xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="panel rounded-xl overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "hsl(var(--input))" }}>
            <Icon name="Search" size={13} className="text-muted-foreground" />
            <input placeholder="Поиск по дрону, миссии..." className="bg-transparent text-xs outline-none w-44 placeholder:text-muted-foreground" />
          </div>
          <select className="bg-transparent border text-xs rounded-lg px-3 py-2 outline-none text-muted-foreground" style={{ borderColor: "hsl(var(--border))" }}>
            <option>Все дроны</option>
            <option>Орёл-1</option>
            <option>Сокол-1</option>
          </select>
          <select className="bg-transparent border text-xs rounded-lg px-3 py-2 outline-none text-muted-foreground" style={{ borderColor: "hsl(var(--border))" }}>
            <option>Все статусы</option>
            <option>Успешно</option>
            <option>Прервано</option>
          </select>
          <span className="ml-auto hud-label">{logs.length} записей</span>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              {["ID", "Дрон", "Миссия", "Дата", "Длит.", "Расстояние", "Циклов ИИ", "Статус", ""].map((h) => (
                <th key={h} className="hud-label text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/2 transition-all cursor-pointer" style={{ borderColor: "hsl(var(--border))" }}>
                <td className="px-4 py-3.5">
                  <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>{l.id}</span>
                </td>
                <td className="px-4 py-3.5 text-xs font-medium">{l.drone}</td>
                <td className="px-4 py-3.5 text-xs text-muted-foreground">{l.mission}</td>
                <td className="px-4 py-3.5 hud-label">{l.date}</td>
                <td className="px-4 py-3.5 hud-value text-xs">{l.dur}</td>
                <td className="px-4 py-3.5 hud-value text-xs">{l.dist}</td>
                <td className="px-4 py-3.5">
                  <span className="hud-value text-xs" style={{ color: "var(--signal-green)" }}>{l.aiCycles}</span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`tag ${statusCls[l.status]}`}>{statusLabel[l.status]}</span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Icon name="Download" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
