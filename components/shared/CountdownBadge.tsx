"use client";

import { Target, AlertTriangle } from "lucide-react";

interface CountdownBadgeProps {
  testDate: string | null;
  testName?: string | null;
  /** compact = pill-only, full = icon + label (default) */
  variant?: "compact" | "full";
}

function daysUntil(dateStr: string): number {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export default function CountdownBadge({
  testDate,
  testName,
  variant = "full",
}: CountdownBadgeProps) {
  if (!testDate) return null;

  const days = daysUntil(testDate);
  const urgent = days <= 30;
  const veryUrgent = days <= 7;

  const formattedDate = new Date(testDate).toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const message =
    days <= 0
      ? "Exam today!"
      : `${days} day${days !== 1 ? "s" : ""} to ${testName ?? "exam"}`;

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
          veryUrgent
            ? "bg-error-text text-white"
            : urgent
            ? "bg-warning-bg text-warning-text"
            : "bg-page border border-border text-muted-foreground"
        }`}
      >
        {veryUrgent && <AlertTriangle size={10} />}
        {days}d to exam
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${
        veryUrgent
          ? "bg-error-bg border border-error-text/20"
          : urgent
          ? "bg-warning-bg border border-warning-text/20"
          : "bg-page border border-border"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          veryUrgent
            ? "bg-error-bg"
            : urgent
            ? "bg-warning-bg"
            : "bg-white"
        }`}
      >
        {veryUrgent ? (
          <AlertTriangle size={15} className="text-error-text" />
        ) : (
          <Target
            size={15}
            className={urgent ? "text-warning-text" : "text-deep-navy"}
          />
        )}
      </div>
      <p
        className={`text-xs font-bold truncate min-w-0 flex-1 ${
          veryUrgent
            ? "text-error-text"
            : urgent
            ? "text-warning-text"
            : "text-deep-navy"
        }`}
      >
        {message}
        <span className="ml-1 font-normal text-muted-foreground">
          · {formattedDate}
        </span>
      </p>
    </div>
  );
}
