import { useState, useEffect } from "react";
import LandingHero   from "./landing/LandingHero";
import LandingSocial from "./landing/LandingSocial";
import { DemoModal, PromoPopup } from "./landing/LandingModals";

interface Props { onNavigate: (p: string) => void; }

export default function LandingPage({ onNavigate }: Props) {
  const [showDemo,   setShowDemo]   = useState(false);
  const [demoSlide,  setDemoSlide]  = useState(0);
  const [showPromo,  setShowPromo]  = useState(false);
  const [promoShown, setPromoShown] = useState(false);

  // Pop-up через 12 сек для посетителя (мероприятие по привлечению)
  useEffect(() => {
    if (promoShown) return;
    const t = setTimeout(() => { setShowPromo(true); setPromoShown(true); }, 12000);
    return () => clearTimeout(t);
  }, [promoShown]);

  return (
    <div className="min-h-screen grid-bg">

      {showDemo && (
        <DemoModal
          slide={demoSlide}
          onSlide={setDemoSlide}
          onClose={() => setShowDemo(false)}
          onNavigate={onNavigate}
        />
      )}

      {showPromo && (
        <PromoPopup
          onClose={() => setShowPromo(false)}
          onNavigate={onNavigate}
        />
      )}

      <LandingHero
        onNavigate={onNavigate}
        onOpenDemo={() => { setShowDemo(true); setDemoSlide(0); }}
      />

      <LandingSocial onNavigate={onNavigate} />

    </div>
  );
}
