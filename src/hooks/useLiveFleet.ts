import { useState, useEffect, useCallback, useRef } from "react";
import { fleet, telemetry, type FleetResponse, type Drone } from "@/lib/api";

// Дрон считается «реально онлайн» если last_seen не старше 15 секунд
function isRealOnline(drone: Drone): boolean {
  if (!drone.drone_token || !drone.last_seen) return false;
  const diffSec = (Date.now() - new Date(drone.last_seen).getTime()) / 1000;
  return diffSec < 15;
}

export function useLiveFleet(intervalMs = 3000) {
  const [data, setData]       = useState<FleetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const retryCount            = useRef(0);
  const MAX_RETRY             = 3;

  const refresh = useCallback(async () => {
    try {
      const res = await fleet.getAll();

      // Помечаем реальные дроны и симулируем только виртуальные
      const hasFakeDrones = res.drones.some(d => !isRealOnline(d));
      if (hasFakeDrones) {
        await telemetry.simulate();
        // Перечитываем после симуляции
        const res2 = await fleet.getAll();
        const tagged = res2.drones.map(d => ({ ...d, is_real: isRealOnline(d) }));
        setData({ ...res2, drones: tagged });
      } else {
        // Все дроны реальные — не симулируем
        const tagged = res.drones.map(d => ({ ...d, is_real: true }));
        setData({ ...res, drones: tagged });
      }

      setError(null);
      retryCount.current = 0;
    } catch (e) {
      retryCount.current += 1;
      if (retryCount.current >= MAX_RETRY) {
        setError(e instanceof Error ? e.message : "Ошибка соединения");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // intervalMs=0 — одноразовый запрос (для страниц без live-обновлений)
    if (intervalMs <= 0) return;
    const timer = setInterval(refresh, intervalMs);
    return () => clearInterval(timer);
  }, [refresh, intervalMs]);

  return { data, loading, error, refresh };
}