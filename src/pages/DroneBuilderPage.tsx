import { useState } from "react";
import Icon from "@/components/ui/icon";

// ── Данные ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "frames",      label: "Рамы",           icon: "Box" },
  { id: "motors",      label: "Моторы",          icon: "Zap" },
  { id: "props",       label: "Пропеллеры",      icon: "Wind" },
  { id: "fc",          label: "Полётный контроллер", icon: "Cpu" },
  { id: "esc",         label: "Регуляторы (ESC)", icon: "CircuitBoard" },
  { id: "power",       label: "АКБ и питание",   icon: "Battery" },
  { id: "sensors",     label: "Сенсоры и навигация", icon: "Crosshair" },
  { id: "payload",     label: "Полезная нагрузка", icon: "Camera" },
  { id: "maintenance", label: "Техобслуживание", icon: "Wrench" },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

interface Article {
  title: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  time: string;
  content: { heading?: string; text: string }[];
}

const ARTICLES: Record<CategoryId, Article[]> = {
  frames: [
    {
      title: "Как выбрать раму БПЛА",
      tags: ["рама", "размер", "материал"],
      difficulty: "easy",
      time: "5 мин",
      content: [
        { heading: "Размер рамы", text: "Размер рамы измеряется по диагонали между осями моторов в мм. 250 мм — гоночный/маневренный, 350–450 мм — оптимально для патрулирования и съёмки, 650+ мм — тяжёлые грузовые применения." },
        { heading: "Материал", text: "Карбон (CF) — лучшее соотношение жёсткость/вес, стандарт для профессиональных БПЛА. Стеклоткань (G10) — дешевле, амортизирует вибрации. Нейлон/пластик — только для обучения и мелких аппаратов." },
        { heading: "Конфигурация", text: "X-рама — стандарт, равномерное управление. H-рама — больше места для электроники. True-X vs Stretched-X — у вытянутых лучше прямолинейная скорость." },
        { heading: "Рекомендации", text: "Для LiDAR-сканирования выбирайте раму 450–550 мм с центральным монтажом нагрузки и защитой пропеллеров. Для длительного патрулирования — гексакоптер на раме 600–800 мм обеспечит надёжность при отказе одного мотора." },
      ],
    },
    {
      title: "Защита пропеллеров и кожухи",
      tags: ["защита", "безопасность", "кожух"],
      difficulty: "easy",
      time: "3 мин",
      content: [
        { heading: "Зачем нужна защита", text: "Защитные кольца предотвращают контакт пропеллеров с объектами при полёте вблизи зданий, деревьев, людей. Обязательны для работы в закрытых помещениях и при инспекции объектов." },
        { heading: "Типы защиты", text: "Полные кожухи (cages) — 360° защита, снижают эффективность на 10–15%. Частичные кольца — компромисс между защитой и аэродинамикой. Мягкие пены — только для мелких квадрокоптеров." },
        { heading: "Материал и вес", text: "Лучший вариант — напечатанные на 3D-принтере PETG или TPU кольца. Лёгкие, заменяемые при поломке. Карбоновые кожухи добавляют прочность при высоких скоростях." },
      ],
    },
  ],
  motors: [
    {
      title: "Выбор бесколлекторных моторов",
      tags: ["мотор", "KV", "тяга"],
      difficulty: "medium",
      time: "8 мин",
      content: [
        { heading: "Что такое KV", text: "KV — количество оборотов на вольт без нагрузки. Низкий KV (400–900) — тяжёлые пропеллеры, высокая эффективность, дроны для съёмки и сканирования. Высокий KV (2000–2700) — маленькие пропеллеры, высокие обороты, гоночные дроны." },
        { heading: "Типоразмер мотора", text: "Обозначение XxYY: первые 2 цифры — диаметр статора (мм), последние — высота. 2306 — гоночный стандарт. 4006/4010 — оптимально для 450–550 мм рам с тяжёлой нагрузкой. 5010+ — мощные грузовые." },
        { heading: "Расчёт тяги", text: "Суммарная тяга всех моторов должна вдвое превышать взлётную массу аппарата (соотношение тяга/вес 2:1). Для видеосъёмки — 3:1. При этом каждый мотор должен давать 30–40% максимальной тяги при зависании." },
        { heading: "Качество и бренды", text: "T-Motor, KDE Direct, Scorpion — профессиональный уровень с паспортами тяги. Emax, RCINPOWER — оптимальное соотношение цена/качество. Всегда проверяйте кривую тяги по официальным тестам, не только по заявлениям производителя." },
      ],
    },
    {
      title: "Балансировка и проверка моторов",
      tags: ["балансировка", "вибрация", "диагностика"],
      difficulty: "medium",
      time: "6 мин",
      content: [
        { heading: "Динамическая балансировка", text: "Дисбаланс мотора/пропеллера — главный источник вибраций. Вибрации деградируют данные IMU, сокращают ресурс рамы и подшипников. Используйте балансировщик пропеллеров перед каждой установкой." },
        { heading: "Тест при вводе в эксплуатацию", text: "Проверьте: 1) вращение от руки — подшипник должен быть тихим, без заеданий; 2) сопротивление обмоток мультиметром — разброс не более 0,1 Ом между фазами; 3) визуальный осмотр на повреждения ротора и статора." },
        { heading: "Температурный контроль", text: "После 5 минут нагрузочного полёта мотор не должен быть обжигающим. 50–60°C — норма. Более 80°C — перегрев, причина: неверный KV для пропеллера, недостаточное охлаждение, или слишком большой ток." },
      ],
    },
  ],
  props: [
    {
      title: "Подбор пропеллеров",
      tags: ["пропеллер", "шаг", "диаметр"],
      difficulty: "easy",
      time: "5 мин",
      content: [
        { heading: "Обозначение пропеллеров", text: "Формат XxY или X.X×Y.Y: первое число — диаметр в дюймах, второе — шаг (pitch). 10×4.5 — диаметр 10\", шаг 4.5\". Больший шаг = больше тяги при тех же оборотах, но выше ток." },
        { heading: "Подбор к мотору", text: "Производитель мотора всегда указывает рекомендуемый диапазон пропеллеров. Нарушение диапазона грозит перегревом или недостаточной тягой. При сомнениях используйте калькулятор (eCalc, ecalc.ch)." },
        { heading: "Количество лопастей", text: "2 лопасти — максимальная эффективность, стандарт для дальних полётов. 3 лопасти — больше тяги при меньшем диаметре, меньше шум. 4+ лопасти — специальные применения, агрессивные манёвры." },
        { heading: "Материал", text: "Карбон — лёгкие и жёсткие, дают минимальные вибрации. Пластик (ABS/нейлон) — гасят удары, безопаснее при столкновениях. Дерево — историческая экзотика, для мелкосерийных конструкций." },
      ],
    },
  ],
  fc: [
    {
      title: "Полётный контроллер: выбор и настройка",
      tags: ["FC", "Ardupilot", "PX4", "автопилот"],
      difficulty: "hard",
      time: "15 мин",
      content: [
        { heading: "Ardupilot vs PX4", text: "Ardupilot — зрелая экосистема, богатый функционал, огромное сообщество, интеграция с Mission Planner и QGroundControl. Подходит для большинства задач. PX4 — более модульная архитектура, лучше документирован для разработки, предпочтителен для кастомных приложений и ROS-интеграции." },
        { heading: "Железо полётного контроллера", text: "Pixhawk 6C/6X — эталон надёжности для профессиональных применений. Cube Orange — усиленная версия с резервированием IMU. Holybro Kakute/Durandal — для более бюджетных решений. Все поддерживают Ardupilot и PX4." },
        { heading: "IMU и вибрации", text: "Большинство современных FC имеют 2–3 IMU с взаимной верификацией. Демпфирование FC от вибраций критично — используйте мягкие силиконовые стойки. Проверяйте логи IMU на предмет клиппинга и избыточного шума." },
        { heading: "Калибровка", text: "Обязательные калибровки: акселерометр (6 положений), компас (вращение в трёх осях), радио, ESC. Для работы с SoloFly калибруйте через Mission Planner, затем подключайте Raspberry Pi с телеметрийным скриптом." },
        { heading: "Параметры для SoloFly", text: "SERIAL2_PROTOCOL=2 (MAVLink2), SERIAL2_BAUD=115, SYSID_THISMAV=1, STREAM_RATE=1 Гц для базовой телеметрии. Для полного набора данных увеличьте SR2_POSITION до 5–10 Гц." },
      ],
    },
    {
      title: "GPS и компас",
      tags: ["GPS", "GNSS", "компас", "навигация"],
      difficulty: "medium",
      time: "7 мин",
      content: [
        { heading: "Выбор GPS-модуля", text: "Here3/Here3+ — RTK-совместимый, CAN-шина, встроенный компас. u-blox M9N/F9P — высокая точность, поддержка многосистемного GNSS (GPS+GLONASS+Galileo+BeiDou). Для профессионального картографирования используйте RTK-GPS с базовой станцией." },
        { heading: "Монтаж компаса", text: "Компас должен быть максимально удалён от силовых кабелей, АКБ и моторов — источников магнитных помех. Оптимально — на стойке 10–15 см выше рамы. Направление стрелки компаса — вперёд по курсу аппарата." },
        { heading: "Интерференция", text: "Силовые кабели с током >20А создают поле, смещающее показания компаса. Используйте скрученные пары кабелей питания, экранирование. После сборки обязательно проверяйте Live Calibration в Mission Planner в полевых условиях." },
      ],
    },
  ],
  esc: [
    {
      title: "Регуляторы скорости (ESC)",
      tags: ["ESC", "BLHeli", "DSHOT", "ток"],
      difficulty: "medium",
      time: "8 мин",
      content: [
        { heading: "Ток и запас мощности", text: "Номинальный ток ESC должен превышать максимальный ток мотора на 20–30%. Пример: если мотор потребляет 35А при максимальной тяге — берите ESC 45А. Никогда не работайте на пределе — перегрев и отказ." },
        { heading: "Прошивка: BLHeli_32 vs AM32", text: "BLHeli_32 — стандарт для профессиональных применений, поддержка DSHOT600, телеметрия оборотов и температуры. AM32 — открытая альтернатива с активной разработкой. Для Ardupilot оба варианта совместимы." },
        { heading: "Протоколы управления", text: "DSHOT300/600 — цифровой протокол, нет дребезга, точная синхронизация. PWM — аналоговый стандарт, требует калибровки. Bidirectional DSHOT — возвращает телеметрию оборотов в FC для notch-фильтров." },
        { heading: "4-в-1 vs раздельные ESC", text: "4-в-1 (stack): компактно, меньше проводов, упрощённая сборка. Минус: отказ одного — замена всего блока. Раздельные: ремонтопригодность, гибкое размещение на раме. Для промышленных аппаратов раздельные предпочтительнее." },
      ],
    },
  ],
  power: [
    {
      title: "Выбор АКБ",
      tags: ["АКБ", "LiPo", "Li-Ion", "ёмкость"],
      difficulty: "medium",
      time: "8 мин",
      content: [
        { heading: "LiPo vs Li-Ion", text: "LiPo — высокий ток разряда (25–100C), лёгкие, стандарт для гоночных и профессиональных дронов. Li-Ion (18650, 21700) — в 2–3 раза больше ёмкость при той же массе, ток до 15–20C, оптимально для дальних полётов." },
        { heading: "Количество ячеек (S)", text: "3S (11.1В) — мелкие и средние аппараты. 4S (14.8В) — оптимум для 250–350 мм. 6S (22.2В) — профессиональные средние и большие дроны, выше КПД при той же мощности. 12S — тяжёлые промышленные." },
        { heading: "Ёмкость и время полёта", text: "Правило: 1 000 мАч ≈ 1 минута полёта на мультироторе средней тяжести. 5 000 мАч 4S даст ~12–15 минут патрулирования. Увеличение ёмкости увеличивает вес — оптимум ищите в симуляторе (eCalc)." },
        { heading: "Безопасность хранения", text: "Хранить при 3.8В/ячейку (storage voltage). Не допускать разряда ниже 3.5В/ячейку. Заряжать только под наблюдением в огнестойком контейнере. Вздувшийся аккумулятор — немедленно утилизировать." },
      ],
    },
    {
      title: "Система управления питанием (PDB)",
      tags: ["PDB", "BEC", "питание", "фильтрация"],
      difficulty: "medium",
      time: "5 мин",
      content: [
        { heading: "Плата распределения питания", text: "PDB соединяет АКБ, ESC и вспомогательные потребители. Современные стеки FC+ESC часто содержат PDB. Для больших аппаратов используйте отдельную медную шину или PDB с током 100–200А." },
        { heading: "BEC (регулятор напряжения)", text: "Отдельный DC-DC конвертер питает FC, GPS, видеосистему стабилизированным 5В или 12В. Критично: шум БЕК влияет на видеосигнал и FC. Используйте Linear BEC или LC-фильтры для чувствительной электроники." },
        { heading: "Конденсаторы", text: "Электролитический конденсатор 470–1000 мкФ параллельно АКБ снижает выбросы напряжения при резких изменениях тяги. Значительно уменьшает видеопомехи и защищает ESC." },
      ],
    },
  ],
  sensors: [
    {
      title: "Датчики высоты и препятствий",
      tags: ["лидар", "сонар", "оптический поток", "высота"],
      difficulty: "medium",
      time: "7 мин",
      content: [
        { heading: "Барометр", text: "Встроен в FC, точность ±0.5–1 м. Необходимо экранировать от прямого воздушного потока пропеллеров и солнечного нагрева — используйте поролоновую защиту." },
        { heading: "Оптический поток (Flow)", text: "Сенсор направленный вниз — позиционирование без GPS внутри помещений. PX4FLOW, Matek 3901-L0X. Работает на высоте до 3–5 м. В комбинации с дальномером даёт стабильное зависание в GPS-denied зонах." },
        { heading: "Лидар (TOF)", text: "TFMini, Benewake TF03 — дальномеры для точного удержания высоты (LIDAR_ALT_ENA=1 в Ardupilot). Точность ±2–5 см. Необходимы для автоматической посадки на неровную поверхность." },
        { heading: "Избегание препятствий", text: "Intel RealSense D435, Benewake CE30 — стереокамеры для 3D-восприятия пространства. Интегрируются с Ardupilot через AP_Proximity. Для автономного облёта объектов обязательны при скоростях >5 м/с." },
      ],
    },
    {
      title: "Телеметрия и связь",
      tags: ["радио", "телеметрия", "SiK", "4G", "MAVLink"],
      difficulty: "medium",
      time: "7 мин",
      content: [
        { heading: "Радиотелеметрия", text: "SiK-совместимые модули (RFDesign RFD900, Holybro SiK) — 433/915 МГц, дальность 10–40 км в условиях прямой видимости. Двунаправленные — позволяют менять параметры FC в полёте." },
        { heading: "4G / LTE телеметрия", text: "Raspberry Pi + SIM-карта передаёт MAVLink через интернет — именно этот подход использует SoloFly. Нет ограничений по дальности, данные в реальном времени через облако. Резервируйте автономностью при потере связи." },
        { heading: "RC управление", text: "FrSky ACCST/ACCESS (2.4 ГГц) — стандарт до 2 км. ExpressLRS (ELRS) — дальность 10+ км, открытый протокол, минимальная задержка. TBS Crossfire — до 40 км, облюбован профессионалами. Всегда настраивайте failsafe на RTL." },
        { heading: "MAVLink протокол", text: "Версия MAVLink 2 (рекомендуется) поддерживает расширенные сообщения и подпись пакетов. HEARTBEAT, GLOBAL_POSITION_INT, VFR_HUD, ATTITUDE, SYS_STATUS — минимальный набор для мониторинга SoloFly." },
      ],
    },
  ],
  payload: [
    {
      title: "Камеры и стабилизаторы",
      tags: ["камера", "гимбал", "съёмка", "FPV"],
      difficulty: "medium",
      time: "6 мин",
      content: [
        { heading: "Типы камер", text: "Action-камеры (GoPro, Insta360) — лёгкие, доступные, широкий угол. Беззеркалки (Sony, Fuji) — профессиональное качество, управление объективами. Тепловизоры (FLIR, DJI Zenmuse XT) — поиск людей, инспекция. Мультиспектральные (Micasense) — сельское хозяйство, картография." },
        { heading: "Гимбал", text: "Трёхосевой гимбал компенсирует крены, тангаж и рысканье. DJI Ronin — профессиональный стандарт. Gremsy, Freefly Alta — промышленные. Важно: балансируйте камеру на всех осях перед полётом, иначе гимбал перегревается." },
        { heading: "Вес и центровка", text: "Нагрузка должна крепиться строго по центру масс аппарата. Смещение ЦМ вызывает постоянную компенсирующую тягу и ускоряет разряд АКБ. Проверяйте баланс при каждой смене нагрузки." },
      ],
    },
    {
      title: "Специальные нагрузки: LiDAR и мультиспектр",
      tags: ["LiDAR", "картография", "точность", "RTK"],
      difficulty: "hard",
      time: "10 мин",
      content: [
        { heading: "LiDAR для картографии", text: "Livox Mid-70, Ouster OS1 — профессиональные сканеры для БПЛА. Вес 300–900 г. Требуют синхронизации с GNSS-INS (IMU+GPS) для геопривязки. Вывод — облака точек LAS/LAZ, обрабатываются в CloudCompare, Terrasolid, PDAL." },
        { heading: "Сопряжение с GNSS-INS", text: "LiDAR-данные без точной траектории бесполезны. Используйте Applanix APX-15, SBG Ellipse-D или Emlid Reach RS3 (RTK) для записи точной траектории. Пост-процессинг траектории (PPK) повышает точность до 2–5 см." },
        { heading: "Мультиспектральные камеры", text: "Micasense RedEdge-MX, Parrot Sequoia — 5 каналов (B, G, R, NIR, RedEdge). Требуют калибровочной панели отражения перед каждым полётом. Обработка в Agisoft Metashape, Pix4Dfields." },
        { heading: "Синхронизация данных", text: "Используйте Hardware Trigger (PWM из FC) для синхронной съёмки по плану. Частота: 1 снимок на каждые 60–80% перекрытия маршрута. Для LiDAR: тактовый сигнал PPS из GPS для временной синхронизации сканера." },
      ],
    },
  ],
  maintenance: [
    {
      title: "Регламент технического обслуживания",
      tags: ["ТО", "регламент", "ресурс", "безопасность"],
      difficulty: "medium",
      time: "8 мин",
      content: [
        { heading: "Перед каждым полётом", text: "1) Визуальный осмотр рамы на трещины и деформации. 2) Проверка затяжки всех болтов мотора (применяйте фиксатор резьбы Loctite 243). 3) Осмотр пропеллеров на сколы и расслоения. 4) Проверка разъёмов и кабелей на окисление и повреждения. 5) Тест АКБ — напряжение покоя, внутреннее сопротивление." },
        { heading: "После каждых 10 полётов", text: "Проверка подшипников моторов (вращение от руки, нет шума). Осмотр паек на ESC и PDB. Проверка термоусадок на кабелях. Обдув electronics от пыли. Проверка затяжки стоек крепления FC и PDB." },
        { heading: "После каждых 50 полётов", text: "Замена пропеллеров (даже без видимых повреждений — пластик устаёт). Осмотр рамы на микротрещины (подсветить с обратной стороны). Проверка и переполировка контактов АКБ. Калибровка FC — акселерометр и компас." },
        { heading: "Хранение", text: "АКБ хранить при 3.8В/ячейку, температура 10–25°C, влажность <60%. Дрон хранить без АКБ. Раз в 3 месяца: зарядить до 100%, разрядить до 80%, зарядить до storage — для «тренировки» ячеек." },
      ],
    },
    {
      title: "Диагностика неисправностей",
      tags: ["диагностика", "неисправность", "логи", "вибрация"],
      difficulty: "hard",
      time: "10 мин",
      content: [
        { heading: "Анализ бортовых логов", text: "Ardupilot/PX4 пишут подробные логи в формате BIN/ULOG. Открывайте в Mission Planner (DataFlash Log), ArduPilot Log Analyzer или UAVLogViewer онлайн. Ищите: VIBE (вибрации), BARO (высота), ATT (ориентация), CURR (ток)." },
        { heading: "Вибрации и клиппинг IMU", text: "Норма: VIBE.VibX/Y/Z < 30 м/с². Клиппинг (обрезание сигнала IMU) — признак критических вибраций. Причины: дисбаланс пропеллеров или моторов, ослабшие стойки FC, трещина в раме. Устраняйте немедленно." },
        { heading: "Типичные неисправности", text: "Дрон тянет в сторону: проверьте калибровку компаса, пропеллеры, тягу моторов. Нестабильное зависание: вибрации или ПИД-регуляторы. Быстрый разряд АКБ: перегруз, неверный KV/пропеллер, утечка тока. Отказ мотора в полёте: грязь в подшипнике, поврежденная обмотка, перегрев ESC." },
        { heading: "Процедура после краша", text: "1) Отключить питание. 2) Не трогать АКБ голыми руками — могла деформироваться. 3) Сфотографировать повреждения. 4) Скачать и проанализировать логи — понять причину. 5) Заменить все повреждённые компоненты. 6) Тестовый полёт в ручном режиме перед автономной работой." },
      ],
    },
    {
      title: "Правовое регулирование в России",
      tags: ["законодательство", "регистрация", "зоны", "разрешения"],
      difficulty: "easy",
      time: "5 мин",
      content: [
        { heading: "Регистрация БПЛА", text: "БПЛА массой 150 г – 30 кг подлежат учёту в Росавиации (Приказ Минтранса №494). Заявку подают через Госуслуги. После регистрации наносится учётный номер несмываемой краской или гравировкой." },
        { heading: "Получение разрешения на полёт", text: "Полёты выше 150 м или в радиусе 5 км от аэродромов требуют разрешения от органа ОВД. Подача через Госуслуги или заявка в ОрВД за 3 рабочих дня. В Москве и СПб — отдельный порядок согласования." },
        { heading: "Запрещённые зоны", text: "Государственные границы, объекты военной инфраструктуры, атомные станции — безусловный запрет. Временные ограничения (NOTAM) публикуются на сайте Росавиации. Используйте приложение «Небо» для проверки текущих ограничений." },
        { heading: "Ответственность", text: "Нарушение правил — административная ответственность по ст. 11.4 КоАП, штраф до 50 000 руб. для физлиц, до 500 000 руб. для юрлиц. При причинении вреда — уголовная ответственность по ст. 263 УК РФ." },
      ],
    },
  ],
};

