// Хук живой телеметрии — поллинг fleet + simulate каждые 3 секунды
import { useState, useEffect, useCallback } from "react";
import { fleet, telemetry, type FleetResponse } from "@/lib/api";

export function useLiveFleet(intervalMs = 3000) {
  const [data, setData] = useState<FleetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      // Запускаем тик симулятора (обновляет позиции/батарею в БД)
      await telemetry.simulate();
      // Читаем обновлённый флот
      const res = await fleet.getAll();
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка соединения");
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
