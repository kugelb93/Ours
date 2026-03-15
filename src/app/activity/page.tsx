"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
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
import type { DailyActivity } from "@/lib/oura";

export default function ActivityPage() {
  const [days, setDays] = useState(14);
  const { data: activity, loading, error } = useOuraData<DailyActivity[]>("daily_activity", days);

  if (loading) return <LoadingSpinner message="Loading activity data..." />;
  if (error) return <ErrorDisplay message={error} />;

  const latest = activity?.[activity.length - 1];
  const avgSteps = activity?.length ? Math.round(activity.reduce((a, b) => a + b.steps, 0) / activity.length) : null;
  const totalSteps = activity?.reduce((a, b) => a + b.steps, 0) || 0;
  const avgCalories = activity?.length ? Math.round(activity.reduce((a, b) => a + b.active_calories, 0) / activity.length) : null;

  const stepsData = activity?.map((a) => ({
    day: a.day.slice(5),
    steps: a.steps,
    target: a.target_meters ? Math.round(a.target_meters / 0.762) : undefined,
  })) || [];

  const caloriesData = activity?.map((a) => ({
    day: a.day.slice(5),
    active: a.active_calories,
    total: a.total_calories,
  })) || [];

  const activityBreakdownData = activity?.map((a) => ({
    day: a.day.slice(5),
    high: Math.round(a.high_activity_time / 60),
    medium: Math.round(a.medium_activity_time / 60),
    low: Math.round(a.low_activity_time / 60),
    sedentary: Math.round(a.sedentary_time / 60),
  })) || [];

  const scoreData = activity?.map((a) => ({
    day: a.day.slice(5),
    score: a.score,
  })) || [];

  const contributors = latest?.contributors || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity Tracking</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Steps, calories, and movement patterns</p>
        </div>
        <DateRangeSelector selected={days} onChange={setDays} />
      </div>

      {/* Today's overview */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="col-span-2 flex flex-col items-center py-6">
          <div className="relative">
            <ScoreRing score={latest?.score} size={140} />
          </div>
          <p className="text-sm font-medium mt-3">Activity Score</p>
          <p className="text-xs text-[var(--text-secondary)]">{latest?.day || "--"}</p>
        </Card>
        <div className="col-span-4 grid grid-cols-3 gap-4">
          <MetricCard label="Steps" value={latest?.steps?.toLocaleString()} color="text-[var(--accent-blue)]" />
          <MetricCard label="Active Cal" value={latest?.active_calories} unit="cal" color="text-[var(--accent-emerald)]" />
          <MetricCard label="Total Cal" value={latest?.total_calories} unit="cal" color="text-[var(--accent-yellow)]" />
          <MetricCard label="Avg Steps" value={avgSteps?.toLocaleString()} color="text-[var(--accent-cyan)]" />
          <MetricCard label="Avg Calories" value={avgCalories} unit="cal" color="text-[var(--accent-purple)]" />
          <MetricCard label="Total Steps" value={totalSteps.toLocaleString()} color="text-[var(--accent-blue)]" />
        </div>
      </div>

      {/* Contributors */}
      <Card title="Activity Score Contributors">
        <div className="grid grid-cols-6 gap-3">
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
      <Card title="Activity Score Trend">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Steps chart */}
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

      {/* Calories */}
      <Card title="Calories Burned">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={caloriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v} cal`} />} />
              <Area type="monotone" dataKey="total" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} name="Total" />
              <Area type="monotone" dataKey="active" stroke="#34d399" fill="#34d399" fillOpacity={0.15} name="Active" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Activity breakdown */}
      <Card title="Activity Breakdown" subtitle="Minutes by intensity level">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v} min`} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="high" stackId="a" fill="#f87171" name="High" />
              <Bar dataKey="medium" stackId="a" fill="#fbbf24" name="Medium" />
              <Bar dataKey="low" stackId="a" fill="#34d399" name="Low" />
              <Bar dataKey="sedentary" stackId="a" fill="#3a3a5e" name="Sedentary" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
