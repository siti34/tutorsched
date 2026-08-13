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

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
          veryUrgent
            ? "bg-red-500 text-white"
            : urgent
            ? "bg-sun-500 text-white"
            : "bg-sun-50 text-sun-600"
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
          ? "bg-red-50 border border-red-200"
          : urgent
          ? "bg-sun-50 border border-sun-100"
          : "bg-ice-100 border border-border"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          veryUrgent
            ? "bg-red-100"
            : urgent
            ? "bg-sun-100"
            : "bg-ice-200"
        }`}
      >
        {veryUrgent ? (
          <AlertTriangle
            size={15}
            className="text-red-500"
          />
        ) : (
          <Target
            size={15}
            className={urgent ? "text-sun-600" : "text-khan-navy"}
          />
        )}
      </div>
      <div>
        <p
          className={`text-xs font-bold ${
            veryUrgent
              ? "text-red-600"
              : urgent
              ? "text-sun-600"
              : "text-khan-navy"
          }`}
        >
          {days <= 0
            ? "Exam today!"
            : `${days} day${days !== 1 ? "s" : ""} to ${testName ?? "exam"}`}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {new Date(testDate).toLocaleDateString("en-SG", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
