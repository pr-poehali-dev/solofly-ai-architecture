/**
 * AIExplainPanel — панель «Почему ИИ принял это решение?»
 * Показывает модель, триггер, факторы решения и отвергнутые альтернативы.
 */
import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { events, type ExplainResponse } from "@/lib/api";

interface AIExplainPanelProps {
  droneId:  string;
  maneuver: string;
  label:    string;
  onClose:  () => void;
}

export default function AIExplainPanel({ droneId, maneuver, label, onClose }: AIExplainPanelProps) {
  const [data, setData]       = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // Загружаем при маунте через ref-колбэк
  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    events.explain(droneId, maneuver)
      .then(d => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [droneId, maneuver]);

  // Вызываем загрузку через ref на div (единоразово при появлении)
  const mountRef = useCallback((el: HTMLDivElement | null) => {
    if (el) load();
  }, [load]);

  return (
    <div
      ref={mountRef}
      className="panel rounded-xl overflow-hidden fade-up"
      style={{ border: "1px solid rgba(0,212,255,0.25)" }}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid hsl(var(--border))", background: "rgba(0,212,255,0.05)" }}>
        <div className="flex items-center gap-2">
          <Icon name="Brain" size={15} style={{ color: "var(--electric)" }} />
          <span className="font-semibold text-sm">Почему ИИ выбрал: {label}?</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-ghost p-1.5 rounded-lg" title="Обновить">
            <Icon name="RefreshCw" size={12} />
          </button>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <Icon name="X" size={14} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i} className="h-8 rounded-lg" style={{ background: "hsl(var(--input))" }} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-xs text-center py-4" style={{ color: "var(--danger)" }}>
            Не удалось загрузить объяснение
            <button onClick={load} className="ml-2 underline">Повторить</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Модель + уверенность */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="tag tag-electric" style={{ fontSize: 9 }}>ИИ-модель</span>
                <span className="font-semibold text-sm">{data.model}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hud-label">Уверенность:</span>
                <span className="hud-value text-sm" style={{ color: data.confidence >= 80 ? "var(--signal-green)" : "var(--warning)" }}>
                  {data.confidence}%
                </span>
                <span className="hud-label">{data.decision_ms} мс</span>
              </div>
            </div>

            {/* Триггер решения */}
            <div className="p-3 rounded-xl"
              style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
              <div className="flex items-start gap-2">
                <Icon name="Zap" size={13} style={{ color: "var(--electric)", marginTop: 2, flexShrink: 0 }} />
                <p className="text-xs leading-relaxed">{data.trigger}</p>
              </div>
            </div>

            {/* Факторы решения */}
            <div>
              <div className="hud-label mb-2">Входные параметры</div>
              <div className="grid grid-cols-2 gap-2">
                {data.factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{ background: "hsl(var(--input))" }}>
                    <div className="flex items-center gap-1.5">
                      <Icon
                        name={f.ok ? "CheckCircle" : "AlertTriangle"}
                        fallback="Circle"
                        size={12}
                        style={{ color: f.ok ? "var(--signal-green)" : "var(--warning)", flexShrink: 0 }}
                      />
                      <span className="hud-label">{f.label}</span>
                    </div>
                    <span className="hud-value text-xs" style={{ color: f.ok ? "hsl(var(--foreground))" : "var(--warning)" }}>
                      {f.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Отвергнутые альтернативы */}
            {data.alternatives.length > 0 && (
              <div>
                <div className="hud-label mb-2">Рассмотренные альтернативы</div>
                <div className="space-y-1.5">
                  {data.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Icon name="XCircle" size={12} style={{ color: "var(--danger)", marginTop: 1, flexShrink: 0 }} />
                      {alt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Последние события по дрону */}
            {data.recent_events.length > 0 && (
              <div>
                <div className="hud-label mb-2">Контекст — последние события</div>
                <div className="space-y-1">
                  {data.recent_events.slice(0, 3).map((ev, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b last:border-0"
                      style={{ borderColor: "hsl(var(--border))" }}>
                      <span className={`tag ${ev.level === "error" ? "tag-danger" : ev.level === "warning" ? "tag-warning" : "tag-muted"}`}
                        style={{ fontSize: 8 }}>
                        {ev.category}
                      </span>
                      <span className="text-muted-foreground flex-1 truncate">{ev.message}</span>
                      <span className="hud-label shrink-0">
                        {new Date(ev.ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
