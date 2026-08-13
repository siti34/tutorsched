"use server";

import { db } from "@/lib/db";
import { sessionNotes, sessionSyllabusTopics, syllabusItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { tagSyllabusTopics } from "@/lib/ai/syllabus-tagger";

export async function saveNote(data: {
  sessionId: string;
  studentId: string;
  content: string;
  noteId?: string | null;
}): Promise<{
  success: boolean;
  noteId: string;
  aiTaggedTopics: string[];
  aiTaggedTopicNames: string[];
}> {
  const now = new Date().toISOString();
  let noteId = data.noteId;

  if (noteId) {
    // Update existing note
    await db
      .update(sessionNotes)
      .set({ content: data.content, updatedAt: now })
      .where(eq(sessionNotes.id, noteId));
  } else {
    // Create new note
    noteId = randomUUID();
    await db.insert(sessionNotes).values({
      id: noteId,
      sessionId: data.sessionId,
      content: data.content,
      updatedAt: now,
    });
  }

  // Fetch syllabus items for AI tagging (only eiken-pre1 for now)
  const items = await db.select().from(syllabusItems);

  // Call AI tagger
  const aiResult = await tagSyllabusTopics(data.content, items);

  // Persist tagged topics (replace existing for this session)
  if (aiResult.topicIds.length > 0) {
    await db
      .delete(sessionSyllabusTopics)
      .where(eq(sessionSyllabusTopics.sessionId, data.sessionId));

    await db.insert(sessionSyllabusTopics).values(
      aiResult.topicIds.map((tid) => ({
        sessionId: data.sessionId,
        syllabusItemId: tid,
      }))
    );
  }

  revalidatePath(`/students/${data.studentId}`);
  revalidatePath(
    `/students/${data.studentId}/sessions/${data.sessionId}`
  );

  // Fetch actual names by IDs for toast display
  const taggedItemsByIds =
    aiResult.topicIds.length > 0
      ? items
          .filter((i) => aiResult.topicIds.includes(i.id))
          .map((i) => i.topicName)
      : [];

  return {
    success: true,
    noteId: noteId!,
    aiTaggedTopics: aiResult.topicIds,
    aiTaggedTopicNames: taggedItemsByIds,
  };
}
