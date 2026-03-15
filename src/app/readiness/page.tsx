"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
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
import type { DailyReadiness, DailyResilience } from "@/lib/oura";

export default function ReadinessPage() {
  const [days, setDays] = useState(14);
  const { data: readiness, loading: l1, error: e1 } = useOuraData<DailyReadiness[]>("daily_readiness", days);
  const { data: resilience, loading: l2, error: e2 } = useOuraData<DailyResilience[]>("daily_resilience", days);

  if (l1 || l2) return <LoadingSpinner message="Loading readiness data..." />;
  if (e1 || e2) return <ErrorDisplay message={e1 || e2 || "Error"} />;

  const latest = readiness?.[readiness.length - 1];
  const latestResilience = resilience?.[resilience.length - 1];

  const avgScore = readiness?.length
    ? Math.round(readiness.filter(r => r.score != null).reduce((a, b) => a + (b.score || 0), 0) / readiness.filter(r => r.score != null).length)
    : null;

  const scoreData = readiness?.map((r) => ({
    day: r.day.slice(5),
    score: r.score,
    tempDev: r.temperature_deviation ? +(r.temperature_deviation).toFixed(2) : null,
  })) || [];

  const tempData = readiness?.filter(r => r.temperature_deviation != null).map((r) => ({
    day: r.day.slice(5),
    deviation: +(r.temperature_deviation!).toFixed(2),
    trend: r.temperature_trend_deviation ? +(r.temperature_trend_deviation).toFixed(2) : null,
  })) || [];

  const contributors = latest?.contributors || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Readiness & Recovery</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">How ready your body is for the day</p>
        </div>
        <DateRangeSelector selected={days} onChange={setDays} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-2 flex flex-col items-center py-6">
          <div className="relative">
            <ScoreRing score={latest?.score} size={160} />
          </div>
          <p className="text-sm font-medium mt-3">Readiness Score</p>
          <p className="text-xs text-[var(--text-secondary)]">{latest?.day || "--"}</p>
        </Card>
        <div className="col-span-3 grid grid-cols-2 gap-4">
          <MetricCard label="Average Score" value={avgScore} color="text-[var(--accent-blue)]" />
          <MetricCard label="Temp Deviation" value={latest?.temperature_deviation != null ? `${latest.temperature_deviation.toFixed(2)}\u00b0C` : "--"} color="text-[var(--accent-yellow)]" />
          <MetricCard label="Resilience Level" value={latestResilience?.level || "--"} color="text-[var(--accent-emerald)]" />
          <MetricCard label="Temp Trend" value={latest?.temperature_trend_deviation != null ? `${latest.temperature_trend_deviation.toFixed(2)}\u00b0C` : "--"} color="text-[var(--accent-cyan)]" />
        </div>
      </div>

      {/* Contributors */}
      <Card title="Readiness Contributors">
        <div className="grid grid-cols-8 gap-3">
          {Object.entries(contributors).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className="relative">
                <ScoreRing score={value} size={60} strokeWidth={5} />
              </div>
              <span className="text-[10px] text-[var(--text-secondary)] text-center capitalize leading-tight">
                {key.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Score trend */}
      <Card title="Readiness Score Trend">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#8888a0", fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#4f8ff7" strokeWidth={2} dot={{ r: 3, fill: "#4f8ff7" }} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Temperature trends */}
      {tempData.length > 0 && (
        <Card title="Temperature Deviation" subtitle="Body temperature deviation from baseline">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}\u00b0C`} />} />
                <Bar dataKey="deviation" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Deviation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
