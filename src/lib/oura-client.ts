// Client-side Oura API fetcher - calls Oura directly from the browser
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

interface OuraCollection<T> {
  data: T[];
  next_token?: string;
}

// Re-export all types
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

// Helpers
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

// Client-side fetch functions
async function fetchCollection<T>(token: string, endpoint: string, range: DateRange): Promise<T[]> {
  const res = await ouraFetch<OuraCollection<T>>({
    endpoint,
    token,
    params: range as Record<string, string>,
  });
  return res.data;
}

export async function fetchDailySleep(token: string, range: DateRange): Promise<DailySleep[]> {
  return fetchCollection(token, "v2/usercollection/daily_sleep", range);
}

export async function fetchSleepPeriods(token: string, range: DateRange): Promise<SleepPeriod[]> {
  return fetchCollection(token, "v2/usercollection/sleep", range);
}

export async function fetchDailyActivity(token: string, range: DateRange): Promise<DailyActivity[]> {
  return fetchCollection(token, "v2/usercollection/daily_activity", range);
}

export async function fetchDailyReadiness(token: string, range: DateRange): Promise<DailyReadiness[]> {
  return fetchCollection(token, "v2/usercollection/daily_readiness", range);
}

export async function fetchHeartRate(token: string, range: DateRange): Promise<HeartRate[]> {
  const hrRange = {
    start_datetime: `${range.start_date}T00:00:00+00:00`,
    end_datetime: `${range.end_date}T23:59:59+00:00`,
  };
  const res = await ouraFetch<OuraCollection<HeartRate>>({
    endpoint: "v2/usercollection/heartrate",
    token,
    params: hrRange as Record<string, string>,
  });
  return res.data;
}

export async function fetchDailySpO2(token: string, range: DateRange): Promise<DailySpO2[]> {
  return fetchCollection(token, "v2/usercollection/daily_spo2", range);
}

export async function fetchDailyStress(token: string, range: DateRange): Promise<DailyStress[]> {
  return fetchCollection(token, "v2/usercollection/daily_stress", range);
}

export async function fetchWorkouts(token: string, range: DateRange): Promise<Workout[]> {
  return fetchCollection(token, "v2/usercollection/workout", range);
}

export async function fetchDailyResilience(token: string, range: DateRange): Promise<DailyResilience[]> {
  return fetchCollection(token, "v2/usercollection/daily_resilience", range);
}

export async function fetchDailyCardiovascularAge(token: string, range: DateRange): Promise<DailyCardiovascularAge[]> {
  return fetchCollection(token, "v2/usercollection/daily_cardiovascular_age", range);
}

export async function fetchVo2Max(token: string, range: DateRange): Promise<Vo2Max[]> {
  return fetchCollection(token, "v2/usercollection/vo2_max", range);
}

export async function fetchPersonalInfo(token: string): Promise<PersonalInfo> {
  return ouraFetch({ endpoint: "v2/usercollection/personal_info", token });
}

export async function fetchAllData(token: string, range: DateRange) {
  const [
    dailySleep, sleepPeriods, dailyActivity, dailyReadiness,
    dailySpO2, dailyStress, workouts, dailyResilience,
  ] = await Promise.allSettled([
    fetchDailySleep(token, range),
    fetchSleepPeriods(token, range),
    fetchDailyActivity(token, range),
    fetchDailyReadiness(token, range),
    fetchDailySpO2(token, range),
    fetchDailyStress(token, range),
    fetchWorkouts(token, range),
    fetchDailyResilience(token, range),
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
  };
}
