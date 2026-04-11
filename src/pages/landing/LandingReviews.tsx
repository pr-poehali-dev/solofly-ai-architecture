import { useState } from "react";
import Icon from "@/components/ui/icon";
import { testimonials, faqs } from "./landingData";

export default function LandingReviews() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ── TRUST SIGNALS ── */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest uppercase mb-6"
            style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>
            Платформа соответствует требованиям
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { label: "152-ФЗ", desc: "Защита персональных данных" },
              { label: "Воздушный кодекс РФ", desc: "Авиационное законодательство" },
              { label: "Приказ Минтранса №494", desc: "Требования к БПЛА" },
              { label: "Ardupilot / PX4", desc: "Открытые стандарты" },
              { label: "MAVLink v2", desc: "Протокол связи" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>{item.label}</span>
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: "ShieldCheck", val: "100%", label: "Данные в России", color: "var(--signal-green)" },
            { icon: "Server", val: "99.9%", label: "Гарантия SLA", color: "var(--electric)" },
            { icon: "Lock", val: "TLS 1.3", label: "Шифрование", color: "var(--electric)" },
            { icon: "RefreshCw", val: "24/7", label: "Мониторинг системы", color: "var(--signal-green)" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl p-5 flex items-center gap-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${m.color}12`, border: `1px solid ${m.color}20` }}>
                <Icon name={m.icon} fallback="Check" size={18} style={{ color: m.color }} />
              </div>
              <div>
                <div className="font-bold text-base" style={{ color: m.color }}>{m.val}</div>
                <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{m.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ОТЗЫВЫ ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-green mb-4">Отзывы клиентов</div>
          <h2 className="text-4xl font-bold mb-3">Что говорят операторы</h2>
          <p className="text-muted-foreground text-sm">Реальные результаты от реальных клиентов</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <article key={t.name}
              className="rounded-2xl p-6 flex flex-col gap-4 transition-all hover:scale-[1.015]"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              itemScope itemType="https://schema.org/Review"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1 italic"
                style={{ color: "hsl(var(--muted-foreground))" }}
                itemProp="reviewBody">
                «{t.text}»
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: "rgba(0,212,255,0.12)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  {t.name.charAt(0)}
                </div>
                <div itemProp="author" itemScope itemType="https://schema.org/Person">
                  <div className="font-semibold text-xs" itemProp="name">{t.name}</div>
                  <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>
                    {t.role} · {t.org}
                  </div>
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
          <h2 className="text-4xl font-bold mb-3">Часто задаваемые вопросы</h2>
          <p className="text-muted-foreground text-sm">Отвечаем на самые популярные вопросы об SoloFly</p>
        </div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-xl overflow-hidden transition-all"
              style={{
                background: openFaq === i ? "rgba(0,212,255,0.04)" : "rgba(255,255,255,0.02)",
                border: openFaq === i ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
              }}
              itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
            >
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
                <div className="px-5 pb-5 text-sm leading-relaxed"
                  style={{ color: "hsl(var(--muted-foreground))" }}
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
