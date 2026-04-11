import { useState } from "react";
import Icon from "@/components/ui/icon";

const ENVS = [
  {
    id: "air",
    icon: "Navigation",
    label: "Воздух",
    emoji: "✈️",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.08)",
    border: "rgba(0,212,255,0.25)",
    title: "Воздушные БПЛА",
    desc: "Квадрокоптеры, мультироторы, самолётного типа. От компактных инспекционных до тяжёлых промышленных платформ с полезной нагрузкой до 20 кг.",
    platforms: ["Квадрокоптеры", "Гексакоптеры", "Самолёты БВПС", "Конвертопланы"],
    usecases: ["Инспекция ЛЭП", "Аэрофотосъёмка", "Мониторинг периметра", "Доставка"],
    controllers: ["ArduPilot", "PX4", "iNav"],
  },
  {
    id: "ground",
    icon: "Truck",
    label: "Земля",
    emoji: "🚗",
    color: "var(--signal-green)",
    accent: "rgba(0,255,136,0.06)",
    border: "rgba(0,255,136,0.25)",
    title: "Наземные роботы",
    desc: "Колёсные и гусеничные платформы для патрулирования, доставки и работы на промышленных объектах. Полная автономность на заданном маршруте.",
    platforms: ["Колёсные роботы", "Гусеничные платформы", "Шагающие роботы", "AGV"],
    usecases: ["Охрана объектов", "Доставка на складах", "Инспекция", "Промышленность"],
    controllers: ["ROS 2", "ArduRover", "Custom"],
  },
  {
    id: "water",
    icon: "Waves",
    label: "Вода",
    emoji: "🚤",
    color: "#3b9eff",
    accent: "rgba(59,158,255,0.06)",
    border: "rgba(59,158,255,0.25)",
    title: "Надводные и подводные",
    desc: "Автономные суда для мониторинга акваторий, гидрологических исследований и инспекции подводной инфраструктуры.",
    platforms: ["Катамараны-роботы", "Моторные лодки", "Подводные дроны", "Буи"],
    usecases: ["Мониторинг водоёмов", "Инспекция мостов", "Гидрология", "Рыбоводство"],
    controllers: ["ArduSub", "ArduBoat", "Custom"],
  },
];

const PROTOCOLS = [
  { name: "MAVLink v2", desc: "Основной протокол БПЛА", color: "var(--electric)" },
  { name: "ROS 2", desc: "Наземные роботы", color: "var(--signal-green)" },
  { name: "RTSP", desc: "Видеопотоки", color: "var(--warning)" },
  { name: "REST API", desc: "Интеграция с ИТ-системами", color: "var(--electric)" },
  { name: "WebSocket", desc: "Телеметрия реального времени", color: "var(--signal-green)" },
  { name: "MQTT", desc: "IoT-устройства и датчики", color: "var(--warning)" },
];

