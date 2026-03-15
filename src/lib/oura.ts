const BASE_URL = "https://api.ouraring.com";

interface OuraRequestOptions {
  endpoint: string;
  token: string;
  params?: Record<string, string>;
}

async function ouraFetch<T>({ endpoint, token, params }: OuraRequestOptions): Promise<T> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Oura API error ${res.status}: ${text}`);
  }

  return res.json();
}

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

export interface DatetimeRange {
  start_datetime?: string;
  end_datetime?: string;
}

// ─── Response wrappers ───
interface OuraCollection<T> {
  data: T[];
  next_token?: string;
}

// ─── Data types ───
export interface PersonalInfo {
  id: string;
  age?: number;
  weight?: number;
  height?: number;
  biological_sex?: string;
  email?: string;
}

export interface DailySleep {
  id: string;
  day: string;
  score: number | null;
  timestamp: string;
  contributors: {
    deep_sleep?: number;
    efficiency?: number;
    latency?: number;
    rem_sleep?: number;
    restfulness?: number;
    timing?: number;
    total_sleep?: number;
  };
}

export interface SleepPeriod {
  id: string;
  day: string;
  bedtime_start: string;
  bedtime_end: string;
  duration: number;
  total_sleep_duration: number;
  awake_time: number;
  light_sleep_duration: number;
  deep_sleep_duration: number;
  rem_sleep_duration: number;
  restless_periods: number;
  sleep_phase_5_min?: string;
  average_breath: number;
  average_heart_rate: number;
  average_hrv: number;
  lowest_heart_rate: number;
  temperature_delta?: number;
  latency?: number;
  efficiency?: number;
  type: string;
  heart_rate?: { interval: number; items: number[]; timestamp: string };
  hrv?: { interval: number; items: number[]; timestamp: string };
}

export interface DailyActivity {
  id: string;
  day: string;
  score: number | null;
  active_calories: number;
  total_calories: number;
  steps: number;
  equivalent_walking_distance: number;
  high_activity_time: number;
  medium_activity_time: number;
  low_activity_time: number;
  sedentary_time: number;
  resting_time: number;
  inactivity_alerts: number;
  average_met_minutes: number;
  met?: { interval: number; items: number[]; timestamp: string };
  contributors: {
    meet_daily_targets?: number;
    move_every_hour?: number;
    recovery_time?: number;
    stay_active?: number;
    training_frequency?: number;
    training_volume?: number;
  };
  target_calories: number;
  target_meters: number;
}

export interface DailyReadiness {
  id: string;
  day: string;
  score: number | null;
  temperature_deviation?: number;
  temperature_trend_deviation?: number;
  timestamp: string;
  contributors: {
    activity_balance?: number;
    body_temperature?: number;
    hrv_balance?: number;
    previous_day_activity?: number;
    previous_night?: number;
    recovery_index?: number;
    resting_heart_rate?: number;
    sleep_balance?: number;
  };
}

export interface HeartRate {
  bpm: number;
  source: string;
  timestamp: string;
}

export interface DailySpO2 {
  id: string;
  day: string;
  spo2_percentage?: {
    average: number;
  };
}

export interface DailyStress {
  id: string;
  day: string;
  stress_high?: number;
  recovery_high?: number;
  day_summary?: string;
}

export interface Workout {
  id: string;
  day: string;
  activity: string;
  calories: number;
  distance?: number;
  duration: number;
  start_datetime: string;
  end_datetime: string;
  intensity: string;
  label?: string;
  source: string;
}

export interface DailyResilience {
  id: string;
  day: string;
  level?: string;
  contributors?: {
    sleep_recovery?: number;
    daytime_recovery?: number;
    stress?: number;
  };
}

export interface DailyCardiovascularAge {
  id: string;
  day: string;
  vascular_age?: number;
}

export interface Vo2Max {
  id: string;
  day: string;
  vo2_max?: number;
}

export interface Session {
  id: string;
  day: string;
  start_datetime: string;
  end_datetime: string;
  type: string;
  mood?: string;
  heart_rate?: { interval: number; items: number[]; timestamp: string };
  hrv?: { interval: number; items: number[]; timestamp: string };
}

export interface SleepTime {
  id: string;
  day: string;
  optimal_bedtime?: {
    day_tz: number;
    end_offset: number;
    start_offset: number;
  };
  recommendation?: string;
  status?: string;
}

export interface Tag {
  id: string;
  day: string;
  text?: string;
  timestamp: string;
  tag_type_code?: string;
}

export interface EnhancedTag {
  id: string;
  day: string;
  text?: string;
  timestamp: string;
  tag_type_code?: string;
  comment?: string;
}

export interface RingConfiguration {
  id: string;
  color?: string;
  design?: string;
  firmware_version?: string;
  hardware_type?: string;
  set_up_at?: string;
  size?: number;
}

// ─── API Client ───
export class OuraClient {
  constructor(private token: string) {}

  async getPersonalInfo(): Promise<PersonalInfo> {
    return ouraFetch({ endpoint: "v2/usercollection/personal_info", token: this.token });
  }

  async getDailySleep(range: DateRange = {}): Promise<DailySleep[]> {
    const res = await ouraFetch<OuraCollection<DailySleep>>({
      endpoint: "v2/usercollection/daily_sleep",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getSleepPeriods(range: DateRange = {}): Promise<SleepPeriod[]> {
    const res = await ouraFetch<OuraCollection<SleepPeriod>>({
      endpoint: "v2/usercollection/sleep",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getDailyActivity(range: DateRange = {}): Promise<DailyActivity[]> {
    const res = await ouraFetch<OuraCollection<DailyActivity>>({
      endpoint: "v2/usercollection/daily_activity",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getDailyReadiness(range: DateRange = {}): Promise<DailyReadiness[]> {
    const res = await ouraFetch<OuraCollection<DailyReadiness>>({
      endpoint: "v2/usercollection/daily_readiness",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getHeartRate(range: DatetimeRange = {}): Promise<HeartRate[]> {
    const res = await ouraFetch<OuraCollection<HeartRate>>({
      endpoint: "v2/usercollection/heartrate",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getDailySpO2(range: DateRange = {}): Promise<DailySpO2[]> {
    const res = await ouraFetch<OuraCollection<DailySpO2>>({
      endpoint: "v2/usercollection/daily_spo2",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getDailyStress(range: DateRange = {}): Promise<DailyStress[]> {
    const res = await ouraFetch<OuraCollection<DailyStress>>({
      endpoint: "v2/usercollection/daily_stress",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getWorkouts(range: DateRange = {}): Promise<Workout[]> {
    const res = await ouraFetch<OuraCollection<Workout>>({
      endpoint: "v2/usercollection/workout",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getDailyResilience(range: DateRange = {}): Promise<DailyResilience[]> {
    const res = await ouraFetch<OuraCollection<DailyResilience>>({
      endpoint: "v2/usercollection/daily_resilience",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getDailyCardiovascularAge(range: DateRange = {}): Promise<DailyCardiovascularAge[]> {
    const res = await ouraFetch<OuraCollection<DailyCardiovascularAge>>({
      endpoint: "v2/usercollection/daily_cardiovascular_age",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getVo2Max(range: DateRange = {}): Promise<Vo2Max[]> {
    const res = await ouraFetch<OuraCollection<Vo2Max>>({
      endpoint: "v2/usercollection/vo2_max",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getSessions(range: DateRange = {}): Promise<Session[]> {
    const res = await ouraFetch<OuraCollection<Session>>({
      endpoint: "v2/usercollection/session",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getSleepTime(range: DateRange = {}): Promise<SleepTime[]> {
    const res = await ouraFetch<OuraCollection<SleepTime>>({
      endpoint: "v2/usercollection/sleep_time",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getTags(range: DateRange = {}): Promise<Tag[]> {
    const res = await ouraFetch<OuraCollection<Tag>>({
      endpoint: "v2/usercollection/tag",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getEnhancedTags(range: DateRange = {}): Promise<EnhancedTag[]> {
    const res = await ouraFetch<OuraCollection<EnhancedTag>>({
      endpoint: "v2/usercollection/enhanced_tag",
      token: this.token,
      params: range as Record<string, string>,
    });
    return res.data;
  }

  async getRingConfiguration(): Promise<RingConfiguration[]> {
    const res = await ouraFetch<OuraCollection<RingConfiguration>>({
      endpoint: "v2/usercollection/ring_configuration",
      token: this.token,
    });
    return res.data;
  }

  // Fetch all data for a date range (used by chat)
  async getAllData(range: DateRange = {}) {
    const [
      dailySleep, sleepPeriods, dailyActivity, dailyReadiness,
      dailySpO2, dailyStress, workouts, dailyResilience,
      sessions, tags,
    ] = await Promise.allSettled([
      this.getDailySleep(range),
      this.getSleepPeriods(range),
      this.getDailyActivity(range),
      this.getDailyReadiness(range),
      this.getDailySpO2(range),
      this.getDailyStress(range),
      this.getWorkouts(range),
      this.getDailyResilience(range),
      this.getSessions(range),
      this.getTags(range),
    ]);

    const extract = <T>(r: PromiseSettledResult<T[]>): T[] =>
      r.status === "fulfilled" ? r.value : [];

    return {
      dailySleep: extract(dailySleep),
      sleepPeriods: extract(sleepPeriods),
      dailyActivity: extract(dailyActivity),
      dailyReadiness: extract(dailyReadiness),
      dailySpO2: extract(dailySpO2),
      dailyStress: extract(dailyStress),
      workouts: extract(workouts),
      dailyResilience: extract(dailyResilience),
      sessions: extract(sessions),
      tags: extract(tags),
    };
  }
}

// Helper to get date range for last N days
export function getDateRange(days: number): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
