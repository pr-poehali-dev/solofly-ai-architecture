import { useState } from "react";
import Icon from "@/components/ui/icon";
import { scanning, type ScanSession } from "@/lib/api";
import { MODE_LABEL, MODE_ICON, MODE_COLOR, STATUS_CLS, STATUS_LABEL, fmtDate, fmtDur, fmtNum } from "./archiveTypes";

interface SessionDetailProps {
  session: ScanSession;
  onClose: () => void;
  onDelete: (id: number) => void;
  onView: (url: string) => void;
}

export default function SessionDetail({ session, onClose, onDelete, onView }: SessionDetailProps) {
  const [deleting, setDeleting] = useState(false);
  const color = MODE_COLOR[session.scan_mode] ?? "var(--electric)";

  const handleDelete = async () => {
    if (!confirm(`Удалить ${session.code} из архива и облака?`)) return;
    setDeleting(true);
    await scanning.remove(session.id);
    onDelete(session.id);
  };

  return (
    <div className="panel rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon name={MODE_ICON[session.scan_mode] ?? "Scan"} fallback="Scan" size={16} style={{ color }} />
          </div>
          <div>
            <span className="font-bold text-sm" style={{ color }}>{session.code}</span>
            <div className="hud-label">{MODE_LABEL[session.scan_mode] ?? session.scan_mode}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`tag ${STATUS_CLS[session.status] ?? "tag-muted"}`}>
            {STATUS_LABEL[session.status] ?? session.status}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Дрон",       val: session.drone_name ?? session.drone_id },
            { label: "Цель",       val: session.target_mode },
            { label: "Дальность",  val: session.range_m >= 1000 ? `${session.range_m / 1000} км` : `${session.range_m} м` },
            { label: "Разрешение", val: `${session.resolution_cm} см` },
            { label: "Частота",    val: `${session.frequency_hz} Гц` },
            { label: "Угол",       val: `${session.fov_deg}°` },
          ].map(i => (
            <div key={i.label} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
              <div className="hud-label mb-0.5">{i.label}</div>
              <div className="hud-value text-xs">{i.val}</div>
            </div>
          ))}
        </div>

        {/* Результаты */}
        <div>
          <div className="hud-label mb-2">Результаты сканирования</div>
          <div className="space-y-2">
            {[
              { icon: "MapPin",      label: "Площадь",        val: `${session.area_km2} км²`,                color: "var(--electric)" },
              { icon: "Layers3",     label: "Точек собрано",  val: fmtNum(session.points_total),             color: "var(--signal-green)" },
              { icon: "Target",      label: "Объектов",       val: fmtNum(session.objects_found),            color: "#a78bfa" },
              { icon: "CheckCircle", label: "Покрытие",       val: `${session.coverage_pct}%`,               color: session.coverage_pct === 100 ? "var(--signal-green)" : "var(--warning)" },
              { icon: "Clock",       label: "Длительность",   val: fmtDur(session.started_at, session.finished_at), color: "var(--electric)" },
              { icon: "Crosshair",   label: "Точность",       val: session.accuracy_m ? `±${session.accuracy_m} м` : "—", color: "var(--signal-green)" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between py-1.5 border-b last:border-0"
                style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex items-center gap-2">
                  <Icon name={r.icon} fallback="Circle" size={13} style={{ color: r.color }} />
                  <span className="hud-label">{r.label}</span>
                </div>
                <span className="hud-value text-xs" style={{ color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Временная метка */}
        <div>
          <div className="hud-label mb-2">Временная метка</div>
          <div className="space-y-1.5 text-xs">
            {[
              { label: "Создан",   val: fmtDate(session.created_at) },
              { label: "Запущен",  val: fmtDate(session.started_at) },
              { label: "Завершён", val: fmtDate(session.finished_at) },
            ].map(t => (
              <div key={t.label} className="flex justify-between">
                <span className="text-muted-foreground">{t.label}</span>
                <span className="hud-value font-mono">{t.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Файл в облаке */}
        {session.result_url ? (
          <div className="p-4 rounded-xl" style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Cloud" size={14} style={{ color: "var(--electric)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--electric)" }}>Файл в облаке</span>
              <span className="hud-label ml-auto">{session.result_size_kb} КБ</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono truncate mb-3 leading-relaxed">
              {session.result_url.split("/").slice(-2).join("/")}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onView(session.result_url!)}
                className="flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 font-semibold transition-all"
                style={{ background: "rgba(0,212,255,0.12)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }}
              >
                <Icon name="Eye" size={12} /> Просмотреть
              </button>
              <a
                href={session.result_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all"
                style={{ background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }}
              >
                <Icon name="Download" size={12} />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Icon name="CloudOff" size={13} />
              Результат не сохранён в облаке
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 flex gap-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        {session.result_url && (
          <button
            onClick={() => onView(session.result_url!)}
            className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2"
          >
            <Icon name="FileSearch" fallback="Eye" size={13} /> Открыть результат
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
          style={{ background: "rgba(255,59,48,0.08)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}
        >
          <Icon name="Trash2" size={13} /> {deleting ? "Удаление…" : "Удалить"}
        </button>
      </div>
    </div>
  );
}
