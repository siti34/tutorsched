"use client";

import Link from "next/link";
import { ChevronRight, CalendarDays, Clock, BookOpen, Users } from "lucide-react";
import type { StudentWithNextSession } from "@/lib/actions/sessions";
import { getStudentColor } from "@/lib/constants";

interface Props {
  students: StudentWithNextSession[];
}

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
        <h1 className="text-2xl font-bold text-deep-navy">Students</h1>
        <p className="text-sm text-muted-foreground">{students.length} active</p>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-action-blue/10 flex items-center justify-center mb-4">
            <Users size={28} className="text-action-blue" />
          </div>
          <p className="text-deep-navy font-semibold mb-1">No students yet</p>
          <p className="text-sm text-muted-foreground">Add your first student to get started</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-28">
          {students.map((student) => {
            const color = getStudentColor(student.id, students);
            const days = daysUntil(student.testDate);
            const urgent = days !== null && days <= 30;

            return (
              <Link key={student.id} href={`/students/${student.id}`}>
                <div className="bg-white rounded-2xl border border-border transition-all duration-150 active:scale-[0.99] cursor-pointer overflow-hidden">
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
                          <p className="text-deep-navy font-bold text-base leading-tight">{student.name}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{student.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {days !== null && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              urgent
                                ? "bg-warning-bg text-warning-text"
                                : "bg-action-blue-50 text-action-blue"
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
                          <CalendarDays size={11} className="text-action-blue" />
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
      )}
    </div>
  );
}
