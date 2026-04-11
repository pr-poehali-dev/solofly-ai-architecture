// Вкладка «Аналитика» — сводка, таблица по бортам, активные алерты
import Icon from "@/components/ui/icon";
import type { FleetAnalytics } from "@/lib/api";
import { ROLE_LABEL, ROLE_COLOR, STATUS_CLS, STATUS_LABEL, STATUS_DOT, fmtDate } from "./ucpTypes";

interface AnalyticsTabProps {
  analytics: FleetAnalytics;
  onSelectDrone: (id: string) => void;
}

export default function AnalyticsTab({ analytics, onSelectDrone }: AnalyticsTabProps) {
  const stats = analytics.stats;

  return (
    <div className="space-y-5">
      {/* Сводка */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: "Plane",   label: "Всего полётов",    val: (stats.total_flights ?? 0).toLocaleString("ru-RU"), color: "var(--electric)" },
          { icon: "Clock",   label: "Налёт, часов",     val: `${stats.total_hours ?? 0} ч`,                      color: "var(--signal-green)" },
          { icon: "Route",   label: "Пройдено, км",     val: `${stats.total_km ?? 0} км`,                        color: "#a78bfa" },
          { icon: "Battery", label: "Ср. заряд",         val: `${Math.round(stats.avg_battery ?? 0)}%`,           color: stats.avg_battery && stats.avg_battery > 40 ? "var(--signal-green)" : "var(--warning)" },
          { icon: "Wifi",    label: "Ср. GPS спутников", val: analytics.sensors.avg_gps != null ? `${Number(analytics.sensors.avg_gps).toFixed(1)}` : "—", color: "var(--electric)" },
          { icon: "Cpu",     label: "Ср. загрузка CPU",  val: analytics.sensors.avg_cpu != null ? `${Math.round(Number(analytics.sensors.avg_cpu))}%` : "—", color: "#f97316" },
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

      {/* Таблица по бортам */}
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
                onClick={() => onSelectDrone(d.id)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={STATUS_DOT[d.status] ?? "dot-offline"} />
                    <div>
                      <div className="text-xs font-semibold">{d.name}</div>
                      <div className="hud-label">{d.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`tag ${STATUS_CLS[d.status] ?? "tag-muted"}`}>{STATUS_LABEL[d.status] ?? d.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: ROLE_COLOR[d.role ?? "scout"] }}>
                    {ROLE_LABEL[d.role ?? "scout"] ?? d.role}
                  </span>
                </td>
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
                <Icon
                  name={a.level === "error" ? "AlertOctagon" : "AlertTriangle"}
                  size={14}
                  style={{ color: a.level === "error" ? "var(--danger)" : "var(--warning)" }}
                  className="mt-0.5 shrink-0"
                />
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
  );
}
