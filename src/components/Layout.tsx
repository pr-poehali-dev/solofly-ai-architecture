import Icon from "@/components/ui/icon";

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  isLanding?: boolean;
}

const navItems = [
  { id: "dashboard", label: "Командный центр", icon: "LayoutDashboard" },
  { id: "ucp", label: "ЦУП", icon: "Radio" },
  { id: "missions", label: "Миссии", icon: "Target" },
  { id: "flightcontrol", label: "Управление полётом", icon: "Navigation" },
  { id: "ai", label: "ИИ-ядро", icon: "Brain" },
  { id: "swarm", label: "Рой БПЛА", icon: "Network" },
  { id: "monitoring", label: "Мониторинг", icon: "Activity" },
  { id: "scanning", label: "Сканирование", icon: "ScanLine" },
  { id: "scanarchive", label: "Архив сканов", icon: "Archive" },
  { id: "flightlog", label: "История полётов", icon: "History" },
  { id: "security", label: "Безопасность", icon: "Shield" },
  { id: "api", label: "API", icon: "Code2" },
  { id: "integrations", label: "Подключения", icon: "Plug" },
  { id: "support", label: "Поддержка", icon: "Headphones" },
];

export default function Layout({ currentPage, onNavigate, children, isLanding }: LayoutProps) {
  if (isLanding) {
    return (
      <div className="min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(5,9,14,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--electric)" }}>
                <Icon name="Navigation" size={14} style={{ color: "hsl(210 25% 4%)" }} />
              </div>
              <span className="font-bold text-base tracking-tight">Solo<span className="gradient-text">Fly</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate("dashboard")} className="btn-ghost px-4 py-2 rounded-lg text-xs">
                Войти в систему
              </button>
              <button onClick={() => onNavigate("dashboard")} className="btn-electric px-4 py-2 rounded-lg text-xs">
                Начать →
              </button>
            </div>
          </div>
        </nav>
        <div className="pt-14">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col" style={{ background: "hsl(var(--sidebar-background))", borderRight: "1px solid hsl(var(--sidebar-border))" }}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4" style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--electric)" }}>
            <Icon name="Navigation" size={14} style={{ color: "hsl(210 25% 4%)" }} />
          </div>
          <span className="font-bold text-sm tracking-tight">Solo<span className="gradient-text">Fly</span></span>
          <span className="tag tag-green ml-auto" style={{ fontSize: 9 }}>LIVE</span>
        </div>

        {/* System status */}
        <div className="mx-3 mt-3 p-3 rounded-lg" style={{ background: "hsl(var(--sidebar-accent))" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="dot-online" />
            <span className="hud-label">Система активна</span>
          </div>
          <div className="hud-value text-xs" style={{ color: "var(--electric)" }}>2 дрона в полёте</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} fallback="Circle" size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
          <div className="flex items-center gap-2.5 p-3 rounded-lg mb-1" style={{ background: "hsl(var(--sidebar-accent))" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,212,255,0.15)" }}>
              <Icon name="User" size={14} style={{ color: "var(--electric)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">Оператор #1</div>
              <div className="hud-label truncate">Администратор</div>
            </div>
          </div>
          <button onClick={() => onNavigate("landing")} className="nav-item w-full">
            <Icon name="LogOut" size={15} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto" style={{ background: "hsl(var(--background))" }}>
        {children}
      </main>
    </div>
  );
}