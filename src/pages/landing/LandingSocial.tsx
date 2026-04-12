import LandingTabs       from "./LandingTabs";
import LandingIndustries from "./LandingIndustries";
import LandingReviews    from "./LandingReviews";
import LandingInfo       from "./LandingInfo";
import LandingFooter     from "./LandingFooter";

interface LandingSocialProps {
  onNavigate: (p: string) => void;
}

export default function LandingSocial({ onNavigate }: LandingSocialProps) {
  return (
    <>
      {/* Отраслевые кейсы — всегда видны */}
      <LandingIndustries onNavigate={onNavigate} />
      {/* Возможности / Тарифы — раскрываются по клику */}
      <LandingTabs onNavigate={onNavigate} />
      {/* Отзывы + trust-сигналы + FAQ */}
      <LandingReviews />
      {/* НИОКР + О проекте + Технология + Команда */}
      <LandingInfo />
      {/* CTA + Footer */}
      <LandingFooter onNavigate={onNavigate} />
    </>
  );
}