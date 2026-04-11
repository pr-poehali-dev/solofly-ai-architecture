// Экспорт облака точек в PLY / OBJ / GeoJSON

import type { SensorModeId } from "./scanningTypes";
import type { ScanMeta } from "./scanPointCloud";
import { buildPointCloud } from "./scanPointCloud";

// ── Блок метаданных для заголовков файлов ────────────────────────────────────
export function metaComments(prefix: string, mode: SensorModeId, progress: number, meta?: ScanMeta): string[] {
  const now   = new Date().toISOString();
  const lines = [
    `${prefix} ═══════════════════════════════════════════════`,
    `${prefix}  SoloFly Point Cloud Export`,
    `${prefix}  Generated : ${now}`,
    `${prefix} ───────────────────────────────────────────────`,
    `${prefix}  SESSION`,
    `${prefix}    Code          : ${meta?.code         ?? "—"}`,
    `${prefix}    Status        : ${progress >= 100 ? "done" : "partial"} (${progress.toFixed(1)}%)`,
    `${prefix}    Started       : ${meta?.started_at   ?? "—"}`,
    `${prefix}    Finished      : ${meta?.finished_at  ?? "—"}`,
    `${prefix} ───────────────────────────────────────────────`,
    `${prefix}  DRONE`,
    `${prefix}    ID            : ${meta?.drone_id     ?? "—"}`,
    `${prefix}    Name          : ${meta?.drone_name   ?? "—"}`,
  ];
  if (meta?.lat != null && meta?.lon != null) {
    lines.push(`${prefix}    Position      : ${meta.lat.toFixed(6)}°N  ${meta.lon.toFixed(6)}°E`);
  }
  if (meta?.altitude_m != null) {
    lines.push(`${prefix}    Altitude      : ${meta.altitude_m} m AGL`);
  }
  lines.push(
    `${prefix} ───────────────────────────────────────────────`,
    `${prefix}  SENSOR`,
    `${prefix}    Mode          : ${meta?.scan_mode    ?? mode}`,
    `${prefix}    Sensor type   : ${meta?.sensor       ?? "—"}`,
    `${prefix}    Range         : ${meta?.range_m      != null ? meta.range_m + " m" : "—"}`,
    `${prefix}    Resolution    : ${meta?.resolution_cm != null ? meta.resolution_cm + " cm" : "—"}`,
    `${prefix}    Frequency     : ${meta?.frequency_hz != null ? meta.frequency_hz + " Hz" : "—"}`,
    `${prefix}    FOV           : ${meta?.fov_deg      != null ? meta.fov_deg + "°" : "—"}`,
    `${prefix} ───────────────────────────────────────────────`,
    `${prefix}  RESULTS`,
    `${prefix}    Coverage      : ${meta?.coverage_pct != null ? meta.coverage_pct + "%" : progress.toFixed(1) + "%"}`,
    `${prefix}    Area          : ${meta?.area_km2     != null ? meta.area_km2 + " km²" : "—"}`,
    `${prefix}    Points total  : ${meta?.points_total != null ? meta.points_total.toLocaleString("en") : Math.floor(4000 * progress / 100)}`,
    `${prefix}    Objects found : ${meta?.objects_found != null ? meta.objects_found : "—"}`,
    `${prefix}    Accuracy      : ${meta?.accuracy_m   != null ? "±" + meta.accuracy_m + " m" : "—"}`,
  );
  if (meta?.elevation_min_m != null && meta?.elevation_max_m != null) {
    lines.push(`${prefix}    Elevation     : ${meta.elevation_min_m} – ${meta.elevation_max_m} m`);
  }
  lines.push(
    `${prefix} ═══════════════════════════════════════════════`,
    `${prefix}  Open with: CloudCompare / MeshLab / Blender`,
    `${prefix} ═══════════════════════════════════════════════`,
  );
  return lines;
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Экспорт PLY (ASCII с метаданными + геопривязкой) ─────────────────────────
export function exportPLY(mode: SensorModeId, progress: number, filename: string, meta?: ScanMeta) {
  const { positions, colors, geo, count } = buildPointCloud(mode, progress, meta);
  const hasGeo = meta?.lat != null && meta?.lon != null;

  const comments = metaComments("comment", mode, progress, meta)
    .map(l => l.replace(/^comment\s*/, "comment "));

  const header = [
    "ply",
    "format ascii 1.0",
    ...comments,
    `element vertex ${count}`,
    // Локальные координаты (X=East, Y=Up, Z=North) в метрах
    "property float x",
    "property float y",
    "property float z",
    // RGB цвет
    "property uchar red",
    "property uchar green",
    "property uchar blue",
    // Географические координаты WGS-84
    ...(hasGeo ? [
      "property double longitude",
      "property double latitude",
      "property double altitude",
    ] : []),
    "end_header",
  ];

  const rows: string[] = [];
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r  = Math.round(colors[i3]     * 255);
    const g  = Math.round(colors[i3 + 1] * 255);
    const b  = Math.round(colors[i3 + 2] * 255);
    const xyz    = `${positions[i3].toFixed(4)} ${positions[i3+1].toFixed(4)} ${positions[i3+2].toFixed(4)}`;
    const rgb    = `${r} ${g} ${b}`;
    const geoStr = hasGeo
      ? ` ${geo[i3].toFixed(8)} ${geo[i3+1].toFixed(8)} ${geo[i3+2].toFixed(3)}`
      : "";
    rows.push(`${xyz} ${rgb}${geoStr}`);
  }

  download([...header, ...rows].join("\n"), filename, "text/plain");
}

