import Icon from "@/components/ui/icon";
import { STATUS_COLOR, type MapDrone } from "./mapUtils";

interface MapToolbarProps {
  validDrones: MapDrone[];
  flyingDrones: MapDrone[];
  selectedDroneId?: string | null;
  zoom: number;
  showOperatorGeo: boolean;
  operatorPos?: { lat: number; lon: number } | null;
  onCenterDrone: (drone: MapDrone) => void;
  onFitAll: () => void;
  onCenterOperator: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function MapToolbar({
  validDrones,
  flyingDrones,
  selectedDroneId,
  zoom,
  showOperatorGeo,
  operatorPos,
  onCenterDrone,
  onFitAll,
  onCenterOperator,
  onZoomIn,
  onZoomOut,
}: MapToolbarProps) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 shrink-0 flex-wrap"
      style={{ borderBottom: "1px solid hsl(var(--border))" }}
    >
      <Icon name="Map" size={14} style={{ color: "var(--electric)" }} />
      <span className="text-xs font-semibold">Карта БПЛА</span>
      {flyingDrones.length > 0 && (
        <span className="tag tag-green flex items-center gap-1.5 ml-1">
          <span className="dot-online" /> {flyingDrones.length} в воздухе
        </span>
      )}

      {/* Быстрый переход к дрону */}
      <div className="flex gap-1 ml-2 flex-wrap">
        {validDrones.map(d => (
          <button
            key={d.id}
            onClick={() => onCenterDrone(d)}
            className="px-2 py-1 rounded text-xs transition-all"
            style={selectedDroneId === d.id
              ? { background: `${STATUS_COLOR[d.status] ?? "#00d4ff"}20`, color: STATUS_COLOR[d.status] ?? "#00d4ff", border: `1px solid ${STATUS_COLOR[d.status] ?? "#00d4ff"}50` }
              : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
            }
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Показать всех */}
        <button
          onClick={onFitAll}
          title="Показать всех"
          className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
          style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}
        >
          <Icon name="Maximize2" size={11} />
        </button>

        {/* Центр на операторе */}
        {showOperatorGeo && operatorPos && (
          <button
            onClick={onCenterOperator}
            title="Моя позиция"
            className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
            style={{ background: "rgba(0,212,255,0.1)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }}
          >
            <Icon name="Navigation" size={11} /> Я
          </button>
        )}

        {/* Зум */}
        <button
          onClick={onZoomIn}
          className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold hover:opacity-80"
        >+</button>
        <span className="hud-label w-6 text-center">{zoom}</span>
        <button
          onClick={onZoomOut}
          className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold hover:opacity-80"
        >−</button>
      </div>
    </div>
  );
}
