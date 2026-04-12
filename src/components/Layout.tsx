import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

function PlanBadge({ user }: { user: { plan_id?: string; plan_expires_at?: string | null } | null }) {
  if (!user?.plan_id || user.plan_id === "free") return null;
  const daysLeft = user.plan_expires_at
    ? Math.ceil((new Date(user.plan_expires_at).getTime() - Date.now()) / 86400000)
    : null;
  const warn = daysLeft !== null && daysLeft <= 7;
  return (
    <div className="mx-3 mt-2 p-2.5 rounded-lg"
      style={{
        background: warn ? "rgba(255,165,0,0.07)" : "rgba(0,255,136,0.06)",
        border: `1px solid ${warn ? "rgba(255,165,0,0.25)" : "rgba(0,255,136,0.15)"}`,
      }}>
      <div className="flex items-center justify-between">
        <span className="hud-label">Подписка</span>
        <span className={`tag ${warn ? "tag-warning" : "tag-green"}`} style={{ fontSize: 9 }}>
          {user.plan_id.toUpperCase()}
        </span>
      </div>
      {daysLeft !== null && (
        <div className="hud-label mt-0.5" style={{ fontSize: 9, color: warn ? "var(--warning)" : "var(--muted-foreground)" }}>
          {warn ? `⚠ Истекает через ${daysLeft} дн.` : `Активна · ${daysLeft} дн.`}
        </div>
      )}
    </div>
  );
}

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
  { id: "droneconnect",  label: "Подключение дрона",  icon: "Wifi" },
  { id: "dronebuilder", label: "Конструктор БПЛА",   icon: "Wrench" },
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
            <div className="flex items-center gap-1">
              {[
                { label: "О проекте", anchor: "about" },
                { label: "НИОКР", anchor: "rnd" },
                { label: "Технология", anchor: "technology" },
                { label: "Команда", anchor: "team" },
                { label: "Контакты", anchor: "contacts" },
                { label: "Тарифы", anchor: "pricing" },
              ].map(item => (
                <button
                  key={item.anchor}
                  onClick={() => {
                    const el = document.getElementById(item.anchor);
                    if (el) window.scrollTo({ top: el.offsetTop - 56, behavior: "smooth" });
                  }}
                  className="btn-ghost px-3 py-2 rounded-lg text-xs hidden md:flex"
                >
                  {item.label}
                </button>
              ))}
              <button onClick={() => onNavigate("dashboard")} className="btn-ghost px-4 py-2 rounded-lg text-xs ml-1">
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

        <PlanBadge user={user} />

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