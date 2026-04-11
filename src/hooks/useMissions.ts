import { useState, useEffect, useCallback, useMemo } from "react";
import { missions, type MissionsResponse, type Mission } from "@/lib/api";

export function useMissions(
  params?: { status?: string; drone_id?: string },
  intervalMs = 5000
) {
  const [data, setData]       = useState<MissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Стабильный ключ зависимости без JSON.stringify на каждый рендер
  const paramsKey = useMemo(
    () => `${params?.status ?? ""}|${params?.drone_id ?? ""}`,
    [params?.status, params?.drone_id]
  );

  const refresh = useCallback(async () => {
    try {
      const res = await missions.getAll(params);
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки миссий");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);

  const updateMission = async (
    id: number,
    upd: Partial<Pick<Mission, "status" | "progress">>
  ) => {
    await missions.update(id, upd);
    await refresh();
  };

  return { data, loading, error, refresh, updateMission };
}