import Icon from "@/components/ui/icon";

const RND_ITEMS = [
  { num: "01", title: "Адаптивная маршрутизация", desc: "Формальная модель планирования траектории с учётом рельефа, погоды и запретных зон.", status: "В разработке", color: "var(--electric)" },
  { num: "02", title: "Алгоритм принятия решений", desc: "Нейросетевое ядро с XAI — объяснимый ИИ выбирает оптимальное действие без оператора.", status: "В разработке", color: "var(--electric)" },
  { num: "03", title: "Сценарии потери связи", desc: "Верификация автономного завершения миссии при деградации канала управления.", status: "Планируется", color: "var(--warning)" },
  { num: "04", title: "Лётная верификация", desc: "Стендовые испытания и лётные эксперименты на полигоне. Валидация реальных показателей.", status: "Планируется", color: "var(--warning)" },
];

const BUDGET = [
  { label: "Фонд оплаты труда", amount: "3 000 000 ₽", pct: 60, color: "var(--electric)" },
  { label: "Оборудование (Pixhawk, Jetson, стенды)", amount: "900 000 ₽", pct: 18, color: "var(--signal-green)" },
  { label: "Лётные испытания и полигон", amount: "600 000 ₽", pct: 12, color: "var(--warning)" },
  { label: "Патентование и правовая охрана", amount: "300 000 ₽", pct: 6, color: "#a78bfa" },
  { label: "Накладные расходы", amount: "200 000 ₽", pct: 4, color: "hsl(var(--muted-foreground))" },
];

