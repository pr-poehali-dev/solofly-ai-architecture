import Icon from "@/components/ui/icon";

const integrations = [
  { name: "MAVLink", desc: "Стандартный протокол управления БПЛА", icon: "Radio", color: "var(--electric)", connected: true, category: "Протоколы" },
  { name: "ROS 2", desc: "Robot Operating System для автономных систем", icon: "Cpu", color: "var(--signal-green)", connected: true, category: "Протоколы" },
  { name: "OpenCV", desc: "Библиотека компьютерного зрения", icon: "Eye", color: "var(--electric)", connected: true, category: "ИИ/ML" },
  { name: "TensorFlow Lite", desc: "ИИ-инференс на бортовом процессоре", icon: "Brain", color: "var(--signal-green)", connected: true, category: "ИИ/ML" },
  { name: "Grafana", desc: "Визуализация телеметрии в реальном времени", icon: "BarChart3", color: "var(--warning)", connected: false, category: "Мониторинг" },
  { name: "Prometheus", desc: "Сбор и хранение метрик системы", icon: "Activity", color: "var(--warning)", connected: false, category: "Мониторинг" },
  { name: "Telegram Bot", desc: "Алерты о статусе миссий в Telegram", icon: "Send", color: "var(--electric)", connected: false, category: "Уведомления" },
  { name: "AWS S3", desc: "Облачное хранилище видео и телеметрии", icon: "Cloud", color: "var(--signal-green)", connected: false, category: "Хранилище" },
];

const CATEGORIES = ["Протоколы", "ИИ/ML", "Мониторинг", "Уведомления", "Хранилище"];

export default function IntegrationsPage() {
  const connected = integrations.filter(i => i.connected).length;

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Внешние подключения</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Активных: <span style={{ color: "var(--signal-green)" }}>{connected}</span> из {integrations.length}
          </p>
        </div>
        <button className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
          <Icon name="Plus" size={13} />
          Добавить
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Подключено", val: connected, color: "var(--signal-green)" },
          { label: "Сообщений/сек", val: "1 240", color: "var(--electric)" },
          { label: "Ошибок за сутки", val: "0", color: "var(--signal-green)" },
        ].map((s) => (
          <div key={s.label} className="panel p-5 rounded-xl text-center">
            <div className="hud-value text-2xl mb-0.5" style={{ color: s.color }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      {CATEGORIES.map(cat => {
        const items = integrations.filter(i => i.category === cat);
        return (
          <div key={cat}>
            <div className="hud-label mb-3">{cat}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {items.map(item => (
                <div
                  key={item.name}
                  className="panel rounded-xl p-5 flex flex-col"
                  style={item.connected ? { borderColor: "rgba(0,255,136,0.15)" } : {}}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}14` }}>
                      <Icon name={item.icon} fallback="Plug" size={18} style={{ color: item.color }} />
                    </div>
                    {item.connected && <span className="dot-online" />}
                  </div>
                  <div className="font-semibold text-sm mb-1">{item.name}</div>
                  <div className="text-xs text-muted-foreground flex-1 mb-4 leading-relaxed">{item.desc}</div>
                  <button
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${item.connected ? "text-muted-foreground" : "btn-electric"}`}
                    style={item.connected ? { background: "hsl(var(--input))" } : {}}
                  >
                    {item.connected ? "Отключить" : "Подключить"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="panel-glow rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,255,0.1)" }}>
            <Icon name="Code" size={18} style={{ color: "var(--electric)" }} />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Пользовательский Webhook</h2>
            <p className="hud-label">Получайте события системы на любой URL</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="hud-label mb-1.5 block">Событие</label>
            <select className="w-full panel rounded-lg px-3 py-2.5 text-xs outline-none">
              <option>Миссия завершена</option>
              <option>Дрон приземлился</option>
              <option>Ошибка системы</option>
              <option>Цикл ИИ выполнен</option>
            </select>
          </div>
          <div>
            <label className="hud-label mb-1.5 block">URL</label>
            <input
              placeholder="https://your-server.com/hook"
              className="w-full panel rounded-lg px-3 py-2.5 text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full btn-electric py-2.5 rounded-lg text-xs font-semibold">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
}
