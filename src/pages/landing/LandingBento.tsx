import { useRef, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const BENTO = [
  {
    id: "ai",
    col: "md:col-span-2",
    row: "",
    icon: "Brain",
    tag: "ИИ-ядро",
    title: "Автономные решения без оператора",
    desc: "Нейросетевое ядро принимает решения на борту за <15 мс. До 85% типовых сценариев выполняется без участия человека.",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.06)",
    border: "rgba(0,212,255,0.18)",
    visual: "ai",
  },
  {
    id: "russia",
    col: "",
    row: "",
    icon: "Shield",
    tag: "Безопасность",
    title: "Данные только в России",
    desc: "Серверы в РФ, соответствие 152-ФЗ и Воздушному кодексу. Никакой иностранной инфраструктуры.",
    color: "var(--signal-green)",
    accent: "rgba(0,255,136,0.05)",
    border: "rgba(0,255,136,0.18)",
    visual: "shield",
  },
  {
    id: "swarm",
    col: "",
    row: "",
    icon: "Network",
    tag: "Рой БПЛА",
    title: "Управление роем до 20 дронов",
    desc: "Координация группы, распределение задач и обмен данными между дронами в реальном времени.",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.05)",
    border: "rgba(0,212,255,0.12)",
    visual: "swarm",
  },
  {
    id: "mavlink",
    col: "",
    row: "",
    icon: "Cpu",
    tag: "Открытый стек",
    title: "Ardupilot · PX4 · MAVLink v2",
    desc: "Работает с любым дроном на открытых стандартах. Не нужна замена оборудования.",
    color: "var(--warning)",
    accent: "rgba(255,149,0,0.05)",
    border: "rgba(255,149,0,0.15)",
    visual: null,
  },
  {
    id: "scan",
    col: "md:col-span-2",
    row: "",
    icon: "Scan",
    tag: "3D сканирование",
    title: "Автоматическое построение 3D-моделей объектов",
    desc: "Дрон облетает объект, собирает данные, платформа автоматически строит точечное облако и 3D-модель. Готовый отчёт — без ручной обработки.",
    color: "var(--signal-green)",
    accent: "rgba(0,255,136,0.05)",
    border: "rgba(0,255,136,0.15)",
    visual: "scan",
  },
  {
    id: "cloud",
    col: "",
    row: "",
    icon: "Cloud",
    tag: "Облако",
    title: "Веб без установки ПО",
    desc: "Командный центр открывается в браузере. Работает с телефона, планшета, ПК.",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.04)",
    border: "rgba(0,212,255,0.1)",
    visual: null,
  },
];

function AIVisual() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % 4), 1200);
    return () => clearInterval(id);
  }, []);
  const decisions = ["Анализ рельефа", "Обнаружение препятствия", "Коррекция маршрута", "Манёвр выполнен"];
  const colors = ["var(--electric)", "var(--warning)", "var(--electric)", "var(--signal-green)"];
  return (
    <div className="mt-4 space-y-1.5">
      {decisions.map((d, i) => (
        <div key={d} className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg transition-all"
          style={{
            background: i === step ? `${colors[i]}10` : "transparent",
            border: `1px solid ${i === step ? colors[i] + "30" : "transparent"}`,
          }}>
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{
            background: i <= step ? colors[i] : "rgba(255,255,255,0.1)",
            boxShadow: i === step ? `0 0 6px ${colors[i]}` : "none",
          }} />
          <span className="text-xs font-mono" style={{ color: i === step ? colors[i] : "rgba(255,255,255,0.3)" }}>{d}</span>
          {i < step && <Icon name="Check" size={11} style={{ color: "var(--signal-green)", marginLeft: "auto" }} />}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span className="hud-label" style={{ fontSize: 8 }}>РЕШЕНИЕ ПРИНЯТО ЗА</span>
        <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>12 мс</span>
      </div>
    </div>
  );
}

function SwarmVisual() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(v => v + 1), 80);
    return () => clearInterval(id);
  }, []);
  const drones = [
    { cx: 50, cy: 50, rx: 28, ry: 18, phase: 0 },
    { cx: 50, cy: 50, rx: 18, ry: 28, phase: Math.PI / 2 },
    { cx: 50, cy: 50, rx: 32, ry: 12, phase: Math.PI },
  ];
  return (
    <div className="mt-4">
      <svg viewBox="0 0 100 70" style={{ width: "100%", height: 80, opacity: 0.8 }}>
        {drones.map((d, i) => {
          const angle = (t * 0.04 + d.phase) % (Math.PI * 2);
          const x = d.cx + d.rx * Math.cos(angle);
          const y = d.cy * 0.7 + d.ry * Math.sin(angle) * 0.5;
          return (
            <g key={i}>
              <ellipse cx={d.cx} cy={d.cy * 0.7} rx={d.rx} ry={d.ry * 0.5}
                fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx={x} cy={y} r="2.5" fill="var(--electric)" opacity="0.9" />
              <circle cx={x} cy={y} r="5" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="0.5" />
            </g>
          );
        })}
        <circle cx="50" cy="35" r="3" fill="rgba(0,255,136,0.6)" />
        <text x="50" y="66" textAnchor="middle" fontSize="4" fill="rgba(255,255,255,0.3)" fontFamily="monospace">3 ДРОНА · СИНХРОННО</text>
      </svg>
    </div>
  );
}

