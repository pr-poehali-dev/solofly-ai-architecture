import { useState } from "react";
import Icon from "@/components/ui/icon";
import LandingIndustries from "./LandingIndustries";
import LandingAICapitan  from "./LandingAICapitan";
import LandingAIBank     from "./LandingAIBank";
import LandingMultiEnv   from "./LandingMultiEnv";
import LandingBento      from "./LandingBento";
import LandingCompare    from "./LandingCompare";
import LandingGrant      from "./LandingGrant";
import LandingOnboarding from "./LandingOnboarding";
import LandingPricing    from "./LandingPricing";

const TABS = [
  {
    id: "industries",
    icon: "Factory",
    label: "Отрасли",
    sub: "Задачи и результаты",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.25)",
  },
  {
    id: "tech",
    icon: "Brain",
    label: "Технологии",
    sub: "ИИ, архитектура, совместимость",
    color: "var(--signal-green)",
    accent: "rgba(0,255,136,0.07)",
    border: "rgba(0,255,136,0.25)",
  },
  {
    id: "grant",
    icon: "Award",
    label: "Конкурс",
    sub: "НИОКР · Старт-Пром-1",
    color: "#a78bfa",
    accent: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.25)",
    badge: "ФСИ",
  },
  {
    id: "pricing",
    icon: "CreditCard",
    label: "Тарифы",
    sub: "Цены и быстрый старт",
    color: "var(--warning)",
    accent: "rgba(255,149,0,0.06)",
    border: "rgba(255,149,0,0.25)",
  },
];

interface Props {
  onNavigate: (p: string) => void;
}

export default function LandingTabs({ onNavigate }: Props) {
  const [active, setActive] = useState<string | null>(null);

  const activeTab = TABS.find(t => t.id === active);

  return (
    <section className="px-6 py-10 max-w-6xl mx-auto">
      {/* Tab nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {TABS.map(tab => {
          const isOpen = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(isOpen ? null : tab.id)}
              className="relative rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: isOpen ? tab.accent : "rgba(255,255,255,0.03)",
                border: `1px solid ${isOpen ? tab.border : "rgba(255,255,255,0.07)"}`,
                boxShadow: isOpen ? `0 0 30px ${tab.color}12` : undefined,
              }}
            >
              {tab.badge && (
                <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded text-xs font-bold"
                  style={{ background: `${tab.color}20`, color: tab.color, fontSize: 8 }}>
                  {tab.badge}
                </div>
              )}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: isOpen ? `${tab.color}18` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isOpen ? tab.color + "30" : "rgba(255,255,255,0.08)"}`,
                }}>
                <Icon name={tab.icon} fallback="Cpu" size={17}
                  style={{ color: isOpen ? tab.color : "hsl(var(--muted-foreground))" }} />
              </div>
              <div className="font-bold text-sm mb-0.5"
                style={{ color: isOpen ? tab.color : "hsl(var(--foreground))" }}>
                {tab.label}
              </div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7 }}>
                {tab.sub}
              </div>
              <div className="absolute bottom-3 right-3">
                <Icon
                  name={isOpen ? "ChevronUp" : "ChevronDown"}
                  size={13}
                  style={{ color: isOpen ? tab.color : "rgba(255,255,255,0.2)" }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded content */}
      {active && activeTab && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: `1px solid ${activeTab.border}`,
            background: activeTab.accent,
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${activeTab.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${activeTab.color}18` }}>
                <Icon name={activeTab.icon} fallback="Cpu" size={14} style={{ color: activeTab.color }} />
              </div>
              <span className="font-bold text-sm">{activeTab.label}</span>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>· {activeTab.sub}</span>
            </div>
            <button
              onClick={() => setActive(null)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
              style={{ background: "rgba(255,255,255,0.06)" }}>
              <Icon name="X" size={13} style={{ color: "hsl(var(--muted-foreground))" }} />
            </button>
          </div>

          {/* Panel body */}
          <div className="px-4 py-6 md:px-6">
            {active === "industries" && (
              <LandingIndustries onNavigate={onNavigate} />
            )}

            {active === "tech" && (
              <div className="space-y-4">
                <LandingAICapitan onNavigate={onNavigate} />
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <LandingAIBank />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <LandingMultiEnv />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <LandingBento />
                </div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <LandingCompare />
                </div>
              </div>
            )}

            {active === "grant" && (
              <LandingGrant />
            )}

            {active === "pricing" && (
              <div className="space-y-4">
                <LandingOnboarding onNavigate={onNavigate} />
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
                  <LandingPricing onNavigate={onNavigate} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