const DIFFICULTY_LABEL = { easy: "Базовый", medium: "Средний", hard: "Продвинутый" };
const DIFFICULTY_CLS   = { easy: "tag-green", medium: "tag-electric", hard: "tag-danger" };

// ── Компонент карточки статьи ─────────────────────────────────────────────────

function ArticleCard({ article, onOpen }: { article: Article; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="panel rounded-xl p-4 text-left w-full transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{ border: "1px solid hsl(var(--border))" }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-sm leading-snug">{article.title}</span>
        <span className={`tag ${DIFFICULTY_CLS[article.difficulty]} shrink-0`} style={{ fontSize: 9 }}>
          {DIFFICULTY_LABEL[article.difficulty]}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="hud-label flex items-center gap-1">
          <Icon name="Clock" size={10} /> {article.time}
        </span>
        {article.tags.map(t => (
          <span key={t} className="tag tag-muted" style={{ fontSize: 9 }}>{t}</span>
        ))}
      </div>
    </button>
  );
}

// ── Модальное окно статьи ─────────────────────────────────────────────────────

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,9,14,0.88)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden panel"
        style={{ border: "1px solid rgba(0,212,255,0.2)" }}>

        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-3">
            <span className={`tag ${DIFFICULTY_CLS[article.difficulty]}`}>
              {DIFFICULTY_LABEL[article.difficulty]}
            </span>
            <span className="font-bold text-sm">{article.title}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {article.content.map((block, i) => (
            <div key={i}>
              {block.heading && (
                <h3 className="font-bold text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full shrink-0" style={{ background: "var(--electric)" }} />
                  {block.heading}
                </h3>
              )}
              <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                {block.text}
              </p>
            </div>
          ))}
        </div>

        <div className="shrink-0 px-5 py-3 flex items-center justify-between"
          style={{ borderTop: "1px solid hsl(var(--border))" }}>
          <span className="hud-label flex items-center gap-1.5">
            <Icon name="Clock" size={11} /> {article.time} на чтение
          </span>
          <button onClick={onClose} className="btn-electric px-4 py-2 rounded-lg text-xs">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Главная страница ──────────────────────────────────────────────────────────

