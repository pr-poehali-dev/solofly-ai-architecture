// Three.js canvas — рендер облака точек, управление камерой мышью
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { SensorModeId } from "./scanningTypes";
import type { ScanMeta } from "./scanPointCloud";
import { buildPointCloud } from "./scanPointCloud";

interface ScanViewportProps {
  mode:     SensorModeId;
  progress: number;
  height:   number;
  meta?:    ScanMeta;
}

export default function ScanViewport({ mode, progress, height, meta }: ScanViewportProps) {
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
      size:            0.08,
      vertexColors:    true,
      sizeAttenuation: true,
      transparent:     true,
      opacity:         0.9,
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
      isRight.current    = e.button === 2;
      lastMouse.current  = { x: e.clientX, y: e.clientY };
      autoRotate         = false;
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
        rotation.current.x  = Math.max(-1.4, Math.min(1.4, rotation.current.x - dy));
      }
      updateCamera();
    };
    const onUp      = () => { isDragging.current = false; };
    const onWheel   = (e: WheelEvent) => {
      e.preventDefault();
      camDist.current = Math.max(2, Math.min(20, camDist.current + e.deltaY * 0.01));
      autoRotate      = false;
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

  return <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden" />;
}
