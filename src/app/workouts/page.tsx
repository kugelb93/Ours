"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import DateRangeSelector from "@/components/DateRangeSelector";
import ChartTooltip from "@/components/ChartTooltip";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useOuraData } from "@/lib/useOuraData";
import { formatDuration, formatTime } from "@/lib/oura";
import type { Workout } from "@/lib/oura";

export default function WorkoutsPage() {
  const [days, setDays] = useState(30);
  const { data: workouts, loading, error } = useOuraData<Workout[]>("workouts", days);

  if (loading) return <LoadingSpinner message="Loading workout data..." />;
  if (error) return <ErrorDisplay message={error} />;

  const totalWorkouts = workouts?.length || 0;
  const totalCalories = workouts?.reduce((a, b) => a + b.calories, 0) || 0;
  const totalDuration = workouts?.reduce((a, b) => a + b.duration, 0) || 0;
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Activity type breakdown
  const byType: Record<string, number> = {};
  workouts?.forEach((w) => {
    const type = w.activity || "other";
    byType[type] = (byType[type] || 0) + 1;
  });
  const typeData = Object.entries(byType)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Calories per workout
  const caloriesData = workouts?.map((w) => ({
    label: `${w.day.slice(5)} ${w.activity?.slice(0, 8) || ""}`,
    calories: w.calories,
    duration: Math.round(w.duration / 60),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workouts</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Exercise history and analysis</p>
        </div>
        <DateRangeSelector selected={days} onChange={setDays} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Workouts" value={totalWorkouts} color="text-[var(--accent-blue)]" />
        <MetricCard label="Total Calories" value={totalCalories.toLocaleString()} unit="cal" color="text-[var(--accent-emerald)]" />
        <MetricCard label="Total Duration" value={formatDuration(totalDuration)} color="text-[var(--accent-purple)]" />
        <MetricCard label="Avg Duration" value={formatDuration(avgDuration)} color="text-[var(--accent-yellow)]" />
      </div>

      {/* Activity type breakdown */}
      {typeData.length > 0 && (
        <Card title="Workout Types">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis type="number" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis dataKey="type" type="category" tick={{ fill: "#8888a0", fontSize: 11 }} width={100} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#4f8ff7" radius={[0, 4, 4, 0]} name="Workouts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Calories per workout */}
      {caloriesData.length > 0 && (
        <Card title="Calories Per Workout">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caloriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="label" tick={{ fill: "#8888a0", fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v, n) => n === "duration" ? `${v} min` : `${v} cal`} />} />
                <Bar dataKey="calories" fill="#34d399" radius={[4, 4, 0, 0]} name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Workout list */}
      <Card title="Recent Workouts">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {workouts?.slice().reverse().map((w) => (
            <div key={w.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center text-xs">
                  &#x26A1;
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{w.activity || "Workout"}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{w.day} &middot; {formatTime(w.start_datetime)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-[var(--text-secondary)] text-xs">Duration</p>
                  <p className="font-medium">{formatDuration(w.duration)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-secondary)] text-xs">Calories</p>
                  <p className="font-medium text-[var(--accent-emerald)]">{w.calories}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-secondary)] text-xs">Intensity</p>
                  <p className="font-medium capitalize">{w.intensity || "--"}</p>
                </div>
              </div>
            </div>
          ))}
          {(!workouts || workouts.length === 0) && (
            <p className="text-center text-[var(--text-secondary)] py-8">No workouts recorded in this period.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
