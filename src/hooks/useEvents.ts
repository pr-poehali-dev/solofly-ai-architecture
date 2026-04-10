// Хук системных событий с автообновлением
import { useState, useEffect, useCallback } from "react";
import { events, type EventsResponse } from "@/lib/api";

export function useEvents(intervalMs = 8000) {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await events.getAll();
      setData(res);
    } catch {
      // silent — не ломаем UI из-за событий
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

  return { data, loading, refresh, resolve };
}
