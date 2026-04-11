import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { billing, type MyPlan } from "@/lib/api";

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  isLanding?: boolean;
}

const navItems = [
  { id: "dashboard",    label: "Командный центр",   icon: "LayoutDashboard" },
  { id: "ucp",          label: "ЦУП",               icon: "Radio" },
  { id: "missions",     label: "Миссии",             icon: "Target" },
  { id: "flightcontrol",label: "Управление полётом", icon: "Navigation" },
  { id: "ai",           label: "ИИ-ядро",            icon: "Brain" },
  { id: "swarm",        label: "Рой БПЛА",           icon: "Network" },
  { id: "monitoring",   label: "Мониторинг",         icon: "Activity" },
  { id: "scanning",     label: "Сканирование",       icon: "ScanLine" },
  { id: "scanarchive",  label: "Архив сканов",       icon: "Archive" },
  { id: "flightlog",    label: "История полётов",    icon: "History" },
  { id: "security",     label: "Безопасность",       icon: "Shield" },
  { id: "api",          label: "API",                icon: "Code2" },
  { id: "integrations", label: "Подключения",        icon: "Plug" },
  { id: "pricing",      label: "Тарифы",             icon: "CreditCard" },
  { id: "support",      label: "Поддержка",          icon: "Headphones" },
];

// Главные разделы в мобильном нижнем таббаре
const mobileTabItems = [
  { id: "dashboard",     label: "Центр",    icon: "LayoutDashboard" },
  { id: "flightcontrol", label: "Пульт",    icon: "Navigation" },
  { id: "missions",      label: "Миссии",   icon: "Target" },
  { id: "monitoring",    label: "События",  icon: "Activity" },
  { id: "profile",       label: "Профиль",  icon: "User" },
];

export default function Layout({ currentPage, onNavigate, children, isLanding }: LayoutProps) {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const [myPlan, setMyPlan] = useState<MyPlan | null>(null);

  useEffect(() => {
    if (!user) return;
    billing.getMyPlan().then(r => setMyPlan(r.plan)).catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

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
              <button onClick={() => onNavigate("pricing")} className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-1.5">
                <Icon name="CreditCard" size={12} /> Тарифы
              </button>
              <button onClick={() => onNavigate("dashboard")} className="btn-ghost px-4 py-2 rounded-lg text-xs">
                Войти
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

  // ── МОБИЛЬНЫЙ LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: "hsl(var(--background))" }}>
        {/* Мобильная шапка */}
        <header className="flex items-center justify-between px-4 h-12 shrink-0 sticky top-0 z-40"
          style={{ background: "rgba(5,9,14,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "var(--electric)" }}>
              <Icon name="Navigation" size={12} style={{ color: "hsl(210 25% 4%)" }} />
            </div>
            <span className="font-bold text-sm tracking-tight">Solo<span className="gradient-text">Fly</span></span>
            <span className="tag tag-green ml-1" style={{ fontSize: 8 }}>LIVE</span>
          </div>
          {/* Имя пользователя */}
          {user && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                style={{ background: user.avatar_color, color: "hsl(210 25% 4%)" }}>
                {user.name.charAt(0).toUpperCase() || "?"}
              </div>
              <span className="text-xs text-muted-foreground">{user.name.split(" ")[0]}</span>
            </div>
          )}
        </header>

        {/* Контент — паддинг снизу под таббар */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Нижний таббар */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex"
          style={{
            background: "rgba(5,9,14,0.97)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid hsl(var(--border))",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}>
          {mobileTabItems.map(item => {
            const active = currentPage === item.id;
            const isProfile = item.id === "profile";
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all active:scale-95"
                style={{ color: active ? "var(--electric)" : "hsl(var(--muted-foreground))" }}
              >
                <div className="relative">
                  {isProfile && user ? (
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                      style={{
                        background: active ? user.avatar_color : `${user.avatar_color}60`,
                        color: "hsl(210 25% 4%)",
                        fontSize: 10,
                      }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <Icon name={item.icon} fallback="Circle" size={20} />
                  )}
                  {active && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--electric)" }} />
                  )}
                </div>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 400 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // ── ДЕСКТОП LAYOUT ────────────────────────────────────────────────────────────
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

        {/* Баннер тарифа */}
        {myPlan && myPlan.plan_id === "free" && (
          <button
            onClick={() => onNavigate("pricing")}
            className="mx-3 mt-2 p-3 rounded-lg w-[calc(100%-24px)] text-left transition-all hover:opacity-80"
            style={{ background: "rgba(0,212,255,0.07)", border: "1px solid rgba(0,212,255,0.2)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="hud-label">Тариф: Старт</span>
              <span className="tag tag-electric" style={{ fontSize: 8 }}>Free</span>
            </div>
            <div className="text-xs font-semibold" style={{ color: "var(--electric)" }}>
              Обновить → Про ✦
            </div>
          </button>
        )}
        {myPlan && myPlan.plan_id !== "free" && (
          <div className="mx-3 mt-2 p-2.5 rounded-lg" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
            <div className="flex items-center justify-between">
              <span className="hud-label">Тариф</span>
              <span className="tag tag-green" style={{ fontSize: 9 }}>{myPlan.name}</span>
            </div>
          </div>
        )}

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

        {/* Bottom — профиль */}
        <div className="p-3" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
          {user && (
            <button
              onClick={() => onNavigate("profile")}
              className="w-full flex items-center gap-2.5 p-3 rounded-lg mb-1 transition-all hover:opacity-80"
              style={{
                background: currentPage === "profile"
                  ? `${user.avatar_color}18`
                  : "hsl(var(--sidebar-accent))",
                border: currentPage === "profile"
                  ? `1px solid ${user.avatar_color}40`
                  : "1px solid transparent",
              }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs"
                style={{ background: user.avatar_color, color: "hsl(210 25% 4%)" }}>
                {user.name.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-semibold truncate">{user.name}</div>
                <div className="hud-label truncate" style={{ color: "var(--electric)", fontSize: 9 }}>
                  Редактировать профиль →
                </div>
              </div>
            </button>
          )}
          <button onClick={handleLogout} className="nav-item w-full">
            <Icon name="LogOut" size={15} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto" style={{ background: "hsl(var(--background))" }}>
        {/* Хлебные крошки (BreadcrumbList JSON-LD для Google) */}
        {currentPage !== "landing" && currentPage !== "dashboard" && (
          <>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://solofly-ai-architecture.poehali.dev/" },
                  { "@type": "ListItem", "position": 2, "name": "Система", "item": "https://solofly-ai-architecture.poehali.dev/?page=dashboard" },
                  ...( currentPage !== "dashboard" ? [{ "@type": "ListItem", "position": 3, "name": navItems.find(n => n.id === currentPage)?.label ?? currentPage, "item": `https://solofly-ai-architecture.poehali.dev/?page=${currentPage}` }] : []),
                ],
              })}}
            />
            <nav aria-label="breadcrumb"
              className="flex items-center gap-1.5 px-6 py-2 text-xs text-muted-foreground border-b"
              style={{ borderColor: "hsl(var(--border))" }}>
              <button onClick={() => onNavigate("dashboard")} className="hover:text-foreground transition-colors">
                Система
              </button>
              {currentPage !== "dashboard" && (
                <>
                  <span>/</span>
                  <span style={{ color: "hsl(var(--foreground))" }}>
                    {navItems.find(n => n.id === currentPage)?.label ?? currentPage}
                  </span>
                </>
              )}
            </nav>
          </>
        )}
        {children}
      </main>
    </div>
  );
}