import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useMissions } from "@/hooks/useMissions";
import { useLiveFleet } from "@/hooks/useLiveFleet";
import { missions as missionsApi } from "@/lib/api";
import type { Mission } from "@/lib/api";

const typeIcon: Record<string, string> = {
  patrol: "Shield", mapping: "Map", inspection: "Search",
  recon: "Eye", delivery: "Package",
};
const typeName: Record<string, string> = {
  patrol: "Патруль", mapping: "Картография", inspection: "Инспекция",
  recon: "Разведка", delivery: "Доставка",
};
const statusCls: Record<string, string> = {
  active: "tag-green", planned: "tag-electric", done: "tag-muted", aborted: "tag-danger",
};
const statusLabel: Record<string, string> = {
  active: "Выполняется", planned: "Запланирована", done: "Завершена", aborted: "Прервана",
};
const riskCls: Record<string, string> = {
  low: "tag-green", medium: "tag-warning", high: "tag-danger",
};
const riskLabel: Record<string, string> = {
  low: "Низкий риск", medium: "Средний риск", high: "Высокий риск",
};

type TabType = "map" | "tasks" | "weather" | "obstacles";

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function MissionsPage() {
  const { data, loading, updateMission, refresh } = useMissions({}, 5000);
  const { data: fleet } = useLiveFleet(0); // только для списка дронов в форме
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tab, setTab] = useState<TabType>("map");

  // Форма создания миссии
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    drone_id: "",
    type: "patrol",
    waypoints: 8,
  });

  const handleCreate = async () => {
    if (!form.name.trim() || !form.drone_id) {
      setFormError("Заполни название и выбери дрон");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      const code = `MSN-${String(Date.now()).slice(-3)}`;
      await missionsApi.create({
        code,
        name:     form.name.trim(),
        drone_id: form.drone_id,
        type:     form.type,
        waypoints: form.waypoints,
      });
      setShowForm(false);
      setForm({ name: "", drone_id: "", type: "patrol", waypoints: 8 });
      await refresh();
    } catch {
      setFormError("Ошибка при создании миссии");
    } finally {
      setFormLoading(false);
    }
  };

  const missionsList = data?.missions ?? [];
  const sel: Mission | undefined = missionsList.find(m => m.id === selectedId)
    ?? (missionsList.length > 0 ? missionsList[0] : undefined);

  const handleStart = async () => {
    if (!sel) return;
    await updateMission(sel.id, { status: "active", progress: 0 });
  };
  const handlePause = async () => {
    if (!sel) return;
    await updateMission(sel.id, { status: "planned" });
  };
  const handleAbort = async () => {
    if (!sel) return;
    await updateMission(sel.id, { status: "aborted" });
  };

  return (
    <div className="p-6 fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Планирование миссий</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Данные из БД · обновление каждые 5 сек
            {data && <span className="ml-2 text-muted-foreground">({data.total} миссий)</span>}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setFormError(null); }}
          className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2"
        >
          <Icon name="Plus" size={13} />
          Новая миссия
        </button>
      </div>

      {/* Форма создания миссии */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="panel rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base">Новая миссия</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="hud-label block mb-1.5">Название миссии</label>
                <input
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  placeholder="Патруль периметра Б"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="hud-label block mb-1.5">Дрон</label>
                <select
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  value={form.drone_id}
                  onChange={e => setForm(f => ({ ...f, drone_id: e.target.value }))}
                >
                  <option value="">Выбери дрон</option>
                  {(fleet?.drones ?? []).map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="hud-label block mb-1.5">Тип миссии</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {Object.entries(typeName).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="hud-label block mb-1.5">Точек маршрута</label>
                  <input
                    type="number" min={2} max={50}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    value={form.waypoints}
                    onChange={e => setForm(f => ({ ...f, waypoints: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)" }}>
                {formError}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-ghost py-2 rounded-lg text-xs">
                Отмена
              </button>
              <button
                onClick={handleCreate}
                disabled={formLoading}
                className="flex-1 btn-electric py-2 rounded-lg text-xs flex items-center justify-center gap-2"
              >
                {formLoading
                  ? <><Icon name="Loader" size={13} className="animate-spin" /> Создаём…</>
                  : <><Icon name="Plus" size={13} /> Создать</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      {data && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { label: "Активных",     val: data.stats.active ?? 0,  cls: "tag-green"   },
            { label: "Запланировано", val: data.stats.planned ?? 0, cls: "tag-electric" },
            { label: "Завершено",    val: data.stats.done ?? 0,    cls: "tag-muted"   },
            { label: "Прервано",     val: data.stats.aborted ?? 0, cls: "tag-danger"  },
          ].map(s => (
            <div key={s.label} className="panel px-4 py-2 rounded-xl flex items-center gap-2">
              <span className={`tag ${s.cls}`}>{s.val}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Mission list */}
        <div className="lg:col-span-2 space-y-3">
          {loading && missionsList.length === 0
            ? [1,2,3].map(i => (
                <div key={i} className="panel p-4 rounded-xl animate-pulse" style={{ height: 100 }} />
              ))
            : missionsList.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedId(m.id); setTab("map"); }}
                  className="w-full text-left p-4 rounded-xl panel transition-all"
                  style={(sel?.id === m.id) ? { borderColor: "rgba(0,212,255,0.35)" } : {}}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(0,212,255,0.1)" }}>
                        <Icon name={typeIcon[m.type] ?? "Navigation"} fallback="Navigation" size={14} style={{ color: "var(--electric)" }} />
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{m.name}</span>
                        <div className="hud-label mt-0.5">{m.drone_name ?? m.drone_id} · {typeName[m.type] ?? m.type}</div>
                      </div>
                    </div>
                    <span className={`tag ${statusCls[m.status] ?? "tag-muted"}`}>{statusLabel[m.status] ?? m.status}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-2 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="Wind" size={11} /> {m.weather_wind} м/с
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Icon name="Navigation" size={11} /> {m.waypoints} точек
                    </span>
                    {m.obstacles_avoided > 0 && (
                      <span className="flex items-center gap-1" style={{ color: "var(--warning)" }}>
                        <Icon name="AlertTriangle" size={11} /> {m.obstacles_avoided} объездов
                      </span>
                    )}
                  </div>

                  {(m.tasks ?? []).length > 0 && (
                    <div className="flex gap-1 flex-wrap mb-2">
                      {m.tasks.slice(0, 3).map(t => (
                        <span key={t} className="tag tag-muted" style={{ fontSize: 9 }}>{t}</span>
                      ))}
                    </div>
                  )}

                  {m.status === "active" && (
                    <>
                      <div className="bar-track mb-1">
                        <div className="bar-fill" style={{ width: `${m.progress}%`, background: "var(--signal-green)", transition: "width 1s ease" }} />
                      </div>
                      <div className="flex justify-between">
                        <span className="hud-label">{m.progress}%</span>
                        <span className="hud-label">ETA {fmtTime(m.eta)}</span>
                      </div>
                    </>
                  )}
                </button>
              ))
          }
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 panel rounded-xl overflow-hidden">
          {!sel ? (
            <div className="h-full flex items-center justify-center text-muted-foreground p-10 text-sm">
              {loading ? "Загрузка миссий…" : "Выберите миссию"}
            </div>
          ) : (
            <>
              {/* Map */}
              <div className="relative h-56 grid-bg radar-bg flex items-center justify-center overflow-hidden">
                <div className="scan-line" />
                {Array.from({ length: sel.waypoints }).map((_, i) => {
                  const angle = (i / Math.max(sel.waypoints, 1)) * Math.PI * 2;
                  const r = 70 + Math.sin(i * 1.7) * 35;
                  const x = 50 + Math.cos(angle) * r * 0.42;
                  const y = 50 + Math.sin(angle) * r * 0.42;
                  const done = (i / Math.max(sel.waypoints, 1)) * 100 < sel.progress;
                  return (
                    <div key={i} className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%`, background: done ? "var(--signal-green)" : "rgba(0,212,255,0.4)", boxShadow: done ? "0 0 6px var(--signal-green)" : "none" }}
                    />
                  );
                })}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center z-10" style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.4)" }}>
                  <Icon name="Navigation" size={20} style={{ color: "var(--electric)" }} />
                </div>
                <div className="absolute top-3 left-3"><span className="tag tag-electric">{sel.code}</span></div>
                {sel.status === "active" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 tag tag-green"><span className="dot-online" /> Live</div>
                )}
                {sel.route_adjustments > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 tag tag-warning">
                    <Icon name="RefreshCw" size={10} /> {sel.route_adjustments} коррекций
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                {(["map", "tasks", "weather", "obstacles"] as TabType[]).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-xs font-semibold transition-all ${tab === t ? "" : "text-muted-foreground hover:text-foreground"}`}
                    style={tab === t ? { color: "var(--electric)", borderBottom: "2px solid var(--electric)" } : {}}
                  >
                    {t === "map" ? "Маршрут" : t === "tasks" ? "Задачи" : t === "weather" ? "Погода" : "Препятствия"}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {tab === "map" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Дрон",   val: sel.drone_name ?? sel.drone_id },
                        { label: "Старт",  val: fmtTime(sel.start_time) },
                        { label: "Прогресс", val: `${sel.progress}%` },
                      ].map(i => (
                        <div key={i.label} className="text-center p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                          <div className="hud-label mb-1">{i.label}</div>
                          <div className="hud-value text-sm">{i.val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                        <span className="hud-label">Дистанция: </span>
                        <span className="hud-value">{sel.distance_km} км</span>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                        <span className="hud-label">Точек: </span>
                        <span className="hud-value">{sel.waypoints}</span>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "tasks" && (
                  <div className="space-y-2">
                    {(sel.tasks ?? []).length === 0
                      ? <p className="text-xs text-muted-foreground">Задачи не указаны</p>
                      : (sel.tasks ?? []).map((task, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                            <div className="flex items-center gap-2">
                              <Icon name="CheckSquare" size={13} style={{ color: "var(--electric)" }} />
                              <span className="text-sm font-medium">{task}</span>
                            </div>
                            <span className={`tag ${statusCls[sel.status] ?? "tag-muted"}`}>
                              {sel.status === "done" ? "Выполнено" : sel.status === "active" ? "Активна" : "Ожидает"}
                            </span>
                          </div>
                        ))
                    }
                  </div>
                )}

                {tab === "weather" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="hud-label">Погодные условия</span>
                      <span className={`tag ${riskCls[sel.weather_risk] ?? "tag-muted"}`}>{riskLabel[sel.weather_risk] ?? sel.weather_risk}</span>
                    </div>
                    {[
                      { icon: "Wind",        label: "Ветер",       val: `${sel.weather_wind} м/с` },
                      { icon: "Eye",         label: "Видимость",   val: sel.weather_vis },
                      { icon: "Thermometer", label: "Температура", val: `${sel.weather_temp}°C` },
                    ].map(w => (
                      <div key={w.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                        <div className="flex items-center gap-2">
                          <Icon name={w.icon} fallback="Cloud" size={14} style={{ color: "var(--electric)" }} />
                          <span className="text-sm">{w.label}</span>
                        </div>
                        <span className="hud-value text-xs">{w.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "obstacles" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="hud-label">Объезды препятствий</span>
                      <span className="tag tag-green">{sel.obstacles_avoided} объездов</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                      <span className="text-xs">Коррекций маршрута</span>
                      <span className="hud-value text-xs">{sel.route_adjustments}</span>
                    </div>
                    {sel.obstacles_avoided === 0 && (
                      <p className="text-xs text-muted-foreground pt-2">Препятствий не обнаружено</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid hsl(var(--border))" }}>
                  {sel.status === "active" && (
                    <button onClick={handlePause} className="btn-ghost flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
                      <Icon name="Pause" size={13} /> Пауза
                    </button>
                  )}
                  {sel.status === "planned" && (
                    <button onClick={handleStart} className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
                      <Icon name="Play" size={13} /> Запустить
                    </button>
                  )}
                  {(sel.status === "active" || sel.status === "planned") && (
                    <button onClick={handleAbort} className="px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)", border: "1px solid rgba(255,59,48,0.25)" }}>
                      <Icon name="X" size={12} /> Прервать
                    </button>
                  )}
                  <button className="panel px-3 py-2 rounded-lg text-xs flex items-center gap-1.5">
                    <Icon name="Download" size={12} /> CSV
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}