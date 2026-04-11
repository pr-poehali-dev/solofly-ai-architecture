import HeroBackground from "./HeroBackground";
import HeroSection    from "./HeroSection";
import HeroUseCases   from "./HeroUseCases";

interface LandingHeroProps {
  onNavigate: (p: string) => void;
  onOpenDemo: () => void;
}

export default function LandingHero({ onNavigate, onOpenDemo }: LandingHeroProps) {
  return (
    <>
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}
      >
        <HeroBackground />
        <HeroSection onNavigate={onNavigate} onOpenDemo={onOpenDemo} />
      </section>

      {/* ── ПРИМЕНЕНИЕ · ЭКОСИСТЕМА · ВОЗМОЖНОСТИ · КОНСТРУКТОР ── */}
      <HeroUseCases onNavigate={onNavigate} />
    </>
  );
}
