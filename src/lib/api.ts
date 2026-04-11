// Центральный модуль запросов к бэкенду SoloFly
// URL берутся из func2url.json (деплой через poehali.dev)

const URLS = {
  fleet:     "https://functions.poehali.dev/21020cdf-872f-4fa8-a1e5-d5223c9c3c41",
  missions:  "https://functions.poehali.dev/d2865279-6dc9-4923-871e-26325690a78c",
  telemetry: "https://functions.poehali.dev/7a62b084-e700-4e06-a220-52002779affc",
  events:    "https://functions.poehali.dev/9aa3b44f-f711-4afb-897f-610623caf2da",
  scanning:  "https://functions.poehali.dev/8f8ffd51-a285-42f6-9148-f178ea5947c4",
  presence:  "https://functions.poehali.dev/5b06fdf4-7c9d-4b21-838b-0b3498110a8d",
  auth:      "https://functions.poehali.dev/673a3df3-6c29-4329-8ed8-5e321ed71a9d",
  billing:        "https://functions.poehali.dev/e1809c69-3d90-440b-8b7b-44cc4b722bfc",
  droneConnect:   "https://functions.poehali.dev/cdf76959-425f-4f9c-a2eb-491d28726328",
  droneTelemetry: "https://functions.poehali.dev/7e8bdc4b-1e8b-47c8-901c-462ebf450950",
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
  // ЦУП-поля
  registered_by?: string;
  firmware_ver?: string;
  serial_num?: string;
  notes?: string;
  total_flights?: number;
  total_hours?: number;
  total_km?: number;
  last_seen_at?: string;
  // Поля реального дрона (MAVLink)
  drone_token?: string;
  hw_serial?: string;
  last_seen?: string;
  flight_mode?: string;
  is_real?: boolean; // true = реальный дрон онлайн
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

export interface FleetAnalytics {
  fleet: Drone[];
  stats: {
    flying: number; standby: number; charging: number; offline: number; errors: number;
    avg_battery: number; min_battery: number;
    total_flights: number; total_hours: number; total_km: number;
  };
  alerts: { drone_id: string; level: string; category: string; message: string; ts: string }[];
  sensors: { avg_gps: number | null; avg_cpu: number | null; avg_ai: number | null };
}

export interface DroneConnection {
  id: number;
  drone_id: string;
  event: string;
  ip_addr: string | null;
  signal_db: number | null;
  link_quality: number | null;
  ts: string;
}

export const fleet = {
  getAll: () => req<FleetResponse>("fleet", "/"),
  command: (drone_id: string, maneuver: string) =>
    req<{ ok: boolean; drone_id: string; maneuver: string; queued_at: string }>("fleet", "/?action=command", {
      method: "POST",
      body: JSON.stringify({ drone_id, maneuver }),
    }),
  getOne: (id: string) =>
    req<{ drone: Drone }>("fleet", `/?id=${encodeURIComponent(id)}`),
  getAnalytics: () =>
    req<FleetAnalytics>("fleet", "/?action=analytics"),
  getConnections: (id: string) =>
    req<{ connections: DroneConnection[]; total: number }>("fleet", `/?action=connections&id=${encodeURIComponent(id)}`),
  update: (data: Partial<Drone> & { id: string }) =>
    req<{ ok: boolean }>("fleet", "/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: {
    id: string; name: string; role?: string;
    hw_weight?: number; hw_motors?: number; hw_battery_cap?: number; hw_max_speed?: number;
    ai_model?: string; firmware_ver?: string; serial_num?: string; notes?: string;
  }) => req<{ ok: boolean; id: string; name: string }>("fleet", "/?action=register", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  patch: (id: string, data: Partial<Pick<Drone,
    "name" | "role" | "ai_model" | "hw_weight" | "hw_motors" | "hw_battery_cap" | "hw_max_speed" | "status"
  > & { firmware_ver?: string; serial_num?: string; notes?: string }>) =>
    req<{ ok: boolean }>("fleet", `/?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    req<{ ok: boolean; deleted: string }>("fleet", `/?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
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
  waypoints_json?: { lat: number; lon: number; action?: string | null }[];
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
    waypoints?: number;
    waypoints_json?: { lat: number; lon: number; action?: string | null }[];
    tasks?: string[];
    weather_wind?: number; weather_vis?: string;
    weather_temp?: number; weather_risk?: string;
  }) => req<{ ok: boolean; id: number; code: string }>("missions", "/", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: number, data: Partial<Pick<Mission, "status" | "progress" | "obstacles_avoided" | "route_adjustments" | "distance_km" | "waypoints_json">>) =>
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

export interface ExplainFactor {
  label: string;
  val:   string;
  ok:    boolean;
}

export interface ExplainResponse {
  maneuver:      string;
  drone_id:      string;
  model:         string;
  trigger:       string;
  factors:       ExplainFactor[];
  alternatives:  string[];
  recent_events: { level: string; category: string; message: string; ts: string }[];
  confidence:    number;
  decision_ms:   number;
}

// ─── Scanning ─────────────────────────────────────────────────────────────────

export interface ScanSession {
  id: number;
  code: string;
  drone_id: string;
  drone_name?: string;
  scan_mode: string;
  target_mode: string;
  status: string;
  range_m: number;
  resolution_cm: number;
  frequency_hz: number;
  fov_deg: number;
  coverage_pct: number;
  area_km2: number;
  points_total: number;
  objects_found: number;
  accuracy_m: number | null;
  result_url: string | null;
  result_size_kb: number;
  result_format: string;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface ScanSessionsResponse {
  sessions: ScanSession[];
  total: number;
  stats: Record<string, number>;
}

export interface SaveScanResult {
  ok: boolean;
  url: string;
  key: string;
  size_kb: number;
  code: string;
}

export const scanning = {
  getAll: (params?: { drone_id?: string; scan_mode?: string; status?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params || {}).filter(([, v]) => v))
    ).toString();
    return req<ScanSessionsResponse>("scanning", qs ? `/?${qs}` : "/");
  },
  getOne: (id: number) =>
    req<{ session: ScanSession }>("scanning", `/?id=${id}`),
  create: (data: { mode: string; drone_id: string; target_mode?: string }) =>
    req<{ ok: boolean; id: number; code: string }>("scanning", "/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  save: (id: number, log: string[], coverage_pct = 100) =>
    req<SaveScanResult>("scanning", "/?action=save", {
      method: "POST",
      body: JSON.stringify({ id, log, coverage_pct }),
    }),
  update: (id: number, data: Partial<Pick<ScanSession, "status" | "coverage_pct" | "points_total" | "objects_found">>) =>
    req<{ ok: boolean }>("scanning", `/?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    req<{ ok: boolean }>("scanning", `/?id=${id}`, { method: "DELETE" }),
};

// ─── Events ───────────────────────────────────────────────────────────────────

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
  explain: (drone_id: string, maneuver: string) =>
    req<ExplainResponse>("events", `/?type=explain&drone_id=${encodeURIComponent(drone_id)}&maneuver=${encodeURIComponent(maneuver)}`),
};

// ─── Presence (совместная работа операторов) ──────────────────────────────────

export interface OperatorPresence {
  id:          number;
  operator_id: string;
  name:        string;
  color:       string;
  lat:         number;
  lon:         number;
  heading:     number;
  page:        string;
  updated_at:  string;
}

export interface PresenceResponse {
  operators: OperatorPresence[];
  total:     number;
}

export const presence = {
  getAll: () =>
    req<PresenceResponse>("presence", "/"),
  upsert: (data: {
    operator_id: string;
    name:        string;
    lat:         number;
    lon:         number;
    heading?:    number;
    page?:       string;
    color?:      string;
  }) => req<{ ok: boolean; id: number; color: string }>("presence", "/", {
    method: "POST",
    body:   JSON.stringify(data),
  }),
  remove: (operator_id: string) =>
    req<{ ok: boolean }>("presence", `/?operator_id=${encodeURIComponent(operator_id)}`, {
      method: "DELETE",
    }),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id:           number;
  email:        string;
  name:         string;
  role:         string;
  avatar_color: string;
  created_at?:  string;
  last_login?:  string;
}

function authReq<T>(action: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("sf_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Auth-Token"] = token;
  return req<T>("auth", `/?action=${action}`, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) } });
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    authReq<{ ok: boolean; token: string; user: User }>("register", {
      method: "POST",
      body:   JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    authReq<{ ok: boolean; token: string; user: User }>("login", {
      method: "POST",
      body:   JSON.stringify(data),
    }),
  me: () =>
    authReq<{ user: User }>("me"),
  logout: () =>
    authReq<{ ok: boolean }>("logout", { method: "POST" }),
  update: (data: {
    name?:             string;
    email?:            string;
    current_password?: string;
    new_password?:     string;
    avatar_color?:     string;
  }) => authReq<{ ok: boolean; user: User }>("update", {
    method: "PATCH",
    body:   JSON.stringify(data),
  }),
  deleteAccount: (password: string) =>
    authReq<{ ok: boolean; message: string }>("delete", {
      method: "POST",
      body:   JSON.stringify({ password }),
    }),
};

