import Icon from "@/components/ui/icon";

interface LandingFooterProps {
  onNavigate: (p: string) => void;
}

export default function LandingFooter({ onNavigate }: LandingFooterProps) {
  return (
    <>
      {/* ── ФИНАЛЬНЫЙ CTA ── */}
      <section id="contacts" className="px-6 py-24 max-w-5xl mx-auto">
        <div className="relative rounded-3xl p-12 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,255,136,0.05) 60%, rgba(0,212,255,0.04) 100%)",
            border: "1px solid rgba(0,212,255,0.2)",
            boxShadow: "0 0 80px rgba(0,212,255,0.06)",
          }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(0,212,255,0.1) 0%, transparent 70%)",
          }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", color: "var(--signal-green)" }}>
              <span className="dot-online" />
              Доступно прямо сейчас
            </div>
            <h2 className="font-black mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Готовы к первому{" "}
              <span className="gradient-text">автономному полёту?</span>
            </h2>
            <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ color: "hsl(var(--muted-foreground))" }}>
              Зарегистрируйтесь за 30 секунд. Командный центр, ИИ-ядро, управление роем БПЛА — всё сразу. Карта не нужна.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button onClick={() => onNavigate("dashboard")}
                className="btn-electric px-10 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ boxShadow: "0 0 30px rgba(0,212,255,0.3)" }}>
                <Icon name="Rocket" size={16} />
                Начать бесплатно
              </button>
              <a href="/?privacy=1" target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "hsl(var(--muted-foreground))",
                }}>
                <Icon name="Shield" size={14} />
                Политика конфиденциальности
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {[
                { icon: "Lock", text: "SSL шифрование" },
                { icon: "CreditCard", text: "Оплата через ЮKassa" },
                { icon: "RotateCcw", text: "Отмена в любой момент" },
                { icon: "MapPin", text: "Серверы в России" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-xs"
                  style={{ color: "hsl(var(--muted-foreground))", opacity: 0.6 }}>
                  <Icon name={item.icon} fallback="Check" size={11} />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--electric)" }}>
                  <Icon name="Navigation" size={15} style={{ color: "hsl(210 25% 4%)" }} />
                </div>
                <span className="font-black text-lg tracking-tight">
                  Solo<span className="gradient-text">Fly</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                Интеллектуальная платформа управления БПЛА нового поколения. Разработка ООО «МАТ-Лабс», Россия.
              </p>
              <div className="flex items-center gap-2">
                <span className="dot-online" />
                <span className="text-xs" style={{ color: "var(--signal-green)" }}>Система работает</span>
              </div>
            </div>

            {/* Продукт */}
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>Продукт</div>
              <ul className="space-y-2.5">
                {[
                  { label: "Командный центр", page: "dashboard" },
                  { label: "Конструктор БПЛА", page: "dronebuilder" },
                  { label: "Тарифы", anchor: "#pricing" },
                ].map((link) => (
                  <li key={link.label}>
                    {link.page ? (
                      <button onClick={() => onNavigate(link.page!)}
                        className="text-sm hover:opacity-100 transition-opacity text-left"
                        style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>
                        {link.label}
                      </button>
                    ) : (
                      <a href={link.anchor || "#"}
                        className="text-sm hover:opacity-100 transition-opacity"
                        style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Компания */}
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>Компания</div>
              <ul className="space-y-2.5">
                {[
                  { label: "О проекте", anchor: "#about" },
                  { label: "НИОКР 2026", anchor: "#rnd" },
                  { label: "Технология", anchor: "#technology" },
                  { label: "mat-labs.ru", href: "https://mat-labs.ru" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href || link.anchor || "#"}
                      target={link.href ? "_blank" : undefined}
                      rel={link.href ? "noopener noreferrer" : undefined}
                      className="text-sm hover:opacity-100 transition-opacity"
                      style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Правовое */}
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>Правовое</div>
              <ul className="space-y-2.5">
                {[
                  { label: "Соответствие 152-ФЗ", anchor: "/?privacy=1" },
                  { label: "Политика конфиденциальности", anchor: "/?privacy=1" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.anchor}
                      className="text-sm hover:opacity-100 transition-opacity"
                      style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.45 }}>
              © {new Date().getFullYear()} ООО «МАТ-Лабс» · Все права защищены
            </div>
            <div className="flex items-center gap-4">
              {[
                { icon: "ShieldCheck", label: "152-ФЗ" },
                { icon: "Server", label: "Серверы РФ" },
                { icon: "Lock", label: "TLS 1.3" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs"
                  style={{ color: "hsl(var(--muted-foreground))", opacity: 0.45 }}>
                  <Icon name={item.icon} fallback="Check" size={11} />
                  {item.label}
                </div>
              ))}
            </div>
            <a href="https://mat-labs.ru" target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "var(--electric)" }}>
              mat-labs.ru
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}