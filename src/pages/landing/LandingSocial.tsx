import LandingTabs    from "./LandingTabs";
import LandingReviews from "./LandingReviews";
import LandingInfo    from "./LandingInfo";
import LandingFooter  from "./LandingFooter";

interface LandingSocialProps {
  onNavigate: (p: string) => void;
}

export default function LandingSocial({ onNavigate }: LandingSocialProps) {
  return (
    <>
      {/* 4 таба: Отрасли / Технологии / Конкурс / Тарифы — раскрываются по клику */}
      <LandingTabs onNavigate={onNavigate} />
      {/* Отзывы + trust-сигналы + FAQ — всегда видны */}
      <LandingReviews />
      {/* НИОКР + О проекте + Технология — всегда видны */}
      <LandingInfo />
      {/* CTA + Footer */}
      <LandingFooter onNavigate={onNavigate} />
    </>
  );
}