export default function LandingGrant() {
  return (
    <div className="space-y-10">

      {/* Шапка гранта */}
      <div className="rounded-2xl p-8"
        style={{
          background: "linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(0,255,136,0.04) 100%)",
          border: "1px solid rgba(0,212,255,0.2)",
        }}>
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }}>
                Старт-Пром-1 · ФСИ
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(0,255,136,0.12)", color: "var(--signal-green)", border: "1px solid rgba(0,255,136,0.25)" }}>
                2026 год
              </span>
            </div>
            <h3 className="font-bold text-xl mb-2">
              Разработка интеллектуальной системы принятия решений для автономного БПЛА
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
              ООО «МАТ-Лабс» участвует в конкурсе Фонда содействия инновациям (Старт-Пром-1)
              на проведение НИОКР по созданию экспериментального образца программного комплекса
              автономного управления БПЛА нового поколения.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl shrink-0"
            style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", minWidth: 160 }}>
            <div className="text-3xl font-black gradient-text">5 млн ₽</div>
            <div className="hud-label mt-1" style={{ fontSize: 9 }}>РАЗМЕР ГРАНТА</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "Users", label: "Команда", val: "4 человека" },
            { icon: "Calendar", label: "Срок", val: "12 месяцев" },
            { icon: "MapPin", label: "Локация", val: "Россия" },
            { icon: "Award", label: "Конкурс", val: "Старт-Пром-1" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Icon name={item.icon} fallback="Check" size={14} style={{ color: "var(--electric)" }} />
              <div>
                <div className="hud-label" style={{ fontSize: 8 }}>{item.label}</div>
                <div className="text-xs font-semibold">{item.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* НИОКР — 4 направления */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="tag tag-green">НИОКР 2026</div>
          <span className="text-sm font-semibold">Научно-исследовательские работы</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RND_ITEMS.map(item => (
            <div key={item.num} className="rounded-xl p-5 relative overflow-hidden"
              style={{ background: `${item.color}05`, border: `1px solid ${item.color}20` }}>
              <div style={{
                position: "absolute", top: 0, right: 0, width: 70, height: 70,
                background: `radial-gradient(circle at top right, ${item.color}0a, transparent 70%)`,
              }} />
              <div className="flex items-start gap-3">
                <span className="text-2xl font-black shrink-0" style={{ color: item.color, opacity: 0.2, lineHeight: 1 }}>
                  {item.num}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-bold text-sm">{item.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                      style={{ background: `${item.color}14`, color: item.color, border: `1px solid ${item.color}30`, fontSize: 9 }}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Команда */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="tag tag-electric">Команда проекта</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: "Тюрин Максим", role: "CEO, сооснователь", tags: ["Стратегия", "Авиационное право"], letter: "М" },
            { name: "Тюрин Александр", role: "CTO, сооснователь", tags: ["MAVLink", "Бортовое ПО"], letter: "А" },
            { name: "Петрушкин Олег", role: "Lead ML Engineer", tags: ["YOLO11", "Компьютерное зрение"], letter: "О" },
            { name: "Красильников Данила", role: "Head of Product", tags: ["UX", "Тестирование"], letter: "Д" },
          ].map((m, i) => (
            <div key={m.name} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base mb-3"
                style={{
                  background: `hsl(${200 + i * 40}deg 40% 18%)`,
                  color: `hsl(${200 + i * 40}deg 70% 60%)`,
                }}>
                {m.letter}
              </div>
              <div className="font-bold text-sm mb-0.5">{m.name}</div>
              <div className="text-xs mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>{m.role}</div>
              <div className="flex flex-wrap gap-1">
                {m.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded text-xs"
                    style={{ background: "rgba(0,212,255,0.08)", color: "var(--electric)", fontSize: 9 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Бюджет */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="tag tag-electric">Расходование средств гранта</div>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          {BUDGET.map((item, i) => (
            <div key={item.label}
              className="flex items-center gap-4 px-5 py-3.5"
              style={{
                background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                borderBottom: i < BUDGET.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              }}>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <div className="flex-1 text-sm">{item.label}</div>
              <div className="w-28 h-1.5 rounded-full overflow-hidden shrink-0"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
              </div>
              <div className="text-xs font-bold text-right shrink-0 w-28" style={{ color: item.color }}>
                {item.amount}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3.5"
            style={{ background: "rgba(0,212,255,0.04)", borderTop: "1px solid rgba(0,212,255,0.15)" }}>
            <span className="font-bold text-sm">ИТОГО</span>
            <span className="font-black text-lg gradient-text">5 000 000 ₽</span>
          </div>
        </div>
      </div>

      {/* Преимущества перед конкурентами */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="tag tag-green">Преимущества перед аналогами</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "vs Wheelies (ITG)", points: ["Открытый стек MAVLink/Ardupilot/PX4 — поддержка любого дрона", "SaaS-модель от 2 900 ₽/мес — ниже порог входа", "Объяснимый ИИ (XAI) — каждое решение прозрачно"], color: "var(--electric)" },
            { title: "vs UgCS, DJI FlightHub", points: ["Серверы в РФ — соответствие 152-ФЗ", "Независимость от санкций и иностранной инфраструктуры", "Нативная поддержка российского законодательства"], color: "var(--signal-green)" },
            { title: "vs Geoscan Planner", points: ["Облачная архитектура — не нужно устанавливать ПО", "Управление роем до 20 БПЛА одновременно", "Банк нейросетей: YOLO11, сегментация, трекинг"], color: "var(--warning)" },
            { title: "Уникальные функции", points: ["Бортовой ИИ без постоянного интернета", "Мультисредовость: воздух, земля, вода", "Автономное завершение миссии при потере связи"], color: "#a78bfa" },
          ].map(block => (
            <div key={block.title} className="rounded-xl p-5"
              style={{ background: `${block.color}06`, border: `1px solid ${block.color}20` }}>
              <div className="font-bold text-sm mb-3" style={{ color: block.color }}>{block.title}</div>
              <ul className="space-y-2">
                {block.points.map(p => (
                  <li key={p} className="flex items-start gap-2 text-xs">
                    <Icon name="Check" size={11} style={{ color: block.color, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Рынок */}
      <div className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="tag tag-electric">Рынок</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { val: "$2.8 млрд", label: "Мировой рынок ПО для БПЛА (2024)", sub: "Рост до $7.4 млрд к 2030, CAGR 17.5%", color: "var(--electric)" },
            { val: "45 млрд ₽", label: "Нацпроект «БАС» до 2030 года", sub: "Государственное финансирование", color: "var(--signal-green)" },
            { val: "1 800+", label: "Целевых клиентов в РФ (SOM)", sub: "Коммерческие операторы на Ardupilot/PX4", color: "var(--warning)" },
          ].map(m => (
            <div key={m.label} className="text-center p-4 rounded-xl"
              style={{ background: `${m.color}07`, border: `1px solid ${m.color}18` }}>
              <div className="text-2xl font-black mb-1" style={{ color: m.color }}>{m.val}</div>
              <div className="text-xs font-semibold mb-1">{m.label}</div>
              <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}