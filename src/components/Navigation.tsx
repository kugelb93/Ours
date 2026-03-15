"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: "\u25C9" },
  { href: "/sleep", label: "Sleep", icon: "\u263E" },
  { href: "/activity", label: "Activity", icon: "\u2197" },
  { href: "/readiness", label: "Readiness", icon: "\u2665" },
  { href: "/heart-rate", label: "Heart Rate", icon: "\u2764" },
  { href: "/body-metrics", label: "Body", icon: "\u2726" },
  { href: "/workouts", label: "Workouts", icon: "\u26A1" },
  { href: "/chat", label: "Chat", icon: "\u2749" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-56 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col z-50">
      <div className="p-5 border-b border-[var(--border-color)]">
        <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          Oura Dashboard
        </h1>
        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Health Analytics</p>
      </div>
      <div className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                isActive
                  ? "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 border-r-2 border-[var(--accent-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-[var(--border-color)]">
        <p className="text-[10px] text-[var(--text-secondary)]">Powered by Oura API v2</p>
      </div>
    </nav>
  );
}
