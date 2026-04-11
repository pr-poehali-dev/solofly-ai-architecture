import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CONNECT_URL    = "https://functions.poehali.dev/cdf76959-425f-4f9c-a2eb-491d28726328";
const TELEMETRY_URL  = "https://functions.poehali.dev/7e8bdc4b-1e8b-47c8-901c-462ebf450950";

interface DroneEntry {
  id: string;
  name: string;
  notes: string | null;
  hw_serial: string | null;
  drone_token: string;
  drone_token_preview: string;
  status: string;
  battery: number;
  altitude: number;
  last_seen: string | null;
  created_at: string;
}

const ARDUPILOT_MODES: Record<string, string> = {
  "0": "STABILIZE", "2": "ALT_HOLD", "3": "AUTO",
  "4": "GUIDED", "5": "LOITER", "6": "RTL",
  "9": "LAND", "16": "POSHOLD",
};

const STATUS_COLOR: Record<string, string> = {
  idle:    "var(--muted-foreground)",
  flight:  "var(--signal-green)",
  offline: "var(--danger)",
  charging:"var(--electric)",
};

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function timeAgo(iso: string | null): string {
  if (!iso) return "никогда";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 10)  return "только что";
  if (diff < 60)  return `${Math.round(diff)} сек назад`;
  if (diff < 3600) return `${Math.round(diff / 60)} мин назад`;
  return `${Math.round(diff / 3600)} ч назад`;
}

