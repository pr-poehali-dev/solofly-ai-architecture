import { useState, useEffect, useCallback } from "react";
import { events, type EventsResponse } from "@/lib/api";

export function useEvents(intervalMs = 8000) {
  const [data, setData]       = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await events.getAll();
      setData(res);
      setError(null);
    } catch (e) {
      // Не ломаем UI — события вторичны, но логируем состояние
      setError(e instanceof Error ? e.message : "Ошибка загрузки событий");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);

  const resolve = async (id: number) => {
    await events.resolve(id);
    await refresh();
  };

  return { data, loading, error, refresh, resolve };
}
