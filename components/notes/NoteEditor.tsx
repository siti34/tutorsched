"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Sparkles, CheckCircle2, Loader2, Clock } from "lucide-react";
import { saveNote } from "@/lib/actions/notes";

interface NoteEditorProps {
  sessionId: string;
  studentId: string;
  studentName: string;
  sessionDate: string;
  initialContent: string;
  initialNoteId: string | null;
  onClose: () => void;
  onSaved?: (newlyTaggedTopicNames: string[]) => void;
}

type SaveStatus = "idle" | "saving" | "ai-tagging" | "saved" | "error";

function formatSessionDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const DEBOUNCE_MS = 1500;

export default function NoteEditor({
  sessionId,
  studentId,
  studentName,
  sessionDate,
  initialContent,
  initialNoteId,
  onClose,
  onSaved,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [noteId, setNoteId] = useState<string | null>(initialNoteId);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  contentRef.current = content;

  // Auto-save with debounce
  const triggerSave = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setStatus("saving");

      const result = await saveNote({
        sessionId,
        studentId,
        content: text,
        noteId,
      });

      if (result.success) {
        setNoteId(result.noteId);
        setStatus("ai-tagging");

        // Short pause to show "AI tagging" state
        await new Promise((r) => setTimeout(r, 600));

        setStatus("saved");
        setLastSaved(new Date());

        if (result.aiTaggedTopicNames.length > 0) {
          setToast(
            `AI tagged ${result.aiTaggedTopicNames.length} topic${result.aiTaggedTopicNames.length > 1 ? "s" : ""}: ${result.aiTaggedTopicNames.slice(0, 3).join(", ")}${result.aiTaggedTopicNames.length > 3 ? "…" : ""}`
          );
          setTimeout(() => setToast(null), 5000);
        }

        onSaved?.(result.aiTaggedTopicNames);
      } else {
        setStatus("error");
      }
    },
    [sessionId, studentId, noteId]
  );

  // Schedule debounced save on content change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!content.trim() || content === initialContent) {
      setStatus("idle");
      return;
    }
    debounceRef.current = setTimeout(() => {
      triggerSave(contentRef.current);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, triggerSave]);

  // Save on unmount if unsaved changes
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function statusIndicator() {
    switch (status) {
      case "saving":
        return (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Loader2 size={11} className="animate-spin" />
            Saving…
          </span>
        );
      case "ai-tagging":
        return (
          <span className="flex items-center gap-1 text-[11px] text-action-blue">
            <Sparkles size={11} className="animate-pulse" />
            AI tagging…
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1 text-[11px] text-success-text">
            <CheckCircle2 size={11} />
            Saved
          </span>
        );
      case "error":
        return (
          <span className="text-[11px] text-error-text">Save failed</span>
        );
      default:
        return lastSaved ? (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock size={10} />
            Last saved{" "}
            {lastSaved.toLocaleTimeString("en-SG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : null;
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Drawer panel */}
      <div className="mt-auto bg-white rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-page" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-border">
          <div>
            <p className="text-base font-bold text-deep-navy leading-tight">
              {studentName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSessionDate(sessionDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {statusIndicator()}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-page transition-colors cursor-pointer"
            >
              <X size={15} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How did the session go? What topics did you cover? Any observations about the student's progress..."
          className="flex-1 min-h-[300px] max-h-[55vh] resize-none px-5 py-4 text-sm text-deep-navy placeholder:text-muted-foreground focus:outline-none font-sans leading-relaxed bg-white"
        />

        {/* AI Toast */}
        {toast && (
          <div className="mx-5 mb-3 px-4 py-2.5 rounded-xl border border-action-blue-100 bg-action-blue-50 flex items-start gap-2 animate-fade-in">
            <Sparkles size={14} className="text-action-blue flex-shrink-0 mt-0.5" />
            <p className="text-xs text-action-blue-700 font-medium">{toast}</p>
          </div>
        )}

        {/* Footer hint */}
        <div className="px-5 pb-6 pt-1">
          <p className="text-[10px] text-muted-foreground text-center">
            Notes auto-save · AI tags syllabus topics as you write
          </p>
        </div>
      </div>
    </div>
  );
}
