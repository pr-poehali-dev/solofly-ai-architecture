import LandingIndustries  from "./LandingIndustries";
import LandingOnboarding  from "./LandingOnboarding";
import LandingAICapitan  from "./LandingAICapitan";
import LandingAIBank     from "./LandingAIBank";
import LandingMultiEnv   from "./LandingMultiEnv";
import LandingBento      from "./LandingBento";
import LandingCompare    from "./LandingCompare";
import LandingReviews    from "./LandingReviews";
import LandingPricing    from "./LandingPricing";
import LandingInfo       from "./LandingInfo";
import LandingFooter     from "./LandingFooter";

interface LandingSocialProps {
  onNavigate: (p: string) => void;
}

export default function LandingSocial({ onNavigate }: LandingSocialProps) {
  return (
    <>
      {/* Отраслевые решения с задачами и ROI */}
      <LandingIndustries onNavigate={onNavigate} />
      {/* Архитектура: AI Captain + Command Center */}
      <LandingAICapitan onNavigate={onNavigate} />
      {/* Банк нейросетей: YOLO11, сегментация, трекинг */}
      <LandingAIBank />
      {/* Мультисредовость + протоколы + оборудование */}
      <LandingMultiEnv />
      {/* Bento-grid возможностей */}
      <LandingBento />
      {/* Сравнение с конкурентами */}
      <LandingCompare />
      {/* Отзывы по отраслям + trust + FAQ */}
      <LandingReviews />
      {/* Как начать: 3 шага онбординга */}
      <LandingOnboarding onNavigate={onNavigate} />
      {/* Тарифы */}
      <LandingPricing onNavigate={onNavigate} />
      {/* НИОКР + О проекте + Технология */}
      <LandingInfo />
      {/* CTA + Footer */}
      <LandingFooter onNavigate={onNavigate} />
    </>
  );
}