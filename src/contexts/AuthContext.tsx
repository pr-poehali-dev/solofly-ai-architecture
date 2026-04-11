import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, type User } from "@/lib/api";

interface AuthContextValue {
  user:       User | null;
  loading:    boolean;
  login:      (email: string, password: string) => Promise<void>;
  register:   (email: string, password: string, name: string) => Promise<void>;
  logout:     () => Promise<void>;
  updateUser: (data: {
    name?:             string;
    email?:            string;
    current_password?: string;
    new_password?:     string;
    avatar_color?:     string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Восстанавливаем сессию при загрузке
  useEffect(() => {
    const token = localStorage.getItem("sf_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then(res => setUser(res.user))
      .catch(() => localStorage.removeItem("sf_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("sf_token", res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await authApi.register({ email, password, name });
    localStorage.setItem("sf_token", res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    localStorage.removeItem("sf_token");
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Parameters<AuthContextValue["updateUser"]>[0]) => {
    const res = await authApi.update(data);
    setUser(res.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
