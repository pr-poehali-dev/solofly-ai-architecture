import Icon from "@/components/ui/icon";
import { fmtCoord } from "./mapUtils";
import { ACTION_LABELS, ALTITUDE_PRESETS, type Waypoint } from "./waypointTypes";

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

  const setAltitude = (altitude: number | undefined) => {
    onChange(waypoints.map((wp, i) =>
      i === selectedWp ? { ...wp, altitude } : wp
    ));
  };

  const currentAlt = waypoint.altitude;

  return (
    <div
      className="shrink-0 px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2"
      style={{ borderTop: "1px solid hsl(var(--border))", background: "rgba(0,212,255,0.04)" }}
    >
      {/* Номер и координаты */}
      <div className="flex items-center gap-2">
        <span className="hud-label">Точка #{selectedWp + 1}:</span>
        <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>
          {fmtCoord(waypoint.lat, waypoint.lon)}
        </span>
      </div>

      {/* Действие */}
      <div className="flex items-center gap-1.5">
        <span className="hud-label">Действие:</span>
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
      </div>

      {/* Высота (эшелон) */}
      <div className="flex items-center gap-1.5">
        <Icon name="MoveVertical" size={12} style={{ color: "var(--electric)" }} />
        <span className="hud-label">Высота:</span>
        {ALTITUDE_PRESETS.map(alt => (
          <button
            key={alt}
            onClick={() => setAltitude(currentAlt === alt ? undefined : alt)}
            className="px-2 py-1 rounded text-xs transition-all"
            style={currentAlt === alt
              ? { background: "rgba(0,255,136,0.15)", color: "var(--signal-green)", border: "1px solid rgba(0,255,136,0.4)" }
              : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
            }
          >
            {alt}м
          </button>
        ))}
        {/* Ручной ввод */}
        <input
          type="number"
          min={10}
          max={500}
          step={10}
          placeholder="м"
          value={currentAlt ?? ""}
          onChange={e => {
            const v = e.target.value === "" ? undefined : Number(e.target.value);
            setAltitude(v);
          }}
          className="w-16 px-2 py-1 rounded text-xs text-center"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
        />
      </div>

      <button onClick={onClose} className="ml-auto btn-ghost px-2 py-1 rounded text-xs">
        <Icon name="X" size={12} />
      </button>
    </div>
  );
}
