"use client";

import { useState } from "react";
import { X, User, BookOpen, Clock, MapPin, CalendarDays } from "lucide-react";
import { createSession } from "@/lib/actions/sessions";
import type { Student } from "@/lib/actions/sessions";

interface Props {
  students: Student[];
  onClose: () => void;
}

const DURATIONS = [45, 60, 75, 90, 120];

export default function AddSessionModal({ students, onClose }: Props) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(90);
  const [location, setLocation] = useState("Zoom");
  const [mode, setMode] = useState<"online" | "in-person">("online");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    await createSession({ studentId, scheduledAt, durationMin: duration, location, mode });
    setSaving(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl z-50 shadow-2xl max-h-[92dvh] overflow-y-auto animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-deep-navy font-medium text-lg">New Session</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-page transition-colors cursor-pointer"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-5 pb-10">
          {/* Student */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <User size={11} className="text-action-blue" />
              Student
            </label>
            <div className="relative">
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-page border border-border rounded-xl px-4 py-3 text-sm text-deep-navy font-medium appearance-none outline-none focus:border-action-blue transition-colors cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▾</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <CalendarDays size={11} className="text-action-blue" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="bg-page border border-border rounded-xl px-3 py-3 text-sm text-deep-navy outline-none focus:border-action-blue transition-colors cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <Clock size={11} className="text-action-blue" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-page border border-border rounded-xl px-3 py-3 text-sm text-deep-navy outline-none focus:border-action-blue transition-colors cursor-pointer"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <Clock size={11} className="text-action-blue" />
              Duration
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-150 cursor-pointer ${
                    duration === d
                      ? "bg-action-blue text-white border-action-blue"
                      : "bg-page text-muted-foreground border-border hover:border-action-blue"
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Mode</label>
            <div className="flex bg-white border border-border rounded-xl p-1 gap-1">
              {(["online", "in-person"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setLocation(m === "online" ? "Zoom" : ""); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                    mode === m ? "bg-sky-accent text-deep-navy" : "text-muted-foreground hover:text-deep-navy"
                  }`}
                >
                  {m === "online" ? "Online" : "In-person"}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <MapPin size={11} className="text-action-blue" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={mode === "online" ? "Zoom / Google Meet" : "e.g. Starbucks Orchard"}
              className="bg-page border border-border rounded-xl px-4 py-3 text-sm text-deep-navy outline-none focus:border-action-blue transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-action-blue text-white rounded-xl py-4 font-bold text-sm hover:bg-action-blue-600 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : "Add Session"}
          </button>
        </form>
      </div>
    </>
  );
}