export default function LandingMultiEnv() {
  const [activeEnv, setActiveEnv] = useState(ENVS[0]);

  return (
    <>
      {/* ── МУЛЬТИСРЕДОВОСТЬ ── */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="tag tag-green mb-4">Мультисредовость</div>
          <h2 className="text-4xl font-bold mb-4">
            Воздух, земля и вода —
            <br />
            <span className="gradient-text">единая экосистема</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            SoloFly управляет воздушными, наземными, надводными и подводными аппаратами
            из единого командного центра. Любые платформы на ArduPilot, PX4 и iNav.
          </p>
        </div>

        {/* Environment tabs */}
        <div className="flex justify-center gap-3 mb-10 flex-wrap">
          {ENVS.map(env => (
            <button key={env.id} onClick={() => setActiveEnv(env)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{
                background: activeEnv.id === env.id ? env.accent : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeEnv.id === env.id ? env.border : "rgba(255,255,255,0.07)"}`,
                color: activeEnv.id === env.id ? env.color : "hsl(var(--muted-foreground))",
              }}>
              <span style={{ fontSize: 18 }}>{env.emoji}</span>
              {env.label}
            </button>
          ))}
        </div>

        {/* Active env detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: activeEnv.accent, border: `1px solid ${activeEnv.border}` }}>
                <Icon name={activeEnv.icon} fallback="Navigation" size={20} style={{ color: activeEnv.color }} />
              </div>
              <h3 className="font-bold text-xl">{activeEnv.title}</h3>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              {activeEnv.desc}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="hud-label mb-2" style={{ fontSize: 9 }}>ТИПЫ ПЛАТФОРМ</div>
                <ul className="space-y-1.5">
                  {activeEnv.platforms.map(p => (
                    <li key={p} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: activeEnv.color }} />
                      <span style={{ color: "hsl(var(--muted-foreground))" }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="hud-label mb-2" style={{ fontSize: 9 }}>СЦЕНАРИИ</div>
                <ul className="space-y-1.5">
                  {activeEnv.usecases.map(u => (
                    <li key={u} className="flex items-center gap-2 text-xs">
                      <Icon name="Check" size={10} style={{ color: activeEnv.color, flexShrink: 0 }} />
                      <span style={{ color: "hsl(var(--muted-foreground))" }}>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="hud-label mb-2" style={{ fontSize: 9 }}>ПОДДЕРЖИВАЕМЫЕ КОНТРОЛЛЕРЫ</div>
              <div className="flex gap-2 flex-wrap">
                {activeEnv.controllers.map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: `${activeEnv.color}12`, color: activeEnv.color, border: `1px solid ${activeEnv.color}25` }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: visual diagram */}
          <div className="rounded-2xl p-6"
            style={{ background: activeEnv.accent, border: `1px solid ${activeEnv.border}` }}>
            {/* SVG environment diagram */}
            <svg viewBox="0 0 320 200" className="w-full" style={{ maxHeight: 220 }}>
              {/* Ground */}
              <rect x="0" y="160" width="320" height="40" fill="rgba(0,255,136,0.06)" />
              <line x1="0" y1="160" x2="320" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              {/* Water */}
              {activeEnv.id === "water" && (
                <>
                  <rect x="0" y="130" width="320" height="30" fill="rgba(59,158,255,0.08)" />
                  <line x1="0" y1="130" x2="320" y2="130" stroke="rgba(59,158,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
                </>
              )}
              {/* Sky area */}
              <rect x="0" y="0" width="320" height="160" fill="rgba(0,212,255,0.02)" />

              {/* Platform icon */}
              {activeEnv.id === "air" && (
                <>
                  {/* Drone body */}
                  <circle cx="160" cy="80" r="12" fill={activeEnv.color} opacity="0.8" />
                  <circle cx="160" cy="80" r="20" fill="none" stroke={activeEnv.color} strokeWidth="0.5" opacity="0.3" />
                  {/* Arms */}
                  {[[-25,-25],[25,-25],[25,25],[-25,25]].map(([dx,dy], i) => (
                    <g key={i}>
                      <line x1="160" y1="80" x2={160+dx} y2={80+dy} stroke={activeEnv.color} strokeWidth="2" opacity="0.5" />
                      <circle cx={160+dx} cy={80+dy} r="5" fill={activeEnv.color} opacity="0.7" />
                    </g>
                  ))}
                  {/* Altitude line */}
                  <line x1="160" y1="100" x2="160" y2="158" stroke={activeEnv.color} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                  <text x="167" y="130" fontSize="8" fill={activeEnv.color} opacity="0.6" fontFamily="monospace">85м</text>
                </>
              )}
              {activeEnv.id === "ground" && (
                <>
                  {/* Ground robot */}
                  <rect x="140" y="143" width="40" height="18" rx="3" fill={activeEnv.color} opacity="0.7" />
                  <circle cx="150" cy="164" r="5" fill={activeEnv.color} opacity="0.5" />
                  <circle cx="170" cy="164" r="5" fill={activeEnv.color} opacity="0.5" />
                  <rect x="145" y="137" width="30" height="8" rx="2" fill={activeEnv.color} opacity="0.4" />
                </>
              )}
              {activeEnv.id === "water" && (
                <>
                  {/* Boat */}
                  <ellipse cx="160" cy="140" rx="35" ry="8" fill={activeEnv.color} opacity="0.6" />
                  <rect x="148" y="120" width="24" height="20" rx="2" fill={activeEnv.color} opacity="0.4" />
                  <line x1="160" y1="115" x2="160" y2="125" stroke={activeEnv.color} strokeWidth="1.5" opacity="0.5" />
                </>
              )}

              {/* Signal rings */}
              {[40, 70, 100].map((r, i) => (
                <circle key={i} cx="160" cy="80" r={r}
                  fill="none" stroke={activeEnv.color}
                  strokeWidth="0.4" opacity={0.1 - i * 0.025}
                  strokeDasharray="3 5" />
              ))}

              {/* Cloud connection */}
              <rect x="240" y="20" width="60" height="28" rx="6"
                fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
              <text x="270" y="30" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.5)" fontFamily="monospace">CLOUD</text>
              <text x="270" y="42" textAnchor="middle" fontSize="7" fill={activeEnv.color} fontFamily="monospace">SoloFly</text>

              {/* Data link */}
              <line x1="200" y1="34" x2="240" y2="34"
                stroke={activeEnv.color} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5" />
              <polygon points="238,31 244,34 238,37" fill={activeEnv.color} opacity="0.5" />

              {/* Labels */}
              <text x="10" y="155" fontSize="7" fill="rgba(255,255,255,0.25)" fontFamily="monospace">ПОВЕРХНОСТЬ</text>
              {activeEnv.id === "water" && (
                <text x="10" y="128" fontSize="7" fill="rgba(59,158,255,0.4)" fontFamily="monospace">УРОВЕНЬ ВОДЫ</text>
              )}
            </svg>

            {/* Live status strip */}
            <div className="flex items-center justify-between mt-3 pt-3"
              style={{ borderTop: `1px solid ${activeEnv.border}` }}>
              <div className="flex items-center gap-2">
                <span className="dot-online" style={{ background: activeEnv.color }} />
                <span className="text-xs font-semibold" style={{ color: activeEnv.color }}>Активна</span>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { icon: "Wifi", val: "98%" },
                  { icon: "Battery", val: "87%" },
                ].map(s => (
                  <div key={s.icon} className="flex items-center gap-1 text-xs"
                    style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Icon name={s.icon} fallback="Cpu" size={10} />
                    {s.val}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ПРОТОКОЛЫ ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="tag tag-electric mb-4">Интеграции</div>
          <h2 className="text-4xl font-bold mb-4">
            Открытый стек — <span className="gradient-text">любые интеграции</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
            Поддержка всех популярных протоколов обмена данными. Интеграция с корпоративными ИТ-системами через REST API.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {PROTOCOLS.map(proto => (
            <div key={proto.name} className="rounded-xl p-4 text-center transition-all hover:scale-[1.03]"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="font-bold text-sm mb-1" style={{ color: proto.color }}>{proto.name}</div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{proto.desc}</div>
            </div>
          ))}
        </div>

        {/* Hardware compatibility */}
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-xs font-bold tracking-widest uppercase mb-4"
            style={{ color: "hsl(var(--muted-foreground))", opacity: 0.5 }}>
            Совместимое оборудование
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Pixhawk 6C", "Cube Orange+", "NVIDIA Jetson Nano",
              "NVIDIA Jetson Xavier", "Raspberry Pi 4/5", "ArduPilot",
              "PX4 Autopilot", "iNav", "ESP32 (телеметрия)",
              "SiK Radio", "4G/LTE модемы", "RFD900",
            ].map(hw => (
              <span key={hw} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: "rgba(0,212,255,0.07)", color: "var(--electric)",
                  border: "1px solid rgba(0,212,255,0.15)",
                }}>
                {hw}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
