import { useState, useEffect, useCallback, useRef } from "react";
import { fleet, telemetry, type FleetResponse, type Drone } from "@/lib/api";

// Дрон считается «реально онлайн» если last_seen не старше 15 секунд
function isRealOnline(drone: Drone): boolean {
  if (!drone.drone_token || !drone.last_seen) return false;
  const diffSec = (Date.now() - new Date(drone.last_seen).getTime()) / 1000;
  return diffSec < 15;
}

const MAX_RETRY        = 5;
const RETRY_BACKOFF_MS = 3000; // задержка после серии ошибок

export function useLiveFleet(intervalMs = 3000) {
  const [data,        setData]        = useState<FleetResponse | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const retryCount  = useRef(0);
  const isMounted   = useRef(true);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fleet.getAll();
      if (!isMounted.current) return;

      // Симулируем телеметрию только для виртуальных дронов
      const hasFakeDrones = res.drones.some(d => !isRealOnline(d));
      let finalRes = res;

      if (hasFakeDrones) {
        try {
          await telemetry.simulate();
          const res2 = await fleet.getAll();
          if (isMounted.current) finalRes = res2;
        } catch {
          // Симуляция упала — используем данные первого запроса
        }
      }

      const tagged = finalRes.drones.map(d => ({ ...d, is_real: isRealOnline(d) }));
      setData({ ...finalRes, drones: tagged });
      setError(null);
      setLastUpdated(new Date());
      retryCount.current = 0;

    } catch (e) {
      if (!isMounted.current) return;
      retryCount.current += 1;

      // Показываем ошибку только после нескольких неудачных попыток подряд
      if (retryCount.current >= MAX_RETRY) {
        const msg = e instanceof Error ? e.message : "Ошибка соединения с сервером";
        setError(msg);

        // Замедляем интервал при устойчивой ошибке
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = setInterval(refresh, Math.max(intervalMs, RETRY_BACKOFF_MS));
        }
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [intervalMs]);

  useEffect(() => {
    isMounted.current = true;
    refresh();

    if (intervalMs > 0) {
      timerRef.current = setInterval(refresh, intervalMs);
    }

    return () => {
      isMounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh, intervalMs]);

  // Ручной сброс ошибки при восстановлении связи
  const resetError = useCallback(() => {
    retryCount.current = 0;
    setError(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(refresh, intervalMs);
    }
    refresh();
  }, [refresh, intervalMs]);

  return { data, loading, error, lastUpdated, refresh, resetError };
}
