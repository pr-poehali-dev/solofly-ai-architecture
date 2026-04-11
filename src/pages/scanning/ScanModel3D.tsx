/**
 * ScanModel3D — интерактивная 3D-визуализация результата сканирования.
 * Строит облако точек (LiDAR) / тепловую карту / NDVI / радар через Three.js.
 * Управление: вращение — ЛКМ, масштаб — колесо, панорама — ПКМ.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SensorModeId } from "./scanningTypes";

// Метаданные сессии сканирования для вшивания в экспорт
export interface ScanMeta {
  code?:           string;   // SCN-0042
  drone_id?:       string;   // SF-001
  drone_name?:     string;   // Орёл-1
  scan_mode?:      string;   // lidar_terrain
  sensor?:         string;   // LiDAR
  range_m?:        number;   // 500
  resolution_cm?:  number;   // 2
  frequency_hz?:   number;   // 20
  fov_deg?:        number;   // 120
  accuracy_m?:     number;   // 0.02
  area_km2?:       number;   // 12.5
  points_total?:   number;   // 1875000
  objects_found?:  number;
  coverage_pct?:   number;
  lat?:            number;   // координата дрона
  lon?:            number;
  altitude_m?:     number;
  started_at?:     string;
  finished_at?:    string;
  elevation_min_m?: number;
  elevation_max_m?: number;
}

interface ScanModel3DProps {
  mode:      SensorModeId;
  progress?: number;   // 0-100
  height?:   number;
  meta?:     ScanMeta; // реальные метаданные сессии
}

// ── Генерация облака точек для каждого режима ─────────────────────────────────

// ── Гео-конвертация ───────────────────────────────────────────────────────────
// scale: сколько метров в одной единице локальной системы координат
const LOCAL_SCALE_M = 20; // 1 unit = 20 м → диапазон -5..5 unit = 100×100 м

/** Локальные (dx, dz) в метрах → (lat, lon) */
function localToGeo(
  dxMeters: number,
  dzMeters: number,
  baseLat: number,
  baseLon: number
): { lat: number; lon: number } {
  const R = 6378137; // радиус Земли, м
  const dLat = dzMeters / R;
  const dLon = dxMeters / (R * Math.cos((baseLat * Math.PI) / 180));
  return {
    lat: baseLat + (dLat * 180) / Math.PI,
    lon: baseLon + (dLon * 180) / Math.PI,
  };
}

function buildPointCloud(
  mode: SensorModeId,
  progress: number,
  meta?: ScanMeta
): { positions: Float32Array; colors: Float32Array; geo: Float64Array; count: number } {
  const total = Math.floor(4000 * (progress / 100));

  const positions = new Float32Array(total * 3);
  const colors    = new Float32Array(total * 3);
  // geo[i*3+0] = longitude, geo[i*3+1] = latitude, geo[i*3+2] = altitude_m
  const geo       = new Float64Array(total * 3);

  const baseLat = meta?.lat       ?? 55.751244;
  const baseLon = meta?.lon       ?? 37.618423;
  const baseAlt = meta?.altitude_m ?? 0;

  const rng = (a: number, b: number) => a + Math.random() * (b - a);

  for (let i = 0; i < total; i++) {
    const i3 = i * 3;

    if (mode === "lidar_terrain") {
      // Рельеф: холмистая поверхность
      const x = rng(-5, 5);
      const z = rng(-5, 5);
      const y = Math.sin(x * 0.7) * Math.cos(z * 0.5) * 1.5
               + Math.sin(x * 1.3 + z * 0.9) * 0.6
               + rng(-0.05, 0.05);
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Цвет по высоте: синий (низко) → зелёный → белый (высоко)
      const t = (y + 2) / 4;
      colors[i3]     = t > 0.7 ? 1 : t * 0.3;
      colors[i3 + 1] = 0.3 + t * 0.5;
      colors[i3 + 2] = t < 0.4 ? 1 - t * 1.5 : 0.1;

    } else if (mode === "lidar_objects") {
      // Объекты: несколько кластеров (здания, машины)
      const cluster = Math.floor(rng(0, 5));
      const cx = [-3, -1, 1.5, 3, -2][cluster];
      const cz = [-2, 2, -3, 1, 0][cluster];
      const h  = [2, 0.8, 3, 1.2, 1.6][cluster];
      const x = cx + rng(-0.4, 0.4);
      const z = cz + rng(-0.4, 0.4);
      const y = rng(0, h);
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Цвет по кластеру
      const hues = [[0,0.8,1],[1,0.5,0],[0.5,1,0.5],[1,1,0],[0.8,0,1]];
      const c = hues[cluster];
      colors[i3] = c[0]; colors[i3+1] = c[1]; colors[i3+2] = c[2];

    } else if (mode === "thermal") {
      // Тепловая карта: плоскость с цветом по температуре
      const x = rng(-5, 5);
      const z = rng(-5, 5);
      // Горячие пятна
      const d1 = Math.sqrt((x - 1) ** 2 + (z + 1) ** 2);
      const d2 = Math.sqrt((x + 2) ** 2 + (z - 2) ** 2);
      const temp = Math.max(0, 1 - d1 * 0.35) + Math.max(0, 0.7 - d2 * 0.4);
      const y = temp * 0.3 + rng(-0.02, 0.02);
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Холодный синий → тёплый жёлтый → горячий красный
      const t = Math.min(1, temp);
      colors[i3]     = t;
      colors[i3 + 1] = Math.max(0, 0.5 - Math.abs(t - 0.5));
      colors[i3 + 2] = 1 - t;

    } else if (mode === "multispectral") {
      // NDVI: плоскость с зонами растительности
      const x = rng(-5, 5);
      const z = rng(-5, 5);
      const ndvi = Math.sin(x * 0.8) * 0.4 + Math.cos(z * 0.6) * 0.4 + 0.3 + rng(-0.1, 0.1);
      const y = ndvi * 0.2;
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Красный (стресс) → жёлтый → зелёный (здоровая растительность)
      const t = Math.min(1, Math.max(0, ndvi));
      colors[i3]     = t < 0.5 ? 1 : 2 * (1 - t);
      colors[i3 + 1] = t < 0.5 ? 2 * t : 1;
      colors[i3 + 2] = 0.1;

    } else if (mode === "radar_long" || mode === "sar") {
      // Радар/SAR: веер с отражениями
      const angle = rng(0, Math.PI);
      const r     = rng(1, 5);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r * 0.6;
      const intensity = rng(0, 1) < 0.05 ? rng(0.8, 1) : rng(0, 0.3); // редкие яркие цели
      const y = intensity * 0.5;
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      // Пурпурный → белый для интенсивных целей
      colors[i3]     = 0.6 + intensity * 0.4;
      colors[i3 + 1] = intensity;
      colors[i3 + 2] = 1;
    }

    // Геопривязка: пересчёт локальных координат в реальные WGS-84
    {
      const dxM = positions[i3]     * LOCAL_SCALE_M;
      const dzM = positions[i3 + 2] * LOCAL_SCALE_M;
      const dyM = positions[i3 + 1] * LOCAL_SCALE_M; // высота относительно дрона
      const { lat, lon } = localToGeo(dxM, dzM, baseLat, baseLon);
      geo[i3]     = lon;
      geo[i3 + 1] = lat;
      geo[i3 + 2] = baseAlt + dyM;
    }
  }

  return { positions, colors, geo, count: total };
}

