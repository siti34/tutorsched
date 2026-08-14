"use client";

import { useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type Event as RBCEvent,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { SessionWithStudent } from "@/lib/actions/sessions";
import { STUDENT_COLOR_FALLBACK } from "@/lib/constants";

const localizer = dateFnsLocalizer({
  format: (date: Date, fmt: string) => format(date, fmt, { locale: enUS }),
  parse: (value: string, fmt: string, ref: Date) => parse(value, fmt, ref, { locale: enUS }),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { "en-US": enUS },
});

interface CalendarEvent extends RBCEvent {
  resource: SessionWithStudent;
}

interface Props {
  sessions: SessionWithStudent[];
  colorMap: Record<string, string>;
}

function CalendarHeader({ date }: { date: Date }) {
  const today = isSameDay(date, new Date());
  return (
    <div className="flex flex-col items-center gap-1 py-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {format(date, "EEE")}
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
          today ? "bg-action-blue font-medium text-white" : "font-normal text-deep-navy"
        }`}
      >
        {format(date, "d")}
      </span>
    </div>
  );
}

function CalendarEventCard({ event }: { event: CalendarEvent }) {
  const { durationMin, student } = event.resource;
  const start = event.start ? format(event.start, "h:mm a") : "";

  if (durationMin <= 60) {
    return (
      <div className="truncate leading-tight">
        {start} · {student.name}
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden leading-tight">
      <span className="truncate text-[10px] font-normal opacity-90">
        {start} – {event.end ? format(event.end, "h:mm a") : ""}
      </span>
      <span className="truncate">{student.name}</span>
      {durationMin >= 90 && (
        <span className="truncate text-[10px] font-normal opacity-90">{student.subject}</span>
      )}
    </div>
  );
}

export default function CalendarView({ sessions, colorMap }: Props) {
  const events: CalendarEvent[] = useMemo(
    () =>
      sessions.map((s) => ({
        title: `${s.student.name} · ${s.student.subject}`,
        start: new Date(s.scheduledAt),
        end: addMinutes(new Date(s.scheduledAt), s.durationMin),
        resource: s,
      })),
    [sessions]
  );

  function eventPropGetter(event: CalendarEvent) {
    const color = colorMap[event.resource.studentId] ?? STUDENT_COLOR_FALLBACK;
    const done = event.resource.status !== "upcoming";
    return {
      style: {
        backgroundColor: color,
        opacity: done ? 0.55 : 1,
      },
    };
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden pb-28">
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={Views.WEEK}
        views={[Views.WEEK, Views.DAY, Views.AGENDA]}
        style={{ height: 560 }}
        eventPropGetter={eventPropGetter}
        components={{ header: CalendarHeader, event: CalendarEventCard }}
        min={new Date(0, 0, 0, 7, 0, 0)}
        max={new Date(0, 0, 0, 22, 0, 0)}
        popup
        formats={{
          timeGutterFormat: (d: Date) => format(d, "h a"),
          dayHeaderFormat: (d: Date) => format(d, "EEE d"),
          agendaDateFormat: (d: Date) => format(d, "EEE, MMM d"),
        }}
        messages={{ previous: "‹", next: "›", today: "Today", week: "Week", day: "Day", agenda: "Agenda" }}
        tooltipAccessor={(e: CalendarEvent) =>
          `${e.resource.student.name} — ${e.resource.student.subject}\n${e.resource.location}`
        }
      />
    </div>
  );
}
