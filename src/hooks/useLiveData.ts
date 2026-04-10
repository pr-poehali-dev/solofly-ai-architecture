/**
 * Хук для получения живых данных с автообновлением.
 * Каждые N секунд вызывает fetch-функцию и обновляет состояние.
 */
import { useState, useEffect, useCallback, useRef } from "react";

interface UseLiveDataOptions {
  interval?: number;   // мс между обновлениями, default 4000
  immediate?: boolean; // загрузить сразу при монтировании, default true
}

export function useLiveData<T>(
  fetcher: () => Promise<T>,
  options: UseLiveDataOptions = {}
) {
  const { interval = 4000, immediate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) fetch();
    timerRef.current = setInterval(fetch, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch, interval, immediate]);

  return { data, loading, error, lastUpdate, refresh: fetch };
}
