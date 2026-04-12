import { useState } from "react";
import Icon from "@/components/ui/icon";

const INDUSTRIES = [
  {
    id: "agro",
    icon: "Wheat",
    label: "Сельское хозяйство",
    color: "var(--signal-green)",
    accent: "rgba(0,255,136,0.05)",
    border: "rgba(0,255,136,0.22)",
    headline: "10 000 га мониторинга за 4 часа",
    desc: "Агрохолдинги и фермерские хозяйства получают точные данные о состоянии посевов без выезда агрономов в поле. БПЛА анализирует каждый гектар и формирует карты для принятия решений.",
    clients: ["Агрохолдинги и фермерские хозяйства", "Компании точного земледелия"],
    tasks: [
      "Анализ состояния посевов и индекс NDVI",
      "Мониторинг здоровья растений",
      "Создание карт плодородия почв",
      "Оптимизация орошения и внесения удобрений",
      "Выявление заболеваний и вредителей",
    ],
    results: [
      { val: "10к га", label: "Покрытие за 4 часа" },
      { val: "±30 см", label: "Точность привязки" },
      { val: "−40%", label: "Потери урожая" },
    ],
  },
  {
    id: "construction",
    icon: "Building2",
    label: "Строительство",
    color: "#a78bfa",
    accent: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.22)",
    headline: "3D-модель объекта — каждую неделю автоматически",
    desc: "Строительные компании и девелоперы контролируют ход работ без геодезистов на крышах. Дрон облетает объект, строит 3D-модель и сравнивает с проектом — отчёт готов автоматически.",
    clients: ["Строительные компании и девелоперы", "Службы эксплуатации зданий и сооружений"],
    tasks: [
      "Мониторинг хода строительства",
      "Инспекция объектов инфраструктуры",
      "Создание 3D-моделей площадок",
      "Контроль качества работ",
      "Обследование мостов, дорог, тоннелей",
    ],
    results: [
      { val: "3D", label: "Модель автоматически" },
      { val: "−60%", label: "Время инспекции" },
      { val: "±2 см", label: "Точность фотограмметрии" },
    ],
  },
  {
    id: "energy",
    icon: "Zap",
    label: "Энергетика",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.06)",
    border: "rgba(0,212,255,0.22)",
    headline: "ЛЭП и ветрогенераторы без верхолазов",
    desc: "Электросетевые компании и нефтегазовые предприятия инспектируют тысячи километров линий и высотных объектов без монтажников-высотников. YOLO11 выявляет дефекты автоматически.",
    clients: ["Электросетевые компании", "Нефтегазовые предприятия", "Операторы возобновляемых источников энергии"],
    tasks: [
      "Инспекция ЛЭП и подстанций",
      "Обнаружение утечек на трубопроводах",
      "Осмотр ветрогенераторов и солнечных панелей",
      "Тепловизионный контроль оборудования",
      "Формирование отчётов с геопривязкой",
    ],
    results: [
      { val: "−85%", label: "Затраты на верхолазов" },
      { val: "500 км", label: "ЛЭП за смену" },
      { val: "97.4%", label: "Точность детекции" },
    ],
  },
  {
    id: "logistics",
    icon: "Package",
    label: "Логистика",
    color: "var(--warning)",
    accent: "rgba(255,149,0,0.07)",
    border: "rgba(255,149,0,0.22)",
    headline: "Доставка и инвентаризация без наземного персонала",
    desc: "Логистические компании и маркетплейсы сокращают затраты на доставку последней мили и инвентаризацию складов. БПЛА выполняет маршруты автономно по заданному расписанию.",
    clients: ["Логистические компании", "Службы экспресс-доставки", "Маркетплейсы и розничные сети"],
    tasks: [
      "Доставка малогабаритных грузов",
      "Инвентаризация складов",
      "Оптимизация маршрутов",
      "Мониторинг логистических центров",
    ],
    results: [
      { val: "−50%", label: "Стоимость доставки" },
      { val: "×3", label: "Скорость инвентаризации" },
      { val: "24/7", label: "Автономная работа" },
    ],
  },
  {
    id: "security",
    icon: "Shield",
    label: "Безопасность",
    color: "#f87171",
    accent: "rgba(248,113,113,0.05)",
    border: "rgba(248,113,113,0.22)",
    headline: "Периметр под охраной без лишних охранников",
    desc: "Охранные предприятия и промышленные объекты переводят рутинное патрулирование на автономные БПЛА. Нейросеть детектирует вторжение и мгновенно оповещает оператора.",
    clients: ["Охранные предприятия", "Промышленные предприятия с охраняемыми объектами", "Организаторы массовых мероприятий"],
    tasks: [
      "Патрулирование территорий",
      "Обнаружение несанкционированного проникновения",
      "Мониторинг периметров",
      "Обеспечение безопасности на мероприятиях",
    ],
    results: [
      { val: "−3", label: "Штатные единицы охраны" },
      { val: "< 30 с", label: "Реакция на вторжение" },
      { val: "24/7", label: "Автономное дежурство" },
    ],
  },
  {
    id: "rescue",
    icon: "HeartPulse",
    label: "Спецслужбы",
    color: "#f87171",
    accent: "rgba(248,113,113,0.05)",
    border: "rgba(248,113,113,0.22)",
    headline: "Разведка и спасение — быстрее и безопаснее",
    desc: "МЧС, полиция и пограничные службы применяют БПЛА для разведки, поиска пострадавших и оценки масштабов ЧС. Дрон прибывает на место раньше наземных бригад.",
    clients: ["МЧС и поисково-спасательные службы", "Полиция и пограничные службы", "Вооружённые силы"],
    tasks: [
      "Разведка и наблюдение",
      "Поиск пострадавших и пропавших",
      "Оценка масштабов ЧС",
      "Координация спасательных операций",
      "Охрана границ",
    ],
    results: [
      { val: "×5", label: "Скорость обнаружения" },
      { val: "−80%", label: "Риск для персонала" },
      { val: "ИК", label: "Поиск в темноте" },
    ],
  },
  {
    id: "telecom",
    icon: "Radio",
    label: "Телекоммуникации",
    color: "#60a5fa",
    accent: "rgba(96,165,250,0.05)",
    border: "rgba(96,165,250,0.22)",
    headline: "Вышки связи — без бригады монтажников",
    desc: "Операторы мобильной связи и провайдеры инспектируют антенно-мачтовые сооружения дроном. YOLO11 фиксирует дефекты, формирует отчёт с геопривязкой за один облёт.",
    clients: ["Операторы мобильной связи", "Провайдеры интернет-услуг"],
    tasks: [
      "Инспекция вышек сотовой связи",
      "Проверка состояния антенно-мачтовых сооружений",
      "Планирование размещения нового оборудования",
      "Обнаружение механических повреждений",
      "Инвентаризация оборудования на высоте",
    ],
    results: [
      { val: "−90%", label: "Стоимость vs верхолаза" },
      { val: "4 вышки", label: "Инспекция за смену" },
      { val: "Авто", label: "Отчёт с геопривязкой" },
    ],
  },
];

