import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useMissions } from "@/hooks/useMissions";
import { useLiveFleet } from "@/hooks/useLiveFleet";
import { missions as missionsApi } from "@/lib/api";
import type { Mission } from "@/lib/api";
import type { Waypoint } from "@/components/map/WaypointEditor";
import MissionList    from "./missions/MissionList";
import MissionDetail  from "./missions/MissionDetail";
import MissionBuilder from "./missions/MissionBuilder";

export default function MissionsPage() {
  const { data, loading, updateMission, refresh } = useMissions({}, 5000);
  const { data: fleet } = useLiveFleet(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Конструктор миссии
  const [showBuilder, setShowBuilder]     = useState(false);
  const [builderStep, setBuilderStep]     = useState<"route" | "details">("route");
  const [wps, setWps]                     = useState<Waypoint[]>([]);
  const [formLoading, setFormLoading]     = useState(false);
  const [formError, setFormError]         = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", drone_id: "", type: "patrol" });

  const openBuilder = () => {
    setWps([]);
    setForm({ name: "", drone_id: "", type: "patrol" });
    setFormError(null);
    setBuilderStep("route");
    setShowBuilder(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.drone_id) {
      setFormError("Заполни название и выбери дрон");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      const code = `MSN-${String(Date.now()).slice(-6)}`;
      await missionsApi.create({
        code,
        name:           form.name.trim(),
        drone_id:       form.drone_id,
        type:           form.type,
        waypoints:      wps.length,
        waypoints_json: wps.map(w => ({ lat: w.lat, lon: w.lon, action: w.action ?? null })),
        tasks:          wps.filter(w => w.action).map(w => w.action!),
      });
      setShowBuilder(false);
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

  const drones = fleet?.drones ?? [];
  const initialCenter = drones[0]?.lat
    ? { lat: Number(drones[0].lat), lon: Number(drones[0].lon) }
    : undefined;

  return (
    <div className="p-6 fade-up">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold">Планирование миссий</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Данные из БД · обновление каждые 5 сек
            {data && <span className="ml-2 text-muted-foreground">({data.total} миссий)</span>}
          </p>
        </div>
        <button
          onClick={openBuilder}
          className="btn-electric px-4 py-2 rounded-lg text-xs flex items-center gap-2"
        >
          <Icon name="Plus" size={13} />
          Новая миссия
        </button>
      </div>

      {/* Конструктор миссии (полный экран) */}
      {showBuilder && (
        <MissionBuilder
          builderStep={builderStep}
          setBuilderStep={setBuilderStep}
          wps={wps}
          setWps={setWps}
          form={form}
          setForm={setForm}
          formLoading={formLoading}
          formError={formError}
          drones={drones}
          initialCenter={initialCenter}
          onClose={() => setShowBuilder(false)}
          onSubmit={handleCreate}
          onClearError={() => setFormError(null)}
        />
      )}

      {/* Stats bar */}
      {data && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { label: "Активных",      val: data.stats.active  ?? 0, cls: "tag-green"   },
            { label: "Запланировано", val: data.stats.planned ?? 0, cls: "tag-electric" },
            { label: "Завершено",     val: data.stats.done    ?? 0, cls: "tag-muted"   },
            { label: "Прервано",      val: data.stats.aborted ?? 0, cls: "tag-danger"  },
          ].map(s => (
            <div key={s.label} className="panel px-4 py-2 rounded-xl flex items-center gap-2">
              <span className={`tag ${s.cls}`}>{s.val}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Список миссий */}
        <div className="lg:col-span-2">
          <MissionList
            loading={loading}
            missions={missionsList}
            selectedId={selectedId ?? sel?.id ?? null}
            onSelect={id => setSelectedId(id)}
          />
        </div>

        {/* Детали миссии */}
        <div className="lg:col-span-3 panel rounded-xl overflow-hidden">
          <MissionDetail
            sel={sel}
            loading={loading}
            drones={drones}
            onStart={handleStart}
            onPause={handlePause}
            onAbort={handleAbort}
          />
        </div>
      </div>
    </div>
  );
}