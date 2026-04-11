import { useState, useEffect, useRef, useCallback } from "react";
import { presence, type OperatorPresence } from "@/lib/api";

// Генерируем стабильный ID для этой вкладки/сессии
function getOperatorId() {
  const key = "solofly_operator_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getOperatorName() {
  return sessionStorage.getItem("solofly_operator_name") ?? "Оператор";
}

export interface UseOperatorPresenceOptions {
  /** Публиковать позицию оператора. Если false — только читаем чужих. */
  publish:    boolean;
  /** Геопозиция текущего оператора (из requestGeo) */
  myPos:      { lat: number; lon: number } | null;
  /** Текущая страница */
  page?:      string;
  /** Интервал публикации в мс */
  publishMs?: number;
  /** Интервал получения списка в мс */
  pollMs?:    number;
}

export function useOperatorPresence({
  publish,
  myPos,
  page      = "dashboard",
  publishMs = 5000,
  pollMs    = 5000,
}: UseOperatorPresenceOptions) {
  const operatorId  = useRef(getOperatorId());
  const myColor     = useRef<string | null>(null);

  const [operators, setOperators] = useState<OperatorPresence[]>([]);

  // Получаем список всех онлайн-операторов
  const fetchAll = useCallback(async () => {
    try {
      const res = await presence.getAll();
      // Фильтруем себя — себя показываем отдельно через operatorPos
      setOperators(res.operators.filter(o => o.operator_id !== operatorId.current));
    } catch { /* тихо */ }
  }, []);

  // Публикуем свою позицию
  const publishPos = useCallback(async () => {
    if (!myPos) return;
    try {
      const res = await presence.upsert({
        operator_id: operatorId.current,
        name:        getOperatorName(),
        lat:         myPos.lat,
        lon:         myPos.lon,
        heading:     0,
        page,
        color:       myColor.current ?? undefined,
      });
      myColor.current = res.color;
    } catch { /* тихо */ }
  }, [myPos, page]);

  // Удаляем себя при размонтировании
  useEffect(() => {
    const id = operatorId.current;
    return () => {
      presence.remove(id).catch(() => {});
    };
  }, []);

  // Полинг: читаем список
  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, pollMs);
    return () => clearInterval(t);
  }, [fetchAll, pollMs]);

  // Публикация позиции
  useEffect(() => {
    if (!publish || !myPos) return;
    publishPos();
    const t = setInterval(publishPos, publishMs);
    return () => clearInterval(t);
  }, [publish, myPos, publishPos, publishMs]);

  return {
    operators,      // другие операторы онлайн
    myOperatorId: operatorId.current,
    myColor:      myColor.current,
    total:        operators.length,
  };
}
