import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { MODE_LABEL, fmtDate, fmtDur, fmtNum, type ScanResultJson } from "./archiveTypes";
import ScanModel3D, { type ScanMeta } from "@/pages/scanning/ScanModel3D";
import type { SensorModeId } from "@/pages/scanning/scanningTypes";

interface FileViewerProps {
  url: string;
  onClose: () => void;
}

export default function FileViewer({ url, onClose }: FileViewerProps) {
  const [data, setData] = useState<ScanResultJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"model" | "summary" | "log" | "raw">("model");

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,9,14,0.85)" }}>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden panel"
        style={{ border: "1px solid rgba(0,212,255,0.2)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2">
            <Icon name="FileJson" fallback="File" size={16} style={{ color: "var(--electric)" }} />
            <span className="font-semibold text-sm">Просмотр результата скана</span>
            {data && <span className="hud-label">{data.session.code}</span>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center p-12 text-muted-foreground text-sm animate-pulse">
            Загрузка из облака…
          </div>
        )}
        {error && (
          <div className="flex-1 flex items-center justify-center p-12 text-sm" style={{ color: "var(--danger)" }}>
            Ошибка загрузки: {error}
          </div>
        )}
        {data && (
          <>
            {/* Tabs */}
            <div className="flex shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              {(["model", "summary", "log", "raw"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2.5 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                  style={tab === t
                    ? { color: "var(--electric)", borderBottom: "2px solid var(--electric)" }
                    : { color: "hsl(var(--muted-foreground))" }
                  }>
                  {t === "model" && <Icon name="Box" size={11} />}
                  {t === "model" ? "3D Модель" : t === "summary" ? "Итоги" : t === "log" ? `Лог (${data.log?.length ?? 0})` : "JSON"}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* 3D Модель */}
              {tab === "model" && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="Box" size={14} style={{ color: "var(--electric)" }} />
                    <span className="font-semibold text-sm">3D-модель облака точек</span>
                    <span className="tag tag-green ml-1">
                      {MODE_LABEL[data.session.scan_mode] ?? data.session.scan_mode}
                    </span>
                  </div>
                  <ScanModel3D
                    mode={(data.session.scan_mode as SensorModeId) ?? "lidar_terrain"}
                    progress={data.results.coverage_pct ?? 100}
                    height={380}
                    meta={{
                      code:           data.session.code,
                      drone_id:       data.session.drone_id,
                      drone_name:     data.session.drone_name,
                      scan_mode:      data.session.scan_mode,
                      sensor:         data.session.sensor,
                      range_m:        data.session.range_m,
                      resolution_cm:  data.session.resolution_cm,
                      frequency_hz:   data.session.frequency_hz,
                      fov_deg:        data.session.fov_deg,
                      accuracy_m:     data.results.accuracy_m,
                      area_km2:       data.results.area_km2,
                      points_total:   data.results.points_total,
                      objects_found:  data.results.objects_found,
                      coverage_pct:   data.results.coverage_pct,
                      started_at:     data.results.started_at,
                      finished_at:    data.results.finished_at,
                    } satisfies ScanMeta}
                  />
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { label: "Точек в модели", val: Math.floor(4000 * (data.results.coverage_pct ?? 100) / 100).toLocaleString("ru-RU"), color: "var(--electric)" },
                      { label: "Площадь",        val: `${data.results.area_km2} км²`,      color: "var(--signal-green)" },
                      { label: "Точность",       val: data.results.accuracy_m ? `±${data.results.accuracy_m} м` : "—", color: "var(--electric)" },
                    ].map(i => (
                      <div key={i.label} className="p-2.5 rounded-lg text-center" style={{ background: "hsl(var(--input))" }}>
                        <div className="hud-label mb-0.5">{i.label}</div>
                        <div className="font-bold text-sm" style={{ color: i.color }}>{i.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === "summary" && (
                <div className="p-5">
                <div className="space-y-4 p-0">
                  {/* Сенсор */}
                  <div>
                    <div className="hud-label mb-2">Сенсор</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Режим",     val: MODE_LABEL[data.session.scan_mode] ?? data.session.scan_mode },
                        { label: "Сенсор",    val: data.session.sensor },
                        { label: "Дальность", val: data.session.range_m >= 1000 ? `${data.session.range_m / 1000} км` : `${data.session.range_m} м` },
                        { label: "Разрешение",val: `${data.session.resolution_cm} см` },
                        { label: "Частота",   val: `${data.session.frequency_hz} Гц` },
                        { label: "Угол FOV",  val: `${data.session.fov_deg}°` },
                      ].map(i => (
                        <div key={i.label} className="p-2.5 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                          <div className="hud-label mb-0.5">{i.label}</div>
                          <div className="hud-value text-xs">{i.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Результаты */}
                  <div>
                    <div className="hud-label mb-2">Результаты</div>
                    <div className="space-y-2">
                      {[
                        { icon: "CheckCircle", label: "Покрытие",       val: `${data.results.coverage_pct}%`,         color: data.results.coverage_pct === 100 ? "var(--signal-green)" : "var(--warning)" },
                        { icon: "MapPin",      label: "Площадь",        val: `${data.results.area_km2} км²`,          color: "var(--electric)" },
                        { icon: "Layers3",     label: "Точек собрано",  val: fmtNum(data.results.points_total),       color: "var(--signal-green)" },
                        { icon: "Target",      label: "Объектов",       val: fmtNum(data.results.objects_found),      color: "#a78bfa" },
                        { icon: "Crosshair",   label: "Точность",       val: data.results.accuracy_m ? `±${data.results.accuracy_m} м` : "—", color: "var(--electric)" },
                        { icon: "Clock",       label: "Длительность",   val: fmtDur(data.results.started_at, data.results.finished_at), color: "var(--electric)" },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between py-1.5 border-b last:border-0"
                          style={{ borderColor: "hsl(var(--border))" }}>
                          <div className="flex items-center gap-2">
                            <Icon name={r.icon} fallback="Circle" size={12} style={{ color: r.color }} />
                            <span className="hud-label">{r.label}</span>
                          </div>
                          <span className="hud-value text-xs" style={{ color: r.color }}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground pt-2"
                    style={{ borderTop: "1px solid hsl(var(--border))" }}>
                    <span>Сгенерирован: {fmtDate(data.generated_at)}</span>
                    <span>Версия: {data.version}</span>
                  </div>
                </div>
                </div>
              )}

              {tab === "log" && (
                <div className="p-5 space-y-1.5">
                  {(!data.log || data.log.length === 0)
                    ? <p className="text-xs text-muted-foreground">Лог пуст</p>
                    : data.log.map((line, i) => (
                        <div key={i} className="text-xs font-mono py-1 border-b last:border-0"
                          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
                          <span style={{ color: "var(--electric)" }}>
                            {line.match(/\[\d{2}:\d{2}:\d{2}\]/)?.[0]}
                          </span>
                          {" "}{line.replace(/\[\d{2}:\d{2}:\d{2}\]\s*/, "")}
                        </div>
                      ))
                  }
                </div>
              )}

              {tab === "raw" && (
                <div className="p-5">
                <pre className="text-xs font-mono overflow-x-auto leading-relaxed"
                  style={{ color: "hsl(var(--muted-foreground))", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid hsl(var(--border))" }}>
              <span className="hud-label">{url.split("/").slice(-1)[0]}</span>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
                <Icon name="Download" size={12} /> Скачать файл
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}