"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  BookOpen,
  Target,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { StudentDetail } from "@/lib/actions/sessions";

interface Props {
  data: StudentDetail;
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
  });
}

const STATUS_STYLES = {
  upcoming: "bg-teal-50 text-teal-600",
  completed: "bg-ice-200 text-slate-500",
  cancelled: "bg-red-50 text-red-500",
};

export default function StudentDetailClient({ data }: Props) {
  const [tab, setTab] = useState<"sessions" | "progress">("sessions");
  // StudentDetail spreads Student fields directly — no nested `.student`
  const { sessions, coveredTopicIds, ...student } = data;

  const days = daysUntil(student.testDate ?? null);
  const urgent = days !== null && days <= 30;
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");

  return (
    <div className="min-h-screen bg-background">
      {/* Back header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/students"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-white hover:bg-ice-100 transition-colors cursor-pointer"
        >
          <ArrowLeft size={17} className="text-khan-navy" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-khan-navy leading-tight">
            {student.name}
          </h1>
          <p className="text-xs text-muted-foreground">{student.subject}</p>
        </div>
      </div>

      {/* Student hero card */}
      <div className="bg-khan-navy rounded-2xl p-5 mb-5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-teal-500/20" />

        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {getInitials(student.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-tight">
              {student.name}
            </p>
            <p className="text-white/60 text-sm">{student.subject}</p>
            <p className="text-white/60 text-sm">{student.level}</p>
          </div>
          {days !== null && (
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                urgent
                  ? "bg-sun-500 text-white"
                  : "bg-teal-500 text-white"
              }`}
            >
              {days}d to exam
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <p className="text-white font-bold text-lg">
              {completedSessions.length}
            </p>
            <p className="text-white/60 text-[10px] uppercase tracking-wide">
              Done
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <p className="text-white font-bold text-lg">
              {upcomingSessions.length}
            </p>
            <p className="text-white/60 text-[10px] uppercase tracking-wide">
              Upcoming
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 text-center">
            <p className="text-white font-bold text-lg">
              {coveredTopicIds.length}
            </p>
            <p className="text-white/60 text-[10px] uppercase tracking-wide">
              Topics
            </p>
          </div>
        </div>

        {/* Test info */}
        {student.testDate && (
          <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <Target size={13} className="text-sun-500 flex-shrink-0" />
            <span className="text-white/80 text-xs">
              {student.testName ?? "Exam"} on{" "}
              {new Date(student.testDate).toLocaleDateString("en-SG", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Hourly rate */}
        <div className="mt-2 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
          <TrendingUp size={13} className="text-teal-400 flex-shrink-0" />
          <span className="text-white/80 text-xs">
            SGD ${student.hourlyRate}/hr
          </span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-white border border-border rounded-xl p-1 mb-5">
        <button
          onClick={() => setTab("sessions")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            tab === "sessions"
              ? "bg-khan-navy text-white shadow-card"
              : "text-muted-foreground hover:text-khan-navy"
          }`}
        >
          Sessions
        </button>
        <button
          onClick={() => setTab("progress")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            tab === "progress"
              ? "bg-khan-navy text-white shadow-card"
              : "text-muted-foreground hover:text-khan-navy"
          }`}
        >
          Progress
        </button>
      </div>

      {tab === "sessions" ? (
        <div className="flex flex-col gap-3 pb-28">
          {sessions.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No sessions yet
            </div>
          )}
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/students/${student.id}/sessions/${session.id}`}
            >
              <div className="bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-150 active:scale-[0.99] cursor-pointer p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          STATUS_STYLES[
                            session.status as keyof typeof STATUS_STYLES
                          ] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {session.status}
                      </span>
                      {session.coveredTopics.length > 0 && (
                        <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium">
                          {session.coveredTopics.length} topics tagged
                        </span>
                      )}
                    </div>
                    <p className="text-khan-navy font-semibold text-sm">
                      {formatDate(session.scheduledAt)}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {session.durationMin} min
                      </span>
                      <span className="flex items-center gap-1">
                        {session.mode === "online" ? (
                          <Wifi size={10} />
                        ) : (
                          <WifiOff size={10} />
                        )}
                        {session.location}
                      </span>
                    </div>
                    {session.note && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 bg-ice-50 rounded-lg p-2">
                        {session.note.content || "No notes yet"}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground mt-1 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Progress tab — syllabus overview */
        <div className="pb-28">
          <div className="bg-white rounded-xl border border-border shadow-card p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} className="text-teal-500" />
              <h2 className="text-khan-navy font-bold text-sm">
                Syllabus Coverage
              </h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {coveredTopicIds.length} topics covered
              </span>
            </div>
            {coveredTopicIds.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">
                No topics tagged yet. Add session notes to track progress.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {coveredTopicIds.map((topicId) => (
                  <span
                    key={topicId}
                    className="inline-flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium"
                  >
                    <CheckCircle2 size={10} />
                    {topicId}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Session timeline */}
          <div className="bg-white rounded-xl border border-border shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={16} className="text-khan-navy" />
              <h2 className="text-khan-navy font-bold text-sm">
                Session Timeline
              </h2>
            </div>
            <div className="space-y-2">
              {sessions.slice(0, 10).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    {s.status === "completed" ? (
                      <CheckCircle2 size={14} className="text-teal-500" />
                    ) : (
                      <Circle size={14} className="text-muted-foreground" />
                    )}
                    {i < sessions.slice(0, 10).length - 1 && (
                      <div className="w-px h-4 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-xs text-khan-navy font-medium">
                      {formatShortDate(s.scheduledAt)}
                    </p>
                    {s.coveredTopics.length > 0 && (
                      <p className="text-[10px] text-teal-600">
                        {s.coveredTopics.length} topic
                        {s.coveredTopics.length !== 1 ? "s" : ""} covered
                      </p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      STATUS_STYLES[s.status as keyof typeof STATUS_STYLES] ??
                      ""
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
