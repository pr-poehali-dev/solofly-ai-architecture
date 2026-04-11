/**
 * ScanModel3D — интерактивная 3D-визуализация результата сканирования.
 * Строит облако точек (LiDAR) / тепловую карту / NDVI / радар через Three.js.
 * Управление: вращение — ЛКМ, масштаб — колесо, панорама — ПКМ.
 */
import type { SensorModeId } from "./scanningTypes";
import type { ScanMeta } from "./scanPointCloud";
import ScanViewport from "./ScanViewport";
import { exportPLY, exportOBJ, exportGeoJSON } from "./scanExport";

export type { ScanMeta };

interface ScanModel3DProps {
  mode:      SensorModeId;
  progress?: number;   // 0-100
  height?:   number;
  meta?:     ScanMeta;
}

export default function ScanModel3D({ mode, progress = 100, height = 360, meta }: ScanModel3DProps) {
  const stamp    = () => new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  const baseName = `solofly_${mode}_${stamp()}`;

  return (
    <div className="relative w-full" style={{ height }}>
      <ScanViewport mode={mode} progress={progress} height={height} meta={meta} />

      {/* Подсказка управления + геостатус */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none flex-wrap">
        <span className="tag tag-muted" style={{ fontSize: 9 }}>ЛКМ — вращение</span>
        <span className="tag tag-muted" style={{ fontSize: 9 }}>ПКМ — панорама</span>
        <span className="tag tag-muted" style={{ fontSize: 9 }}>Колесо — масштаб</span>
        {meta?.lat != null && meta?.lon != null
          ? <span className="tag tag-green" style={{ fontSize: 9 }}>
              ✓ WGS-84 · {meta.lat.toFixed(5)}°N {meta.lon.toFixed(5)}°E
            </span>
          : <span className="tag tag-muted" style={{ fontSize: 9, opacity: 0.5 }}>
              нет геопривязки
            </span>
        }
      </div>

      {/* Кнопки экспорта + кол-во точек */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className="tag tag-electric" style={{ fontSize: 9 }}>
          {Math.floor(4000 * progress / 100).toLocaleString("ru-RU")} точек
        </span>
        <button
          onClick={() => exportPLY(mode, progress, `${baseName}.ply`, meta)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all"
          style={{ background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.35)" }}
          title="PLY — CloudCompare, MeshLab, Blender"
        >
          ↓ PLY
        </button>
        <button
          onClick={() => exportOBJ(mode, progress, `${baseName}.obj`, meta)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all"
          style={{ background: "rgba(0,255,136,0.12)", color: "var(--signal-green)", border: "1px solid rgba(0,255,136,0.3)" }}
          title="OBJ — 3ds Max, Maya, AutoCAD, Rhino"
        >
          ↓ OBJ
        </button>
        <button
          onClick={() => exportGeoJSON(mode, progress, `${baseName}.geojson`, meta)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all"
          style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.35)" }}
          title="GeoJSON — QGIS, Google Earth, Leaflet, Mapbox"
        >
          ↓ GeoJSON
        </button>
      </div>
    </div>
  );
}
