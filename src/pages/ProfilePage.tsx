import Icon from "@/components/ui/icon";

export default function ProfilePage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-black">Личный кабинет</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Управление аккаунтом и настройками</p>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black glow-purple" style={{ background: "linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))" }}>
            ИП
          </div>
          <div>
            <h2 className="text-xl font-black">Иван Петров</h2>
            <p className="text-muted-foreground text-sm">ivan@company.ru · Администратор</p>
            <span className="badge-pill bg-purple-500/15 text-purple-400 mt-1 inline-block">Бизнес тариф</span>
          </div>
          <button className="ml-auto glass-card px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/8 transition-all flex items-center gap-2">
            <Icon name="Camera" size={14} />
            Сменить фото
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Имя", val: "Иван" },
            { label: "Фамилия", val: "Петров" },
            { label: "Email", val: "ivan@company.ru" },
            { label: "Телефон", val: "+7 (999) 123-45-67" },
            { label: "Компания", val: "ООО «Техновизор»" },
            { label: "Должность", val: "Генеральный директор" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs text-muted-foreground mb-1.5 block">{f.label}</label>
              <input
                defaultValue={f.val}
                className="w-full glass-card rounded-xl px-4 py-2.5 text-sm outline-none border border-border focus:border-purple-500/50 transition-all"
              />
            </div>
          ))}
        </div>
        <button className="mt-5 gradient-btn px-6 py-2.5 rounded-xl font-semibold text-sm">
          Сохранить изменения
        </button>
      </div>

      {/* Security */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-bold mb-5">Безопасность</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/4">
            <div className="flex items-center gap-3">
              <Icon name="Lock" size={18} className="text-purple-400" />
              <div>
                <div className="font-medium text-sm">Пароль</div>
                <div className="text-xs text-muted-foreground">Последнее изменение: 2 месяца назад</div>
              </div>
            </div>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Изменить</button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/4">
            <div className="flex items-center gap-3">
              <Icon name="Smartphone" size={18} className="text-cyan-400" />
              <div>
                <div className="font-medium text-sm">Двухфакторная аутентификация</div>
                <div className="text-xs text-muted-foreground">Через приложение Google Authenticator</div>
              </div>
            </div>
            <span className="badge-pill bg-green-500/15 text-green-400">Включено</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/4">
            <div className="flex items-center gap-3">
              <Icon name="Monitor" size={18} className="text-pink-400" />
              <div>
                <div className="font-medium text-sm">Активные сессии</div>
                <div className="text-xs text-muted-foreground">Chrome на macOS · Москва, 1 час назад</div>
              </div>
            </div>
            <button className="text-sm text-red-400 hover:text-red-300 transition-colors">Завершить все</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-bold mb-5">Уведомления</h2>
        <div className="space-y-3">
          {[
            { label: "Новые платежи", on: true },
            { label: "Изменения подписки", on: true },
            { label: "Еженедельный отчёт", on: false },
            { label: "Ошибки API", on: true },
            { label: "Новости продукта", on: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">{n.label}</span>
              <button
                className={`w-11 h-6 rounded-full transition-all relative ${n.on ? "" : "bg-white/15"}`}
                style={n.on ? { background: "var(--neon-purple)" } : {}}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${n.on ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass-card rounded-2xl p-6 border border-red-500/20">
        <h2 className="font-bold text-red-400 mb-4">Опасная зона</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Удалить аккаунт</div>
            <div className="text-xs text-muted-foreground mt-0.5">Все данные будут удалены безвозвратно</div>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm font-medium border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all">
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}
