// DroneCard + DroneDetail — карточка в сетке и боковая панель деталей
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { fleet, type Drone, type DroneConnection } from "@/lib/api";
import { ROLE_LABEL, ROLE_COLOR, STATUS_CLS, STATUS_LABEL, STATUS_DOT, fmtDate, relTime } from "./ucpTypes";

// ─── Карточка дрона ───────────────────────────────────────────────────────────

interface DroneCardProps {
  drone: Drone;
  selected: boolean;
  onClick: () => void;
}

export function DroneCard({ drone, selected, onClick }: DroneCardProps) {
  const color = ROLE_COLOR[drone.role ?? "scout"] ?? "var(--electric)";
  return (
    <button onClick={onClick} className="w-full text-left panel rounded-xl p-4 transition-all hover:opacity-90"
      style={selected ? { borderColor: color, background: `${color}08` } : {}}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={STATUS_DOT[drone.status] ?? "dot-offline"} />
          <div>
            <div className="font-semibold text-sm">{drone.name}</div>
            <div className="hud-label">{drone.id}</div>
          </div>
        </div>
        <span className={`tag ${STATUS_CLS[drone.status] ?? "tag-muted"}`}>{STATUS_LABEL[drone.status] ?? drone.status}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        {[
          { label: "АКБ",     val: `${drone.battery}%` },
          { label: "Высота",  val: `${Number(drone.altitude).toFixed(0)}м` },
          { label: "Скорость",val: `${Number(drone.speed).toFixed(0)}км/ч` },
        ].map(i => (
          <div key={i.label} className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
            <div className="hud-label" style={{ fontSize: 9 }}>{i.label}</div>
            <div className="hud-value text-xs">{i.val}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
          {ROLE_LABEL[drone.role ?? "scout"] ?? drone.role}
        </span>
        <span className="hud-label">{drone.firmware_ver ?? "—"}</span>
      </div>
      {drone.status === "flight" && (
        <div className="mt-2 bar-track" style={{ height: 3 }}>
          <div className="bar-fill" style={{ width: `${drone.battery}%`, background: drone.battery > 30 ? "var(--signal-green)" : "var(--warning)", transition: "width 1s" }} />
        </div>
      )}
    </button>
  );
}

// ─── Панель деталей дрона ─────────────────────────────────────────────────────

interface DroneDetailProps {
  drone: Drone;
  onClose: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function DroneDetail({ drone, onClose, onDelete, onRefresh }: DroneDetailProps) {
  const [connections, setConnections] = useState<DroneConnection[]>([]);
  const [connLoading, setConnLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: drone.name, notes: drone.notes ?? "", firmware_ver: drone.firmware_ver ?? "" });
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState<"info" | "telemetry" | "connections">("info");

  const loadConns = useCallback(async () => {
    setConnLoading(true);
    try {
      const r = await fleet.getConnections(drone.id);
      setConnections(r.connections);
    } catch { /* silent */ }
    finally { setConnLoading(false); }
  }, [drone.id]);

  useEffect(() => { if (tab === "connections") loadConns(); }, [tab, loadConns]);

  const handleSave = async () => {
    await fleet.patch(drone.id, { name: editForm.name, notes: editForm.notes, firmware_ver: editForm.firmware_ver });
    setEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Снять с учёта ${drone.id} (${drone.name})?`)) return;
    setDeleting(true);
    await fleet.remove(drone.id);
    onDelete(drone.id);
  };

  const color = ROLE_COLOR[drone.role ?? "scout"] ?? "var(--electric)";
  const history = drone.telemetry_history ?? [];

  return (
    <div className="panel rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon name="Navigation" size={17} style={{ color }} />
          </div>
          <div>
            {editing
              ? <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="font-bold text-sm bg-transparent border-b outline-none" style={{ borderColor: color }} />
              : <div className="font-bold text-sm">{drone.name}</div>
            }
            <div className="hud-label">{drone.id} · {drone.serial_num || "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`tag ${STATUS_CLS[drone.status] ?? "tag-muted"}`}>{STATUS_LABEL[drone.status] ?? drone.status}</span>
          {editing
            ? <button onClick={handleSave} className="btn-electric px-3 py-1.5 rounded-lg text-xs">Сохранить</button>
            : <button onClick={() => setEditing(true)} className="btn-ghost p-1.5 rounded-lg"><Icon name="Pencil" size={14} /></button>
          }
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        {(["info", "telemetry", "connections"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-xs font-semibold transition-all"
            style={tab === t ? { color: color, borderBottom: `2px solid ${color}` } : { color: "hsl(var(--muted-foreground))" }}>
            {t === "info" ? "Паспорт" : t === "telemetry" ? `Телеметрия (${history.length})` : "Подключения"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">

        {/* ── INFO ── */}
        {tab === "info" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Роль",        val: ROLE_LABEL[drone.role ?? "scout"] ?? drone.role },
                { label: "ИИ-модель",   val: drone.ai_model },
                { label: "Прошивка",    val: drone.firmware_ver ?? "—" },
                { label: "Серийный №",  val: drone.serial_num || "—" },
                { label: "Регистратор", val: drone.registered_by ?? "—" },
                { label: "Last seen",   val: drone.last_seen_at ? relTime(drone.last_seen_at) : "—" },
              ].map(i => (
                <div key={i.label} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="hud-label mb-0.5">{i.label}</div>
                  <div className="hud-value text-xs">{i.val}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="hud-label mb-2">Статистика налёта</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "Plane", label: "Полётов", val: drone.total_flights ?? 0,      color: color },
                  { icon: "Clock", label: "Часов",   val: `${drone.total_hours ?? 0} ч`, color: "var(--signal-green)" },
                  { icon: "Route", label: "Км пути", val: `${drone.total_km ?? 0} км`,   color: "#a78bfa" },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "hsl(var(--input))" }}>
                    <Icon name={s.icon} fallback="Circle" size={16} style={{ color: s.color }} className="mx-auto mb-1" />
                    <div className="hud-value text-sm" style={{ color: s.color }}>{s.val}</div>
                    <div className="hud-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="hud-label mb-2">Аппаратные характеристики</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Масса",   val: `${drone.hw_weight} кг` },
                  { label: "Моторов", val: String(drone.hw_motors) },
                  { label: "АКБ",     val: `${drone.hw_battery_cap} мАч` },
                  { label: "Vmax",    val: `${drone.hw_max_speed} км/ч` },
                ].map(i => (
                  <div key={i.label} className="flex justify-between px-3 py-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                    <span className="hud-label">{i.label}</span>
                    <span className="hud-value text-xs">{i.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {editing ? (
              <div>
                <div className="hud-label mb-1">Заметки</div>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
                  style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }} />
              </div>
            ) : drone.notes ? (
              <div className="p-3 rounded-lg text-xs text-muted-foreground" style={{ background: "hsl(var(--input))" }}>
                {drone.notes}
              </div>
            ) : null}
          </div>
        )}

        {/* ── TELEMETRY ── */}
        {tab === "telemetry" && (
          <div className="space-y-2">
            {history.length === 0
              ? <p className="text-xs text-muted-foreground">Нет данных телеметрии</p>
              : history.map((h, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                    <div className="flex justify-between mb-2">
                      <span className="hud-label font-mono">{fmtDate(h.ts)}</span>
                      <span className="hud-value text-xs" style={{ color: "var(--signal-green)" }}>{h.battery}%</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: "Выс.",  val: `${Number(h.altitude).toFixed(0)}м` },
                        { label: "Скор.", val: `${Number(h.speed).toFixed(0)}км/ч` },
                        { label: "GPS",   val: `${h.lat != null ? Number(h.lat).toFixed(4) : "—"}°` },
                        { label: "CPU",   val: h.cpu_load != null ? `${h.cpu_load}%` : "—" },
                      ].map(f => (
                        <div key={f.label}>
                          <div className="hud-label" style={{ fontSize: 9 }}>{f.label}</div>
                          <div className="hud-value text-xs">{f.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {/* ── CONNECTIONS ── */}
        {tab === "connections" && (
          <div className="space-y-2">
            {connLoading
              ? <p className="text-xs text-muted-foreground animate-pulse">Загрузка…</p>
              : connections.length === 0
                ? <p className="text-xs text-muted-foreground">Нет записей подключений</p>
                : connections.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: c.event === "connect" ? "rgba(0,255,136,0.1)" : "rgba(255,59,48,0.1)" }}>
                        <Icon
                          name={c.event === "disconnect" ? "WifiOff" : c.event === "registered" ? "PlusCircle" : "Wifi"}
                          size={13}
                          style={{ color: c.event === "connect" ? "var(--signal-green)" : c.event === "registered" ? "var(--electric)" : "var(--danger)" }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold capitalize">{c.event}</div>
                        <div className="hud-label">{c.ip_addr ?? "—"} {c.signal_db != null ? `· ${c.signal_db} дБм` : ""}</div>
                      </div>
                      <div className="hud-label">{fmtDate(c.ts)}</div>
                    </div>
                  ))
            }
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 flex gap-2 shrink-0" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <button onClick={handleDelete} disabled={deleting}
          className="px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-40"
          style={{ background: "rgba(255,59,48,0.08)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.2)" }}>
          <Icon name="Trash2" size={13} /> {deleting ? "Удаление…" : "Снять с учёта"}
        </button>
        <button onClick={loadConns} className="btn-ghost px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 ml-auto">
          <Icon name="RefreshCw" size={12} /> Обновить
        </button>
      </div>
    </div>
  );
}
