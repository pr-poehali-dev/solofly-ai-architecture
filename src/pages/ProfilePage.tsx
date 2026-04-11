import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";

const AVATAR_COLORS = [
  "#00d4ff", "#00ff88", "#a78bfa", "#f97316",
  "#ec4899", "#14b8a6", "#eab308", "#ff3b30",
];

export default function ProfilePage() {
  const { user, updateUser, logout, deleteAccount } = useAuth();

  // Форма — основные данные
  const [name,  setName]  = useState(user?.name  ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [color, setColor] = useState(user?.avatar_color ?? "#00d4ff");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  // Форма — смена пароля
  const [curPwd,  setCurPwd]  = useState("");
  const [newPwd,  setNewPwd]  = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  // Удаление аккаунта
  const [showDelete,    setShowDelete]    = useState(false);
  const [deletePwd,     setDeletePwd]     = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState<string | null>(null);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoMsg(null);
    try {
      await updateUser({ name, email, avatar_color: color });
      setInfoMsg({ ok: true, text: "Профиль обновлён" });
    } catch (err: unknown) {
      let text = "Ошибка при сохранении";
      try {
        const raw = err instanceof Error ? err.message : String(err);
        const parsed = JSON.parse(raw.replace(/^.*?(\{.*\}).*$/s, "$1"));
        text = parsed.error ?? text;
      } catch { /* */ }
      setInfoMsg({ ok: false, text });
    } finally {
      setInfoLoading(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== newPwd2) {
      setPwdMsg({ ok: false, text: "Пароли не совпадают" });
      return;
    }
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      await updateUser({ current_password: curPwd, new_password: newPwd });
      setPwdMsg({ ok: true, text: "Пароль изменён" });
      setCurPwd(""); setNewPwd(""); setNewPwd2("");
    } catch (err: unknown) {
      let text = "Ошибка при смене пароля";
      try {
        const raw = err instanceof Error ? err.message : String(err);
        const parsed = JSON.parse(raw.replace(/^.*?(\{.*\}).*$/s, "$1"));
        text = parsed.error ?? text;
      } catch { /* */ }
      setPwdMsg({ ok: false, text });
    } finally {
      setPwdLoading(false);
    }
  };

  const initial = (user?.name ?? "?").charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="p-6 space-y-6 fade-up max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-bold">Профиль</h1>
        <span className="tag tag-muted">{user?.role === "admin" ? "Администратор" : "Оператор"}</span>
      </div>

      {/* Аватар + статистика */}
      <div className="panel rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
          style={{ background: color, color: "hsl(210 25% 4%)" }}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg truncate">{user?.name}</div>
          <div className="text-muted-foreground text-sm truncate">{user?.email}</div>
          <div className="hud-label mt-1">В системе с {memberSince}</div>
        </div>
        <button
          onClick={logout}
          className="btn-ghost px-3 py-2 rounded-lg text-xs flex items-center gap-2 shrink-0"
        >
          <Icon name="LogOut" size={13} />
          Выйти
        </button>
      </div>

      {/* Основные данные */}
      <form onSubmit={saveInfo} className="panel rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Icon name="User" size={15} style={{ color: "var(--electric)" }} />
          Основные данные
        </h2>

        <div>
          <label className="hud-label block mb-1.5">Имя</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            placeholder="Иван Петров"
          />
        </div>

        <div>
          <label className="hud-label block mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            placeholder="operator@solofly.dev"
          />
        </div>

        <div>
          <label className="hud-label block mb-2">Цвет аватара</label>
          <div className="flex gap-2 flex-wrap">
            {AVATAR_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-lg transition-all"
                style={{
                  background: c,
                  border: color === c ? "2px solid hsl(var(--foreground))" : "2px solid transparent",
                  boxShadow: color === c ? `0 0 10px ${c}80` : "none",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {infoMsg && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{
              background: infoMsg.ok ? "rgba(0,255,136,0.1)" : "rgba(255,59,48,0.1)",
              color:      infoMsg.ok ? "var(--signal-green)" : "var(--danger)",
              border:     `1px solid ${infoMsg.ok ? "rgba(0,255,136,0.25)" : "rgba(255,59,48,0.2)"}`,
            }}>
            <Icon name={infoMsg.ok ? "CheckCircle" : "AlertCircle"} size={13} />
            {infoMsg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={infoLoading}
          className="btn-electric px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
        >
          {infoLoading
            ? <><Icon name="Loader" size={13} className="animate-spin" /> Сохраняем…</>
            : <><Icon name="Save" size={13} /> Сохранить изменения</>
          }
        </button>
      </form>

      {/* Смена пароля */}
      <form onSubmit={savePassword} className="panel rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Icon name="Lock" size={15} style={{ color: "var(--electric)" }} />
          Смена пароля
        </h2>

        <div>
          <label className="hud-label block mb-1.5">Текущий пароль</label>
          <input
            type="password"
            value={curPwd}
            onChange={e => setCurPwd(e.target.value)}
            placeholder="Введи текущий пароль"
            className="w-full px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="hud-label block mb-1.5">Новый пароль</label>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Минимум 6 символов"
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            />
          </div>
          <div>
            <label className="hud-label block mb-1.5">Повтори пароль</label>
            <input
              type="password"
              value={newPwd2}
              onChange={e => setNewPwd2(e.target.value)}
              placeholder="Повтори новый пароль"
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{
                background: "hsl(var(--input))",
                border: newPwd2 && newPwd !== newPwd2
                  ? "1px solid var(--danger)"
                  : "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
          </div>
        </div>

        {pwdMsg && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
            style={{
              background: pwdMsg.ok ? "rgba(0,255,136,0.1)" : "rgba(255,59,48,0.1)",
              color:      pwdMsg.ok ? "var(--signal-green)" : "var(--danger)",
              border:     `1px solid ${pwdMsg.ok ? "rgba(0,255,136,0.25)" : "rgba(255,59,48,0.2)"}`,
            }}>
            <Icon name={pwdMsg.ok ? "CheckCircle" : "AlertCircle"} size={13} />
            {pwdMsg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={pwdLoading || !curPwd || !newPwd || !newPwd2}
          className="btn-ghost px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2"
          style={{ opacity: (!curPwd || !newPwd || !newPwd2) ? 0.5 : 1 }}
        >
          {pwdLoading
            ? <><Icon name="Loader" size={13} className="animate-spin" /> Меняем…</>
            : <><Icon name="Lock" size={13} /> Изменить пароль</>
          }
        </button>
      </form>

      {/* 152-ФЗ: право на забвение — удаление аккаунта */}
      <div className="panel rounded-2xl p-6 space-y-4"
        style={{ border: "1px solid rgba(255,59,48,0.15)" }}>
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Icon name="Trash2" size={15} style={{ color: "var(--danger)" }} />
          Удаление аккаунта
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          В соответствии со ст. 21 Федерального закона №152-ФЗ вы имеете право на удаление ваших
          персональных данных. После удаления данные будут анонимизированы и вход станет невозможен.
          Действие необратимо.
        </p>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all"
            style={{ background: "rgba(255,59,48,0.08)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}
          >
            <Icon name="Trash2" size={13} /> Удалить мой аккаунт
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold" style={{ color: "var(--danger)" }}>
              Для подтверждения введи свой пароль:
            </p>
            <input
              type="password"
              value={deletePwd}
              onChange={e => setDeletePwd(e.target.value)}
              placeholder="Твой текущий пароль"
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: "hsl(var(--input))", border: "1px solid rgba(255,59,48,0.3)", color: "hsl(var(--foreground))" }}
            />
            {deleteError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}>
                <Icon name="AlertCircle" size={13} /> {deleteError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDelete(false); setDeletePwd(""); setDeleteError(null); }}
                className="btn-ghost px-4 py-2 rounded-lg text-xs"
              >
                Отмена
              </button>
              <button
                disabled={deleteLoading || !deletePwd}
                onClick={async () => {
                  setDeleteLoading(true);
                  setDeleteError(null);
                  try {
                    await deleteAccount(deletePwd);
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : String(err);
                    try {
                      const p = JSON.parse(msg.replace(/^.*?(\{.*\}).*$/s, "$1"));
                      setDeleteError(p.error ?? msg);
                    } catch { setDeleteError(msg); }
                    setDeleteLoading(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: "var(--danger)", color: "#fff",
                  opacity: (!deletePwd || deleteLoading) ? 0.6 : 1,
                }}
              >
                {deleteLoading
                  ? <><Icon name="Loader" size={13} className="animate-spin" /> Удаляем…</>
                  : <><Icon name="Trash2" size={13} /> Удалить навсегда</>
                }
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ссылка на политику */}
      <div className="flex items-center justify-between py-2">
        <a
          href="/?privacy=1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--electric)" }}
        >
          <Icon name="Shield" size={12} /> Политика конфиденциальности (152-ФЗ)
        </a>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="LogOut" size={12} /> Выйти
        </button>
      </div>
    </div>
  );
}