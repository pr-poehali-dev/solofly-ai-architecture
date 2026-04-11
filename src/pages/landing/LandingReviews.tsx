import { useState } from "react";
import Icon from "@/components/ui/icon";
import { testimonials, faqs } from "./landingData";

export default function LandingReviews() {
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
    </>
  );
}