function ScanVisual() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.8), 50);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="hud-label" style={{ fontSize: 8 }}>ПОСТРОЕНИЕ 3D МОДЕЛИ</span>
        <span className="hud-value text-xs" style={{ color: "var(--signal-green)" }}>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--signal-green), var(--electric))",
            boxShadow: "0 0 8px rgba(0,255,136,0.5)",
          }} />
      </div>
      <div className="grid grid-cols-3 gap-1 mt-1">
        {["Точек", "Полигонов", "Точность"].map((l, i) => (
          <div key={l} className="text-center py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="hud-value text-xs" style={{ color: "var(--signal-green)" }}>
              {i === 0 ? `${(progress * 1200).toFixed(0)}` : i === 1 ? `${(progress * 340).toFixed(0)}` : "±3см"}
            </div>
            <div className="hud-label" style={{ fontSize: 7 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShieldVisual() {
  return (
    <div className="mt-4 space-y-1.5">
      {[
        { label: "152-ФЗ", status: "Соответствует", ok: true },
        { label: "Серверы РФ", status: "Москва / СПб", ok: true },
        { label: "Шифрование", status: "TLS 1.3", ok: true },
        { label: "Иностр. инфра", status: "Не используется", ok: true },
      ].map(r => (
        <div key={r.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.08)" }}>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{r.label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: "var(--signal-green)" }}>{r.status}</span>
            <Icon name="Check" size={10} style={{ color: "var(--signal-green)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingBento() {
  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <div className="tag tag-electric mb-4">Возможности платформы</div>
        <h2 className="text-4xl font-bold mb-4">
          Всё что нужно для<br /><span className="gradient-text">промышленного БПЛА</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Единая экосистема управления — от бортового алгоритма до командного центра.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BENTO.map(card => (
          <div
            key={card.id}
            className={`${card.col} rounded-2xl p-6 flex flex-col transition-all hover:scale-[1.01] hover:brightness-110`}
            style={{
              background: card.accent,
              border: `1px solid ${card.border}`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                <Icon name={card.icon} fallback="Cpu" size={20} style={{ color: card.color }} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${card.color}12`, color: card.color, border: `1px solid ${card.color}25` }}>
                {card.tag}
              </span>
            </div>
            <h3 className="font-bold text-base mb-2 leading-snug">{card.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{card.desc}</p>

            {card.visual === "ai" && <AIVisual />}
            {card.visual === "swarm" && <SwarmVisual />}
            {card.visual === "scan" && <ScanVisual />}
            {card.visual === "shield" && <ShieldVisual />}
          </div>
        ))}
      </div>
    </section>
  );
}
