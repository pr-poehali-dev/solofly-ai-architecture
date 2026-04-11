import { useState, useRef, useCallback, useEffect } from "react";
import { fitBounds, metersPerPixel, type MapDrone } from "./mapUtils";

interface UseMapInteractionOptions {
  centerProp?: { lat: number; lon: number };
  zoomProp?: number;
  validDrones: MapDrone[];
  operatorPos?: { lat: number; lon: number } | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function useMapInteraction({
  centerProp,
  zoomProp,
  validDrones,
  operatorPos,
  canvasRef,
}: UseMapInteractionOptions) {
  const fittedRef = useRef(false);

  const [center, setCenter] = useState<{ lat: number; lon: number }>(
    () => centerProp ?? { lat: 0, lon: 0 }
  );
  const [zoom, setZoom] = useState(zoomProp ?? 2);

  const centerRef = useRef(center);
  const zoomRef   = useRef(zoom);
  centerRef.current = center;
  zoomRef.current   = zoom;

  /** Вписать всех дронов (+ оператора) в viewport */
  const fitAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pts = [...validDrones.map(d => ({ lat: d.lat, lon: d.lon }))];
    if (operatorPos) pts.push(operatorPos);
    if (pts.length === 0) return;

    const { center: c, zoom: z } = fitBounds(pts, canvas.offsetWidth, canvas.offsetHeight, 70);
    setCenter(c);
    setZoom(z);
  }, [validDrones, operatorPos, canvasRef]);

  // Авто-fit при первом получении дронов
  useEffect(() => {
    if (!fittedRef.current && validDrones.length > 0) {
      fittedRef.current = true;
      fitAll();
    }
  }, [validDrones.length, fitAll]);

  // Если prop явно задан — следовать ему
  useEffect(() => {
    if (centerProp) setCenter(centerProp);
  }, [centerProp]);
  useEffect(() => {
    if (zoomProp != null) setZoom(zoomProp);
  }, [zoomProp]);

  // ── Drag to pan ──────────────────────────────────────────────────────────────
  const dragRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, cx: centerRef.current.lat, cy: centerRef.current.lon };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const z   = zoomRef.current;
    const n   = Math.pow(2, z);
    const tSz = 256;
    const dx  = e.clientX - dragRef.current.x;
    const dy  = e.clientY - dragRef.current.y;
    const mpp  = metersPerPixel(dragRef.current.cx, z);
    const dLon = -(dx * mpp) / (111320 * Math.cos((dragRef.current.cx * Math.PI) / 180));
    const dLat =  (dy * mpp) / 111320;
    const newLat = Math.max(-85, Math.min(85, dragRef.current.cx + dLat));
    const newLon = ((dragRef.current.cy + dLon + 180) % 360 + 360) % 360 - 180;
    setCenter({ lat: newLat, lon: newLon });
    void (n * tSz);
  };
  const onMouseUp = () => { dragRef.current = null; };

  // ── Touch support ────────────────────────────────────────────────────────────
  const touchRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY, cx: centerRef.current.lat, cy: centerRef.current.lon };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    e.preventDefault();
    const t   = e.touches[0];
    const mpp = metersPerPixel(touchRef.current.cx, zoomRef.current);
    const dx  = t.clientX - touchRef.current.x;
    const dy  = t.clientY - touchRef.current.y;
    const dLon = -(dx * mpp) / (111320 * Math.cos((touchRef.current.cx * Math.PI) / 180));
    const dLat =  (dy * mpp) / 111320;
    const newLat = Math.max(-85, Math.min(85, touchRef.current.cx + dLat));
    const newLon = ((touchRef.current.cy + dLon + 180) % 360 + 360) % 360 - 180;
    setCenter({ lat: newLat, lon: newLon });
  };
  const onTouchEnd = () => { touchRef.current = null; };

  // ── Zoom wheel ───────────────────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(18, Math.max(2, z + (e.deltaY < 0 ? 1 : -1))));
  };

  return {
    center, setCenter,
    zoom, setZoom,
    centerRef, zoomRef,
    fitAll,
    onMouseDown, onMouseMove, onMouseUp,
    onTouchStart, onTouchMove, onTouchEnd,
    onWheel,
  };
}
