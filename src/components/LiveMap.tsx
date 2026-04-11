/**
 * LiveMap — интерактивная карта OSM с дронами и геолокацией оператора.
 * Работает в любой точке мира: авто-fit по bbox дронов, корректный масштаб с учётом широты.
 */
import { useEffect, useRef, useCallback } from "react";
import { STATUS_COLOR, type MapDrone } from "./map/mapUtils";
import { useMapInteraction } from "./map/useMapInteraction";
import { drawMapCanvas, type RemoteOperator } from "./map/drawMapCanvas";
import MapToolbar from "./map/MapToolbar";

export type { MapDrone };
export type { RemoteOperator };

interface LiveMapProps {
  drones: MapDrone[];
  center?: { lat: number; lon: number };
  zoom?: number;
  height?: number;
  operatorPos?: { lat: number; lon: number } | null;
  remoteOperators?: RemoteOperator[];
  selectedDroneId?: string | null;
  onSelectDrone?: (id: string | null) => void;
  showOperatorGeo?: boolean;
  className?: string;
}

export default function LiveMap({
  drones,
  center: centerProp,
  zoom: zoomProp,
  height = 320,
  operatorPos,
  remoteOperators = [],
  selectedDroneId,
  onSelectDrone,
  showOperatorGeo = false,
  className = "",
}: LiveMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const tickRef   = useRef(0);

  const validDrones  = drones.filter(d => d.lat && d.lon);
  const flyingDrones = drones.filter(d => d.status === "flight");

  const {
    center, setCenter,
    zoom, setZoom,
    centerRef, zoomRef,
    fitAll,
    onMouseDown, onMouseMove, onMouseUp,
    onTouchStart, onTouchMove, onTouchEnd,
    onWheel,
  } = useMapInteraction({ centerProp, zoomProp, validDrones, operatorPos, canvasRef });

  // ── Рендер ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    drawMapCanvas({
      ctx,
      W: canvas.width,
      H: canvas.height,
      center: centerRef.current,
      zoom: zoomRef.current,
      drones,
      operatorPos,
      remoteOperators,
      selectedDroneId,
      tick: tickRef.current,
      onTileLoad: draw,
    });

    tickRef.current++;
    animRef.current = requestAnimationFrame(draw);
  }, [drones, operatorPos, remoteOperators, selectedDroneId, centerRef, zoomRef]);

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

  const centerOnDrone = (drone: MapDrone) => {
    setCenter({ lat: drone.lat, lon: drone.lon });
    onSelectDrone?.(drone.id);
  };

  return (
    <div className={`flex flex-col ${className}`} style={{ height }}>
      <MapToolbar
        validDrones={validDrones}
        flyingDrones={flyingDrones}
        selectedDroneId={selectedDroneId}
        zoom={zoom}
        showOperatorGeo={showOperatorGeo}
        operatorPos={operatorPos}
        onCenterDrone={centerOnDrone}
        onFitAll={fitAll}
        onCenterOperator={() => operatorPos && setCenter(operatorPos)}
        onZoomIn={() => setZoom(z => Math.min(18, z + 1))}
        onZoomOut={() => setZoom(z => Math.max(2, z - 1))}
      />

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "hsl(210 20% 7%)" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* Легенда */}
        <div
          className="absolute bottom-3 right-3 flex flex-col gap-1"
          style={{ background: "rgba(5,9,14,0.85)", borderRadius: 8, padding: "8px 10px" }}
        >
          {Object.entries({ flight: "В полёте", standby: "Готов", charging: "Зарядка", offline: "Офлайн" }).map(([s, l]) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_COLOR[s] }} />
              <span className="hud-label" style={{ fontSize: 9 }}>{l}</span>
            </div>
          ))}
          {drones.some(d => d.is_real) && (
            <div className="flex items-center gap-2 mt-1 pt-1" style={{ borderTop: "1px solid rgba(0,255,136,0.2)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#00ff88", boxShadow: "0 0 4px #00ff88" }} />
              <span className="hud-label" style={{ fontSize: 9, color: "#00ff88" }}>● LIVE MAVLink</span>
            </div>
          )}
          {operatorPos && (
            <div className="flex items-center gap-2 mt-1 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--electric)" }} />
              <span className="hud-label" style={{ fontSize: 9 }}>Вы</span>
            </div>
          )}
          {remoteOperators.map(op => (
            <div key={op.operator_id} className="flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 2, marginTop: 2 }}>
              <div className="w-2.5 h-2.5 rounded-sm" style={{
                background: op.color,
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }} />
              <span className="hud-label" style={{ fontSize: 9, color: op.color }}>{op.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}