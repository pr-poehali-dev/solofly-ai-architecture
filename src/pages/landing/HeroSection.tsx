import Icon from "@/components/ui/icon";
import { useCountUp } from "./landingData";

interface HeroSectionProps {
  onNavigate: (p: string) => void;
  onOpenDemo: () => void;
}

export default function HeroSection({ onNavigate, onOpenDemo }: HeroSectionProps) {
  const { count: missionsCount, ref: missionsRef } = useCountUp(1247);
  const { count: hoursCount,    ref: hoursRef }    = useCountUp(3840);
  const { count: accuracyCount, ref: accuracyRef } = useCountUp(974);
  const { count: dronesCount,   ref: dronesRef }   = useCountUp(47);

  return (
    <div className="relative px-6 pt-32 pb-8 max-w-7xl mx-auto w-full">
      {/* Badge */}
      <div className="flex justify-center mb-8 fade-up">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{
            background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.22)",
            color: "var(--electric)",
          }}>
          <span className="dot-online" />
          Открытое бета-тестирование · v0.9-beta
          <span style={{
            background: "rgba(0,255,136,0.15)", color: "var(--signal-green)",
            border: "1px solid rgba(0,255,136,0.3)", padding: "1px 8px", borderRadius: 99, fontSize: 9,
          }}>NEW</span>
        </div>
      </div>

      {/* Main headline */}
      <div className="text-center max-w-5xl mx-auto mb-6 fade-up">
        <h1 style={{
          fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 900,
          lineHeight: 1.05, letterSpacing: "-0.035em",
        }}>
          <span className="gradient-text">SoloFly — экспериментальная система</span>
          <br />
          <span style={{ color: "hsl(var(--foreground))" }}>автономного управления БПЛА на базе ИИ</span>
        </h1>
      </div>

      <p className="text-center max-w-2xl mx-auto mb-4 leading-relaxed fade-up"
        style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "hsl(var(--muted-foreground))" }}>
        Разработка алгоритмов адаптивной навигации и автономного принятия решений для промышленного применения.
      </p>


      <p className="text-center text-xs mb-10 fade-up"
        style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>
        Ardupilot · PX4 · MAVLink v2 · YOLO11 · Данные в России · 152-ФЗ
      </p>

      {/* CTA */}
      <div className="flex items-center justify-center gap-3 mb-16 flex-wrap fade-up">
        <button onClick={() => onNavigate("dashboard")}
          title="Запустить систему автономного управления БПЛА SoloFly"
          className="btn-electric px-9 py-4 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-[1.03] transition-all"
          style={{ boxShadow: "0 0 32px rgba(0,212,255,0.25)" }}>
          <Icon name="Rocket" size={16} />
          Запустить систему
        </button>
        <button onClick={onOpenDemo}
          title="Смотреть демо платформы управления БПЛА SoloFly"
          className="px-8 py-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:scale-[1.02]"
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
            color: "hsl(var(--foreground))",
          }}>
          <Icon name="Play" size={15} style={{ color: "var(--electric)" }} />
          Смотреть демо
        </button>
        <button onClick={() => onNavigate("dronebuilder")}
          title="Конструктор БПЛА — бесплатные руководства по сборке дронов"
          className="px-7 py-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:opacity-80"
          style={{ color: "hsl(var(--muted-foreground))" }}>
          <Icon name="Wrench" size={14} />
          Конструктор БПЛА
          <span style={{
            fontSize: 9, background: "rgba(0,255,136,0.15)", color: "var(--signal-green)",
            border: "1px solid rgba(0,255,136,0.3)", padding: "1px 6px", borderRadius: 99,
          }}>Бесплатно</span>
        </button>
      </div>

      {/* Hero screen */}
      <div className="relative max-w-5xl mx-auto mb-14 fade-up">
        <div style={{
          position: "absolute", inset: "-50px",
          background: "radial-gradient(ellipse at center, rgba(0,212,255,0.13) 0%, transparent 65%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />
        <div className="relative rounded-2xl overflow-hidden" style={{
          aspectRatio: "16/9",
          border: "1px solid rgba(0,212,255,0.28)",
          boxShadow: "0 0 80px rgba(0,212,255,0.09), 0 40px 90px rgba(0,0,0,0.55)",
        }}>
          <img
            src="https://cdn.poehali.dev/projects/5ef72b5b-2023-4dff-b313-89105094219f/files/ef12817c-6954-4f4e-ab4a-34ef3b34cbd0.jpg"
            alt="SoloFly — командный центр управления автономными дронами"
            className="w-full h-full object-cover"
            style={{ opacity: 0.85 }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to bottom, transparent 55%, rgba(5,9,14,0.85) 100%)",
          }} />
          <div className="absolute bottom-5 left-5 flex items-center gap-3">
            <span className="dot-online" />
            <span className="text-sm font-semibold" style={{ color: "var(--signal-green)" }}>
              Система активна · 2 дрона в полёте
            </span>
          </div>
          <div className="absolute top-5 right-5">
            <span className="tag tag-electric" style={{ fontSize: 10 }}>Live · ИИ-ядро v2.4.1</span>
          </div>
          <div style={{
            position: "absolute", top: 0, left: 0, width: 28, height: 28,
            borderTop: "2px solid rgba(0,212,255,0.55)", borderLeft: "2px solid rgba(0,212,255,0.55)",
          }} />
          <div style={{
            position: "absolute", bottom: 0, right: 0, width: 28, height: 28,
            borderBottom: "2px solid rgba(0,212,255,0.55)", borderRight: "2px solid rgba(0,212,255,0.55)",
          }} />
        </div>
      </div>

      {/* Counters strip */}
      <div className="max-w-3xl mx-auto rounded-2xl mb-10 fade-up" style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {[
          { ref: missionsRef, count: missionsCount, label: "Миссий выполнено", fmt: (v: number) => v.toLocaleString("ru-RU") },
          { ref: hoursRef,    count: hoursCount,    label: "Часов автополёта", fmt: (v: number) => v.toLocaleString("ru-RU") },
          { ref: accuracyRef, count: accuracyCount / 10, label: "Точность ИИ", fmt: (v: number) => v.toFixed(1) + "%" },
          { ref: dronesRef,   count: dronesCount,   label: "Дронов онлайн",   fmt: (v: number) => v.toLocaleString("ru-RU") },
        ].map((item, i) => (
          <div key={i} ref={item.ref} className="p-5 text-center"
            style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
            <div className="gradient-text font-black mb-1" style={{ fontSize: "1.85rem", lineHeight: 1 }}>
              {item.fmt(item.count)}
            </div>
            <div className="hud-label" style={{ fontSize: 10 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}