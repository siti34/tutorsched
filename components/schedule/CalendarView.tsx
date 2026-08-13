"use client";

import { useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type Event as RBCEvent,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addMinutes } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { SessionWithStudent } from "@/lib/actions/sessions";

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
    const color = colorMap[event.resource.studentId] ?? "#0A2A66";
    const done = event.resource.status !== "upcoming";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "8px",
        border: "none",
        borderLeft: "3px solid #14BF96",
        color: "#FFFFFF",
        fontSize: "11px",
        fontWeight: 600,
        opacity: done ? 0.55 : 1,
        padding: "2px 6px",
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
