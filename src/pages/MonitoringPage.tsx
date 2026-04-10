import Icon from "@/components/ui/icon";

const reports = [
  { id: "RPT-892", mission: "Патруль периметра А", date: "10.04.2026", drone: "Орёл-1", type: "patrol", pages: 8, generated: "14:35", hasVideo: true },
  { id: "RPT-891", mission: "Картографирование C1", date: "10.04.2026", drone: "Сокол-1", type: "mapping", pages: 14, generated: "12:47", hasVideo: true },
  { id: "RPT-890", mission: "Обзор-14", date: "09.04.2026", drone: "Орёл-3", type: "recon", pages: 6, generated: "11:00", hasVideo: false },
];

const alerts = [
  { level: "critical", msg: "SF-003: потеря сигнала GPS на 4 секунды", time: "10:24", drone: "SF-003", resolved: true },
  { level: "warning", msg: "SF-004: вибрация выше нормы (1.8g)", time: "09:51", drone: "SF-004", resolved: false },
  { level: "info", msg: "Модель ThreatDetect обновлена до v2.0", time: "09:12", drone: "—", resolved: true },
  { level: "warning", msg: "SF-001: ветер 16 м/с — скорость снижена", time: "08:44", drone: "SF-001", resolved: true },
];

const levelIcon: Record<string, string> = { critical: "AlertOctagon", warning: "AlertTriangle", info: "Info" };
const levelColor: Record<string, string> = { critical: "var(--danger)", warning: "var(--warning)", info: "var(--electric)" };
const levelCls: Record<string, string> = { critical: "tag-danger", warning: "tag-warning", info: "tag-electric" };

export default function MonitoringPage() {
  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Мониторинг и отчётность</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Авто-генерация отчётов · Визуализация · Уведомления (раздел 3.7)</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Bell" size={13} />
            Настроить алерты
          </button>
          <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="FileDown" size={13} />
            Сводный PDF
          </button>
        </div>
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Активных алертов", val: "1", icon: "Bell", color: "var(--warning)" },
          { label: "Отчётов за день", val: String(reports.length), icon: "FileText", color: "var(--electric)" },
          { label: "Уведомлений отправлено", val: "12", icon: "Send", color: "var(--signal-green)" },
          { label: "Часов видео записано", val: "6.4", icon: "Video", color: "var(--electric)" },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Activity" size={14} style={{ color: s.color }} />
            </div>
            <div className="hud-value text-xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Reports */}
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Автоматические отчёты</h2>
            <span className="tag tag-electric">Авто-генерация ИИ</span>
          </div>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="p-4 rounded-xl" style={{ background: "hsl(var(--input))" }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm">{r.mission}</div>
                    <div className="hud-label mt-0.5">{r.drone} · {r.date} · {r.generated}</div>
                  </div>
                  <span className="tag tag-muted">{r.pages} стр.</span>
                </div>
                <div className="flex items-center gap-2">
                  {r.hasVideo && (
                    <span className="flex items-center gap-1 tag tag-electric" style={{ fontSize: 9 }}>
                      <Icon name="Video" size={9} /> Видео с разметкой
                    </span>
                  )}
                  <div className="flex gap-1.5 ml-auto">
                    <button className="btn-ghost px-2.5 py-1 rounded text-xs flex items-center gap-1">
                      <Icon name="FileText" size={11} /> CSV
                    </button>
                    <button className="btn-ghost px-2.5 py-1 rounded text-xs flex items-center gap-1">
                      <Icon name="Table" size={11} /> XLSX
                    </button>
                    <button className="btn-electric px-2.5 py-1 rounded text-xs flex items-center gap-1">
                      <Icon name="FileDown" size={11} /> PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center py-3">
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Все отчёты (48) →
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Критические события</h2>
            <span className="tag tag-warning">1 активный</span>
          </div>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{
                  background: a.resolved ? "hsl(var(--input))" : `${levelColor[a.level]}10`,
                  border: a.resolved ? "1px solid transparent" : `1px solid ${levelColor[a.level]}30`,
                  opacity: a.resolved ? 0.65 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  <Icon name={levelIcon[a.level]} fallback="Bell" size={15} style={{ color: levelColor[a.level] }} className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`tag ${levelCls[a.level]}`} style={{ fontSize: 9 }}>{a.level.toUpperCase()}</span>
                      {a.drone !== "—" && <span className="tag tag-muted" style={{ fontSize: 9 }}>{a.drone}</span>}
                      {a.resolved && <span className="tag tag-muted" style={{ fontSize: 9 }}>Решено</span>}
                    </div>
                    <p className="text-xs">{a.msg}</p>
                  </div>
                  <span className="hud-label shrink-0">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="panel rounded-xl p-5">
        <h2 className="font-semibold text-sm mb-4">Визуализация данных</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Тепловая карта миссий", desc: "Плотность полётов по зонам, распределение объектов", icon: "MapPin", color: "var(--electric)" },
            { title: "Графики телеметрии", desc: "Батарея, высота, скорость — в динамике за полёт", icon: "TrendingUp", color: "var(--signal-green)" },
            { title: "Видео с аннотациями", desc: "Кадры с AI-разметкой: боксы, классы, уверенность", icon: "Video", color: "var(--warning)" },
          ].map(v => (
            <div key={v.title} className="p-5 rounded-xl flex flex-col items-center text-center" style={{ background: "hsl(var(--input))" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${v.color}15` }}>
                <Icon name={v.icon} fallback="BarChart2" size={20} style={{ color: v.color }} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{v.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{v.desc}</p>
              <button className="btn-electric w-full py-2 rounded-lg text-xs font-semibold">Открыть</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
