import { useState } from "react";
import Layout from "@/components/Layout";
import LandingPage from "./LandingPage";
import DashboardPage from "./DashboardPage";
import ProfilePage from "./ProfilePage";
import SubscriptionsPage from "./SubscriptionsPage";
import BillingPage from "./BillingPage";
import ApiDocsPage from "./ApiDocsPage";
import SupportPage from "./SupportPage";
import IntegrationsPage from "./IntegrationsPage";

type Page = "landing" | "dashboard" | "profile" | "subscriptions" | "billing" | "api" | "support" | "integrations";

export default function Index() {
  const [page, setPage] = useState<Page>("landing");

  const navigate = (p: string) => setPage(p as Page);
  const isLanding = page === "landing";

  const renderPage = () => {
    switch (page) {
      case "landing": return <LandingPage onNavigate={navigate} />;
      case "dashboard": return <DashboardPage />;
      case "profile": return <ProfilePage />;
      case "subscriptions": return <SubscriptionsPage />;
      case "billing": return <BillingPage />;
      case "api": return <ApiDocsPage />;
      case "support": return <SupportPage />;
      case "integrations": return <IntegrationsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={navigate} isLanding={isLanding}>
      {renderPage()}
    </Layout>
  );
}
