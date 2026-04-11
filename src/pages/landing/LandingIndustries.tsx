import { useState } from "react";
import Icon from "@/components/ui/icon";

const INDUSTRIES = [
  {
    id: "oil",
    icon: "Flame",
    label: "Нефтегаз",
    color: "var(--warning)",
    accent: "rgba(255,149,0,0.07)",
    border: "rgba(255,149,0,0.22)",
    headline: "Трубопроводы и НПЗ под контролем 24/7",
    desc: "Автономная инспекция сотен километров трубопроводов, поиск утечек тепловизором, мониторинг технологических площадок — без наземных бригад.",
    tasks: [
      "Инспекция трубопроводов и обнаружение утечек",
      "Тепловизионный контроль оборудования",
      "Мониторинг НПЗ и промышленных площадок",
      "Охрана периметра объектов",
      "Фото- и видеофиксация нарушений",
    ],
    results: [
      { val: "−70%", label: "Стоимость инспекции" },
      { val: "×8", label: "Скорость охвата" },
      { val: "24/7", label: "Мониторинг" },
    ],
    client: "Нефтяная компания «Роснефть», Лукойл, Газпром-структуры",
  },
  {
    id: "energy",
    icon: "Zap",
    label: "Энергетика",
    color: "var(--electric)",
    accent: "rgba(0,212,255,0.06)",
    border: "rgba(0,212,255,0.22)",
    headline: "ЛЭП и ветрогенераторы без верхолазов",
    desc: "Инспекция тысяч километров воздушных линий электропередачи и высотных объектов без привлечения монтажников-высотников. YOLO11 выявляет дефекты автоматически.",
    tasks: [
      "Осмотр ЛЭП и выявление повреждений изоляторов",
      "Инспекция ветрогенераторов и солнечных панелей",
      "Контроль состояния подстанций",
      "Тепловизионная диагностика оборудования",
      "Формирование отчётов с геопривязкой",
    ],
    results: [
      { val: "−85%", label: "Затраты на верхолазов" },
      { val: "500 км", label: "ЛЭП за смену" },
      { val: "97.4%", label: "Точность детекции" },
    ],
    client: "ФСК ЕЭС, МРСК, Россети",
  },
  {
    id: "agro",
    icon: "Wheat",
    label: "АПК",
    color: "var(--signal-green)",
    accent: "rgba(0,255,136,0.05)",
    border: "rgba(0,255,136,0.22)",
    headline: "10 000 га мониторинга за 4 часа",
    desc: "Картографирование угодий, анализ состояния посевов по NDVI, выявление заболеваний и вредителей, оптимизация внесения удобрений. Всё автономно.",
    tasks: [
      "Анализ состояния посевов и индекс NDVI",
      "Создание карт плодородия и влажности почв",
      "Выявление болезней растений и вредителей",
      "Мониторинг ирригационных систем",
      "Поддержка принятия агрономических решений",
    ],
    results: [
      { val: "10к га", label: "Покрытие за 4 часа" },
      { val: "±30 см", label: "Точность привязки" },
      { val: "−40%", label: "Потери урожая" },
    ],
    client: "Агрохолдинги, фермерские хозяйства, управляющие компании АПК",
  },
  {
    id: "construction",
    icon: "Building2",
    label: "Строительство",
    color: "#a78bfa",
    accent: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.22)",
    headline: "3D-модель объекта — каждую неделю автоматически",
    desc: "Еженедельный облёт стройки, фотограмметрия, сравнение с BIM-проектом и автоматический отчёт об отклонениях. Без геодезистов и прораборского надзора на крышах.",
    tasks: [
      "Мониторинг хода строительных работ",
      "Создание 3D-моделей и ортофотопланов",
      "Контроль качества и сравнение с проектом",
      "Инспекция мостов, дорог, тоннелей",
      "Обследование кровли и фасадов зданий",
    ],
    results: [
      { val: "3D", label: "Модель автоматически" },
      { val: "−60%", label: "Время инспекции" },
      { val: "±2 см", label: "Точность фотограмметрии" },
    ],
    client: "Строительные группы, девелоперы, службы эксплуатации ЖКХ",
  },
  {
    id: "security",
    icon: "Shield",
    label: "Безопасность",
    color: "#f87171",
    accent: "rgba(248,113,113,0.05)",
    border: "rgba(248,113,113,0.22)",
    headline: "Периметр под охраной без лишних охранников",
    desc: "Автономное патрулирование периметра по заданному маршруту, детекция вторжений нейросетью, мгновенное оповещение оператора. Работает ночью и в любую погоду.",
    tasks: [
      "Патрулирование периметра промышленных объектов",
      "Детекция несанкционированного проникновения",
      "Обеспечение безопасности массовых мероприятий",
      "Поисково-спасательные операции",
      "Охрана границ и режимных объектов",
    ],
    results: [
      { val: "−3", label: "Штатные единицы охраны" },
      { val: "< 30 с", label: "Реакция на вторжение" },
      { val: "24/7", label: "Автономное дежурство" },
    ],
    client: "Охранные предприятия, промышленные объекты, МЧС",
  },
  {
    id: "telecom",
    icon: "Radio",
    label: "Телеком",
    color: "#60a5fa",
    accent: "rgba(96,165,250,0.05)",
    border: "rgba(96,165,250,0.22)",
    headline: "Вышки связи — без бригады монтажников",
    desc: "Инспекция антенно-мачтовых сооружений дроном с YOLO11-детекцией дефектов. Полная документация и 3D-модель вышки за один облёт.",
    tasks: [
      "Инспекция вышек сотовой связи",
      "Проверка антенно-мачтовых сооружений",
      "Обнаружение механических повреждений",
      "Планирование размещения нового оборудования",
      "Инвентаризация оборудования на высоте",
    ],
    results: [
      { val: "−90%", label: "Стоимость vs верхолаза" },
      { val: "4 вышки", label: "Инспекция за смену" },
      { val: "Авто", label: "Отчёт с геопривязкой" },
    ],
    client: "МТС, Билайн, Мегафон, региональные операторы",
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
            <div className="text-xs px-3 py-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "hsl(var(--muted-foreground))",
              }}>
              <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Клиенты: </span>
              {active.client}
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
