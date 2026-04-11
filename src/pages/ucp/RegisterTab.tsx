// Вкладка «Регистрация» — форма + инструкция + список бортов
import { useState } from "react";
import Icon from "@/components/ui/icon";
import { fleet, type Drone } from "@/lib/api";
import { ROLE_LABEL, STATUS_CLS, STATUS_LABEL, STATUS_DOT, EMPTY_FORM } from "./ucpTypes";

// ─── Форма регистрации ────────────────────────────────────────────────────────

interface RegisterFormProps {
  onDone: () => void;
  onCancel: () => void;
}

function RegisterForm({ onDone, onCancel }: RegisterFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
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

  const Field = ({ label, k, type = "text", placeholder = "" }: {
    label: string; k: keyof typeof EMPTY_FORM; type?: string; placeholder?: string;
  }) => (
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
        <button type="submit" disabled={saving}
          className="btn-electric flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50">
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

// ─── Вкладка «Регистрация» ────────────────────────────────────────────────────

interface RegisterTabProps {
  drones: Drone[];
  onDone: () => void;
  onCancel: () => void;
}

export default function RegisterTab({ drones, onDone, onCancel }: RegisterTabProps) {
  return (
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
        <RegisterForm onDone={onDone} onCancel={onCancel} />
      </div>

      <div className="space-y-4">
        <div className="panel rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-3">Инструкция</h2>
          <div className="space-y-3">
            {[
              { step: "1", title: "ID дрона",          desc: "Уникальный идентификатор: буквы, цифры, дефис. Пример: SF-005, UAV-001" },
              { step: "2", title: "Характеристики",    desc: "Масса, количество моторов, ёмкость АКБ, максимальная скорость" },
              { step: "3", title: "Прошивка и ИИ",     desc: "Версия прошивки и модель ИИ-навигации (PathNet-v4.2 по умолчанию)" },
              { step: "4", title: "Подтверждение",     desc: "После регистрации дрон появится в системе со статусом Офлайн" },
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
  );
}
