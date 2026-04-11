/**
 * WaypointEditor — интерактивный редактор маршрута на OSM-карте.
 * Клик по карте добавляет waypoint, drag перемещает, правый клик удаляет.
 * Маршрут рисуется линиями между точками, каждая точка пронумерована.
 */
import { useEffect, useRef, useCallback, useState } from "react";
import Icon from "@/components/ui/icon";
import { useWaypointMap } from "./useWaypointMap";
import { drawWaypoints } from "./drawWaypoints";
import WaypointActionBar from "./WaypointActionBar";
import type { WaypointEditorProps } from "./waypointTypes";

export type { Waypoint } from "./waypointTypes";

export default function WaypointEditor({
  waypoints,
  onChange,
  height = 420,
  initialCenter = { lat: 55.751, lon: 37.618 },
  initialZoom   = 14,
}: WaypointEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const tickRef   = useRef(0);

  const [selectedWp, setSelectedWp] = useState<number | null>(null);

  const {
    center, zoom, setZoom,
    centerRef, zoomRef,
    fitAll, totalDist,
    onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
    onContextMenu, onWheel,
  } = useWaypointMap({
    waypoints,
    onChange,
    initialCenter,
    initialZoom,
    canvasRef,
    setSelectedWp,
    selectedWp,
  });

  // ── Рендер ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    drawWaypoints({
      ctx,
      W:          canvas.width,
      H:          canvas.height,
      center:     centerRef.current,
      zoom:       zoomRef.current,
      waypoints,
      selectedWp,
      tick:       tickRef.current,
    });

    tickRef.current++;
    animRef.current = requestAnimationFrame(draw);
  }, [waypoints, selectedWp, centerRef, zoomRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
    return () => { ro.disconnect(); cancelAnimationFrame(animRef.current); };
  }, [draw]);

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0 flex-wrap"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <Icon name="MapPin" size={14} style={{ color: "var(--electric)" }} />
        <span className="text-xs font-semibold">Конструктор маршрута</span>
        <span className="tag tag-muted" style={{ fontSize: 9 }}>Клик — добавить · ПКМ — удалить · Drag — переместить</span>

        {waypoints.length > 0 && (
          <span className="tag tag-electric ml-1">{waypoints.length} точек</span>
        )}
        {totalDist > 0 && (
          <span className="tag tag-green">
            {totalDist >= 1000 ? `${(totalDist/1000).toFixed(2)} км` : `${Math.round(totalDist)} м`}
          </span>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {waypoints.length >= 2 && (
            <button onClick={fitAll} title="Показать маршрут"
              className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
              style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
              <Icon name="Maximize2" size={11} />
            </button>
          )}
          {waypoints.length > 0 && (
            <button onClick={() => { onChange([]); setSelectedWp(null); }}
              className="px-2 py-1 rounded text-xs flex items-center gap-1 transition-all"
              style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}>
              <Icon name="Trash2" size={11} /> Очистить
            </button>
          )}
          <button onClick={() => setZoom(z => Math.min(18, z + 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold">+</button>
          <span className="hud-label w-6 text-center">{zoom}</span>
          <button onClick={() => setZoom(z => Math.max(2, z - 1))}
            className="w-6 h-6 flex items-center justify-center rounded panel text-xs font-bold">−</button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "hsl(210 20% 7%)" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full select-none"
          style={{ cursor: "crosshair" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onContextMenu={onContextMenu}
          onWheel={onWheel}
        />

        {/* Подсказка при пустой карте */}
        {waypoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-6 rounded-xl" style={{ background: "rgba(5,9,14,0.7)" }}>
              <Icon name="MousePointer" size={28} style={{ color: "var(--electric)", margin: "0 auto 8px" }} />
              <p className="text-sm font-semibold mb-1">Кликни по карте</p>
              <p className="text-xs text-muted-foreground">Каждый клик добавляет точку маршрута</p>
            </div>
          </div>
        )}
      </div>

      {/* Редактор действия выбранной точки */}
      {selectedWp !== null && waypoints[selectedWp] && (
        <WaypointActionBar
          selectedWp={selectedWp}
          waypoint={waypoints[selectedWp]}
          onChange={onChange}
          waypoints={waypoints}
          onClose={() => setSelectedWp(null)}
        />
      )}
    </div>
  );
}
