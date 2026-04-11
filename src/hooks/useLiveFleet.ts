import { useState, useEffect, useCallback, useRef } from "react";
import { fleet, telemetry, type FleetResponse } from "@/lib/api";

export function useLiveFleet(intervalMs = 3000) {
  const [data, setData]       = useState<FleetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const retryCount            = useRef(0);
  const MAX_RETRY             = 3;

  const refresh = useCallback(async () => {
    try {
      await telemetry.simulate();
      const res = await fleet.getAll();
      setData(res);
      setError(null);
      retryCount.current = 0;
    } catch (e) {
      retryCount.current += 1;
      if (retryCount.current >= MAX_RETRY) {
        setError(e instanceof Error ? e.message : "Ошибка соединения");
      }
      // При временных ошибках сохраняем предыдущие данные
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [refresh, intervalMs]);

  return { data, loading, error, refresh };
}
