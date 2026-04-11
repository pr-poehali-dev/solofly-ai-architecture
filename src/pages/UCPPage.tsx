import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { fleet, type Drone, type FleetAnalytics, type DroneConnection } from "@/lib/api";
import LiveMap, { type MapDrone } from "@/components/LiveMap";

// ─── Константы ────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  scout: "Разведчик", mapper: "Картограф", relay: "Ретранслятор",
  leader: "Лидер роя", cargo: "Грузовой", guard: "Охрана",
};
const ROLE_COLOR: Record<string, string> = {
  scout: "var(--electric)", mapper: "var(--signal-green)", relay: "#a78bfa",
  leader: "#f97316", cargo: "#22d3ee", guard: "#e879f9",
};
const STATUS_CLS: Record<string, string> = {
  flight: "tag-green", standby: "tag-electric", charging: "tag-warning",
  offline: "tag-muted", error: "tag-danger",
};
const STATUS_LABEL: Record<string, string> = {
  flight: "В полёте", standby: "Готов", charging: "Зарядка",
  offline: "Офлайн", error: "Ошибка",
};
const STATUS_DOT: Record<string, string> = {
  flight: "dot-online", standby: "dot-online", charging: "dot-warning",
  offline: "dot-offline", error: "dot-danger",
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
function relTime(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} с назад`;
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  return `${Math.floor(s / 3600)} ч назад`;
}

// ─── Форма регистрации БПЛА ───────────────────────────────────────────────────

const EMPTY_FORM = {
  id: "", name: "", role: "scout",
  hw_weight: "2.0", hw_motors: "4", hw_battery_cap: "10000", hw_max_speed: "90",
  ai_model: "PathNet-v4.2", firmware_ver: "1.0.0", serial_num: "", notes: "",
};

function RegisterForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim()) { setError("ID и Название обязательны"); return; }
    setSaving(true); setError(null);
    try {
      await fleet.register({
        id: form.id.trim().toUpperCase(), name: form.name.trim(), role: form.role,
        hw_weight: parseFloat(form.hw_weight), hw_motors: parseInt(form.hw_motors),
        hw_battery_cap: parseInt(form.hw_battery_cap), hw_max_speed: parseInt(form.hw_max_speed),
        ai_model: form.ai_model, firmware_ver: form.firmware_ver,
        serial_num: form.serial_num, notes: form.notes,
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally { setSaving(false); }
  };

  const Field = ({ label, k, type = "text", placeholder = "" }: { label: string; k: keyof typeof EMPTY_FORM; type?: string; placeholder?: string }) => (
    <div>
      <label className="hud-label block mb-1">{label}</label>
      <input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-xs outline-none"
        style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="ID дрона *" k="id" placeholder="SF-005" />
        <Field label="Название *" k="name" placeholder="Орёл-5" />
      </div>

      <div>
        <label className="hud-label block mb-1">Роль</label>
        <select value={form.role} onChange={set("role")}
          className="w-full px-3 py-2 rounded-lg text-xs outline-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }}>
          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Серийный номер" k="serial_num" placeholder="SOLOFLY-XXXXX" />
        <Field label="Прошивка" k="firmware_ver" placeholder="1.0.0" />
      </div>

      <div className="p-3 rounded-xl" style={{ background: "hsl(var(--input))" }}>
        <div className="hud-label mb-2">Аппаратные характеристики</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Масса (кг)" k="hw_weight" type="number" placeholder="2.0" />
          <Field label="Моторов" k="hw_motors" type="number" placeholder="4" />
          <Field label="АКБ (мАч)" k="hw_battery_cap" type="number" placeholder="10000" />
          <Field label="Vmax (км/ч)" k="hw_max_speed" type="number" placeholder="90" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="ИИ-модель" k="ai_model" placeholder="PathNet-v4.2" />
      </div>

      <div>
        <label className="hud-label block mb-1">Заметки</label>
        <textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Доп. информация о борте…"
          className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
          style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))" }} />
      </div>

      {error && (
        <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)" }}>
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50">
          <Icon name={saving ? "Loader" : "Plus"} size={13} className={saving ? "animate-spin" : ""} />
          {saving ? "Регистрирую…" : "Зарегистрировать БПЛА"}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost px-4 py-2 rounded-lg text-xs">
          Отмена
        </button>
      </div>
    </form>
  );
}

// ─── Карточка дрона ───────────────────────────────────────────────────────────

function DroneCard({ drone, selected, onClick }: {
  drone: Drone; selected: boolean; onClick: () => void;
}) {
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
          { label: "АКБ",    val: `${drone.battery}%` },
          { label: "Высота", val: `${Number(drone.altitude).toFixed(0)}м` },
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

function DroneDetail({ drone, onClose, onDelete, onRefresh }: {
  drone: Drone; onClose: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
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
            {/* Роль + статистика */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Роль",       val: ROLE_LABEL[drone.role ?? "scout"] ?? drone.role },
                { label: "ИИ-модель",  val: drone.ai_model },
                { label: "Прошивка",   val: drone.firmware_ver ?? "—" },
                { label: "Серийный №", val: drone.serial_num || "—" },
                { label: "Регистратор",val: drone.registered_by ?? "—" },
                { label: "Last seen",  val: drone.last_seen_at ? relTime(drone.last_seen_at) : "—" },
              ].map(i => (
                <div key={i.label} className="p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                  <div className="hud-label mb-0.5">{i.label}</div>
                  <div className="hud-value text-xs">{i.val}</div>
                </div>
              ))}
            </div>

            {/* Налёт */}
            <div>
              <div className="hud-label mb-2">Статистика налёта</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "Plane",    label: "Полётов",  val: drone.total_flights ?? 0,        color: color },
                  { icon: "Clock",    label: "Часов",    val: `${drone.total_hours ?? 0} ч`,   color: "var(--signal-green)" },
                  { icon: "Route",    label: "Км пути",  val: `${drone.total_km ?? 0} км`,     color: "#a78bfa" },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: "hsl(var(--input))" }}>
                    <Icon name={s.icon} fallback="Circle" size={16} style={{ color: s.color }} className="mx-auto mb-1" />
                    <div className="hud-value text-sm" style={{ color: s.color }}>{s.val}</div>
                    <div className="hud-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Железо */}
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

            {/* Заметки */}
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
                        { label: "Выс.", val: `${Number(h.altitude).toFixed(0)}м` },
                        { label: "Скор.", val: `${Number(h.speed).toFixed(0)}км/ч` },
                        { label: "GPS", val: `${h.lat?.toFixed ? Number(h.lat).toFixed(4) : "—"}°` },
                        { label: "CPU", val: h.cpu_load != null ? `${h.cpu_load}%` : "—" },
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
                        <Icon name={c.event === "disconnect" ? "WifiOff" : c.event === "registered" ? "PlusCircle" : "Wifi"}
                          size={13} style={{ color: c.event === "connect" ? "var(--signal-green)" : c.event === "registered" ? "var(--electric)" : "var(--danger)" }} />
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

// ─── Главная страница ЦУП ─────────────────────────────────────────────────────

type Tab = "fleet" | "register" | "analytics" | "map";

export default function UCPPage() {
  const [tab, setTab]                 = useState<Tab>("fleet");
  const [drones, setDrones]           = useState<Drone[]>([]);
  const [analytics, setAnalytics]     = useState<FleetAnalytics | null>(null);
  const [loading, setLoading]         = useState(true);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [operatorPos, setOperatorPos] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus]     = useState<"idle" | "loading" | "ok" | "denied">("idle");

  const load = useCallback(async () => {
    try {
      const [fleetRes, analyticsRes] = await Promise.all([
        fleet.getAll(),
        fleet.getAnalytics(),
      ]);
      setDrones(fleetRes.drones);
      setAnalytics(analyticsRes);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Автообновление каждые 5 сек
  useEffect(() => {
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  const requestGeo = () => {
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      p => { setOperatorPos({ lat: p.coords.latitude, lon: p.coords.longitude }); setGeoStatus("ok"); },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const selectedDrone = drones.find(d => d.id === selectedId) ?? null;
  const stats = analytics?.stats;
  const flying = stats?.flying ?? 0;

  const mapDrones: MapDrone[] = drones
    .filter(d => Number(d.lat) && Number(d.lon))
    .map(d => ({
      id: d.id, name: d.name, status: d.status,
      lat: Number(d.lat), lon: Number(d.lon),
      altitude: Number(d.altitude), heading: Number(d.heading),
      speed: Number(d.speed), battery: d.battery,
    }));

  return (
    <div className="p-6 space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold">ЦУП — Центр управления полётами</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Регистрация БПЛА · Телеметрия · Аналитика флота
            {!loading && <span className="ml-2" style={{ color: "var(--signal-green)" }}>● LIVE</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={requestGeo}
            className="panel px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all"
            style={geoStatus === "ok" ? { borderColor: "rgba(255,59,48,0.4)", color: "#ff3b30" } : {}}>
            <Icon name={geoStatus === "loading" ? "Loader" : "MapPin"} size={13}
              className={geoStatus === "loading" ? "animate-spin" : ""} />
            {geoStatus === "ok" ? "Геолокация активна" : "Геолокация"}
          </button>
          <button onClick={load} className="btn-ghost px-3 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="RefreshCw" size={13} /> Обновить
          </button>
          <button onClick={() => setTab("register")} className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2">
            <Icon name="Plus" size={13} /> Подключить БПЛА
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: "Navigation", label: "В полёте",    val: flying,                                         color: "var(--signal-green)" },
          { icon: "Zap",        label: "Готово",       val: stats?.standby ?? 0,                            color: "var(--electric)"     },
          { icon: "BatteryCharging", label: "Зарядка", val: stats?.charging ?? 0,                           color: "#f97316"             },
          { icon: "WifiOff",    label: "Офлайн",       val: (stats?.offline ?? 0) + (stats?.errors ?? 0),   color: "var(--muted)"        },
          { icon: "Database",   label: "Всего",        val: drones.length,                                  color: "#a78bfa"             },
        ].map(s => (
          <div key={s.label} className="panel p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${s.color}14` }}>
              <Icon name={s.icon} fallback="Circle" size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="hud-value text-xl" style={{ color: s.color }}>{loading ? "—" : s.val}</div>
              <div className="hud-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 panel rounded-xl p-1" style={{ width: "fit-content" }}>
        {([["fleet", "Флот", "Layers3"], ["register", "Регистрация", "PlusCircle"],
           ["analytics", "Аналитика", "BarChart2"], ["map", "Карта", "Map"]] as const).map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
            style={tab === id
              ? { background: "rgba(0,212,255,0.12)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }
              : { color: "hsl(var(--muted-foreground))" }}>
            <Icon name={icon} size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── FLEET ── */}
      {tab === "fleet" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {loading
              ? [1,2,3,4].map(i => <div key={i} className="panel rounded-xl h-36 animate-pulse" />)
              : drones.map(d => (
                  <DroneCard key={d.id} drone={d} selected={selectedId === d.id}
                    onClick={async () => {
                      if (selectedId === d.id) { setSelectedId(null); return; }
                      // Подгружаем с историей телеметрии
                      const res = await fleet.getOne(d.id);
                      setDrones(prev => prev.map(x => x.id === d.id ? { ...x, ...res.drone } : x));
                      setSelectedId(d.id);
                    }} />
                ))
            }
          </div>
          <div className="lg:col-span-2">
            {selectedDrone
              ? <DroneDetail drone={selectedDrone} onClose={() => setSelectedId(null)}
                  onDelete={id => { setDrones(prev => prev.filter(d => d.id !== id)); setSelectedId(null); }}
                  onRefresh={load} />
              : (
                <div className="panel rounded-xl h-full flex flex-col items-center justify-center p-10 text-center gap-4"
                  style={{ minHeight: 280 }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,212,255,0.08)" }}>
                    <Icon name="Navigation" size={28} style={{ color: "var(--electric)" }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">Выберите БПЛА</div>
                    <div className="text-muted-foreground text-xs">Нажмите на карточку для просмотра паспорта и телеметрии</div>
                  </div>
                  <div className="hud-label">{drones.length} борт{drones.length !== 1 ? "ов" : ""} в системе</div>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* ── REGISTER ── */}
      {tab === "register" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="panel rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,212,255,0.1)" }}>
                <Icon name="PlusCircle" size={18} style={{ color: "var(--electric)" }} />
              </div>
              <div>
                <div className="font-semibold text-sm">Регистрация нового БПЛА</div>
                <div className="hud-label">Занесение борта в систему ЦУП</div>
              </div>
            </div>
            <RegisterForm onDone={() => { load(); setTab("fleet"); }} onCancel={() => setTab("fleet")} />
          </div>

          <div className="space-y-4">
            <div className="panel rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-3">Инструкция</h2>
              <div className="space-y-3">
                {[
                  { step: "1", title: "ID дрона", desc: "Уникальный идентификатор: буквы, цифры, дефис. Пример: SF-005, UAV-001" },
                  { step: "2", title: "Характеристики", desc: "Масса, количество моторов, ёмкость АКБ, максимальная скорость" },
                  { step: "3", title: "Прошивка и ИИ", desc: "Версия прошивки и модель ИИ-навигации (PathNet-v4.2 по умолчанию)" },
                  { step: "4", title: "Подтверждение", desc: "После регистрации дрон появится в системе со статусом Офлайн" },
                ].map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: "rgba(0,212,255,0.12)", color: "var(--electric)" }}>{s.step}</div>
                    <div>
                      <div className="text-xs font-semibold">{s.title}</div>
                      <div className="hud-label leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-3">Зарегистрированные борты</h2>
              <div className="space-y-2">
                {drones.map(d => (
                  <div key={d.id} className="flex items-center justify-between py-1.5 border-b last:border-0"
                    style={{ borderColor: "hsl(var(--border))" }}>
                    <div className="flex items-center gap-2">
                      <span className={STATUS_DOT[d.status] ?? "dot-offline"} />
                      <span className="text-xs font-medium">{d.name}</span>
                      <span className="hud-label">{d.id}</span>
                    </div>
                    <span className={`tag ${STATUS_CLS[d.status] ?? "tag-muted"}`} style={{ fontSize: 9 }}>
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && analytics && (
        <div className="space-y-5">
          {/* Сводка */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "Plane",       label: "Всего полётов",    val: (stats?.total_flights ?? 0).toLocaleString("ru-RU"), color: "var(--electric)" },
              { icon: "Clock",       label: "Налёт, часов",     val: `${stats?.total_hours ?? 0} ч`,                      color: "var(--signal-green)" },
              { icon: "Route",       label: "Пройдено, км",     val: `${stats?.total_km ?? 0} км`,                        color: "#a78bfa" },
              { icon: "Battery",     label: "Ср. заряд",         val: `${Math.round(stats?.avg_battery ?? 0)}%`,           color: stats?.avg_battery && stats.avg_battery > 40 ? "var(--signal-green)" : "var(--warning)" },
              { icon: "Wifi",        label: "Ср. GPS спутников", val: analytics.sensors.avg_gps != null ? `${Number(analytics.sensors.avg_gps).toFixed(1)}` : "—", color: "var(--electric)" },
              { icon: "Cpu",         label: "Ср. загрузка CPU",  val: analytics.sensors.avg_cpu != null ? `${Math.round(Number(analytics.sensors.avg_cpu))}%` : "—", color: "#f97316" },
            ].map(s => (
              <div key={s.label} className="panel p-5 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}14` }}>
                  <Icon name={s.icon} fallback="Circle" size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <div className="hud-value text-xl" style={{ color: s.color }}>{s.val}</div>
                  <div className="hud-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Детали по каждому дрону */}
          <div className="panel rounded-xl overflow-hidden">
            <div className="px-5 py-3" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
              <h2 className="font-semibold text-sm">Аналитика по бортам</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  {["Борт", "Статус", "Роль", "АКБ", "Высота", "Полётов", "Налёт", "Пройдено", "GPS", "Прошивка"].map(h => (
                    <th key={h} className="hud-label text-left px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.fleet.map(d => (
                  <tr key={d.id} className="border-b hover:bg-white/2 transition-all cursor-pointer"
                    style={{ borderColor: "hsl(var(--border))" }}
                    onClick={() => { setSelectedId(d.id); setTab("fleet"); }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={STATUS_DOT[d.status] ?? "dot-offline"} />
                        <div>
                          <div className="text-xs font-semibold">{d.name}</div>
                          <div className="hud-label">{d.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className={`tag ${STATUS_CLS[d.status] ?? "tag-muted"}`}>{STATUS_LABEL[d.status] ?? d.status}</span></td>
                    <td className="px-4 py-3"><span className="text-xs" style={{ color: ROLE_COLOR[d.role ?? "scout"] }}>{ROLE_LABEL[d.role ?? "scout"] ?? d.role}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="bar-track w-12" style={{ height: 3 }}>
                          <div className="bar-fill" style={{ width: `${d.battery}%`, background: d.battery > 30 ? "var(--signal-green)" : "var(--warning)" }} />
                        </div>
                        <span className="hud-value text-xs">{d.battery}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hud-value text-xs">{Number(d.altitude).toFixed(0)} м</td>
                    <td className="px-4 py-3 hud-value text-xs">{d.total_flights ?? 0}</td>
                    <td className="px-4 py-3 hud-value text-xs">{d.total_hours ?? 0} ч</td>
                    <td className="px-4 py-3 hud-value text-xs">{d.total_km ?? 0} км</td>
                    <td className="px-4 py-3 hud-value text-xs">{d.gps_sats} спут.</td>
                    <td className="px-4 py-3 hud-label">{d.firmware_ver ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Активные алерты */}
          {analytics.alerts.length > 0 && (
            <div className="panel rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="AlertTriangle" size={15} style={{ color: "var(--warning)" }} />
                Активные алерты ({analytics.alerts.length})
              </h2>
              <div className="space-y-2">
                {analytics.alerts.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ background: "hsl(var(--input))" }}>
                    <Icon name={a.level === "error" ? "AlertOctagon" : "AlertTriangle"} size={14}
                      style={{ color: a.level === "error" ? "var(--danger)" : "var(--warning)" }}
                      className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-semibold">{a.drone_id ?? "Система"} · {a.category}</div>
                      <div className="hud-label leading-relaxed">{a.message}</div>
                    </div>
                    <div className="hud-label shrink-0">{fmtDate(a.ts)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MAP ── */}
      {tab === "map" && (
        <div className="panel rounded-xl overflow-hidden">
          <LiveMap
            drones={mapDrones}
            height={520}
            operatorPos={operatorPos}
            selectedDroneId={selectedId}
            onSelectDrone={id => { setSelectedId(id); if (id) setTab("fleet"); }}
            showOperatorGeo
          />
        </div>
      )}
    </div>
  );
}
