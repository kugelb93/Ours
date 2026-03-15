export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function scoreColor(score: number | null | undefined): string {
  if (score == null) return "text-gray-400";
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-yellow-400";
  return "text-red-400";
}

export function scoreBg(score: number | null | undefined): string {
  if (score == null) return "bg-gray-700";
  if (score >= 85) return "bg-emerald-500/20";
  if (score >= 70) return "bg-yellow-500/20";
  return "bg-red-500/20";
}

export function scoreRingColor(score: number | null | undefined): string {
  if (score == null) return "stroke-gray-600";
  if (score >= 85) return "stroke-emerald-400";
  if (score >= 70) return "stroke-yellow-400";
  return "stroke-red-400";
}
