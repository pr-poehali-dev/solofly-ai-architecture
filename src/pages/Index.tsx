import { useState } from "react";
import Layout from "@/components/Layout";
import LandingPage from "./LandingPage";
import DashboardPage from "./DashboardPage";
import MissionsPage from "./MissionsPage";
import FlightControlPage from "./FlightControlPage";
import AIPage from "./AIPage";
import SwarmPage from "./SwarmPage";
import MonitoringPage from "./MonitoringPage";
import FlightLogPage from "./FlightLogPage";
import SecurityPage from "./SecurityPage";
import ApiDocsPage from "./ApiDocsPage";
import SupportPage from "./SupportPage";
import IntegrationsPage from "./IntegrationsPage";
import ScanningPage from "./ScanningPage";
import ScanArchivePage from "./ScanArchivePage";

type Page =
  | "landing" | "dashboard" | "missions" | "flightcontrol"
  | "ai" | "swarm" | "monitoring" | "flightlog"
  | "security" | "api" | "support" | "integrations" | "scanning" | "scanarchive";

export default function Index() {
  const [page, setPage] = useState<Page>("landing");

  const navigate = (p: string) => setPage(p as Page);
  const isLanding = page === "landing";

  const renderPage = () => {
    switch (page) {
      case "landing": return <LandingPage onNavigate={navigate} />;
      case "dashboard": return <DashboardPage />;
      case "missions": return <MissionsPage />;
      case "flightcontrol": return <FlightControlPage />;
      case "ai": return <AIPage />;
      case "swarm": return <SwarmPage />;
      case "monitoring": return <MonitoringPage />;
      case "flightlog": return <FlightLogPage />;
      case "security": return <SecurityPage />;
      case "api": return <ApiDocsPage />;
      case "support": return <SupportPage />;
      case "integrations": return <IntegrationsPage />;
      case "scanning":    return <ScanningPage onNavigate={navigate} />;
      case "scanarchive": return <ScanArchivePage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={navigate} isLanding={isLanding}>
      {renderPage()}
    </Layout>
  );
}