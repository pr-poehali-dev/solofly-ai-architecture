import Icon from "@/components/ui/icon";

interface LandingFooterProps {
  onNavigate: (p: string) => void;
}

export default function LandingFooter({ onNavigate }: LandingFooterProps) {
  return (
    <>
      {/* ── CTA финальный ── */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <div className="panel-glow rounded-2xl p-12">
          <div className="tag tag-electric mb-6 mx-auto" style={{ width: "fit-content" }}>Бесплатно</div>
          <h2 className="text-4xl font-bold mb-4">Готовы к первому автономному полёту?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Зарегистрируйтесь за 30 секунд. Полный доступ ко всем модулям — командный центр,
            управление полётом, ИИ-ядро, рой БПЛА. Карта не нужна.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate("dashboard")}
              className="btn-electric px-10 py-4 rounded-lg font-bold text-sm">
              Начать бесплатно →
            </button>
            <a href="/?privacy=1" target="_blank" rel="noopener noreferrer"
              className="btn-ghost px-6 py-4 rounded-lg text-sm flex items-center justify-center gap-2">
              <Icon name="Shield" size={14} /> Политика конфиденциальности
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-6 py-8" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--electric)" }}>
              <Icon name="Navigation" size={14} style={{ color: "hsl(210 25% 4%)" }} />
            </div>
            <span className="font-bold text-sm tracking-tight">Solo<span className="gradient-text">Fly</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap justify-center">
            <a href="/?privacy=1" target="_blank" rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1">
              <Icon name="Shield" size={11} /> Конфиденциальность
            </a>
            <span>·</span>
            <span>152-ФЗ соблюдён</span>
            <span>·</span>
            <a href="https://mat-labs.ru" target="_blank" rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity" style={{ color: "var(--electric)" }}>
              ООО МАТ-Лабс
            </a>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} mat-labs.ru
          </div>
        </div>
      </footer>
    </>
  );
}
