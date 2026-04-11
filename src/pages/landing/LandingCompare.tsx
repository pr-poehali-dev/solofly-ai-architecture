import Icon from "@/components/ui/icon";

const FEATURES = [
  { label: "Серверы в России (152-ФЗ)", solofly: true, wheelies: false, ugcs: false, dji: false },
  { label: "Автономность без GPS", solofly: true, wheelies: true, ugcs: false, dji: false },
  { label: "Открытый стек MAVLink / Ardupilot / PX4", solofly: true, wheelies: false, ugcs: true, dji: false },
  { label: "Рой до 20 БПЛА", solofly: true, wheelies: true, ugcs: false, dji: true },
  { label: "3D сканирование в облаке", solofly: true, wheelies: false, ugcs: false, dji: false },
  { label: "Объяснимый ИИ (XAI)", solofly: true, wheelies: false, ugcs: false, dji: false },
  { label: "Веб без установки ПО", solofly: true, wheelies: true, ugcs: false, dji: true },
  { label: "Независимость от санкций", solofly: true, wheelies: true, ugcs: false, dji: false },
  { label: "SaaS-подписка от 2 900 ₽", solofly: true, wheelies: false, ugcs: false, dji: false },
];

const COLS = [
  { key: "solofly", label: "SoloFly", sub: "Наш продукт", highlight: true },
  { key: "wheelies", label: "Wheelies", sub: "ITG" },
  { key: "ugcs", label: "UgCS", sub: "SPH Engineering" },
  { key: "dji", label: "DJI FlightHub", sub: "DJI (Китай)" },
];

export default function LandingCompare() {
  return (
    <section className="px-6 py-24 max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <div className="tag tag-green mb-4">Сравнение</div>
        <h2 className="text-4xl font-bold mb-4">
          SoloFly против<br /><span className="gradient-text">конкурентов</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Единственная российская облачная платформа с открытым стеком и объяснимым ИИ.
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(0,212,255,0.15)" }}>
        {/* Header */}
        <div className="grid grid-cols-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="p-4" />
          {COLS.map(col => (
            <div key={col.key} className="p-4 text-center"
              style={{
                background: col.highlight ? "rgba(0,212,255,0.06)" : "rgba(255,255,255,0.01)",
                borderLeft: col.highlight ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(255,255,255,0.04)",
              }}>
              {col.highlight && (
                <div className="text-xs font-bold mb-1 px-2 py-0.5 rounded-full mx-auto w-fit"
                  style={{ background: "rgba(0,212,255,0.15)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.3)" }}>
                  Наш выбор
                </div>
              )}
              <div className="font-bold text-sm"
                style={{ color: col.highlight ? "var(--electric)" : "hsl(var(--foreground))" }}>
                {col.label}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{col.sub}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {FEATURES.map((feat, idx) => (
          <div key={feat.label}
            className="grid grid-cols-5 border-b transition-all hover:brightness-110"
            style={{
              borderColor: "rgba(255,255,255,0.04)",
              background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
            }}>
            <div className="p-4 flex items-center">
              <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{feat.label}</span>
            </div>
            {COLS.map(col => {
              const val = feat[col.key as keyof typeof feat] as boolean;
              return (
                <div key={col.key} className="p-4 flex items-center justify-center"
                  style={{
                    background: col.highlight ? "rgba(0,212,255,0.03)" : undefined,
                    borderLeft: col.highlight ? "1px solid rgba(0,212,255,0.1)" : "1px solid rgba(255,255,255,0.03)",
                  }}>
                  {val ? (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: col.highlight ? "rgba(0,212,255,0.15)" : "rgba(0,255,136,0.1)",
                        border: `1px solid ${col.highlight ? "rgba(0,212,255,0.3)" : "rgba(0,255,136,0.2)"}`,
                      }}>
                      <Icon name="Check" size={12} style={{ color: col.highlight ? "var(--electric)" : "var(--signal-green)" }} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <Icon name="X" size={12} style={{ color: "rgba(255,255,255,0.2)" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Footer row */}
        <div className="grid grid-cols-5 p-4"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center">
            <span className="text-xs font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>Итого</span>
          </div>
          {COLS.map(col => {
            const count = FEATURES.filter(f => f[col.key as keyof typeof f]).length;
            return (
              <div key={col.key} className="flex items-center justify-center"
                style={{ borderLeft: col.highlight ? "1px solid rgba(0,212,255,0.1)" : "1px solid rgba(255,255,255,0.03)" }}>
                <span className="text-xl font-bold"
                  style={{ color: col.highlight ? "var(--electric)" : count >= 6 ? "var(--signal-green)" : count >= 4 ? "var(--warning)" : "rgba(255,255,255,0.3)" }}>
                  {count}<span className="text-xs font-normal ml-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>/{FEATURES.length}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "hsl(var(--muted-foreground))" }}>
        * Данные основаны на публичной документации конкурентов. Обновлено апрель 2026.
      </p>
    </section>
  );
}
