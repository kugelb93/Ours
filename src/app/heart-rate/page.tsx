"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import DateRangeSelector from "@/components/DateRangeSelector";
import ChartTooltip from "@/components/ChartTooltip";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useOuraData } from "@/lib/useOuraData";
import type { HeartRate, SleepPeriod } from "@/lib/oura";

export default function HeartRatePage() {
  const [days, setDays] = useState(7);
  const { data: heartRate, loading: l1, error: e1 } = useOuraData<HeartRate[]>("heartrate", days);
  const { data: sleepPeriods, loading: l2, error: e2 } = useOuraData<SleepPeriod[]>("sleep", days);

  if (l1 || l2) return <LoadingSpinner message="Loading heart rate data..." />;
  if (e1 || e2) return <ErrorDisplay message={e1 || e2 || "Error"} />;

  // Aggregate heart rate by hour for the most recent day
  const hrByDay = useMemo(() => {
    if (!heartRate?.length) return {};
    const grouped: Record<string, HeartRate[]> = {};
    heartRate.forEach((hr) => {
      const day = hr.timestamp.split("T")[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(hr);
    });
    return grouped;
  }, [heartRate]);

  const days_list = Object.keys(hrByDay).sort();
  const latestDay = days_list[days_list.length - 1];
  const latestHR = hrByDay[latestDay] || [];

  // Hourly aggregation for latest day
  const hourlyData = useMemo(() => {
    const hourly: Record<number, number[]> = {};
    latestHR.forEach((hr) => {
      const hour = new Date(hr.timestamp).getHours();
      if (!hourly[hour]) hourly[hour] = [];
      hourly[hour].push(hr.bpm);
    });
    return Array.from({ length: 24 }, (_, h) => {
      const readings = hourly[h] || [];
      return {
        hour: `${h.toString().padStart(2, "0")}:00`,
        avg: readings.length ? Math.round(readings.reduce((a, b) => a + b, 0) / readings.length) : null,
        min: readings.length ? Math.min(...readings) : null,
        max: readings.length ? Math.max(...readings) : null,
      };
    }).filter((d) => d.avg != null);
  }, [latestHR]);

  // Daily resting HR from sleep
  const dailyHRData = sleepPeriods
    ?.filter((s) => s.type === "long_sleep")
    .map((s) => ({
      day: s.day.slice(5),
      avgHR: s.average_heart_rate,
      lowestHR: s.lowest_heart_rate,
      avgHRV: s.average_hrv,
    })) || [];

  // Stats
  const currentHR = latestHR.length ? latestHR[latestHR.length - 1].bpm : null;
  const avgHR = latestHR.length ? Math.round(latestHR.reduce((a, b) => a + b.bpm, 0) / latestHR.length) : null;
  const minHR = latestHR.length ? Math.min(...latestHR.map((h) => h.bpm)) : null;
  const maxHR = latestHR.length ? Math.max(...latestHR.map((h) => h.bpm)) : null;
  const latestSleep = sleepPeriods?.filter(s => s.type === "long_sleep").slice(-1)[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Heart Rate & HRV</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Cardiovascular monitoring</p>
        </div>
        <DateRangeSelector selected={days} onChange={setDays} />
      </div>

      <div className="grid grid-cols-6 gap-4">
        <MetricCard label="Latest HR" value={currentHR} unit="bpm" color="text-[var(--accent-red)]" />
        <MetricCard label="Avg HR Today" value={avgHR} unit="bpm" color="text-[var(--accent-blue)]" />
        <MetricCard label="Min HR" value={minHR} unit="bpm" color="text-[var(--accent-emerald)]" />
        <MetricCard label="Max HR" value={maxHR} unit="bpm" color="text-[var(--accent-yellow)]" />
        <MetricCard label="Resting HR" value={latestSleep?.lowest_heart_rate} unit="bpm" color="text-[var(--accent-purple)]" />
        <MetricCard label="Avg HRV" value={latestSleep?.average_hrv} unit="ms" color="text-[var(--accent-cyan)]" />
      </div>

      {/* Today's HR */}
      <Card title={`Heart Rate - ${latestDay || "Today"}`} subtitle="Hourly averages throughout the day">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="hour" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v} bpm`} />} />
              <Area type="monotone" dataKey="max" stroke="transparent" fill="#f87171" fillOpacity={0.1} name="Max" />
              <Area type="monotone" dataKey="avg" stroke="#f87171" fill="#f87171" fillOpacity={0.2} strokeWidth={2} name="Avg" />
              <Area type="monotone" dataKey="min" stroke="#4f8ff7" fill="#4f8ff7" fillOpacity={0.1} strokeWidth={1} name="Min" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sleep HR & HRV trends */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Resting Heart Rate Trend" subtitle="From sleep data">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyHRData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} bpm`} />} />
                <Line type="monotone" dataKey="avgHR" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: "#f87171" }} name="Avg HR" />
                <Line type="monotone" dataKey="lowestHR" stroke="#4f8ff7" strokeWidth={2} dot={{ r: 3, fill: "#4f8ff7" }} name="Lowest HR" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="HRV Trend" subtitle="Heart rate variability during sleep">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyHRData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} ms`} />} />
                <Area type="monotone" dataKey="avgHRV" stroke="#34d399" fill="#34d399" fillOpacity={0.15} strokeWidth={2} name="HRV" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
