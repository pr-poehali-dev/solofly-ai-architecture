import { useState } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "./AuthPage";
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
import UCPPage from "./UCPPage";
import ProfilePage from "./ProfilePage";
import PrivacyPage from "./PrivacyPage";

type Page =
  | "landing" | "dashboard" | "missions" | "flightcontrol"
  | "ai" | "swarm" | "monitoring" | "flightlog"
  | "security" | "api" | "support" | "integrations" | "scanning" | "scanarchive" | "ucp"
  | "profile" | "privacy";

export default function Index() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>("landing");

  const navigate = (p: string) => setPage(p as Page);
  const isLanding = page === "landing";

  // Показываем спиннер пока восстанавливается сессия
  if (loading) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
            style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
            <span style={{ color: "var(--electric)", fontSize: 28 }}>✈</span>
          </div>
          <p className="hud-label animate-pulse">Загрузка SoloFly…</p>
        </div>
      </div>
    );
  }

  // Не авторизован — показываем страницу входа/регистрации
  if (!user) {
    // Показываем политику по прямой ссылке без авторизации
    if (new URLSearchParams(window.location.search).get("privacy") === "1") {
      return <PrivacyPage standalone onClose={() => window.history.back()} />;
    }
    return <AuthPage onSuccess={() => setPage("dashboard")} />;
  }

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
      case "ucp":         return <UCPPage />;
      case "profile":     return <ProfilePage />;
      case "privacy":     return <PrivacyPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={navigate} isLanding={isLanding}>
      {renderPage()}
    </Layout>
  );
}