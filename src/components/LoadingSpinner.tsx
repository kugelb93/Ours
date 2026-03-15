"use client";

export default function LoadingSpinner({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-8 h-8 border-2 border-[var(--border-color)] border-t-[var(--accent-blue)] rounded-full animate-spin" />
      <p className="text-sm text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}
