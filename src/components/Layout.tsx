import Icon from "@/components/ui/icon";

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  isLanding?: boolean;
}

const navItems = [
  { id: "dashboard", label: "Обзор", icon: "LayoutDashboard" },
  { id: "profile", label: "Мой кабинет", icon: "User" },
  { id: "subscriptions", label: "Подписки", icon: "Package" },
  { id: "billing", label: "История платежей", icon: "Receipt" },
  { id: "api", label: "API и документация", icon: "Code2" },
  { id: "integrations", label: "Интеграции", icon: "Plug" },
  { id: "support", label: "Поддержка", icon: "Headphones" },
];

export default function Layout({ currentPage, onNavigate, children, isLanding }: LayoutProps) {
  if (isLanding) {
    return (
      <div className="min-h-screen">
        {/* Top nav for landing */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))" }}>
                <Icon name="Zap" size={14} className="text-white" />
              </div>
              <span className="font-black text-lg">Nova<span className="gradient-text">SaaS</span></span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate("dashboard")} className="glass-card px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/8 transition-all">
                Войти
              </button>
              <button onClick={() => onNavigate("dashboard")} className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold">
                Начать →
              </button>
            </div>
          </div>
        </nav>
        <div className="pt-16">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-border" style={{ background: "hsl(var(--sidebar-background))" }}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-border">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))" }}>
            <Icon name="Zap" size={14} className="text-white" />
          </div>
          <span className="font-black text-base">Nova<span className="gradient-text">SaaS</span></span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-link w-full ${currentPage === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} fallback="Circle" size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => onNavigate("profile")}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/6 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))" }}>
              ИП
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium truncate">Иван Петров</div>
              <div className="text-xs text-muted-foreground truncate">Бизнес тариф</div>
            </div>
            <Icon name="Settings" size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <button
            onClick={() => onNavigate("landing")}
            className="nav-link w-full mt-1"
          >
            <Icon name="LogOut" size={16} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
