"use client";

import { useState, useEffect, useCallback } from "react";
import { getDateRange } from "./oura";

const OURA_BASE = "https://api.ouraring.com";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("oura_token");
}

export function setStoredToken(token: string) {
  localStorage.setItem("oura_token", token);
}

export function clearStoredToken() {
  localStorage.removeItem("oura_token");
}

async function fetchOura<T>(endpoint: string, token: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${OURA_BASE}/${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Oura API ${res.status}: ${text}`);
  }
  return res.json();
}

interface OuraCollection<T> {
  data: T[];
}

const ENDPOINT_MAP: Record<string, { path: string; useDatetime?: boolean }> = {
  personal_info: { path: "v2/usercollection/personal_info" },
  daily_sleep: { path: "v2/usercollection/daily_sleep" },
  sleep: { path: "v2/usercollection/sleep" },
  daily_activity: { path: "v2/usercollection/daily_activity" },
  daily_readiness: { path: "v2/usercollection/daily_readiness" },
  heartrate: { path: "v2/usercollection/heartrate", useDatetime: true },
  daily_spo2: { path: "v2/usercollection/daily_spo2" },
  daily_stress: { path: "v2/usercollection/daily_stress" },
  workouts: { path: "v2/usercollection/workout" },
  daily_resilience: { path: "v2/usercollection/daily_resilience" },
  daily_cardiovascular_age: { path: "v2/usercollection/daily_cardiovascular_age" },
  vo2_max: { path: "v2/usercollection/vo2_max" },
  sessions: { path: "v2/usercollection/session" },
  sleep_time: { path: "v2/usercollection/sleep_time" },
  tags: { path: "v2/usercollection/tag" },
  enhanced_tags: { path: "v2/usercollection/enhanced_tag" },
  ring_configuration: { path: "v2/usercollection/ring_configuration" },
};

export function useOuraData<T>(type: string, days: number = 14) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setError("No API token. Please set your Oura token in settings.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = ENDPOINT_MAP[type];
      if (!endpoint) throw new Error(`Unknown type: ${type}`);

      if (type === "personal_info" || type === "ring_configuration") {
        // These don't use date ranges, and personal_info returns object not collection
        if (type === "personal_info") {
          const result = await fetchOura<T>(endpoint.path, token);
          setData(result);
        } else {
          const result = await fetchOura<OuraCollection<unknown>>(endpoint.path, token);
          setData(result.data as T);
        }
      } else {
        const range = getDateRange(days);
        const params = endpoint.useDatetime
          ? {
              start_datetime: `${range.start_date}T00:00:00+00:00`,
              end_datetime: `${range.end_date}T23:59:59+00:00`,
            }
          : (range as Record<string, string>);

        const result = await fetchOura<OuraCollection<unknown>>(endpoint.path, token, params);
        setData(result.data as T);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [type, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Fetch all data for chat context
export async function fetchAllOuraData(token: string, days: number = 30) {
  const range = getDateRange(days);
  const params = range as Record<string, string>;

  const endpoints = [
    "daily_sleep", "daily_activity", "daily_readiness",
    "daily_spo2", "daily_stress", "daily_resilience",
  ];

  const results = await Promise.allSettled(
    endpoints.map(async (type) => {
      const ep = ENDPOINT_MAP[type];
      const res = await fetchOura<OuraCollection<unknown>>(ep.path, token, params);
      return { type, data: res.data };
    })
  );

  const allData: Record<string, unknown[]> = {};
  results.forEach((r) => {
    if (r.status === "fulfilled") {
      allData[r.value.type] = r.value.data;
    }
  });

  // Also fetch sleep periods for detail
  try {
    const sleepRange = getDateRange(7);
    const sleepRes = await fetchOura<OuraCollection<unknown>>(
      "v2/usercollection/sleep", token, sleepRange as Record<string, string>
    );
    allData["sleep_periods"] = sleepRes.data;
  } catch { /* ignore */ }

  return allData;
}
