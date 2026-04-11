import { useState } from "react";
import Icon from "@/components/ui/icon";
import { testimonials, faqs } from "./landingData";

interface LandingSocialProps {
  onNavigate: (p: string) => void;
}

export default function LandingSocial({ onNavigate }: LandingSocialProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ── Отзывы ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-green mb-4">Отзывы клиентов</div>
          <h2 className="text-4xl font-bold mb-3">Что говорят операторы</h2>
          <p className="text-muted-foreground">Реальные результаты от реальных клиентов</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <article key={t.name} className="panel rounded-2xl p-6 flex flex-col gap-4"
              itemScope itemType="https://schema.org/Review">
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} style={{ color: "#eab308", fontSize: 16 }}>★</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1" itemProp="reviewBody">
                «{t.text}»
              </p>
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: "rgba(0,212,255,0.15)", color: "var(--electric)" }}>
                  {t.name.charAt(0)}
                </div>
                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                  <div className="font-semibold text-xs" itemProp="name">{t.name}</div>
                  <div className="hud-label">{t.role} · {t.org}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 max-w-3xl mx-auto" itemScope itemType="https://schema.org/FAQPage">
        <div className="text-center mb-12">
          <div className="tag tag-electric mb-4">Вопросы и ответы</div>
          <h2 className="text-4xl font-bold">Часто задаваемые вопросы</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="panel rounded-xl overflow-hidden"
              itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-all hover:opacity-80"
              >
                <span className="font-semibold text-sm pr-4" itemProp="name">{f.q}</span>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className="shrink-0 transition-transform"
                  style={{
                    color: "var(--electric)",
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed"
                  itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

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
