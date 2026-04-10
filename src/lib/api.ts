// Центральный модуль запросов к бэкенду SoloFly
// URL берутся из func2url.json (деплой через poehali.dev)

const URLS = {
  fleet:     "https://functions.poehali.dev/21020cdf-872f-4fa8-a1e5-d5223c9c3c41",
  missions:  "https://functions.poehali.dev/d2865279-6dc9-4923-871e-26325690a78c",
  telemetry: "https://functions.poehali.dev/7a62b084-e700-4e06-a220-52002779affc",
  events:    "https://functions.poehali.dev/9aa3b44f-f711-4afb-897f-610623caf2da",
};

async function req<T>(
  fn: keyof typeof URLS,
  path = "/",
  options: RequestInit = {}
): Promise<T> {
  const url = URLS[fn] + (path === "/" ? "" : path);
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`${fn} ${res.status}`);
  return res.json();
}

// ─── Fleet ───────────────────────────────────────────────────────────────────

export interface Drone {
  id: string;
  name: string;
  role: string;
  status: string;
  battery: number;
  altitude: number;
  speed: number;
  heading: number;
  lat: number;
  lon: number;
  wind: number;
  temperature: number;
  vibration: string;
  gps_sats: number;
  ai_model: string;
  hw_weight: number;
  hw_motors: number;
  hw_battery_cap: number;
  hw_max_speed: number;
  updated_at: string;
  current_mission?: {
    code: string; name: string; type: string; status: string; progress: number;
  } | null;
  telemetry_history?: TelemetryPoint[];
}

export interface FleetResponse {
  drones: Drone[];
  total: number;
  flying: number;
}

export const fleet = {
  getAll: () => req<FleetResponse>("fleet", "/"),
  getOne: (id: string) =>
    req<{ drone: Drone }>("fleet", `/?id=${encodeURIComponent(id)}`),
  update: (data: Partial<Drone> & { id: string }) =>
    req<{ ok: boolean }>("fleet", "/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Telemetry ────────────────────────────────────────────────────────────────

export interface TelemetryPoint {
  battery: number;
  altitude: number;
  speed: number;
  heading: number;
  lat: number;
  lon: number;
  roll: number;
  pitch: number;
  yaw: number;
  wind: number;
  temperature: number;
  cpu_load: number;
  ai_confidence: number;
  ts: string;
}

export interface TelemetryResponse {
  drone_id: string;
  points: TelemetryPoint[];
  total: number;
}

export const telemetry = {
  get: (droneId: string, limit = 50) =>
    req<TelemetryResponse>(
      "telemetry",
      `/?drone_id=${encodeURIComponent(droneId)}&limit=${limit}`
    ),
  simulate: () =>
    req<{ ok: boolean; simulated: number }>("telemetry", "/?action=simulate", {
      method: "POST",
      body: JSON.stringify({}),
    }),
};

// ─── Missions ─────────────────────────────────────────────────────────────────

export interface Mission {
  id: number;
  code: string;
  name: string;
  drone_id: string;
  drone_name?: string;
  type: string;
  status: string;
  progress: number;
  waypoints: number;
  tasks: string[];
  weather_wind: number;
  weather_vis: string;
  weather_temp: number;
  weather_risk: string;
  obstacles_avoided: number;
  route_adjustments: number;
  distance_km: number;
  start_time: string | null;
  eta: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface MissionsResponse {
  missions: Mission[];
  total: number;
  stats: Record<string, number>;
}

export const missions = {
  getAll: (params?: { status?: string; drone_id?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return req<MissionsResponse>("missions", qs ? `/?${qs}` : "/");
  },
  getOne: (id: number) =>
    req<{ mission: Mission }>("missions", `/?id=${id}`),
  create: (data: {
    code: string; name: string; drone_id: string; type: string;
    waypoints?: number; tasks?: string[];
    weather_wind?: number; weather_vis?: string;
    weather_temp?: number; weather_risk?: string;
  }) => req<{ ok: boolean; id: number; code: string }>("missions", "/", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Pick<Mission, "status" | "progress" | "obstacles_avoided" | "route_adjustments" | "distance_km">>) =>
    req<{ ok: boolean }>("missions", `/?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ─── Events ───────────────────────────────────────────────────────────────────

export interface SystemEvent {
  id: number;
  drone_id: string | null;
  mission_id: number | null;
  level: string;
  category: string;
  message: string;
  resolved: boolean;
  ts: string;
}

export interface EventsResponse {
  events: SystemEvent[];
  total: number;
  unresolved: number;
}

export interface AIModel {
  id: number;
  name: string;
  accuracy: number;
  cycles: number;
  updated_at: string;
}

export interface AIModelsResponse {
  models: AIModel[];
  total_models: number;
  avg_accuracy: number;
  total_cycles: number;
}

export const events = {
  getAll: (params?: { level?: string; drone_id?: string; unresolved?: boolean }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params || {})
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      )
    ).toString();
    return req<EventsResponse>("events", qs ? `/?${qs}` : "/");
  },
  getAIModels: () =>
    req<AIModelsResponse>("events", "/?type=ai"),
  create: (data: { level: string; category: string; message: string; drone_id?: string; mission_id?: number }) =>
    req<{ ok: boolean; id: number }>("events", "/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resolve: (id: number) =>
    req<{ ok: boolean }>("events", `/?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ resolved: true }),
    }),
};