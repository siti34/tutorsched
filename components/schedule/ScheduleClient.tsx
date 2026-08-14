"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { List, Calendar, Plus, Clock, MapPin, Video, ChevronRight } from "lucide-react";
import type { SessionWithStudent } from "@/lib/actions/sessions";
import type { Student } from "@/db/schema";
import AddSessionModal from "@/components/schedule/AddSessionModal";
import { STUDENT_COLORS, STUDENT_COLOR_FALLBACK, getStudentColor } from "@/lib/constants";

const CalendarView = dynamic(() => import("@/components/schedule/CalendarView"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-page border border-border rounded-2xl animate-pulse" />
  ),
});

type ViewMode = "list" | "calendar";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-SG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateGroup(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-SG", { weekday: "short", month: "short", day: "numeric" });
}

function groupByDate(sessions: SessionWithStudent[]): Record<string, SessionWithStudent[]> {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
  const groups: Record<string, SessionWithStudent[]> = {};
  for (const s of sorted) {
    const key = new Date(s.scheduledAt).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }
  return groups;
}

interface Props {
  sessions: SessionWithStudent[];
  students: Student[];
}

export default function ScheduleClient({ sessions, students }: Props) {
  const [view, setView] = useState<ViewMode>("list");
  const [showModal, setShowModal] = useState(false);

  const grouped = useMemo(() => groupByDate(sessions), [sessions]);
  const upcoming = sessions.filter((s) => s.status === "upcoming").length;

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of students) {
      map[s.id] = getStudentColor(s.id, students);
    }
    return map;
  }, [students]);

  const nextSession = useMemo(() => {
    const upcomingSessions = sessions
      .filter((s) => s.status === "upcoming")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return upcomingSessions[0] ?? null;
  }, [sessions]);

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-medium text-deep-navy">Schedule</h1>
          <p className="text-sm text-muted-foreground">{upcoming} upcoming</p>
        </div>
        {/* Toggle */}
        <div className="flex bg-white rounded-xl p-1 gap-1 border border-border">
          {(["list", "calendar"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                view === v
                  ? "bg-sky-accent text-deep-navy"
                  : "text-muted-foreground hover:text-deep-navy"
              }`}
            >
              {v === "list" ? <List size={13} /> : <Calendar size={13} />}
              {v === "list" ? "List" : "Calendar"}
            </button>
          ))}
        </div>
      </div>

      {/* Hero card: next upcoming session */}
      {nextSession && (
        <div className="rounded-2xl bg-action-blue text-white p-5 mb-4">
          <p className="text-xs font-medium text-white/70 uppercase tracking-wide mb-1">
            Next session
          </p>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-medium leading-tight">
                {nextSession.student.name} · {nextSession.student.subject}
              </p>
              <p className="text-sm text-white/80 mt-1">
                {formatDateGroup(nextSession.scheduledAt)} at {formatTime(nextSession.scheduledAt)}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(nextSession.student.name)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/80 mt-3">
            {nextSession.mode === "online" ? <Video size={12} /> : <MapPin size={12} />}
            <span>{nextSession.location}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {view === "calendar" ? (
        <CalendarView sessions={sessions} colorMap={colorMap} />
      ) : (
        <ListView grouped={grouped} colorMap={colorMap} />
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-action-blue text-white rounded-full shadow-lg shadow-action-blue/30 flex items-center justify-center hover:bg-action-blue-600 active:scale-95 transition-all duration-150 z-40 cursor-pointer"
        aria-label="Add session"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {showModal && (
        <AddSessionModal students={students} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

/* ── List view ───────────────────────────────────────────────────────────── */

function ListView({
  grouped,
  colorMap,
}: {
  grouped: Record<string, SessionWithStudent[]>;
  colorMap: Record<string, string>;
}) {
  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-action-blue/10 flex items-center justify-center mb-4">
          <Calendar size={28} className="text-action-blue" />
        </div>
        <p className="text-deep-navy font-semibold mb-1">No sessions yet</p>
        <p className="text-sm text-muted-foreground">Tap + to schedule your first lesson</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-28">
      {Object.entries(grouped).map(([dateKey, daySessions]) => (
        <div key={dateKey}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              {formatDateGroup(daySessions[0].scheduledAt)}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="flex flex-col gap-3">
            {daySessions.map((s) => (
              <SessionCard key={s.id} session={s} color={colorMap[s.studentId] ?? STUDENT_COLOR_FALLBACK} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionCard({ session, color }: { session: SessionWithStudent; color: string }) {
  const done = session.status === "completed";
  const cancelled = session.status === "cancelled";

  return (
    <div
      className={`bg-white rounded-xl border border-border flex overflow-hidden transition-all duration-150 active:scale-[0.99] cursor-pointer ${
        done || cancelled ? "opacity-60" : ""
      }`}
    >
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {getInitials(session.student.name)}
            </div>
            <div>
              <p className="text-deep-navy font-semibold text-sm leading-tight">
                {session.student.name}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">{session.student.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {done ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-page text-muted-foreground font-medium">Done</span>
            ) : cancelled ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">Cancelled</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-bg text-success-text font-medium">Upcoming</span>
            )}
            <ChevronRight size={14} className="text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} className="text-action-blue" />
            <span>{formatTime(session.scheduledAt)} · {session.durationMin}m</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {session.mode === "online" ? (
              <Video size={11} className="text-action-blue" />
            ) : (
              <MapPin size={11} className="text-action-blue" />
            )}
            <span>{session.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