export default function LandingIndustries({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [active, setActive] = useState(INDUSTRIES[0]);

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <div className="tag tag-electric mb-4">Отраслевые решения</div>
        <h2 className="text-4xl font-bold mb-4">
          Ваша отрасль —
          <br />
          <span className="gradient-text">ваши задачи решены</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
          SoloFly адаптируется под задачи каждой индустрии. Выберите свою отрасль
          и посмотрите, как платформа работает именно для вас.
        </p>
      </div>

      {/* Industry tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {INDUSTRIES.map(ind => (
          <button key={ind.id} onClick={() => setActive(ind)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03]"
            style={{
              background: active.id === ind.id ? ind.accent : "rgba(255,255,255,0.03)",
              border: `1px solid ${active.id === ind.id ? ind.border : "rgba(255,255,255,0.07)"}`,
              color: active.id === ind.id ? ind.color : "hsl(var(--muted-foreground))",
            }}>
            <Icon name={ind.icon} fallback="Building2" size={14} />
            {ind.label}
          </button>
        ))}
      </div>

      {/* Active industry detail */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${active.border}` }}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left: content */}
          <div className="p-8" style={{ background: active.accent }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${active.color}18`, border: `1px solid ${active.color}30` }}>
                <Icon name={active.icon} fallback="Building2" size={22} style={{ color: active.color }} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest uppercase mb-0.5"
                  style={{ color: active.color, opacity: 0.7 }}>Отраслевое решение</div>
                <h3 className="font-bold text-xl leading-snug">{active.headline}</h3>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
              {active.desc}
            </p>

            {/* Tasks */}
            <div className="mb-6">
              <div className="hud-label mb-3" style={{ fontSize: 9 }}>ЗАДАЧИ, КОТОРЫЕ РЕШАЕТ ПЛАТФОРМА</div>
              <ul className="space-y-2">
                {active.tasks.map(task => (
                  <li key={task} className="flex items-start gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${active.color}15` }}>
                      <Icon name="Check" size={10} style={{ color: active.color }} />
                    </div>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target clients */}
            <div className="px-3 py-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="hud-label mb-2" style={{ fontSize: 9 }}>ОСНОВНЫЕ КЛИЕНТЫ</div>
              <ul className="space-y-1">
                {active.clients.map(c => (
                  <li key={c} className="flex items-center gap-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: active.color, flexShrink: 0, opacity: 0.7 }} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: results */}
          <div className="p-8 flex flex-col justify-between"
            style={{ background: "rgba(255,255,255,0.015)", borderLeft: `1px solid ${active.border}` }}>
            <div>
              <div className="hud-label mb-5" style={{ fontSize: 9 }}>ИЗМЕРИМЫЕ РЕЗУЛЬТАТЫ</div>
              <div className="space-y-4">
                {active.results.map(r => (
                  <div key={r.label} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: `${active.color}08`, border: `1px solid ${active.color}18` }}>
                    <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{r.label}</span>
                    <span className="text-2xl font-black" style={{ color: active.color }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${active.border}` }}>
              <p className="text-xs mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>
                Оценки на основе данных бета-тестирования и открытых отраслевых исследований.
                Точные результаты зависят от конкретного объекта и задачи.
              </p>
              <div className="flex gap-3">
                <button onClick={() => onNavigate("dashboard")}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: active.color,
                    color: active.id === "agro" ? "hsl(210 25% 4%)" : "hsl(210 25% 4%)",
                    boxShadow: `0 0 20px ${active.color}30`,
                  }}>
                  Попробовать →
                </button>
                <button onClick={() => onNavigate("support")}
                  className="px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "hsl(var(--muted-foreground))",
                  }}>
                  Консультация
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}