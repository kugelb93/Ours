"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn(
      "bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 card-glow",
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>}
          {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
