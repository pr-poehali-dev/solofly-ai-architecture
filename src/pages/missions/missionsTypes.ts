// ─── Константы и типы страницы миссий ────────────────────────────────────────

export const typeIcon: Record<string, string> = {
  patrol: "Shield", mapping: "Map", inspection: "Search",
  recon: "Eye", delivery: "Package",
};

export const typeName: Record<string, string> = {
  patrol: "Патруль", mapping: "Картография", inspection: "Инспекция",
  recon: "Разведка", delivery: "Доставка",
};

export const statusCls: Record<string, string> = {
  active: "tag-green", planned: "tag-electric", done: "tag-muted", aborted: "tag-danger",
};

export const statusLabel: Record<string, string> = {
  active: "Выполняется", planned: "Запланирована", done: "Завершена", aborted: "Прервана",
};

export const riskCls: Record<string, string> = {
  low: "tag-green", medium: "tag-warning", high: "tag-danger",
};

export const riskLabel: Record<string, string> = {
  low: "Низкий риск", medium: "Средний риск", high: "Высокий риск",
};

export type TabType = "map" | "tasks" | "weather" | "obstacles";

export function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
