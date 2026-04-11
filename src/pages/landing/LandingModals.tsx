import { useState } from "react";
import Icon from "@/components/ui/icon";
import { DEMO_SLIDES } from "./landingData";

// ─── Lazy-загрузка слайда с skeleton ─────────────────────────────────────────

function SlideImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);

  return (
    <>
      {/* Skeleton пока грузится */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,212,255,0.04)" }}>
          <div className="space-y-3 w-full px-12 opacity-40">
            <div className="h-3 rounded animate-pulse" style={{ background: "rgba(0,212,255,0.2)", width: "60%" }} />
            <div className="h-3 rounded animate-pulse" style={{ background: "rgba(0,212,255,0.15)", width: "80%" }} />
            <div className="h-3 rounded animate-pulse" style={{ background: "rgba(0,212,255,0.1)", width: "45%" }} />
          </div>
          <div className="absolute">
            <Icon name="ImageOff" size={28} style={{ color: "rgba(0,212,255,0.2)" }} />
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="text-center">
            <Icon name="ImageOff" size={28} style={{ color: "rgba(255,255,255,0.3)" }} />
            <div className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Не удалось загрузить</div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover fade-up"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
      />
    </>
  );
}

// ─── Демо-модал ───────────────────────────────────────────────────────────────

interface DemoModalProps {
  slide:        number;
  onSlide:      (s: number) => void;
  onClose:      () => void;
  onNavigate:   (p: string) => void;
}

export function DemoModal({ slide, onSlide, onClose, onNavigate }: DemoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl panel rounded-2xl overflow-hidden fade-up"
        style={{ border: "1px solid rgba(0,212,255,0.25)" }}>

        {/* Шапка */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid hsl(var(--border))", background: "rgba(0,212,255,0.04)" }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--signal-green)", boxShadow: "0 0 6px var(--signal-green)" }} />
            <span className="font-bold text-sm">Демо-режим SoloFly</span>
            <span className="tag tag-electric" style={{ fontSize: 9 }}>Без регистрации</span>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Слайд */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <SlideImage
            src={DEMO_SLIDES[slide].img}
            alt={DEMO_SLIDES[slide].title}
            key={slide}
          />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(5,9,14,0.92) 0%, transparent 50%)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-bold text-lg mb-1">{DEMO_SLIDES[slide].title}</h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed max-w-lg">
              {DEMO_SLIDES[slide].desc}
            </p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_SLIDES[slide].tags.map(t => (
                <span key={t} className="tag tag-electric" style={{ fontSize: 9 }}>{t}</span>
              ))}
            </div>
          </div>
          {slide > 0 && (
            <button
              onClick={() => onSlide(slide - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "rgba(5,9,14,0.7)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <Icon name="ChevronLeft" size={18} style={{ color: "var(--electric)" }} />
            </button>
          )}
          {slide < DEMO_SLIDES.length - 1 && (
            <button
              onClick={() => onSlide(slide + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "rgba(5,9,14,0.7)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <Icon name="ChevronRight" size={18} style={{ color: "var(--electric)" }} />
            </button>
          )}
        </div>

        {/* Точки + CTA */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex gap-2">
            {DEMO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => onSlide(i)}
                className="transition-all rounded-full"
                style={{
                  width:      slide === i ? 20 : 8,
                  height:     8,
                  background: slide === i ? "var(--electric)" : "rgba(0,212,255,0.25)",
                }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-ghost px-4 py-2 rounded-lg text-xs">
              Закрыть
            </button>
            <button
              onClick={() => { onClose(); onNavigate("dashboard"); }}
              className="btn-electric px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2">
              <Icon name="LogIn" size={13} /> Войти в систему
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Промо pop-up ─────────────────────────────────────────────────────────────

interface PromoPopupProps {
  onClose:    () => void;
  onNavigate: (p: string) => void;
}

export function PromoPopup({ onClose, onNavigate }: PromoPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md panel rounded-2xl p-6 fade-up relative"
        style={{ border: "1px solid rgba(0,212,255,0.3)" }}>
        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-1.5 rounded-lg">
          <Icon name="X" size={16} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,212,255,0.15)" }}>
            <Icon name="Zap" size={20} style={{ color: "var(--electric)" }} />
          </div>
          <div>
            <div className="font-bold text-sm">Бесплатный доступ</div>
            <div className="hud-label">Только сейчас — без ограничений</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Зарегистрируйтесь прямо сейчас и получите полный доступ к командному центру SoloFly —
          все модули, все дроны, весь ИИ. Бесплатно и без карты.
        </p>
        <div className="flex gap-2">
          <button onClick={() => { onClose(); onNavigate("dashboard"); }}
            className="btn-electric flex-1 py-2.5 rounded-lg text-sm font-semibold">
            Начать бесплатно →
          </button>
          <button onClick={onClose} className="btn-ghost px-4 py-2.5 rounded-lg text-sm">
            Позже
          </button>
        </div>
      </div>
    </div>
  );
}