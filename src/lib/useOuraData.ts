"use client";

import { useState, useEffect, useCallback } from "react";
import { getDateRange } from "./oura";

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

// Fetch via the Next.js server API route to avoid CORS issues
async function fetchViaApi<T>(
  type: string,
  token: string,
  params?: { days?: number; start_date?: string; end_date?: string }
): Promise<T> {
  const searchParams = new URLSearchParams({ type });
  if (params?.days) searchParams.set("days", String(params.days));
  if (params?.start_date) searchParams.set("start_date", params.start_date);
  if (params?.end_date) searchParams.set("end_date", params.end_date);

  const res = await fetch(`/api/oura?${searchParams}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

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
      // The /api/oura route returns data directly (arrays for collections, object for personal_info)
      const result = await fetchViaApi<T>(type, token, { days });
      setData(result);
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
  const endpoints = [
    "daily_sleep", "daily_activity", "daily_readiness",
    "daily_spo2", "daily_stress", "daily_resilience",
  ];

  const results = await Promise.allSettled(
    endpoints.map(async (type) => {
      const data = await fetchViaApi<unknown[]>(type, token, { days });
      return { type, data };
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
    const sleepData = await fetchViaApi<unknown[]>("sleep", token, { days: 7 });
    allData["sleep_periods"] = sleepData;
  } catch { /* ignore */ }

  return allData;
}