export default function DroneBuilderPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("frames");
  const [openArticle, setOpenArticle]       = useState<Article | null>(null);
  const [search, setSearch]                 = useState("");

  const articles = ARTICLES[activeCategory] ?? [];
  const filtered = search.trim()
    ? Object.values(ARTICLES).flat().filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : articles;

  return (
    <div className="p-6 fade-up">

      {/* Заголовок */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}>
            <Icon name="Wrench" size={18} style={{ color: "var(--electric)" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Конструктор БПЛА</h1>
            <p className="text-muted-foreground text-sm">
              Руководства по сборке, настройке и обслуживанию — бесплатно
            </p>
          </div>
          <span className="tag tag-green ml-auto" style={{ fontSize: 9 }}>Бесплатно</span>
        </div>

        {/* Поиск */}
        <div className="relative mt-4">
          <Icon name="Search" size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "hsl(var(--muted-foreground))" }} />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            placeholder="Поиск по теме (мотор, LiDAR, Ardupilot…)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon name="X" size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Категории */}
      {!search && (
        <div className="flex gap-2 flex-wrap mb-5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={activeCategory === cat.id
                ? { background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.4)" }
                : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid transparent" }
              }
            >
              <Icon name={cat.icon} fallback="BookOpen" size={12} />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Статьи */}
      {search && (
        <p className="text-xs text-muted-foreground mb-3">
          Результаты поиска: {filtered.length} {filtered.length === 1 ? "статья" : "статей"}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="panel rounded-xl p-10 text-center text-muted-foreground text-sm">
          По запросу «{search}» ничего не найдено
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((article, i) => (
            <ArticleCard key={i} article={article} onOpen={() => setOpenArticle(article)} />
          ))}
        </div>
      )}

      {/* Баннер внизу */}
      {!search && (
        <div className="mt-6 panel rounded-xl p-5 flex items-center gap-4"
          style={{ border: "1px solid rgba(0,255,136,0.15)", background: "rgba(0,255,136,0.03)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,255,136,0.1)" }}>
            <Icon name="BookOpen" size={18} style={{ color: "var(--signal-green)" }} />
          </div>
          <div>
            <div className="font-semibold text-sm">База знаний пополняется</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Есть вопрос или хотите добавить тему — напишите в{" "}
              <button className="underline" style={{ color: "var(--electric)" }}
                onClick={() => window.open("https://t.me/+QgiLIa1gFRY4Y2Iy", "_blank")}>
                Telegram-сообщество
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно */}
      {openArticle && (
        <ArticleModal article={openArticle} onClose={() => setOpenArticle(null)} />
      )}
    </div>
  );
}
