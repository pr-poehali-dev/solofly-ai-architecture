import Icon from "@/components/ui/icon";
import { fmtCoord } from "./mapUtils";
import { ACTION_LABELS, type Waypoint } from "./waypointTypes";

interface WaypointActionBarProps {
  selectedWp: number;
  waypoint: Waypoint;
  onChange: (wps: Waypoint[]) => void;
  waypoints: Waypoint[];
  onClose: () => void;
}

export default function WaypointActionBar({
  selectedWp,
  waypoint,
  onChange,
  waypoints,
  onClose,
}: WaypointActionBarProps) {
  const setAction = (action: string) => {
    onChange(waypoints.map((wp, i) =>
      i === selectedWp ? { ...wp, action } : wp
    ));
  };

  return (
    <div
      className="shrink-0 px-4 py-2 flex items-center gap-3 flex-wrap"
      style={{ borderTop: "1px solid hsl(var(--border))", background: "rgba(0,212,255,0.04)" }}
    >
      <span className="hud-label">Точка #{selectedWp + 1}:</span>
      <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>
        {fmtCoord(waypoint.lat, waypoint.lon)}
      </span>
      <span className="hud-label ml-2">Действие:</span>
      {Object.entries(ACTION_LABELS).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setAction(key)}
          className="px-2 py-1 rounded text-xs transition-all"
          style={waypoint.action === key
            ? { background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.4)" }
            : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
          }
        >
          {label}
        </button>
      ))}
      <button onClick={onClose} className="ml-auto btn-ghost px-2 py-1 rounded text-xs">
        <Icon name="X" size={12} />
      </button>
    </div>
  );
}
