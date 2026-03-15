"use client";

import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import Card from "@/components/Card";
import MetricCard from "@/components/MetricCard";
import DateRangeSelector from "@/components/DateRangeSelector";
import ChartTooltip from "@/components/ChartTooltip";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import { useOuraData } from "@/lib/useOuraData";
import type { DailySpO2, DailyStress, DailyCardiovascularAge, Vo2Max } from "@/lib/oura";

export default function BodyMetricsPage() {
  const [days, setDays] = useState(30);
  const { data: spo2, loading: l1, error: e1 } = useOuraData<DailySpO2[]>("daily_spo2", days);
  const { data: stress, loading: l2, error: e2 } = useOuraData<DailyStress[]>("daily_stress", days);
  const { data: cardioAge, loading: l3, error: e3 } = useOuraData<DailyCardiovascularAge[]>("daily_cardiovascular_age", days);
  const { data: vo2max, loading: l4, error: e4 } = useOuraData<Vo2Max[]>("vo2_max", days);

  const loading = l1 || l2 || l3 || l4;
  const error = e1 || e2 || e3 || e4;

  if (loading) return <LoadingSpinner message="Loading body metrics..." />;
  if (error) return <ErrorDisplay message={error} />;

  const latestSpO2 = spo2?.slice(-1)[0];
  const latestStress = stress?.slice(-1)[0];
  const latestCardioAge = cardioAge?.slice(-1)[0];
  const latestVo2 = vo2max?.slice(-1)[0];

  const spo2Data = spo2?.filter(s => s.spo2_percentage?.average).map((s) => ({
    day: s.day.slice(5),
    spo2: s.spo2_percentage!.average,
  })) || [];

  const stressData = stress?.map((s) => ({
    day: s.day.slice(5),
    stressHigh: s.stress_high || 0,
    recoveryHigh: s.recovery_high || 0,
    summary: s.day_summary,
  })) || [];

  const cardioAgeData = cardioAge?.filter(c => c.vascular_age != null).map((c) => ({
    day: c.day.slice(5),
    age: c.vascular_age,
  })) || [];

  const vo2Data = vo2max?.filter(v => v.vo2_max != null).map((v) => ({
    day: v.day.slice(5),
    vo2: v.vo2_max,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Body Metrics</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">SpO2, stress, cardiovascular age, and VO2 max</p>
        </div>
        <DateRangeSelector selected={days} onChange={setDays} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="SpO2" value={latestSpO2?.spo2_percentage?.average != null ? `${latestSpO2.spo2_percentage.average}%` : "--"} color="text-[var(--accent-blue)]" />
        <MetricCard label="Stress Level" value={latestStress?.day_summary || "--"} color="text-[var(--accent-red)]" />
        <MetricCard label="Cardio Age" value={latestCardioAge?.vascular_age ?? "--"} unit="yrs" color="text-[var(--accent-purple)]" />
        <MetricCard label="VO2 Max" value={latestVo2?.vo2_max ?? "--"} unit="ml/kg/min" color="text-[var(--accent-emerald)]" />
      </div>

      {/* SpO2 */}
      {spo2Data.length > 0 && (
        <Card title="Blood Oxygen (SpO2)" subtitle="Average nightly SpO2 levels">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spo2Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis domain={[90, 100]} tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Line type="monotone" dataKey="spo2" stroke="#4f8ff7" strokeWidth={2} dot={{ r: 3, fill: "#4f8ff7" }} name="SpO2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Stress */}
      {stressData.length > 0 && (
        <Card title="Daily Stress" subtitle="Stress and recovery minutes">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} min`} />} />
                <Bar dataKey="stressHigh" fill="#f87171" name="Stress" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recoveryHigh" fill="#34d399" name="Recovery" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Cardiovascular Age */}
      {cardioAgeData.length > 0 && (
        <Card title="Cardiovascular Age Trend">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cardioAgeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} years`} />} />
                <Line type="monotone" dataKey="age" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} name="Cardio Age" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* VO2 Max */}
      {vo2Data.length > 0 && (
        <Card title="VO2 Max Trend">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vo2Data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="day" tick={{ fill: "#8888a0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8888a0", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} ml/kg/min`} />} />
                <Line type="monotone" dataKey="vo2" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: "#34d399" }} name="VO2 Max" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* No data messages */}
      {spo2Data.length === 0 && stressData.length === 0 && cardioAgeData.length === 0 && vo2Data.length === 0 && (
        <Card>
          <p className="text-center text-[var(--text-secondary)] py-8">No body metrics data available for this period. Try expanding the date range.</p>
        </Card>
      )}
    </div>
  );
}
