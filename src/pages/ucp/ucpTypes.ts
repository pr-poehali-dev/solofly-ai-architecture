// Shared constants, helpers and form defaults for the UCP module

export const ROLE_LABEL: Record<string, string> = {
  scout: "Разведчик", mapper: "Картограф", relay: "Ретранслятор",
  leader: "Лидер роя", cargo: "Грузовой", guard: "Охрана",
};

export const ROLE_COLOR: Record<string, string> = {
  scout: "var(--electric)", mapper: "var(--signal-green)", relay: "#a78bfa",
  leader: "#f97316", cargo: "#22d3ee", guard: "#e879f9",
};

export const STATUS_CLS: Record<string, string> = {
  flight: "tag-green", standby: "tag-electric", charging: "tag-warning",
  offline: "tag-muted", error: "tag-danger",
};

export const STATUS_LABEL: Record<string, string> = {
  flight: "В полёте", standby: "Готов", charging: "Зарядка",
  offline: "Офлайн", error: "Ошибка",
};

export const STATUS_DOT: Record<string, string> = {
  flight: "dot-online", standby: "dot-online", charging: "dot-warning",
  offline: "dot-offline", error: "dot-danger",
};

export function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function relTime(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} с назад`;
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  return `${Math.floor(s / 3600)} ч назад`;
}

export const EMPTY_FORM = {
  id: "", name: "", role: "scout",
  hw_weight: "2.0", hw_motors: "4", hw_battery_cap: "10000", hw_max_speed: "90",
  ai_model: "PathNet-v4.2", firmware_ver: "1.0.0", serial_num: "", notes: "",
};
