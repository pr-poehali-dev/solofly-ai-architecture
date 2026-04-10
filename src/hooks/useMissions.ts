// Хук миссий с автообновлением
import { useState, useEffect, useCallback } from "react";
import { missions, type MissionsResponse, type Mission } from "@/lib/api";

export function useMissions(params?: { status?: string; drone_id?: string }, intervalMs = 5000) {
  const [data, setData] = useState<MissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await missions.getAll(params);
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);

  const updateMission = async (id: number, upd: Partial<Pick<Mission, "status" | "progress">>) => {
    await missions.update(id, upd);
    await refresh();
  };

  return { data, loading, error, refresh, updateMission };
}
