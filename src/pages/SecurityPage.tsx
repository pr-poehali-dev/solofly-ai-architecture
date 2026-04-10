import { useState } from "react";
import Icon from "@/components/ui/icon";

const accessLog = [
  { user: "Оператор #1", action: "Вход в систему", ip: "192.168.1.10", time: "14:31", ok: true },
  { user: "API (SF-001)", action: "Обновление модели PathNet", ip: "10.0.0.1", time: "14:28", ok: true },
  { user: "Неизвестно", action: "Неудачная аутентификация", ip: "91.234.78.12", time: "13:44", ok: false },
  { user: "Оператор #2", action: "Экспорт полётных данных", ip: "192.168.1.14", time: "12:10", ok: true },
];

const emergencyScenarios = [
  { id: "rtb", name: "Возврат на базу (RTB)", trigger: "Потеря связи > 30 сек", status: "ready", priority: 1 },
  { id: "land", name: "Безопасная посадка", trigger: "Батарея < 10% или критич. отказ", status: "ready", priority: 2 },
  { id: "hold", name: "Режим ожидания (Loiter)", trigger: "Кратковременная потеря сигнала", status: "ready", priority: 3 },
  { id: "wipe", name: "Самоуничтожение данных", trigger: "Сигнал захвата / команда оператора", status: "armed", priority: 4 },
];

export default function SecurityPage() {
  const [wipeConfirm, setWipeConfirm] = useState(false);

  return (
    <div className="p-6 space-y-5 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Безопасность системы</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Шифрование · Защита · Аварийные протоколы (раздел 5)</p>
        </div>
        <span className="tag tag-green flex items-center gap-1.5">
          <span className="dot-online" />
          Статус защиты: Норма
        </span>
      </div>

      {/* Security status overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Шифрование каналов", val: "AES-256", icon: "Lock", ok: true },
          { label: "Попыток взлома (24ч)", val: "1", icon: "ShieldAlert", ok: false },
          { label: "Сертификат TLS", val: "v1.3", icon: "Shield", ok: true },
          { label: "Последний аудит", val: "Сегодня", icon: "CheckSquare", ok: true },
        ].map(s => (
          <div key={s.label} className={`panel p-4 rounded-xl ${!s.ok ? "border-[rgba(255,59,48,0.3)]" : ""}`} style={!s.ok ? { borderColor: "rgba(255,59,48,0.3)" } : {}}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: s.ok ? "rgba(0,255,136,0.1)" : "rgba(255,59,48,0.1)" }}>
              <Icon name={s.icon} fallback="Lock" size={14} style={{ color: s.ok ? "var(--signal-green)" : "var(--danger)" }} />
            </div>
            <div className="hud-value text-lg mb-0.5" style={{ color: s.ok ? "hsl(var(--foreground))" : "var(--danger)" }}>{s.val}</div>
            <div className="hud-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Encryption */}
        <div className="panel rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4">Защита каналов связи</h2>
          <div className="space-y-2">
            {[
              { label: "Телеметрия (борт → сервер)", proto: "AES-256 + TLS 1.3", status: "active" },
              { label: "Управляющие команды", proto: "AES-256 + HMAC-SHA256", status: "active" },
              { label: "Видеопоток", proto: "AES-256-GCM", status: "active" },
              { label: "API внешние запросы", proto: "TLS 1.3 + JWT RS256", status: "active" },
              { label: "Межсистемный обмен (рой)", proto: "DTLS 1.2 + Ed25519", status: "active" },
              { label: "Обновления моделей ИИ", proto: "Подпись SHA-512 + AES-256", status: "active" },
            ].map(c => (
              <div key={c.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "hsl(var(--input))" }}>
                <div>
                  <div className="text-xs font-medium">{c.label}</div>
                  <div className="hud-label mt-0.5">{c.proto}</div>
                </div>
                <span className="dot-online shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Emergency scenarios */}
        <div className="panel-danger rounded-xl p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--danger)" }}>
            <Icon name="AlertOctagon" size={15} />
            Аварийные протоколы
          </h2>
          <div className="space-y-3 mb-4">
            {emergencyScenarios.map(s => (
              <div key={s.id} className="p-3 rounded-xl" style={{ background: s.id === "wipe" ? "rgba(255,59,48,0.08)" : "hsl(var(--input))" }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="hud-value text-xs" style={{ color: "var(--electric)" }}>#{s.priority}</span>
                    <span className="font-semibold text-xs">{s.name}</span>
                  </div>
                  <span className={`tag ${s.status === "armed" ? "tag-danger" : "tag-green"}`}>
                    {s.status === "armed" ? "Взведён" : "Готов"}
                  </span>
                </div>
                <div className="hud-label">Триггер: {s.trigger}</div>
              </div>
            ))}
          </div>
          {!wipeConfirm ? (
            <button
              onClick={() => setWipeConfirm(true)}
              className="w-full py-2.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: "rgba(255,59,48,0.12)", border: "1px solid rgba(255,59,48,0.35)", color: "var(--danger)" }}
            >
              Инициировать самоуничтожение данных
            </button>
          ) : (
            <div className="p-3 rounded-xl" style={{ background: "rgba(255,59,48,0.12)", border: "1px solid rgba(255,59,48,0.4)" }}>
              <p className="text-xs mb-3" style={{ color: "var(--danger)" }}>
                Все полётные данные, ключи и модели будут безвозвратно удалены. Подтвердите действие.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg text-xs font-bold" style={{ background: "var(--danger)", color: "white" }}>Подтвердить</button>
                <button onClick={() => setWipeConfirm(false)} className="flex-1 py-2 rounded-lg text-xs font-medium panel">Отмена</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Access log */}
      <div className="panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Журнал доступа</h2>
          <div className="flex gap-2">
            <button className="btn-ghost px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
              <Icon name="Download" size={12} /> CSV
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {accessLog.map((l, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: l.ok ? "hsl(var(--input))" : "rgba(255,59,48,0.07)", border: l.ok ? "none" : "1px solid rgba(255,59,48,0.25)" }}>
              <Icon name={l.ok ? "CheckCircle" : "XCircle"} size={14} style={{ color: l.ok ? "var(--signal-green)" : "var(--danger)" }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs">{l.user}</div>
                <div className="hud-label">{l.action}</div>
              </div>
              <span className="hud-label font-mono">{l.ip}</span>
              <span className="hud-label shrink-0">{l.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Standards */}
      <div className="panel rounded-xl p-5">
        <h2 className="font-semibold text-sm mb-4">Соответствие стандартам</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { std: "NIST SP 800-82", desc: "Кибербезопасность промышленных систем", ok: true },
            { std: "DO-326A", desc: "Авиационная кибербезопасность", ok: true },
            { std: "FIPS 140-2", desc: "Криптографические модули", ok: true },
            { std: "GDPR (данные полётов)", desc: "Защита данных операторов", ok: true },
          ].map(s => (
            <div key={s.std} className="p-4 rounded-xl text-center" style={{ background: "hsl(var(--input))" }}>
              <Icon name="ShieldCheck" size={20} style={{ color: "var(--signal-green)" }} className="mx-auto mb-2" />
              <div className="font-bold text-xs mb-1">{s.std}</div>
              <div className="hud-label">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