// ── Формирует блок метаданных для заголовков файлов ──────────────────────────
function metaComments(prefix: string, mode: SensorModeId, progress: number, meta?: ScanMeta): string[] {
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

// ── Экспорт PLY (ASCII с метаданными + геопривязкой) ─────────────────────────
function exportPLY(mode: SensorModeId, progress: number, filename: string, meta?: ScanMeta) {
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
    const xyz = `${positions[i3].toFixed(4)} ${positions[i3+1].toFixed(4)} ${positions[i3+2].toFixed(4)}`;
    const rgb = `${r} ${g} ${b}`;
    const geoStr = hasGeo
      ? ` ${geo[i3].toFixed(8)} ${geo[i3+1].toFixed(8)} ${geo[i3+2].toFixed(3)}`
      : "";
    rows.push(`${xyz} ${rgb}${geoStr}`);
  }

  download([...header, ...rows].join("\n"), filename, "text/plain");
}

// ── Экспорт OBJ (с геопривязкой + RGB) ───────────────────────────────────────
function exportOBJ(mode: SensorModeId, progress: number, filename: string, meta?: ScanMeta) {
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
    const i3  = i * 3;
    const r   = colors[i3].toFixed(3);
    const g   = colors[i3 + 1].toFixed(3);
    const b   = colors[i3 + 2].toFixed(3);
    // CloudCompare / MeshLab читают "v x y z r g b"
    rows.push(`v ${positions[i3].toFixed(4)} ${positions[i3+1].toFixed(4)} ${positions[i3+2].toFixed(4)} ${r} ${g} ${b}`);
    // Геопривязка как inline-комментарий к каждой вершине
    if (hasGeo) {
      rows.push(`# geo lon=${geo[i3].toFixed(8)} lat=${geo[i3+1].toFixed(8)} alt=${geo[i3+2].toFixed(3)}`);
    }
  }

  download([...header, ...rows].join("\n"), filename, "text/plain");
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

