import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import AuthPage from "./AuthPage";
import LandingPage from "./LandingPage";
import PaywallPage from "./PaywallPage";
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
import DroneConnectPage from "./DroneConnectPage";

type Page =
  | "landing" | "auth" | "dashboard" | "missions" | "flightcontrol"
  | "ai" | "swarm" | "monitoring" | "flightlog"
  | "security" | "api" | "support" | "integrations" | "scanning" | "scanarchive" | "ucp"
  | "profile" | "privacy" | "droneconnect";

export default function Index() {
  const { user, loading, hasPlan, refreshUser } = useAuth();
  const [page, setPage] = useState<Page>("landing");

  const navigate = (p: string) => setPage(p as Page);
  const isLanding = page === "landing";

  // Если вернулся с оплаты (?paid=1) — обновляем сессию
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("paid") === "1" && user) {
      // Опрашиваем auth/me каждые 3 сек до 5 раз — ждём webhook
      let attempts = 0;
      const check = setInterval(async () => {
        await refreshUser();
        attempts++;
        if (attempts >= 5) clearInterval(check);
      }, 3000);
      return () => clearInterval(check);
    }
  }, [user, refreshUser]);

  // Спиннер загрузки
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

  // Не авторизован — лендинг или форма входа
  if (!user) {
    if (new URLSearchParams(window.location.search).get("privacy") === "1") {
      return <PrivacyPage standalone onClose={() => window.history.back()} />;
    }
    if (page === "landing" || page === "privacy") {
      const publicNavigate = (p: string) => {
        if (p === "landing" || p === "privacy") setPage(p as Page);
        else setPage("auth" as Page);
      };
      return (
        <Layout currentPage={page} onNavigate={publicNavigate} isLanding>
          {page === "privacy" ? <PrivacyPage /> : <LandingPage onNavigate={publicNavigate} />}
        </Layout>
      );
    }
    return <AuthPage onSuccess={() => setPage("dashboard")} />;
  }

  // Авторизован, но нет активной подписки → Paywall
  if (!hasPlan) {
    return <PaywallPage onSuccess={refreshUser} />;
  }

  const renderPage = () => {
    switch (page) {
      case "landing":       return <LandingPage onNavigate={navigate} />;
      case "dashboard":     return <DashboardPage />;
      case "missions":      return <MissionsPage />;
      case "flightcontrol": return <FlightControlPage />;
      case "ai":            return <AIPage />;
      case "swarm":         return <SwarmPage />;
      case "monitoring":    return <MonitoringPage />;
      case "flightlog":     return <FlightLogPage />;
      case "security":      return <SecurityPage />;
      case "api":           return <ApiDocsPage />;
      case "support":       return <SupportPage />;
      case "integrations":  return <IntegrationsPage />;
      case "scanning":      return <ScanningPage onNavigate={navigate} />;
      case "scanarchive":   return <ScanArchivePage />;
      case "ucp":           return <UCPPage />;
      case "profile":       return <ProfilePage />;
      case "privacy":       return <PrivacyPage />;
      case "droneconnect":  return <DroneConnectPage />;
      case "auth":          return <DashboardPage />;
      default:              return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={page} onNavigate={navigate} isLanding={isLanding}>
      {renderPage()}
    </Layout>
  );
}
