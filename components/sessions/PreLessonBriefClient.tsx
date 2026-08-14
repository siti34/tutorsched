"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Wifi,
  WifiOff,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PenLine,
  Calendar,
} from "lucide-react";
import type { PreLessonBriefData } from "@/lib/actions/sessions";
import CountdownBadge from "@/components/shared/CountdownBadge";
import SyllabusChecklist from "@/components/syllabus/SyllabusChecklist";
import NoteEditor from "@/components/notes/NoteEditor";

interface Props {
  data: PreLessonBriefData;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function PreLessonBriefClient({ data }: Props) {
  const {
    session,
    student,
    lastNote,
    lastSessionDate,
    coveredTopicIds,
    syllabusItems,
    upcomingTestDate,
    upcomingTestName,
    currentSessionNote,
  } = data;

  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [lastNoteExpanded, setLastNoteExpanded] = useState(true);
  const [syllabusExpanded, setSyllabusExpanded] = useState(false);
  const [newlyTaggedIds, setNewlyTaggedIds] = useState<string[]>([]);
  // Local mirror of note content so it updates without full page refresh
  const [localNoteContent, setLocalNoteContent] = useState(
    currentSessionNote.content
  );

  const totalTopics = syllabusItems.length;
  const coveredCount = syllabusItems.filter((i) => i.covered).length;
  const progressPct = totalTopics > 0 ? (coveredCount / totalTopics) * 100 : 0;

  function handleNoteSaved(topicNames: string[]) {
    // Map topic names back to IDs for SyllabusChecklist highlight
    const newIds = syllabusItems
      .filter((item) => topicNames.includes(item.topicName))
      .map((item) => item.id);
    setNewlyTaggedIds(newIds);
    // Auto-clear highlight after 8s
    setTimeout(() => setNewlyTaggedIds([]), 8000);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back navigation */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href={`/students/${student.id}`}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-white hover:bg-page transition-colors cursor-pointer"
        >
          <ArrowLeft size={17} className="text-deep-navy" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-medium text-deep-navy leading-tight truncate">
            Pre-Lesson Brief
          </h1>
          <p className="text-xs text-muted-foreground">{student.name}</p>
        </div>
      </div>

      {/* ── Session hero card ── */}
      <div className="bg-action-blue rounded-2xl p-5 mb-5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute right-3 -bottom-4 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-action-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(student.name)}
          </div>
          <div>
            <p className="text-white font-medium leading-tight">{student.name}</p>
            <p className="text-white/60 text-xs">{student.subject}</p>
          </div>
        </div>

        {/* Session time + details */}
        <div className="relative bg-white/10 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
            <Calendar size={13} className="text-sky-accent flex-shrink-0" />
            {formatDateTime(session.scheduledAt)}
          </div>
          <div className="flex items-center gap-4 text-white/60 text-xs">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {session.durationMin} min
            </span>
            <span className="flex items-center gap-1">
              {session.mode === "online" ? (
                <Wifi size={11} />
              ) : (
                <WifiOff size={11} />
              )}
              {session.mode}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {session.location}
            </span>
          </div>
        </div>
      </div>

      {/* ── Exam countdown ── */}
      {upcomingTestDate && (
        <div className="mb-4">
          <CountdownBadge
            testDate={upcomingTestDate}
            testName={upcomingTestName}
            variant="full"
          />
        </div>
      )}

      {/* ── Syllabus progress summary ── */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-action-blue" />
            <span className="text-sm font-medium text-deep-navy">
              Syllabus Progress
            </span>
          </div>
          <span className="text-sm font-bold text-action-blue">
            {coveredCount}/{totalTopics}
          </span>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-action-blue rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {progressPct.toFixed(0)}% of Eiken Pre-1 covered
          </p>
          <button
            onClick={() => setSyllabusExpanded((p) => !p)}
            className="flex items-center gap-1 text-[11px] text-action-blue font-medium hover:text-action-blue-700 cursor-pointer transition-colors"
          >
            {syllabusExpanded ? (
              <>
                Hide checklist <ChevronDown size={11} />
              </>
            ) : (
              <>
                View checklist <ChevronRight size={11} />
              </>
            )}
          </button>
        </div>
        {newlyTaggedIds.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-success-bg rounded-lg animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse" />
            <p className="text-[11px] text-success-text font-medium">
              AI just tagged {newlyTaggedIds.length} new topic
              {newlyTaggedIds.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Syllabus checklist expanded */}
      {syllabusExpanded && (
        <div className="mb-4 animate-fade-in">
          <SyllabusChecklist
            items={syllabusItems}
            newlyTaggedIds={newlyTaggedIds}
          />
        </div>
      )}

      {/* ── Current session note card ── */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PenLine size={15} className="text-deep-navy" />
            <span className="text-sm font-medium text-deep-navy">
              Session Notes
            </span>
          </div>
          <button
            onClick={() => setNoteEditorOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-action-blue hover:bg-action-blue-600 transition-colors px-3 py-1.5 rounded-lg cursor-pointer"
          >
            <PenLine size={11} />
            {localNoteContent.trim() ? "Edit Notes" : "Add Notes"}
          </button>
        </div>

        {localNoteContent.trim() ? (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-page rounded-lg p-3">
            {localNoteContent}
          </p>
        ) : (
          <div className="text-center py-6">
            <PenLine size={24} className="text-border mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              No notes yet for this session.
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Tap "Add Notes" to start — AI will tag topics automatically.
            </p>
          </div>
        )}
      </div>

      {/* ── Last session notes card ── */}
      {lastNote && (
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <button
            onClick={() => setLastNoteExpanded((p) => !p)}
            className="w-full flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-muted-foreground" />
              <span className="text-sm font-medium text-deep-navy">
                Last Session Notes
              </span>
              {lastSessionDate && (
                <span className="text-[10px] text-muted-foreground bg-page px-2 py-0.5 rounded-full">
                  {timeAgo(lastSessionDate)} ·{" "}
                  {formatDateShort(lastSessionDate)}
                </span>
              )}
            </div>
            {lastNoteExpanded ? (
              <ChevronDown size={14} className="text-muted-foreground" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
          </button>

          {lastNoteExpanded && (
            <div className="mt-3 animate-fade-in">
              {lastNote.content.trim() ? (
                <p className="text-sm text-muted-foreground leading-relaxed bg-page rounded-lg p-3 whitespace-pre-wrap">
                  {lastNote.content}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No content in last session note.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {!lastNote && (
        <div className="bg-white rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={15} className="text-muted-foreground" />
            <span className="text-sm font-medium text-deep-navy">
              Last Session Notes
            </span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            This is the first session — no previous notes.
          </p>
        </div>
      )}

      {/* Bottom padding for nav */}
      <div className="h-28" />

      {/* ── NoteEditor Drawer ── */}
      {noteEditorOpen && (
        <NoteEditor
          sessionId={session.id}
          studentId={student.id}
          studentName={student.name}
          sessionDate={session.scheduledAt}
          initialContent={localNoteContent}
          initialNoteId={currentSessionNote.id}
          onClose={() => setNoteEditorOpen(false)}
          onSaved={(topicNames) => {
            handleNoteSaved(topicNames);
          }}
        />
      )}
    </div>
  );
}
