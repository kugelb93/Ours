"use client";

export default function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-red-400 text-3xl">!</div>
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 text-sm bg-[var(--accent-blue)] text-white rounded-lg hover:opacity-90">
          Retry
        </button>
      )}
    </div>
  );
}