export default function DroneConnectPage() {
  const [drones,    setDrones]    = useState<DroneEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [form,      setForm]      = useState({ name: "", model: "Ardupilot" });
  const [registering, setRegistering] = useState(false);
  const [newDrone,  setNewDrone]  = useState<{ token: string; drone_id: string; name: string } | null>(null);
  const [copied,    setCopied]    = useState<string | null>(null);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [err,       setErr]       = useState<string | null>(null);

  const loadDrones = () => {
    fetch(`${CONNECT_URL}/?action=list`)
      .then(r => r.json())
      .then(r => setDrones(r.drones ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDrones(); }, []);

  const handleCopy = (text: string, key: string) => {
    copyText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegister = async () => {
    if (!form.name.trim()) { setErr("Введите название дрона"); return; }
    setRegistering(true);
    setErr(null);
    try {
      const res = await fetch(`${CONNECT_URL}/?action=register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: form.name.trim(), model: form.model }),
      });
      const data = await res.json();
      if (!data.ok) { setErr(data.error ?? "Ошибка"); return; }
      setNewDrone({ token: data.token, drone_id: data.drone_id, name: data.name });
      setForm({ name: "", model: "Ardupilot" });
      loadDrones();
    } catch {
      setErr("Нет соединения с сервером");
    } finally {
      setRegistering(false);
    }
  };

  // Генерируем готовый Python-скрипт для Raspberry Pi
  const getPiScript = (token: string, drone_id: string) => `#!/usr/bin/env python3
"""
SoloFly MAVLink Bridge — отправка телеметрии на сервер
Дрон: ${drone_id}
Установка: pip install pymavlink requests
Запуск:    python3 solofly_bridge.py
"""
import time, requests
from pymavlink import mavutil

DRONE_TOKEN  = "${token}"
TELEMETRY_URL = "${TELEMETRY_URL}/"
SERIAL_PORT  = "/dev/ttyAMA0"   # или /dev/ttyUSB0, tcp:127.0.0.1:5760
BAUD_RATE    = 57600             # для UART; для TCP не важно
INTERVAL_SEC = 1.0               # как часто отправлять данные

# Режимы Ardupilot
MODES = {0:"STABILIZE",2:"ALT_HOLD",3:"AUTO",4:"GUIDED",5:"LOITER",6:"RTL",9:"LAND"}

print(f"Подключаемся к дрону: {SERIAL_PORT}")
master = mavutil.mavlink_connection(SERIAL_PORT, baud=BAUD_RATE)
master.wait_heartbeat()
print("Дрон найден! Начинаем передачу телеметрии...")

tel = {}

while True:
    msg = master.recv_match(blocking=False)
    if msg:
        t = msg.get_type()
        if t == "GLOBAL_POSITION_INT":
            tel["lat"]      = msg.lat / 1e7
            tel["lon"]      = msg.lon / 1e7
            tel["altitude"] = msg.relative_alt / 1000.0
        elif t == "VFR_HUD":
            tel["speed"]   = msg.groundspeed
            tel["heading"] = msg.heading
        elif t == "SYS_STATUS":
            tel["battery"] = msg.battery_remaining
        elif t == "ATTITUDE":
            import math
            tel["roll"]  = round(math.degrees(msg.roll), 1)
            tel["pitch"] = round(math.degrees(msg.pitch), 1)
            tel["yaw"]   = round(math.degrees(msg.yaw), 1)
        elif t == "GPS_RAW_INT":
            tel["gps_sats"] = msg.satellites_visible
        elif t == "HEARTBEAT":
            tel["armed"] = bool(msg.base_mode & 128)
            tel["mode"]  = str(msg.custom_mode)
        elif t == "WIND":
            tel["wind"] = round(msg.speed, 1)

    if tel.get("lat") is not None:
        try:
            resp = requests.post(
                TELEMETRY_URL,
                json={"token": DRONE_TOKEN, **tel},
                timeout=3,
            )
            if resp.status_code == 200:
                d = resp.json()
                print(f"OK | {d.get('status','?')} | lat={tel.get('lat'):.5f} bat={tel.get('battery','?')}%")
            else:
                print(f"ERR {resp.status_code}: {resp.text[:80]}")
        except Exception as e:
            print(f"Нет связи: {e}")

    time.sleep(INTERVAL_SEC)
`;

  return (
    <div className="p-6 max-w-4xl mx-auto fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.25)" }}>
          <Icon name="Wifi" size={20} style={{ color: "var(--electric)" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Подключение дрона</h1>
          <p className="text-xs text-muted-foreground">Ardupilot / PX4 через MAVLink → Raspberry Pi → 4G → SoloFly</p>
        </div>
      </div>

      {/* Схема подключения */}
      <div className="panel rounded-2xl p-5 mb-6">
        <div className="hud-label mb-3">Схема подключения</div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: "Navigation", label: "Дрон\n(Ardupilot)", color: "var(--electric)" },
            { icon: "ArrowRight", label: "", color: "var(--muted-foreground)" },
            { icon: "Cpu", label: "Raspberry Pi\n(на борту)", color: "var(--signal-green)" },
            { icon: "ArrowRight", label: "", color: "var(--muted-foreground)" },
            { icon: "Wifi", label: "4G / WiFi\n(интернет)", color: "#a78bfa" },
            { icon: "ArrowRight", label: "", color: "var(--muted-foreground)" },
            { icon: "Server", label: "SoloFly\n(сервер)", color: "var(--electric)" },
            { icon: "ArrowRight", label: "", color: "var(--muted-foreground)" },
            { icon: "Monitor", label: "Ваш\nбраузер", color: "var(--signal-green)" },
          ].map((s, i) => s.label
            ? (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[56px]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                  <Icon name={s.icon} fallback="Circle" size={16} style={{ color: s.color }} />
                </div>
                <span className="text-center hud-label leading-tight whitespace-pre-line">{s.label}</span>
              </div>
            ) : (
              <Icon key={i} name="ArrowRight" size={14} style={{ color: s.color }} />
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Регистрация нового дрона */}
        <div className="panel rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Icon name="PlusCircle" size={15} style={{ color: "var(--electric)" }} />
            Зарегистрировать дрон
          </h2>

          <div className="space-y-3">
            <div>
              <label className="hud-label mb-1 block">Название дрона</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleRegister()}
                placeholder="Например: Разведчик-1"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="hud-label mb-1 block">Платформа</label>
              <select
                value={form.model}
                onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                className="input-field w-full"
              >
                <option value="Ardupilot">Ardupilot (Copter / Plane / Rover)</option>
                <option value="PX4">PX4 Flight Stack</option>
                <option value="DJI-SDK">DJI (через SDK)</option>
                <option value="Other">Другое</option>
              </select>
            </div>
            {err && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(255,59,48,0.1)", color: "var(--danger)" }}>
                {err}
              </div>
            )}
            <button
              onClick={handleRegister}
              disabled={registering}
              className="btn-electric w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              {registering
                ? <><Icon name="Loader" size={13} className="animate-spin" /> Регистрируем…</>
                : <><Icon name="Key" size={13} /> Получить токен</>
              }
            </button>
          </div>

          {/* Токен после регистрации */}
          {newDrone && (
            <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="CheckCircle" size={14} style={{ color: "var(--signal-green)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--signal-green)" }}>
                  Дрон {newDrone.name} зарегистрирован
                </span>
              </div>
              <div className="hud-label mb-1">Токен дрона (скопируй сейчас — больше не покажем)</div>
              <div className="flex items-center gap-2">
                <code className="text-xs flex-1 px-2 py-1.5 rounded-lg break-all"
                  style={{ background: "hsl(var(--sidebar-accent))", color: "var(--electric)" }}>
                  {newDrone.token}
                </code>
                <button onClick={() => handleCopy(newDrone.token, "token")}
                  className="shrink-0 p-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(0,212,255,0.1)", color: "var(--electric)" }}>
                  <Icon name={copied === "token" ? "Check" : "Copy"} size={14} />
                </button>
              </div>
              <button
                onClick={() => {
                  const script = getPiScript(newDrone.token, newDrone.drone_id);
                  const blob   = new Blob([script], { type: "text/plain" });
                  const a      = document.createElement("a");
                  a.href       = URL.createObjectURL(blob);
                  a.download   = "solofly_bridge.py";
                  a.click();
                }}
                className="mt-3 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: "rgba(0,212,255,0.08)", color: "var(--electric)", border: "1px solid rgba(0,212,255,0.2)" }}
              >
                <Icon name="Download" size={13} /> Скачать скрипт для Raspberry Pi (solofly_bridge.py)
              </button>
            </div>
          )}
        </div>

        {/* Инструкция */}
        <div className="panel rounded-2xl p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Icon name="BookOpen" size={15} style={{ color: "var(--electric)" }} />
            Как подключить за 5 шагов
          </h2>
          <ol className="space-y-3">
            {[
              { n:1, icon:"Navigation", title:"Подготовь дрон",    text:"Ardupilot или PX4, UART/USB подключён к Raspberry Pi" },
              { n:2, icon:"Cpu",        title:"Raspberry Pi",      text:"Нужен любой Raspberry Pi с интернетом (4G модем или WiFi)" },
              { n:3, icon:"Terminal",   title:"Установи библиотеки", text:"pip install pymavlink requests" },
              { n:4, icon:"Key",        title:"Получи токен",      text:"Зарегистрируй дрон слева → скачай готовый скрипт" },
              { n:5, icon:"Play",       title:"Запусти скрипт",    text:"python3 solofly_bridge.py — телеметрия пойдёт в приложение" },
            ].map(s => (
              <li key={s.n} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(0,212,255,0.12)", color: "var(--electric)" }}>
                  {s.n}
                </div>
                <div>
                  <div className="text-xs font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.text}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)", color: "rgba(167,139,250,0.9)" }}>
            <span className="font-semibold">Протокол UART:</span> подключи TX дрона → RX Pi, RX дрона → TX Pi, GND → GND. Порт: /dev/ttyAMA0, скорость 57600.
          </div>
        </div>
      </div>

      {/* Список дронов */}
      <div className="mt-6 panel rounded-2xl p-5">
        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Icon name="List" size={15} style={{ color: "var(--electric)" }} />
          Зарегистрированные дроны
          <span className="tag tag-electric ml-auto">{drones.length}</span>
        </h2>

        {loading ? (
          <div className="space-y-2">
            {[1,2].map(i => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "hsl(var(--sidebar-accent))" }} />)}
          </div>
        ) : drones.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            <Icon name="Navigation" size={32} style={{ color: "hsl(var(--border))", marginBottom: 8 }} />
            <div>Дронов ещё нет — зарегистрируй первый</div>
          </div>
        ) : (
          <div className="space-y-2">
            {drones.map(d => {
              const color    = STATUS_COLOR[d.status] ?? "var(--muted-foreground)";
              const isOnline = d.last_seen && (Date.now() - new Date(d.last_seen).getTime()) < 15000;
              return (
                <div key={d.id}>
                  <button
                    onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{ background: expanded === d.id ? "rgba(0,212,255,0.06)" : "hsl(var(--sidebar-accent))",
                             border: `1px solid ${expanded === d.id ? "rgba(0,212,255,0.2)" : "transparent"}` }}
                  >
                    <span className={isOnline ? "dot-online" : "dot-offline"} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{d.name}</div>
                      <div className="hud-label">{d.id} · {d.notes ?? "Ardupilot"}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold" style={{ color }}>{d.status}</div>
                      <div className="hud-label">{timeAgo(d.last_seen)}</div>
                    </div>
                    <Icon name={expanded === d.id ? "ChevronUp" : "ChevronDown"} size={14}
                      style={{ color: "var(--muted-foreground)" }} />
                  </button>

                  {expanded === d.id && (
                    <div className="mx-1 mb-2 p-4 rounded-b-xl space-y-3"
                      style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,212,255,0.1)", borderTop: "none" }}>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div><div className="hud-label">Батарея</div><div className="font-semibold">{d.battery ?? "—"}%</div></div>
                        <div><div className="hud-label">Высота</div><div className="font-semibold">{d.altitude ?? "—"} м</div></div>
                        <div><div className="hud-label">Статус</div><div className="font-semibold" style={{ color }}>{d.status}</div></div>
                      </div>

                      <div>
                        <div className="hud-label mb-1">Токен для Raspberry Pi</div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs flex-1 px-2 py-1.5 rounded-lg truncate"
                            style={{ background: "hsl(var(--sidebar-accent))", color: "var(--electric)" }}>
                            {d.drone_token_preview ?? d.drone_token}
                          </code>
                          <button onClick={() => handleCopy(d.drone_token, `t-${d.id}`)}
                            className="shrink-0 p-1.5 rounded-lg"
                            style={{ background: "rgba(0,212,255,0.1)", color: "var(--electric)" }}>
                            <Icon name={copied === `t-${d.id}` ? "Check" : "Copy"} size={13} />
                          </button>
                          <button
                            onClick={() => {
                              const blob = new Blob([getPiScript(d.drone_token, d.id)], { type: "text/plain" });
                              const a    = document.createElement("a");
                              a.href     = URL.createObjectURL(blob);
                              a.download = `solofly_bridge_${d.id}.py`;
                              a.click();
                            }}
                            className="shrink-0 p-1.5 rounded-lg"
                            style={{ background: "rgba(0,212,255,0.1)", color: "var(--electric)" }}>
                            <Icon name="Download" size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Зарегистрирован: {new Date(d.created_at).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