// ── Экспорт OBJ (с геопривязкой + RGB) ───────────────────────────────────────
export function exportOBJ(mode: SensorModeId, progress: number, filename: string, meta?: ScanMeta) {
  const { positions, colors, geo, count } = buildPointCloud(mode, progress, meta);
  const hasGeo = meta?.lat != null && meta?.lon != null;

  const header = metaComments("#", mode, progress, meta);
  header.push(
    "",
    `# Vertex format: v X Y Z R G B${hasGeo ? "  (+ geo comments below each vertex)" : ""}`,
    `# Vertex count : ${count}`,
    "",
  );

  const rows: string[] = [];
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r  = colors[i3].toFixed(3);
    const g  = colors[i3 + 1].toFixed(3);
    const b  = colors[i3 + 2].toFixed(3);
    // CloudCompare / MeshLab читают "v x y z r g b"
    rows.push(`v ${positions[i3].toFixed(4)} ${positions[i3+1].toFixed(4)} ${positions[i3+2].toFixed(4)} ${r} ${g} ${b}`);
    // Геопривязка как inline-комментарий к каждой вершине
    if (hasGeo) {
      rows.push(`# geo lon=${geo[i3].toFixed(8)} lat=${geo[i3+1].toFixed(8)} alt=${geo[i3+2].toFixed(3)}`);
    }
  }

  download([...header, ...rows].join("\n"), filename, "text/plain");
}

// ── Экспорт GeoJSON (RFC 7946) — QGIS / Google Earth / Leaflet ───────────────
export function exportGeoJSON(mode: SensorModeId, progress: number, filename: string, meta?: ScanMeta) {
  const { colors, geo, count } = buildPointCloud(mode, progress, meta);
  const hasGeo = meta?.lat != null && meta?.lon != null;

  const features = [];
  for (let i = 0; i < count; i++) {
    const i3  = i * 3;
    const lon = hasGeo ? geo[i3]     : 0;
    const lat = hasGeo ? geo[i3 + 1] : 0;
    const alt = hasGeo ? geo[i3 + 2] : 0;
    const r   = Math.round(colors[i3]     * 255);
    const g   = Math.round(colors[i3 + 1] * 255);
    const b   = Math.round(colors[i3 + 2] * 255);

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: hasGeo ? [
          parseFloat(lon.toFixed(8)),
          parseFloat(lat.toFixed(8)),
          parseFloat(alt.toFixed(3)),
        ] : [0, 0, 0],
      },
      properties: {
        r, g, b,
        color: `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`,
        index: i,
      },
    });
  }

  const geojson = {
    type: "FeatureCollection",
    name: meta?.code ?? `solofly_${mode}`,
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    },
    metadata: {
      generated:     new Date().toISOString(),
      source:        "SoloFly Point Cloud Export",
      session_code:  meta?.code          ?? null,
      drone_id:      meta?.drone_id      ?? null,
      drone_name:    meta?.drone_name    ?? null,
      scan_mode:     meta?.scan_mode     ?? mode,
      sensor:        meta?.sensor        ?? null,
      range_m:       meta?.range_m       ?? null,
      resolution_cm: meta?.resolution_cm ?? null,
      frequency_hz:  meta?.frequency_hz  ?? null,
      fov_deg:       meta?.fov_deg       ?? null,
      accuracy_m:    meta?.accuracy_m    ?? null,
      area_km2:      meta?.area_km2      ?? null,
      coverage_pct:  meta?.coverage_pct  ?? progress,
      points_total:  meta?.points_total  ?? count,
      objects_found: meta?.objects_found ?? null,
      started_at:    meta?.started_at    ?? null,
      finished_at:   meta?.finished_at   ?? null,
      georeferenced: hasGeo,
      origin_lat:    meta?.lat           ?? null,
      origin_lon:    meta?.lon           ?? null,
      origin_alt_m:  meta?.altitude_m    ?? null,
    },
    features,
  };

  download(JSON.stringify(geojson, null, 2), filename, "application/geo+json");
}
