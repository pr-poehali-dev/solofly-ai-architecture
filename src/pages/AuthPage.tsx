import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { YandexLoginButton } from "@/components/extensions/yandex-auth/YandexLoginButton";
import { useYandexAuth } from "@/components/extensions/yandex-auth/useYandexAuth";

const YANDEX_AUTH_URL = "https://functions.poehali.dev/10cbe5fa-e5d6-47d9-8b16-0520118ce11e";

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode]     = useState<"login" | "register">("login");
  const [email, setEmail]   = useState("");
  const [password, setPass] = useState("");
  const [name, setName]     = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const yandexAuth = useYandexAuth({
    apiUrls: {
      authUrl: `${YANDEX_AUTH_URL}?action=auth-url`,
      callback: `${YANDEX_AUTH_URL}?action=callback`,
      refresh: `${YANDEX_AUTH_URL}?action=refresh`,
      logout: `${YANDEX_AUTH_URL}?action=logout`,
    },
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "register" && !consent) {
      setError("Необходимо дать согласие на обработку персональных данных");
      return;
    }
    setLoad(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name, true);
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

          {/* Согласие на обработку ПДн — только при регистрации (152-ФЗ) */}
          {mode === "register" && (
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                  className="sr-only"
                />
                <div className="w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    background: consent ? "var(--electric)" : "hsl(var(--input))",
                    border: `1px solid ${consent ? "var(--electric)" : "hsl(var(--border))"}`,
                  }}>
                  {consent && <Icon name="Check" size={10} style={{ color: "hsl(210 25% 4%)" }} />}
                </div>
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Я даю согласие на обработку моих персональных данных в соответствии с{" "}
                <button
                  type="button"
                  onClick={() => window.open("/?privacy=1", "_blank")}
                  className="underline"
                  style={{ color: "var(--electric)" }}
                >
                  Политикой конфиденциальности
                </button>
                {" "}и требованиями Федерального закона №152-ФЗ «О персональных данных»
              </span>
            </label>
          )}

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

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
            <span className="text-xs text-muted-foreground">или</span>
            <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
          </div>

          <YandexLoginButton
            onClick={yandexAuth.login}
            isLoading={yandexAuth.isLoading}
            className="w-full"
          />
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