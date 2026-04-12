import { useState, useEffect } from "react";
import LandingHero       from "./landing/LandingHero";
import LandingSocial     from "./landing/LandingSocial";
import LandingInfo       from "./landing/LandingInfo";
import LandingBento      from "./landing/LandingBento";
import LandingTabs       from "./landing/LandingTabs";
import LandingIndustries from "./landing/LandingIndustries";
import LandingPricing    from "./landing/LandingPricing";
import LandingReviews    from "./landing/LandingReviews";
import LandingGrant      from "./landing/LandingGrant";
import LandingFooter     from "./landing/LandingFooter";
import { DemoModal, PromoPopup } from "./landing/LandingModals";

interface Props { onNavigate: (p: string) => void; }

// Показываем popup только на десктопе
const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;

// Проверяем — видел ли уже этот сеанс (чтобы не раздражать при навигации)
const PROMO_KEY = "sf_promo_shown";
const promoAlreadySeen = () => {
  try { return !!sessionStorage.getItem(PROMO_KEY); } catch { return true; }
};
const markPromoSeen = () => {
  try { sessionStorage.setItem(PROMO_KEY, "1"); } catch { /* ignore */ }
};

export default function LandingPage({ onNavigate }: Props) {
  const [showDemo,   setShowDemo]   = useState(false);
  const [demoSlide,  setDemoSlide]  = useState(0);
  const [showPromo,  setShowPromo]  = useState(false);

  // Popup: только десктоп + только если не видел в этом сеансе + через 30 сек
  useEffect(() => {
    if (!isDesktop || promoAlreadySeen()) return;
    const t = setTimeout(() => {
      setShowPromo(true);
      markPromoSeen();
    }, 30_000);
    return () => clearTimeout(t);
  }, []);

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
      <LandingInfo />
      <LandingBento />
      <LandingTabs onNavigate={onNavigate} />
      <LandingIndustries onNavigate={onNavigate} />
      <LandingReviews />
      <LandingGrant />
      <LandingPricing onNavigate={onNavigate} />
      <LandingFooter onNavigate={onNavigate} />

    </div>
  );
}