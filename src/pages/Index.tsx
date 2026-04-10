import { useState } from "react";
import Layout from "@/components/Layout";
import LandingPage from "./LandingPage";
import DashboardPage from "./DashboardPage";
import MissionsPage from "./MissionsPage";
import AIPage from "./AIPage";
import FlightLogPage from "./FlightLogPage";
import ApiDocsPage from "./ApiDocsPage";
import SupportPage from "./SupportPage";
import IntegrationsPage from "./IntegrationsPage";

type Page = "landing" | "dashboard" | "missions" | "ai" | "flightlog" | "api" | "support" | "integrations";

export default function Index() {
  const [page, setPage] = useState<Page>("landing");

  const navigate = (p: string) => setPage(p as Page);
  const isLanding = page === "landing";

  const renderPage = () => {
    switch (page) {
      case "landing": return <LandingPage onNavigate={navigate} />;
      case "dashboard": return <DashboardPage />;
      case "missions": return <MissionsPage />;
      case "ai": return <AIPage />;
      case "flightlog": return <FlightLogPage />;
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
