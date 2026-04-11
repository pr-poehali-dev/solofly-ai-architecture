import LandingReviews from "./LandingReviews";
import LandingPricing from "./LandingPricing";
import LandingInfo from "./LandingInfo";
import LandingFooter from "./LandingFooter";

interface LandingSocialProps {
  onNavigate: (p: string) => void;
}

export default function LandingSocial({ onNavigate }: LandingSocialProps) {
  return (
    <>
      <LandingReviews />
      <LandingPricing onNavigate={onNavigate} />
      <LandingInfo />
      <LandingFooter onNavigate={onNavigate} />
    </>
  );
}
