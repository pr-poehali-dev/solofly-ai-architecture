import Icon from "@/components/ui/icon";

const POLICY_VERSION = "1.0";
const POLICY_DATE    = "11 апреля 2026 г.";
const OPERATOR_NAME  = "SoloFly";
const CONTACT_EMAIL  = "privacy@solofly.dev";

interface Section {
  title: string;
  items: string[];
}

const sections: Section[] = [
  {
    title: "1. Общие положения",
    items: [
      `Настоящая Политика конфиденциальности определяет порядок обработки персональных данных пользователей системы ${OPERATOR_NAME} (далее — «Система») в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».`,
      "Оператором персональных данных является владелец Системы.",
      `Актуальная версия Политики: ${POLICY_VERSION} от ${POLICY_DATE}.`,
    ],
  },
  {
    title: "2. Какие данные мы собираем",
    items: [
      "Имя пользователя — для идентификации в системе.",
      "Адрес электронной почты (email) — для входа в аккаунт и связи.",
      "Хеш пароля — для аутентификации (пароль не хранится в открытом виде).",
      "IP-адрес и User-Agent — фиксируются при регистрации и выдаче согласия (требование 152-ФЗ).",
      "Дата и время регистрации, последнего входа.",
      "Данные о геолокации оператора — только при явном разрешении пользователя, только в оперативной памяти, не сохраняются в БД.",
    ],
  },
  {
    title: "3. Цели обработки данных",
    items: [
      "Обеспечение доступа к функционалу системы управления БПЛА.",
      "Идентификация и аутентификация пользователей.",
      "Обеспечение безопасности и защиты от несанкционированного доступа.",
      "Соблюдение требований законодательства Российской Федерации.",
    ],
  },
  {
    title: "4. Правовое основание обработки",
    items: [
      "Обработка персональных данных осуществляется на основании согласия субъекта персональных данных (п. 1 ч. 1 ст. 6 152-ФЗ).",
      "Согласие предоставляется при регистрации путём проставления отметки в соответствующем поле.",
      "Факт согласия, IP-адрес и время фиксируются в журнале согласий для доказательной базы.",
    ],
  },
  {
    title: "5. Хранение и защита данных",
    items: [
      "Данные хранятся на серверах, расположенных на территории Российской Федерации.",
      "Передача данных третьим лицам не осуществляется.",
      "Пароли хранятся исключительно в виде хеша (SHA-256), восстановление исходного пароля невозможно.",
      "Сессии автоматически истекают через 30 дней.",
    ],
  },
  {
    title: "6. Права субъектов персональных данных",
    items: [
      "Право на доступ — вы можете запросить информацию о хранящихся данных.",
      "Право на исправление — вы можете изменить имя и email в разделе «Профиль».",
      "Право на удаление (право на забвение) — вы можете удалить аккаунт в разделе «Профиль → Удалить аккаунт». Данные будут анонимизированы в течение 1 рабочего дня.",
      "Право на отзыв согласия — вы можете отозвать согласие, удалив аккаунт. Отзыв согласия не влияет на законность обработки, осуществлённой до отзыва.",
      "Право на обращение в Роскомнадзор — вы вправе подать жалобу в уполномоченный орган по защите прав субъектов персональных данных.",
    ],
  },
  {
    title: "7. Контактная информация",
    items: [
      `По всем вопросам, связанным с обработкой персональных данных, обращайтесь: ${CONTACT_EMAIL}`,
      "Срок ответа на запросы — не более 30 дней с момента получения.",
    ],
  },
];

interface PrivacyPageProps {
  standalone?: boolean;
  onClose?:    () => void;
}

export default function PrivacyPage({ standalone = false, onClose }: PrivacyPageProps) {
  return (
    <div className={standalone ? "fixed inset-0 z-50 overflow-y-auto" : "p-6 fade-up max-w-3xl mx-auto"}
      style={standalone ? { background: "hsl(var(--background))" } : {}}>
      {standalone && (
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: "rgba(5,9,14,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={16} style={{ color: "var(--electric)" }} />
            <span className="font-bold text-sm">Политика конфиденциальности</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
              <Icon name="X" size={16} />
            </button>
          )}
        </div>
      )}

      <div className={standalone ? "max-w-3xl mx-auto p-6 space-y-6" : "space-y-6"}>
        {!standalone && (
          <div className="flex items-center gap-3">
            <Icon name="Shield" size={20} style={{ color: "var(--electric)" }} />
            <div>
              <h1 className="text-xl font-bold">Политика конфиденциальности</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Версия {POLICY_VERSION} · {POLICY_DATE}</p>
            </div>
          </div>
        )}

        {/* Краткое резюме */}
        <div className="panel-glow rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Zap" size={14} style={{ color: "var(--electric)" }} />
            <span className="font-semibold text-sm">Коротко о главном</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "Server",    text: "Данные хранятся в РФ" },
              { icon: "Lock",      text: "Пароли не хранятся в открытом виде" },
              { icon: "UserX",     text: "Можно удалить аккаунт в любой момент" },
              { icon: "EyeOff",    text: "Данные не передаются третьим лицам" },
            ].map(i => (
              <div key={i.text} className="flex items-center gap-2 text-xs">
                <Icon name={i.icon} fallback="Check" size={13} style={{ color: "var(--signal-green)", flexShrink: 0 }} />
                <span>{i.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Разделы */}
        {sections.map(section => (
          <div key={section.title} className="panel rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-sm" style={{ color: "var(--electric)" }}>{section.title}</h2>
            <ul className="space-y-2">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "var(--electric)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="text-center hud-label py-4">
          Версия {POLICY_VERSION} · Вступила в силу {POLICY_DATE}
        </div>
      </div>
    </div>
  );
}
