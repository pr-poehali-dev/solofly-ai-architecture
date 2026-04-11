import { useEffect, useRef } from "react";

// Фиксированные координаты — не пересчитываются при каждом рендере
const PARTICLES = [
  { id:0,  x:8,  y:12, size:1.2, dur:8,  delay:0   },
  { id:1,  x:23, y:45, size:0.8, dur:11, delay:1.5 },
  { id:2,  x:41, y:78, size:1.5, dur:9,  delay:3   },
  { id:3,  x:57, y:22, size:0.9, dur:13, delay:0.7 },
  { id:4,  x:72, y:61, size:1.1, dur:10, delay:2.2 },
  { id:5,  x:88, y:35, size:1.4, dur:7,  delay:4   },
  { id:6,  x:15, y:88, size:0.7, dur:12, delay:1   },
  { id:7,  x:33, y:5,  size:1.3, dur:8,  delay:3.5 },
  { id:8,  x:50, y:50, size:1.0, dur:9,  delay:0.3 },
  { id:9,  x:65, y:90, size:0.8, dur:11, delay:2   },
  { id:10, x:80, y:15, size:1.2, dur:10, delay:4.5 },
  { id:11, x:95, y:70, size:0.9, dur:13, delay:1.8 },
];

// Определяем мобильное устройство один раз
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const sizeRef   = useRef({ W: 0, H: 0 });

  // requestAnimationFrame с throttle до ~24fps; на мобильных canvas не рисуем
  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
      sizeRef.current = { W, H };
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(canvas);

    const TARGET_FPS   = 24;
    const FRAME_BUDGET = 1000 / TARGET_FPS;
    let lastTime       = 0;

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (now - lastTime < FRAME_BUDGET) return;
      lastTime = now;

      const { W, H } = sizeRef.current;
      if (!W || !H) return;

      ctx.clearRect(0, 0, W, H);
      const t = now / 1000;

      const nodes = [
        { x: W * 0.12, y: H * 0.25 },
        { x: W * 0.30, y: H * 0.65 },
        { x: W * 0.52, y: H * 0.20 },
        { x: W * 0.72, y: H * 0.72 },
        { x: W * 0.88, y: H * 0.40 },
        { x: W * 0.48 + Math.sin(t * 0.4) * 55, y: H * 0.50 + Math.cos(t * 0.3) * 38 },
        { x: W * 0.22 + Math.cos(t * 0.5) * 35, y: H * 0.78 + Math.sin(t * 0.4) * 25 },
        { x: W * 0.65 + Math.sin(t * 0.35) * 40, y: H * 0.30 + Math.cos(t * 0.45) * 30 },
      ];

      const DIST_SQ = 300 * 300;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dSq = dx * dx + dy * dy;
          if (dSq < DIST_SQ) {
            const alpha = (1 - dSq / DIST_SQ) * 0.14;
            ctx.strokeStyle = `rgba(0,212,255,${alpha.toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = "rgba(0,212,255,0.45)";
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 70% at 50% -5%, rgba(0,212,255,0.09) 0%, transparent 65%)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 50% 50% at 85% 85%, rgba(0,255,136,0.05) 0%, transparent 60%)",
      }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.035 }}>
        <defs>
          <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(0,212,255,1)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.7 }}
      />
      {PARTICLES.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: "rgba(0,212,255,0.55)",
          animation: `floatParticle ${p.dur}s ${p.delay}s infinite ease-in-out alternate`,
        }} />
      ))}
      <div className="scan-line" style={{ top: 0 }} />
    </div>
  );
}
