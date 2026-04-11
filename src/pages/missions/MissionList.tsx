import Icon from "@/components/ui/icon";
import type { Mission } from "@/lib/api";
import { typeIcon, typeName, statusCls, statusLabel, fmtTime } from "./missionsTypes";

interface MissionListProps {
  loading: boolean;
  missions: Mission[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function MissionList({
  loading,
  missions,
  selectedId,
  onSelect,
}: MissionListProps) {
  const sel = missions.find(m => m.id === selectedId) ?? missions[0];

  if (loading && missions.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="panel p-4 rounded-xl animate-pulse" style={{ height: 100 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {missions.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className="w-full text-left p-4 rounded-xl panel transition-all"
          style={sel?.id === m.id ? { borderColor: "rgba(0,212,255,0.35)" } : {}}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,212,255,0.1)" }}>
                <Icon name={typeIcon[m.type] ?? "Navigation"} fallback="Navigation" size={14} style={{ color: "var(--electric)" }} />
              </div>
              <div>
                <span className="font-semibold text-sm">{m.name}</span>
                <div className="hud-label mt-0.5">{m.drone_name ?? m.drone_id} · {typeName[m.type] ?? m.type}</div>
              </div>
            </div>
            <span className={`tag ${statusCls[m.status] ?? "tag-muted"}`}>{statusLabel[m.status] ?? m.status}</span>
          </div>

          <div className="flex items-center gap-3 mb-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Icon name="Wind" size={11} /> {m.weather_wind} м/с
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Icon name="Navigation" size={11} /> {m.waypoints} точек
            </span>
            {m.obstacles_avoided > 0 && (
              <span className="flex items-center gap-1" style={{ color: "var(--warning)" }}>
                <Icon name="AlertTriangle" size={11} /> {m.obstacles_avoided} объездов
              </span>
            )}
          </div>

          {(m.tasks ?? []).length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {m.tasks.slice(0, 3).map(t => (
                <span key={t} className="tag tag-muted" style={{ fontSize: 9 }}>{t}</span>
              ))}
            </div>
          )}

          {m.status === "active" && (
            <>
              <div className="bar-track mb-1">
                <div className="bar-fill" style={{ width: `${m.progress}%`, background: "var(--signal-green)", transition: "width 1s ease" }} />
              </div>
              <div className="flex justify-between">
                <span className="hud-label">{m.progress}%</span>
                <span className="hud-label">ETA {fmtTime(m.eta)}</span>
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
