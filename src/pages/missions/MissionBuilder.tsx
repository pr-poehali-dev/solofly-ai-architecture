import Icon from "@/components/ui/icon";
import WaypointEditor, { type Waypoint } from "@/components/map/WaypointEditor";
import type { Drone } from "@/lib/api";
import { typeIcon, typeName } from "./missionsTypes";
import { ALTITUDE_PRESETS } from "@/components/map/waypointTypes";

interface MissionBuilderProps {
  builderStep:    "route" | "details";
  setBuilderStep: (step: "route" | "details") => void;
  wps:            Waypoint[];
  setWps:         (wps: Waypoint[]) => void;
  form:           { name: string; drone_id: string; type: string; defaultAltitude: number | null };
  setForm:        (updater: (f: { name: string; drone_id: string; type: string; defaultAltitude: number | null }) => { name: string; drone_id: string; type: string; defaultAltitude: number | null }) => void;
  formLoading:    boolean;
  formError:      string | null;
  drones:         Drone[];
  initialCenter?: { lat: number; lon: number };
  onClose:        () => void;
  onSubmit:       () => void;
  onClearError:   () => void;
}

export default function MissionBuilder({
  builderStep,
  setBuilderStep,
  wps,
  setWps,
  form,
  setForm,
  formLoading,
  formError,
  drones,
  initialCenter,
  onClose,
  onSubmit,
  onClearError,
}: MissionBuilderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "hsl(var(--background))" }}>

      {/* Шапка конструктора */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-3">
          <Icon name="MapPin" size={16} style={{ color: "var(--electric)" }} />
          <span className="font-bold">Конструктор миссии</span>

          {/* Степпер */}
          <div className="flex items-center gap-1 ml-4">
            {(["route", "details"] as const).map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <button
                  onClick={() => builderStep === "details" && step === "route" && setBuilderStep("route")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all"
                  style={builderStep === step
                    ? { background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.4)" }
                    : { color: "hsl(var(--muted-foreground))" }
                  }
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: builderStep === step ? "var(--electric)" : "hsl(var(--input))",
                      color:      builderStep === step ? "#000" : undefined,
                    }}
                  >
                    {i + 1}
                  </span>
                  {step === "route" ? "Маршрут" : "Параметры"}
                </button>
                {i === 0 && <Icon name="ChevronRight" size={12} style={{ color: "hsl(var(--muted-foreground))" }} />}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} className="btn-ghost p-2 rounded-lg">
          <Icon name="X" size={16} />
        </button>
      </div>

      {/* Шаг 1: Карта с редактором маршрута */}
      {builderStep === "route" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <WaypointEditor
            waypoints={wps}
            onChange={setWps}
            height={undefined}
            initialCenter={initialCenter}
          />
          <div className="shrink-0 flex items-center justify-between px-6 py-3"
            style={{ borderTop: "1px solid hsl(var(--border))" }}>
            <span className="text-xs text-muted-foreground">
              {wps.length === 0
                ? "Кликни по карте чтобы добавить первую точку маршрута"
                : `${wps.length} точек добавлено`}
            </span>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost px-4 py-2 rounded-lg text-xs">
                Отмена
              </button>
              <button
                onClick={() => { setBuilderStep("details"); onClearError(); }}
                disabled={wps.length < 2}
                className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2"
                style={{ opacity: wps.length < 2 ? 0.5 : 1 }}
              >
                Далее — параметры <Icon name="ChevronRight" size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Шаг 2: Параметры миссии */}
      {builderStep === "details" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Превью маршрута (слева) */}
          <div className="flex-1 overflow-hidden">
            <WaypointEditor
              waypoints={wps}
              onChange={setWps}
              height={undefined}
            />
          </div>

          {/* Форма параметров (справа) */}
          <div className="w-80 shrink-0 flex flex-col p-6 space-y-4 overflow-y-auto"
            style={{ borderLeft: "1px solid hsl(var(--border))" }}>
            <h2 className="font-bold text-sm">Параметры миссии</h2>

            <div>
              <label className="hud-label block mb-1.5">Название</label>
              <input
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                placeholder="Патруль периметра Б"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                autoFocus
              />
            </div>

            <div>
              <label className="hud-label block mb-1.5">Дрон-исполнитель</label>
              <select
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                value={form.drone_id}
                onChange={e => setForm(f => ({ ...f, drone_id: e.target.value }))}
              >
                <option value="">Выбери дрон</option>
                {drones.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.status === "standby" ? "Готов" : d.status === "flight" ? "В полёте" : d.status} · {d.battery}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="hud-label block mb-1.5">Тип миссии</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(typeName).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setForm(f => ({ ...f, type: k }))}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                    style={form.type === k
                      ? { background: "rgba(0,212,255,0.12)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.35)" }
                      : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))" }
                    }
                  >
                    <Icon name={typeIcon[k] ?? "Navigation"} fallback="Navigation" size={12} />
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Воздушный эшелон */}
            <div>
              <label className="hud-label block mb-1.5 flex items-center gap-1.5">
                <Icon name="MoveVertical" size={11} style={{ color: "var(--electric)" }} />
                Воздушный эшелон (высота по умолчанию)
              </label>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {ALTITUDE_PRESETS.map(alt => (
                  <button
                    key={alt}
                    onClick={() => setForm(f => ({ ...f, defaultAltitude: f.defaultAltitude === alt ? null : alt }))}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={form.defaultAltitude === alt
                      ? { background: "rgba(0,255,136,0.15)", color: "var(--signal-green)", border: "1px solid rgba(0,255,136,0.4)" }
                      : { background: "hsl(var(--input))", color: "hsl(var(--muted-foreground))", border: "1px solid transparent" }
                    }
                  >
                    {alt}м
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="hud-label">Или вручную:</span>
                <input
                  type="number"
                  min={10}
                  max={500}
                  step={10}
                  placeholder="м"
                  value={form.defaultAltitude ?? ""}
                  onChange={e => setForm(f => ({ ...f, defaultAltitude: e.target.value === "" ? null : Number(e.target.value) }))}
                  className="w-20 px-2 py-1.5 rounded-lg text-xs text-center"
                  style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                />
                <span className="text-xs text-muted-foreground">AGL</span>
              </div>
              {form.defaultAltitude && (
                <p className="text-xs mt-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Применяется ко всем точкам без индивидуальной высоты
                </p>
              )}
            </div>

            {/* Сводка маршрута */}
            <div className="panel rounded-xl p-3 space-y-2">
              <div className="hud-label">Сводка маршрута</div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Точек</span>
                <span className="hud-value">{wps.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">С действиями</span>
                <span className="hud-value">{wps.filter(w => w.action).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Высота задана</span>
                <span className="hud-value">
                  {wps.filter(w => w.altitude).length > 0
                    ? `${wps.filter(w => w.altitude).length} точек`
                    : form.defaultAltitude
                      ? `${form.defaultAltitude}м (глобально)`
                      : <span style={{ color: "var(--danger)" }}>не задана</span>
                  }
                </span>
              </div>
            </div>

            {formError && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)" }}>
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={onSubmit}
                disabled={formLoading}
                className="btn-electric py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 font-semibold"
              >
                {formLoading
                  ? <><Icon name="Loader" size={13} className="animate-spin" /> Создаём…</>
                  : <><Icon name="CheckCircle" size={13} /> Создать миссию</>
                }
              </button>
              <button onClick={() => setBuilderStep("route")} className="btn-ghost py-2 rounded-lg text-xs">
                ← Назад к маршруту
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}