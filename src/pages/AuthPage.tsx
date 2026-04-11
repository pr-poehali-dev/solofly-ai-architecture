import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode]     = useState<"login" | "register">("login");
  const [email, setEmail]   = useState("");
  const [password, setPass] = useState("");
  const [name, setName]     = useState("");
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoad(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Пробуем извлечь текст из JSON-ответа
      try {
        const parsed = JSON.parse(msg.replace(/^.*?(\{.*\}).*$/s, "$1"));
        setError(parsed.error ?? msg);
      } catch {
        setError(msg);
      }
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-up">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--electric)" }}>
            <Icon name="Navigation" size={28} style={{ color: "hsl(210 25% 4%)" }} />
          </div>
          <h1 className="text-2xl font-bold">Solo<span className="gradient-text">Fly</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Система управления БПЛА</p>
        </div>

        {/* Переключатель режима */}
        <div className="flex mb-6 p-1 rounded-xl" style={{ background: "hsl(var(--input))" }}>
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={mode === m
                ? { background: "var(--electric)", color: "hsl(210 25% 4%)" }
                : { color: "hsl(var(--muted-foreground))" }
              }
            >
              {m === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Форма */}
        <form onSubmit={submit} className="panel rounded-2xl p-6 space-y-4">
          {mode === "register" && (
            <div>
              <label className="hud-label block mb-1.5">Имя</label>
              <input
                type="text"
                placeholder="Иван Петров"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
              />
            </div>
          )}

          <div>
            <label className="hud-label block mb-1.5">Email</label>
            <input
              type="email"
              placeholder="operator@solofly.dev"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            />
          </div>

          <div>
            <label className="hud-label block mb-1.5">Пароль</label>
            <input
              type="password"
              placeholder={mode === "register" ? "Минимум 6 символов" : "••••••••"}
              value={password}
              onChange={e => setPass(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm"
              style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
              style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}>
              <Icon name="AlertCircle" size={13} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-electric py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading
              ? <><Icon name="Loader" size={16} className="animate-spin" /> Подождите…</>
              : mode === "login"
                ? <><Icon name="LogIn" size={16} /> Войти в систему</>
                : <><Icon name="UserPlus" size={16} /> Создать аккаунт</>
            }
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {mode === "login"
            ? <>Нет аккаунта? <button onClick={() => setMode("register")} className="underline" style={{ color: "var(--electric)" }}>Зарегистрироваться</button></>
            : <>Уже есть аккаунт? <button onClick={() => setMode("login")} className="underline" style={{ color: "var(--electric)" }}>Войти</button></>
          }
        </p>
      </div>
    </div>
  );
}
