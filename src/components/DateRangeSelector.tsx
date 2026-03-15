"use client";

import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  selected: number;
  onChange: (days: number) => void;
}

const ranges = [
  { days: 7, label: "7D" },
  { days: 14, label: "14D" },
  { days: 30, label: "30D" },
  { days: 90, label: "90D" },
];

export default function DateRangeSelector({ selected, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-1">
      {ranges.map(({ days, label }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={cn(
            "px-3 py-1 rounded-md text-xs font-medium transition-colors",
            selected === days
              ? "bg-[var(--accent-blue)] text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
