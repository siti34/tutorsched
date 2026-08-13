"use client";

import Link from "next/link";
import { ChevronRight, CalendarDays, Clock, BookOpen } from "lucide-react";
import type { StudentWithNextSession } from "@/lib/actions/sessions";

interface Props {
  students: StudentWithNextSession[];
}

const STUDENT_COLORS = ["#0A2A66", "#14BF96", "#FFC212", "#6366F1"];

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatNextSession(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudentsClient({ students }: Props) {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-khan-navy">Students</h1>
        <p className="text-sm text-muted-foreground">{students.length} active</p>
      </div>

      <div className="flex flex-col gap-4 pb-28">
        {students.map((student, idx) => {
          const color = STUDENT_COLORS[idx % STUDENT_COLORS.length];
          const days = daysUntil(student.testDate);
          const urgent = days !== null && days <= 30;

          return (
            <Link key={student.id} href={`/students/${student.id}`}>
              <div className="bg-white rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-150 active:scale-[0.99] cursor-pointer overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  {/* Color bar */}
                  <div className="w-1 self-stretch rounded-full flex-shrink-0 -ml-4 mr-1" style={{ backgroundColor: color }} />

                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {getInitials(student.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-khan-navy font-bold text-base leading-tight">{student.name}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{student.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {days !== null && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                            urgent
                              ? "bg-sun-50 text-sun-600"
                              : "bg-teal-50 text-teal-600"
                          }`}>
                            {days}d to exam
                          </span>
                        )}
                        <ChevronRight size={14} className="text-muted-foreground" />
                      </div>
                    </div>

                    {/* Next session */}
                    {student.nextSession && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <CalendarDays size={11} className="text-teal-500" />
                        <span>{formatNextSession(student.nextSession.scheduledAt)}</span>
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        <span>{student.completedCount} sessions done</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen size={11} />
                        <span>{student.level}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
