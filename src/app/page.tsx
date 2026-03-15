"use client";

import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import ScoreRing from "@/components/ScoreRing";
import DateRangeSelector from "@/components/DateRangeSelector";
import ChartTooltip from "@/components/ChartTooltip";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useOuraData } from "@/lib/useOuraData";
import { scoreColor } from "@/lib/utils";
import type { DailySleep, DailyActivity, DailyReadiness } from "@/lib/oura";

export default function OverviewPage() {
  const [days, setDays] = useState(14);
  const { data: sleep, loading: l1, error: e1 } = useOuraData<DailySleep[]>("daily_sleep", days);
  const { data: activity, loading: l2, error: e2 } = useOuraData<DailyActivity[]>("daily_activity", days);
  const { data: readiness, loading: l3, error: e3 } = useOuraData<DailyReadiness[]>("daily_readiness", days);

  const loading = l1 || l2 || l3;
  const error = e1 || e2 || e3;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  const latestSleep = sleep?.[sleep.length - 1];
  const latestActivity = activity?.[activity.length - 1];
  const latestReadiness = readiness?.[readiness.length - 1];

  // Compute averages
  const avgSleepScore = sleep?.length
    ? Math.round(sleep.filter(s => s.score != null).reduce((a, b) => a + (b.score || 0), 0) / sleep.filter(s => s.score != null).length)
    : null;
  const avgActivityScore = activity?.length
    ? Math.round(activity.filter(a => a.score != null).reduce((a, b) => a + (b.score || 0), 0) / activity.filter(a => a.score != null).length)
    : null;
  const avgReadinessScore = readiness?.length
    ? Math.round(readiness.filter(r => r.score != null).reduce((a, b) => a + (b.score || 0), 0) / readiness.filter(r => r.score != null).length)
    : null;

  const avgSteps = activity?.length
    ? Math.round(activity.reduce((a, b) => a + b.steps, 0) / activity.length)
    : null;
  const avgCalories = activity?.length
    ? Math.round(activity.reduce((a, b) => a + b.active_calories, 0) / activity.length)
    : null;

  // Combined score chart data
  const chartData = sleep?.map((s) => {
    const act = activity?.find((a) => a.day === s.day);
    const rdy = readiness?.find((r) => r.day === s.day);
    return {
      day: s.day.slice(5),
      sleep: s.score,
      activity: act?.score,
      readiness: rdy?.score,
    };
  }) || [];

  // Steps chart data
  const stepsData = activity?.map((a) => ({
    day: a.day.slice(5),
    steps: a.steps,
    calories: a.active_calories,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Your health at a glance</p>
        </div>
        <DateRangeSelector selected={days} onChange={setDays} />
      </div>

      {/* Score Rings */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col items-center py-6">
          <div className="relative">
            <ScoreRing score={latestSleep?.score} size={140} />
          </div>
          <p className="text-sm font-medium mt-3">Sleep Score</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Avg: <span className={scoreColor(avgSleepScore)}>{avgSleepScore ?? "--"}</span>
          </p>
        </Card>
        <Card className="flex flex-col items-center py-6">
          <div className="relative">
            <ScoreRing score={latestActivity?.score} size={140} />
          </div>
          <p className="text-sm font-medium mt-3">Activity Score</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Avg: <span className={scoreColor(avgActivityScore)}>{avgActivityScore ?? "--"}</span>
          </p>
        </Card>
        <Card className="flex flex-col items-center py-6">
          <div className="relative">
            <ScoreRing score={latestReadiness?.score} size={140} />
          </div>
          <p className="text-sm font-medium mt-3">Readiness Score</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Avg: <span className={scoreColor(avgReadinessScore)}>{avgReadinessScore ?? "--"}</span>
          </p>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Steps Today" value={latestActivity?.steps?.toLocaleString()} icon={<span>&#x1F463;</span>} />
        <MetricCard label="Avg Daily Steps" value={avgSteps?.toLocaleString()} color="text-[var(--accent-cyan)]" icon={<span>&#x2195;</span>} />
        <MetricCard label="Active Calories" value={latestActivity?.active_calories} unit="cal" color="text-[var(--accent-emerald)]" icon={<span>&#x1F525;</span>} />
        <MetricCard label="Avg Calories" value={avgCalories} unit="cal" color="text-[var(--accent-yellow)]" icon={<span>&#x26A1;</span>} />
      </div>

      {/* Score Trends */}
      <Card title="Score Trends" subtitle="Sleep, Activity, and Readiness scores over time">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Sleep" />
              <Line type="monotone" dataKey="activity" stroke="#34d399" strokeWidth={2} dot={false} name="Activity" />
              <Line type="monotone" dataKey="readiness" stroke="#4f8ff7" strokeWidth={2} dot={false} name="Readiness" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Steps & Calories */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Daily Steps">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="steps" fill="#4f8ff7" radius={[4, 4, 0, 0]} name="Steps" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Active Calories">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#34d399" fill="#34d399" fillOpacity={0.1} name="Calories" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
