"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { List, Calendar, Plus, Clock, MapPin, Video, ChevronRight } from "lucide-react";
import type { SessionWithStudent } from "@/lib/actions/sessions";
import type { Student } from "@/db/schema";
import AddSessionModal from "@/components/schedule/AddSessionModal";

const CalendarView = dynamic(() => import("@/components/schedule/CalendarView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] bg-white rounded-2xl border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading calendar…</p>
      </div>
    </div>
  ),
});

type ViewMode = "list" | "calendar";

// Stable per-student color derived from student id position
const STUDENT_COLORS = ["#0A2A66", "#14BF96", "#FFC212", "#6366F1", "#EF4444"];

function getStudentColor(studentId: string, students: Student[]): string {
  const idx = students.findIndex((s) => s.id === studentId);
  return STUDENT_COLORS[idx >= 0 ? idx % STUDENT_COLORS.length : 0];
}

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

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-khan-navy">Schedule</h1>
          <p className="text-sm text-muted-foreground">{upcoming} upcoming</p>
        </div>
        {/* Toggle */}
        <div className="flex bg-ice-100 rounded-xl p-1 gap-1 border border-border">
          {(["list", "calendar"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                view === v
                  ? "bg-white text-khan-navy shadow-sm"
                  : "text-muted-foreground hover:text-khan-navy"
              }`}
            >
              {v === "list" ? <List size={13} /> : <Calendar size={13} />}
              {v === "list" ? "List" : "Calendar"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {view === "calendar" ? (
        <CalendarView sessions={sessions} colorMap={colorMap} />
      ) : (
        <ListView grouped={grouped} colorMap={colorMap} />
      )}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center hover:bg-teal-600 active:scale-95 transition-all duration-150 z-40 cursor-pointer"
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
        <div className="w-16 h-16 rounded-full bg-ice-100 flex items-center justify-center mb-4">
          <Calendar size={28} className="text-muted-foreground" />
        </div>
        <p className="text-khan-navy font-semibold mb-1">No sessions yet</p>
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
              <SessionCard key={s.id} session={s} color={colorMap[s.studentId] ?? "#0A2A66"} />
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
      className={`bg-white rounded-2xl border border-border flex overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-150 active:scale-[0.99] cursor-pointer ${
        done || cancelled ? "opacity-60" : ""
      }`}
    >
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {getInitials(session.student.name)}
            </div>
            <div>
              <p className="text-khan-navy font-semibold text-sm leading-tight">
                {session.student.name}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">{session.student.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {done ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-ice-100 text-muted-foreground font-medium">Done</span>
            ) : cancelled ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">Cancelled</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 font-medium">Upcoming</span>
            )}
            <ChevronRight size={14} className="text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} className="text-teal-500" />
            <span>{formatTime(session.scheduledAt)} · {session.durationMin}m</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {session.mode === "online" ? (
              <Video size={11} className="text-teal-500" />
            ) : (
              <MapPin size={11} className="text-teal-500" />
            )}
            <span>{session.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
