"use server";

import { db } from "@/lib/db";
import {
  sessions,
  students,
  sessionNotes,
  sessionSyllabusTopics,
  syllabusItems,
  type Session,
  type Student,
} from "@/db/schema";
import { eq, desc, asc, and, gte, lte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { Student };

export type SessionWithStudent = Session & { student: Student };

export type StudentWithNextSession = Student & {
  nextSession: Session | null;
  completedCount: number;
};

export type StudentDetail = Student & {
  sessions: Array<
    Session & {
      note: { id: string; content: string; updatedAt: string } | null;
      coveredTopics: string[];
    }
  >;
  coveredTopicIds: string[];
};

export type PreLessonBriefData = {
  session: Session;
  student: Student;
  lastNote: { id: string; content: string; updatedAt: string } | null;
  lastSessionDate: string | null;
  coveredTopicIds: string[];
  syllabusItems: Array<{
    id: string;
    stage: string;
    category: string;
    topicName: string;
    description: string | null;
    orderIndex: number;
    covered: boolean;
  }>;
  upcomingTestDate: string | null;
  upcomingTestName: string | null;
  currentSessionNote: {
    id: string | null;
    content: string;
  };
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getSessions(): Promise<SessionWithStudent[]> {
  const rows = await db.query.sessions.findMany({
    with: { student: true },
    orderBy: [asc(sessions.scheduledAt)],
  });
  return rows as SessionWithStudent[];
}

export async function getStudents(): Promise<Student[]> {
  return db.select().from(students).orderBy(asc(students.name));
}

export async function getStudentsWithNextSession(): Promise<
  StudentWithNextSession[]
> {
  const allStudents = await db
    .select()
    .from(students)
    .orderBy(asc(students.name));
  const now = new Date().toISOString();

  const result: StudentWithNextSession[] = [];

  for (const student of allStudents) {
    const nextSession = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.studentId, student.id),
          gte(sessions.scheduledAt, now),
          eq(sessions.status, "upcoming")
        )
      )
      .orderBy(asc(sessions.scheduledAt))
      .limit(1)
      .then((r) => r[0] ?? null);

    const completedCount = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.studentId, student.id),
          eq(sessions.status, "completed")
        )
      )
      .then((r) => r.length);

    result.push({ ...student, nextSession, completedCount });
  }

  return result;
}

export async function getStudentDetail(
  studentId: string
): Promise<StudentDetail | null> {
  const student = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .then((r) => r[0] ?? null);

  if (!student) return null;

  const allSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.studentId, studentId))
    .orderBy(desc(sessions.scheduledAt));

  const sessionIds = allSessions.map((s) => s.id);

  const notes =
    sessionIds.length > 0
      ? await db
          .select()
          .from(sessionNotes)
          .where(inArray(sessionNotes.sessionId, sessionIds))
      : [];

  const taggedTopics =
    sessionIds.length > 0
      ? await db
          .select()
          .from(sessionSyllabusTopics)
          .where(inArray(sessionSyllabusTopics.sessionId, sessionIds))
      : [];

  const coveredTopicIds = [
    ...new Set(taggedTopics.map((t) => t.syllabusItemId)),
  ];

  const enrichedSessions = allSessions.map((s) => ({
    ...s,
    note: notes.find((n) => n.sessionId === s.id) ?? null,
    coveredTopics: taggedTopics
      .filter((t) => t.sessionId === s.id)
      .map((t) => t.syllabusItemId),
  }));

  return { ...student, sessions: enrichedSessions, coveredTopicIds };
}

export async function getPreLessonBrief(
  studentId: string,
  sessionId: string
): Promise<PreLessonBriefData | null> {
  const student = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .then((r) => r[0] ?? null);

  if (!student) return null;

  const session = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.studentId, studentId)))
    .then((r) => r[0] ?? null);

  if (!session) return null;

  // Current session note
  const currentNote = await db
    .select()
    .from(sessionNotes)
    .where(eq(sessionNotes.sessionId, sessionId))
    .then((r) => r[0] ?? null);

  // Last completed session (before this one)
  const lastCompletedSession = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.studentId, studentId),
        eq(sessions.status, "completed"),
        lte(sessions.scheduledAt, session.scheduledAt)
      )
    )
    .orderBy(desc(sessions.scheduledAt))
    .limit(2)
    .then((rows) => {
      // exclude current session itself
      return rows.find((r) => r.id !== sessionId) ?? null;
    });

  const lastNote = lastCompletedSession
    ? await db
        .select()
        .from(sessionNotes)
        .where(eq(sessionNotes.sessionId, lastCompletedSession.id))
        .then((r) => r[0] ?? null)
    : null;

  // All covered topic IDs across all sessions for this student
  const allSessionIds = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.studentId, studentId))
    .then((r) => r.map((s) => s.id));

  const coveredTopicIds =
    allSessionIds.length > 0
      ? await db
          .select()
          .from(sessionSyllabusTopics)
          .where(inArray(sessionSyllabusTopics.sessionId, allSessionIds))
          .then((r) => [...new Set(r.map((t) => t.syllabusItemId))])
      : [];

  // Get syllabus items (only for eiken-pre1 since that's Kenji's subject)
  const items = await db
    .select()
    .from(syllabusItems)
    .where(eq(syllabusItems.studentSubject, "eiken-pre1"))
    .orderBy(asc(syllabusItems.orderIndex));

  const enrichedItems = items.map((item) => ({
    ...item,
    covered: coveredTopicIds.includes(item.id),
  }));

  return {
    session,
    student,
    lastNote: lastNote
      ? {
          id: lastNote.id,
          content: lastNote.content,
          updatedAt: lastNote.updatedAt,
        }
      : null,
    lastSessionDate: lastCompletedSession?.scheduledAt ?? null,
    coveredTopicIds,
    syllabusItems: enrichedItems,
    upcomingTestDate: student.testDate,
    upcomingTestName: student.testName,
    currentSessionNote: {
      id: currentNote?.id ?? null,
      content: currentNote?.content ?? "",
    },
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createSession(data: {
  studentId: string;
  scheduledAt: string;
  durationMin: number;
  location: string;
  mode: string;
}) {
  const id = randomUUID();
  await db.insert(sessions).values({
    id,
    studentId: data.studentId,
    scheduledAt: data.scheduledAt,
    durationMin: data.durationMin,
    location: data.location,
    mode: data.mode,
    status: "upcoming",
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/schedule");
  revalidatePath("/students");
  return { id };
}

export async function updateSessionStatus(
  sessionId: string,
  status: "upcoming" | "completed" | "cancelled"
) {
  await db
    .update(sessions)
    .set({ status })
    .where(eq(sessions.id, sessionId));
  revalidatePath("/schedule");
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
  revalidatePath("/schedule");
}
