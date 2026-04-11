/**
 * ScanModel3D — интерактивная 3D-визуализация результата сканирования.
 * Строит облако точек (LiDAR) / тепловую карту / NDVI / радар через Three.js.
 * Управление: вращение — ЛКМ, масштаб — колесо, панорама — ПКМ.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SensorModeId } from "./scanningTypes";

interface ScanModel3DProps {
  mode: SensorModeId;
  progress?: number; // 0-100, сколько точек показывать
  height?: number;
}

// ── Генерация облака точек для каждого режима ─────────────────────────────────

function buildPointCloud(
  mode: SensorModeId,
  progress: number
): { positions: Float32Array; colors: Float32Array; count: number } {
  const total = Math.floor(4000 * (progress / 100));

  const positions = new Float32Array(total * 3);
  const colors    = new Float32Array(total * 3);

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
  }

  return { positions, colors, count: total };
}

export default function ScanModel3D({ mode, progress = 100, height = 360 }: ScanModel3DProps) {
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
    const { positions, colors, count } = buildPointCloud(mode, progress);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size:         0.08,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });
    const points = new THREE.Points(geo, mat);
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
  }, [mode, progress, height]);

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" />
      {/* Подсказка управления */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 pointer-events-none">
        <span className="tag tag-muted" style={{ fontSize: 9 }}>ЛКМ — вращение</span>
        <span className="tag tag-muted" style={{ fontSize: 9 }}>ПКМ — панорама</span>
        <span className="tag tag-muted" style={{ fontSize: 9 }}>Колесо — масштаб</span>
      </div>
      {/* Кол-во точек */}
      <div className="absolute top-3 right-3 pointer-events-none">
        <span className="tag tag-electric" style={{ fontSize: 9 }}>
          {Math.floor(4000 * progress / 100).toLocaleString("ru-RU")} точек
        </span>
      </div>
    </div>
  );
}
