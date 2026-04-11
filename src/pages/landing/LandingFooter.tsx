import Icon from "@/components/ui/icon";

interface LandingFooterProps {
  onNavigate: (p: string) => void;
}

export default function LandingFooter({ onNavigate }: LandingFooterProps) {
  return (
    <>
      {/* ── Final CTA ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden p-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,255,136,0.04) 50%, rgba(0,212,255,0.06) 100%)",
            border: "1px solid rgba(0,212,255,0.2)",
          }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
            width: "60%", height: "200%",
            background: "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          {/* Grid */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}>
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,1)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{
                background: "rgba(0,255,136,0.1)",
                border: "1px solid rgba(0,255,136,0.25)",
                color: "var(--signal-green)",
              }}>
              <span className="dot-online" />
              Бесплатная регистрация — без карты
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Готовы к первому<br />
              <span className="gradient-text">автономному полёту?</span>
            </h2>

            <p className="text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Зарегистрируйтесь за 30 секунд. Полный доступ к командному центру, управлению полётом, ИИ-ядру и рою БПЛА — сразу после регистрации.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate("dashboard")}
                className="px-10 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.03]"
                style={{
                  background: "var(--electric)",
                  color: "hsl(210 25% 4%)",
                  boxShadow: "0 0 30px rgba(0,212,255,0.3)",
                }}
              >
                <Icon name="Rocket" size={16} />
                Начать бесплатно →
              </button>
              <button
                onClick={() => onNavigate("dronebuilder")}
                className="px-8 py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <Icon name="Wrench" size={15} />
                Конструктор БПЛА
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
              {[
                "Карта не нужна",
                "Данные в России",
                "Отмена в любое время",
              ].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs"
                  style={{ color: "hsl(var(--muted-foreground))" }}>
                  <Icon name="Check" size={12} style={{ color: "var(--signal-green)" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--electric)" }}>
                  <Icon name="Navigation" size={14} style={{ color: "hsl(210 25% 4%)" }} />
                </div>
                <span className="font-bold tracking-tight">Solo<span className="gradient-text">Fly</span></span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                Интеллектуальная система автономного управления БПЛА. Россия, 2026.
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="dot-online" style={{ width: 5, height: 5 }} />
                <span className="text-xs" style={{ color: "var(--signal-green)" }}>Система онлайн</span>
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="font-semibold text-xs mb-3 tracking-wider uppercase"
                style={{ color: "hsl(var(--muted-foreground))" }}>Продукт</div>
              <ul className="space-y-2">
                {[
                  { label: "Возможности", action: () => {} },
                  { label: "Тарифы", action: () => {} },
                  { label: "Конструктор БПЛА", action: () => onNavigate("dronebuilder") },
                  { label: "API документация", action: () => onNavigate("api") },
                ].map(item => (
                  <li key={item.label}>
                    <button onClick={item.action}
                      className="text-xs hover:text-foreground transition-colors text-left"
                      style={{ color: "hsl(var(--muted-foreground))" }}>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="font-semibold text-xs mb-3 tracking-wider uppercase"
                style={{ color: "hsl(var(--muted-foreground))" }}>Компания</div>
              <ul className="space-y-2">
                {[
                  { label: "О проекте", href: null },
                  { label: "Новости", href: null },
                  { label: "Поддержка", action: () => onNavigate("support") },
                  { label: "ООО МАТ-Лабс", href: "https://mat-labs.ru" },
                ].map(item => (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-xs hover:text-foreground transition-colors"
                        style={{ color: "hsl(var(--muted-foreground))" }}>
                        {item.label}
                      </a>
                    ) : (
                      <button
                        onClick={item.action ?? undefined}
                        className="text-xs hover:text-foreground transition-colors text-left"
                        style={{ color: "hsl(var(--muted-foreground))" }}>
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="font-semibold text-xs mb-3 tracking-wider uppercase"
                style={{ color: "hsl(var(--muted-foreground))" }}>Правовое</div>
              <ul className="space-y-2">
                {[
                  { label: "Политика конфиденциальности", href: "/?privacy=1" },
                  { label: "152-ФЗ соблюдён", href: null },
                  { label: "Воздушный кодекс РФ", href: null },
                ].map(item => (
                  <li key={item.label}>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-xs hover:text-foreground transition-colors flex items-center gap-1"
                        style={{ color: "hsl(var(--muted-foreground))" }}>
                        <Icon name="Shield" size={10} />
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-xs flex items-center gap-1"
                        style={{ color: "hsl(var(--muted-foreground))" }}>
                        <Icon name="Check" size={10} style={{ color: "var(--signal-green)" }} />
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              © {new Date().getFullYear()} ООО МАТ-Лабс · solofly.ru
            </span>
            <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              <span className="flex items-center gap-1">
                <Icon name="MapPin" size={10} style={{ color: "var(--electric)" }} />
                Россия
              </span>
              <span>·</span>
              <a href="https://mat-labs.ru" target="_blank" rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity" style={{ color: "var(--electric)" }}>
                mat-labs.ru
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
