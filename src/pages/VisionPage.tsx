import { useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

type DetectionStatus = "idle" | "loading_model" | "processing" | "done" | "error";

interface Detection {
  label: string;
  score: number;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
}

const LABEL_COLORS: Record<string, string> = {
  person:       "#ff4757", cat:     "#2ed573", dog:       "#1e90ff",
  car:          "#ffa502", truck:   "#ff6b81", bus:       "#ff6348",
  bicycle:      "#eccc68", bird:    "#a29bfe", horse:     "#fd79a8",
  airplane:     "#00cec9", boat:    "#e17055", train:     "#6c5ce7",
  cow:          "#00b894", sheep:   "#fdcb6e", bear:      "#e84393",
  bottle:       "#74b9ff", chair:   "#55efc4", laptop:    "#0984e3",
  phone:        "#6c5ce7", book:    "#a29bfe", umbrella:  "#fd79a8",
  default:      "#00d4ff",
};

function getColor(label: string) {
  const base = label.toLowerCase().replace(/ /g, "_");
  return LABEL_COLORS[base] ?? LABEL_COLORS.default;
}

function drawDetections(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  detections: Detection[]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  for (const d of detections) {
    const { xmin, ymin, xmax, ymax } = d.box;
    const w = xmax - xmin;
    const h = ymax - ymin;
    const color = getColor(d.label);
    const label = `${d.label} ${Math.round(d.score * 100)}%`;

    // Box
    ctx.strokeStyle = color;
    ctx.lineWidth   = 3;
    ctx.strokeRect(xmin, ymin, w, h);

    // Fill corner accents
    const cs = 12;
    ctx.fillStyle = color;
    [[xmin, ymin, cs, 3], [xmin, ymin, 3, cs],
     [xmax - cs, ymin, cs, 3], [xmax - 3, ymin, 3, cs],
     [xmin, ymax - 3, cs, 3], [xmin, ymax - cs, 3, cs],
     [xmax - cs, ymax - 3, cs, 3], [xmax - 3, ymax - cs, 3, cs]]
      .forEach(([x, y, bw, bh]) => ctx.fillRect(x, y, bw, bh));

    // Label background
    ctx.font = "bold 13px monospace";
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = color + "dd";
    ctx.fillRect(xmin, ymin - 22, tw + 10, 22);

    // Label text
    ctx.fillStyle = "#000";
    ctx.fillText(label, xmin + 5, ymin - 6);
  }
}

const EXAMPLE_IMAGES = [
  { label: "Улица", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png" },
  { label: "Аэропорт", url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=640&q=80" },
  { label: "Трасса", url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=640&q=80" },
  { label: "Стройка", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&q=80" },
];

export default function VisionPage() {
  const fileRef     = useRef<HTMLInputElement>(null);
  const imgRef      = useRef<HTMLImageElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);

  const [status,      setStatus]      = useState<DetectionStatus>("idle");
  const [detections,  setDetections]  = useState<Detection[]>([]);
  const [imgSrc,      setImgSrc]      = useState<string | null>(null);
  const [errorMsg,    setErrorMsg]    = useState<string>("");
  const [modelReady,  setModelReady]  = useState(false);
  const [loadPct,     setLoadPct]     = useState(0);

  const pipelineRef = useRef<((img: string) => Promise<Detection[]>) | null>(null);

  const loadModel = useCallback(async () => {
    if (pipelineRef.current) return true;
    setStatus("loading_model");
    setLoadPct(0);
    try {
      // Динамический импорт через ESM CDN — без установки пакетов
      const { pipeline, env } = await import(
        /* @vite-ignore */
        "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3/dist/transformers.min.js"
      );
      env.allowLocalModels = false;

      // Прогресс загрузки модели
      const detector = await pipeline(
        "object-detection",
        "Xenova/detr-resnet-50",
        {
          progress_callback: (p: { progress?: number; status?: string }) => {
            if (p.progress !== undefined) setLoadPct(Math.round(p.progress));
          },
        }
      );

      pipelineRef.current = async (imageUrl: string) => {
        const result = await detector(imageUrl, { threshold: 0.4 });
        return result as Detection[];
      };

      setModelReady(true);
      return true;
    } catch (e) {
      setErrorMsg("Не удалось загрузить модель. Проверьте интернет-соединение.");
      setStatus("error");
      return false;
    }
  }, []);

  const runDetection = useCallback(async (src: string) => {
    setDetections([]);
    setStatus("loading_model");
    const ok = await loadModel();
    if (!ok) return;

    setStatus("processing");
    try {
      const results = await pipelineRef.current!(src);
      setDetections(results);
      setStatus("done");

      // Рисуем рамки после рендера изображения
      requestAnimationFrame(() => {
        if (imgRef.current && canvasRef.current) {
          const img = imgRef.current;
          if (img.complete) {
            drawDetections(canvasRef.current, img, results);
          } else {
            img.onload = () => drawDetections(canvasRef.current!, img, results);
          }
        }
      });
    } catch {
      setErrorMsg("Ошибка при обработке изображения.");
      setStatus("error");
    }
  }, [loadModel]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImgSrc(src);
      runDetection(src);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const handleExample = (url: string) => {
    setImgSrc(url);
    runDetection(url);
  };

  const reset = () => {
    setImgSrc(null);
    setDetections([]);
    setStatus("idle");
    setErrorMsg("");
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const grouped = detections.reduce<Record<string, number>>((acc, d) => {
    acc[d.label] = (acc[d.label] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-5 fade-up max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Icon name="ScanSearch" size={20} style={{ color: "var(--electric)" }} />
            Компьютерное зрение
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Реальная детекция объектов · Модель DETR (Facebook/HuggingFace) · Работает в браузере
          </p>
        </div>
        {imgSrc && (
          <button onClick={reset} className="btn-ghost px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="RefreshCw" size={13} />
            Сбросить
          </button>
        )}
      </div>

      {/* Model status */}
      <div className="flex items-center gap-3 p-3 rounded-xl text-xs"
        style={{
          background: modelReady ? "rgba(0,255,136,0.06)" : "rgba(0,212,255,0.06)",
          border: `1px solid ${modelReady ? "rgba(0,255,136,0.2)" : "rgba(0,212,255,0.15)"}`,
        }}>
        <div className={modelReady ? "dot-online" : "dot-warning"} />
        <span style={{ color: modelReady ? "var(--signal-green)" : "var(--electric)" }}>
          {modelReady
            ? "Модель DETR-ResNet50 загружена и готова"
            : "Модель загрузится при первом запуске (~40 МБ)"}
        </span>
        <span className="ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
          DETR · ResNet-50 · 91 класс COCO
        </span>
      </div>

      {/* Upload zone */}
      {!imgSrc && (
        <div
          className="rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all hover:scale-[1.01]"
          style={{ borderColor: "rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.03)" }}
          onClick={() => fileRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}>
            <Icon name="Upload" size={28} style={{ color: "var(--electric)" }} />
          </div>
          <div className="font-bold text-base mb-1">Загрузите изображение</div>
          <div className="text-sm text-muted-foreground mb-2">
            Перетащите файл или нажмите для выбора
          </div>
          <div className="text-xs text-muted-foreground opacity-60">
            JPG, PNG, WebP · до 10 МБ
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* Example images */}
      {!imgSrc && (
        <div>
          <div className="hud-label mb-3" style={{ fontSize: 9 }}>ИЛИ ПОПРОБУЙТЕ ПРИМЕР</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXAMPLE_IMAGES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => handleExample(ex.url)}
                className="rounded-xl overflow-hidden text-left transition-all hover:scale-[1.03]"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <img
                  src={ex.url}
                  alt={ex.label}
                  className="w-full object-cover"
                  style={{ height: 80 }}
                />
                <div className="px-3 py-2 text-xs font-semibold"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  {ex.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Processing state */}
      {imgSrc && (status === "loading_model" || status === "processing") && (
        <div className="rounded-2xl p-8 text-center"
          style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.12)" }}>
            <Icon name="Brain" size={22} style={{ color: "var(--electric)", animation: "pulse 1s infinite" }} />
          </div>
          <div className="font-bold mb-2">
            {status === "loading_model" ? "Загрузка модели DETR..." : "Обнаружение объектов..."}
          </div>
          {status === "loading_model" && loadPct > 0 && (
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Загрузка весов модели</span>
                <span>{loadPct}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${loadPct}%`,
                    background: "linear-gradient(90deg, var(--electric), var(--signal-green))",
                  }} />
              </div>
            </div>
          )}
          {status === "processing" && (
            <div className="text-sm text-muted-foreground">
              Анализ изображения нейросетью...
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="rounded-xl p-5 flex items-start gap-3"
          style={{ background: "rgba(255,59,48,0.08)", border: "1px solid rgba(255,59,48,0.25)" }}>
          <Icon name="AlertTriangle" size={18} style={{ color: "var(--danger)", flexShrink: 0 }} />
          <div>
            <div className="font-semibold text-sm mb-0.5">Ошибка</div>
            <div className="text-xs text-muted-foreground">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Result */}
      {imgSrc && status === "done" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Canvas with boxes */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl overflow-hidden relative"
              style={{ border: "1px solid rgba(0,212,255,0.2)" }}>
              {/* Hidden img for CORS loading */}
              <img
                ref={imgRef}
                src={imgSrc}
                alt="source"
                crossOrigin="anonymous"
                style={{ display: "none" }}
              />
              <canvas
                ref={canvasRef}
                className="w-full"
                style={{ display: "block", maxHeight: 500, objectFit: "contain" }}
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: "rgba(0,0,0,0.7)", color: "var(--signal-green)", backdropFilter: "blur(8px)" }}>
                  ✓ {detections.length} объектов найдено
                </span>
              </div>
            </div>
          </div>

          {/* Detections list */}
          <div className="space-y-3">
            <div className="hud-label" style={{ fontSize: 9 }}>ОБНАРУЖЕННЫЕ ОБЪЕКТЫ</div>

            {/* Summary by class */}
            <div className="space-y-2">
              {Object.entries(grouped)
                .sort((a, b) => b[1] - a[1])
                .map(([label, count]) => {
                  const color = getColor(label);
                  const maxScore = Math.max(
                    ...detections.filter(d => d.label === label).map(d => d.score)
                  );
                  return (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm capitalize">{label}</div>
                        <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          макс. уверенность {Math.round(maxScore * 100)}%
                        </div>
                      </div>
                      <div className="text-xl font-black" style={{ color }}>×{count}</div>
                    </div>
                  );
                })}
            </div>

            {/* Raw detections */}
            <div className="hud-label mt-4 mb-2" style={{ fontSize: 9 }}>ВСЕ ДЕТЕКЦИИ</div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {detections
                .sort((a, b) => b.score - a.score)
                .map((d, i) => {
                  const color = getColor(d.label);
                  return (
                    <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-xs capitalize flex-1">{d.label}</span>
                      <div className="w-16 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${d.score * 100}%`, background: color }} />
                      </div>
                      <span className="text-xs font-mono w-8 text-right"
                        style={{ color }}>
                        {Math.round(d.score * 100)}%
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Try another */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-2 transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "var(--electric)",
              }}
            >
              <Icon name="Upload" size={14} />
              Загрузить другое фото
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) { reset(); setTimeout(() => handleFile(f), 50); }
              }}
            />
          </div>
        </div>
      )}

      {/* Info footer */}
      <div className="rounded-xl p-4 flex items-start gap-3 text-xs"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <Icon name="Info" size={14} style={{ color: "var(--electric)", flexShrink: 0, marginTop: 1 }} />
        <div style={{ color: "hsl(var(--muted-foreground))" }}>
          <strong style={{ color: "hsl(var(--foreground))" }}>Как это работает:</strong>{" "}
          Модель DETR (Detection Transformer) от Facebook Research загружается прямо в браузер через HuggingFace.
          Обработка происходит локально — изображение не передаётся на сервер. Распознаёт 91 класс объектов COCO:
          люди, транспорт, животные, мебель, техника и другие.
        </div>
      </div>
    </div>
  );
}
