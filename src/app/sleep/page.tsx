"use client";

import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import ScoreRing from "@/components/ScoreRing";
import DateRangeSelector from "@/components/DateRangeSelector";
import ChartTooltip from "@/components/ChartTooltip";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useOuraData } from "@/lib/useOuraData";
import { formatDuration } from "@/lib/oura";
import type { DailySleep, SleepPeriod } from "@/lib/oura";

export default function SleepPage() {
  const [days, setDays] = useState(14);
  const { data: dailySleep, loading: l1, error: e1 } = useOuraData<DailySleep[]>("daily_sleep", days);
  const { data: sleepPeriods, loading: l2, error: e2 } = useOuraData<SleepPeriod[]>("sleep", days);

  if (l1 || l2) return <LoadingSpinner message="Loading sleep data..." />;
  if (e1 || e2) return <ErrorDisplay message={e1 || e2 || "Error"} />;

  const latest = dailySleep?.[dailySleep.length - 1];
  const latestPeriod = sleepPeriods?.filter(s => s.type === "long_sleep").slice(-1)[0];

  // Sleep stages chart
  const stagesData = sleepPeriods
    ?.filter((s) => s.type === "long_sleep")
    .map((s) => ({
      day: s.day.slice(5),
      deep: Math.round(s.deep_sleep_duration / 60),
      rem: Math.round(s.rem_sleep_duration / 60),
      light: Math.round(s.light_sleep_duration / 60),
      awake: Math.round(s.awake_time / 60),
      total: Math.round(s.total_sleep_duration / 60),
    })) || [];

  // HRV & HR during sleep
  const sleepVitalsData = sleepPeriods
    ?.filter((s) => s.type === "long_sleep")
    .map((s) => ({
      day: s.day.slice(5),
      avgHR: s.average_heart_rate,
      lowestHR: s.lowest_heart_rate,
      avgHRV: s.average_hrv,
      tempDelta: s.temperature_delta ? +(s.temperature_delta).toFixed(2) : null,
    })) || [];

  // Score trend
  const scoreData = dailySleep?.map((s) => ({
    day: s.day.slice(5),
    score: s.score,
  })) || [];

  // Contributors for latest
  const contributors = latest?.contributors || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sleep Analysis</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Detailed sleep tracking and trends</p>
        </div>
        <DateRangeSelector selected={days} onChange={setDays} />
      </div>

      {/* Latest night overview */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="col-span-2 flex flex-col items-center py-6">
          <div className="relative">
            <ScoreRing score={latest?.score} size={160} />
          </div>
          <p className="text-sm font-medium mt-3">Last Night&apos;s Score</p>
          <p className="text-xs text-[var(--text-secondary)]">{latest?.day || "--"}</p>
        </Card>
        <div className="col-span-4 grid grid-cols-2 gap-4">
          <MetricCard label="Total Sleep" value={latestPeriod ? formatDuration(latestPeriod.total_sleep_duration) : "--"} color="text-[var(--accent-purple)]" />
          <MetricCard label="Deep Sleep" value={latestPeriod ? formatDuration(latestPeriod.deep_sleep_duration) : "--"} color="text-[var(--accent-blue)]" />
          <MetricCard label="REM Sleep" value={latestPeriod ? formatDuration(latestPeriod.rem_sleep_duration) : "--"} color="text-[var(--accent-cyan)]" />
          <MetricCard label="Sleep Efficiency" value={latestPeriod?.efficiency != null ? `${latestPeriod.efficiency}%` : "--"} color="text-[var(--accent-emerald)]" />
          <MetricCard label="Avg Heart Rate" value={latestPeriod?.average_heart_rate} unit="bpm" color="text-[var(--accent-red)]" />
          <MetricCard label="Avg HRV" value={latestPeriod?.average_hrv} unit="ms" color="text-[var(--accent-yellow)]" />
        </div>
      </div>

      {/* Contributors */}
      <Card title="Sleep Score Contributors" subtitle="Factors affecting your sleep score">
        <div className="grid grid-cols-7 gap-3">
          {Object.entries(contributors).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className="relative">
                <ScoreRing score={value} size={64} strokeWidth={5} />
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] text-center capitalize">
                {key.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Score trend */}
      <Card title="Sleep Score Trend">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sleep stages stacked bar */}
      <Card title="Sleep Stages" subtitle="Duration in minutes per night">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stagesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip formatter={(v, n) => `${v} min`} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="deep" stackId="a" fill="#4f8ff7" name="Deep" />
              <Bar dataKey="rem" stackId="a" fill="#22d3ee" name="REM" />
              <Bar dataKey="light" stackId="a" fill="#8b5cf6" name="Light" />
              <Bar dataKey="awake" stackId="a" fill="#f87171" name="Awake" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Heart rate & HRV during sleep */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Heart Rate During Sleep">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepVitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} bpm`} />} />
                <Line type="monotone" dataKey="avgHR" stroke="#f87171" strokeWidth={2} dot={false} name="Avg HR" />
                <Line type="monotone" dataKey="lowestHR" stroke="#4f8ff7" strokeWidth={2} dot={false} name="Lowest HR" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="HRV During Sleep">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepVitalsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} ms`} />} />
                <Area type="monotone" dataKey="avgHRV" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} name="Avg HRV" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Temperature deviation */}
      <Card title="Temperature Deviation" subtitle="Skin temperature deviation from baseline during sleep">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sleepVitalsData.filter(d => d.tempDelta != null)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v}\u00b0C`} />} />
              <Bar dataKey="tempDelta" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Temp Delta" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