// ── Экспорт GeoJSON (RFC 7946) — QGIS / Google Earth / Leaflet ───────────────
function exportGeoJSON(mode: SensorModeId, progress: number, filename: string, meta?: ScanMeta) {
  const { colors, geo, count } = buildPointCloud(mode, progress, meta);
  const hasGeo = meta?.lat != null && meta?.lon != null;

  const features = [];
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
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
      generated:    new Date().toISOString(),
      source:       "SoloFly Point Cloud Export",
      session_code: meta?.code         ?? null,
      drone_id:     meta?.drone_id     ?? null,
      drone_name:   meta?.drone_name   ?? null,
      scan_mode:    meta?.scan_mode    ?? mode,
      sensor:       meta?.sensor       ?? null,
      range_m:      meta?.range_m      ?? null,
      resolution_cm:meta?.resolution_cm ?? null,
      frequency_hz: meta?.frequency_hz ?? null,
      fov_deg:      meta?.fov_deg      ?? null,
      accuracy_m:   meta?.accuracy_m   ?? null,
      area_km2:     meta?.area_km2     ?? null,
      coverage_pct: meta?.coverage_pct ?? progress,
      points_total: meta?.points_total ?? count,
      objects_found:meta?.objects_found ?? null,
      started_at:   meta?.started_at   ?? null,
      finished_at:  meta?.finished_at  ?? null,
      georeferenced: hasGeo,
      origin_lat:   meta?.lat          ?? null,
      origin_lon:   meta?.lon          ?? null,
      origin_alt_m: meta?.altitude_m   ?? null,
    },
    features,
  };

  download(JSON.stringify(geojson, null, 2), filename, "application/geo+json");
}

export default function ScanModel3D({ mode, progress = 100, height = 360, meta }: ScanModel3DProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const frameRef   = useRef<number>(0);
  const isDragging = useRef(false);
  const isRight    = useRef(false);
  const lastMouse  = useRef({ x: 0, y: 0 });
  const rotation   = useRef({ x: 0.4, y: 0 });
  const pan        = useRef({ x: 0, y: 0 });
  const camDist    = useRef(9);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Scene ──
    const scene    = new THREE.Scene();
    scene.background = new THREE.Color(0x05090e);
    scene.fog        = new THREE.FogExp2(0x05090e, 0.04);

    // ── Camera ──
    const W = el.offsetWidth || 600;
    const H = height;
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 4, camDist.current);
    camera.lookAt(0, 0, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // ── Сетка-подложка ──
    const grid = new THREE.GridHelper(12, 24, 0x1a2a3a, 0x0d1a27);
    scene.add(grid);

    // ── Оси ──
    const axesMat = (color: number) =>
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 });
    const addAxis = (dir: THREE.Vector3, color: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), dir]);
      scene.add(new THREE.Line(geo, axesMat(color)));
    };
    addAxis(new THREE.Vector3(3, 0, 0), 0xff4444);
    addAxis(new THREE.Vector3(0, 3, 0), 0x44ff88);
    addAxis(new THREE.Vector3(0, 0, 3), 0x4488ff);

    // ── Облако точек ──
    const { positions, colors } = buildPointCloud(mode, progress, meta);
    const bufGeo = new THREE.BufferGeometry();
    bufGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    bufGeo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size:         0.08,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(bufGeo, mat);
    scene.add(points);

    // ── Лёгкое вращение для режима LiDAR ──
    let autoRotate = true;

    // ── Helpers для управления камерой ──
    const updateCamera = () => {
      const r  = camDist.current;
      const rx = rotation.current.x;
      const ry = rotation.current.y;
      camera.position.x = r * Math.sin(ry) * Math.cos(rx) + pan.current.x;
      camera.position.y = r * Math.sin(rx) + pan.current.y;
      camera.position.z = r * Math.cos(ry) * Math.cos(rx);
      camera.lookAt(pan.current.x, pan.current.y, 0);
    };

    // ── Mouse handlers ──
    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      isRight.current = e.button === 2;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      autoRotate = false;
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - lastMouse.current.x) * 0.005;
      const dy = (e.clientY - lastMouse.current.y) * 0.005;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      if (isRight.current) {
        pan.current.x -= dx * camDist.current * 0.2;
        pan.current.y += dy * camDist.current * 0.2;
      } else {
        rotation.current.y += dx;
        rotation.current.x = Math.max(-1.4, Math.min(1.4, rotation.current.x - dy));
      }
      updateCamera();
    };
    const onUp = () => { isDragging.current = false; };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist.current = Math.max(2, Math.min(20, camDist.current + e.deltaY * 0.01));
      autoRotate = false;
      updateCamera();
    };
    const onContext = (e: Event) => e.preventDefault();

    el.addEventListener("mousedown",   onDown);
    el.addEventListener("mousemove",   onMove);
    el.addEventListener("mouseup",     onUp);
    el.addEventListener("mouseleave",  onUp);
    el.addEventListener("wheel",       onWheel, { passive: false });
    el.addEventListener("contextmenu", onContext);

    // ── Resize ──
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    // ── Render loop ──
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (autoRotate) {
        rotation.current.y += 0.003;
        updateCamera();
      }
      renderer.render(scene, camera);
    };
    updateCamera();
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      el.removeEventListener("mousedown",   onDown);
      el.removeEventListener("mousemove",   onMove);
      el.removeEventListener("mouseup",     onUp);
      el.removeEventListener("mouseleave",  onUp);
      el.removeEventListener("wheel",       onWheel);
      el.removeEventListener("contextmenu", onContext);
      ro.disconnect();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [mode, progress, height, meta]);

  const stamp    = () => new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  const baseName = `solofly_${mode}_${stamp()}`;

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" />

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