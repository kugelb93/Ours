"use client";

import Card from "./Card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  trend?: number;
  icon?: React.ReactNode;
  className?: string;
  color?: string;
}

export default function MetricCard({ label, value, unit, trend, icon, className, color }: MetricCardProps) {
  return (
    <Card className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{label}</span>
        {icon && <span className={color || "text-[var(--accent-blue)]"}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold", color)}>{value ?? "--"}</span>
        {unit && <span className="text-sm text-[var(--text-secondary)]">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={cn("text-xs flex items-center gap-1", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
          <span>{trend >= 0 ? "\u2191" : "\u2193"}</span>
          <span>{Math.abs(trend)}% vs last week</span>
        </div>
      )}
    </Card>
  );
}
