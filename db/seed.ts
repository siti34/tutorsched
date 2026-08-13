import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

const now = new Date().toISOString();

async function seed() {
  console.log("🌱 Seeding Supabase database...");

  // ─── Clear existing data (order matters — child tables first) ──────────────
  await db.delete(schema.sessionSyllabusTopics);
  await db.delete(schema.sessionNotes);
  await db.delete(schema.materials);
  await db.delete(schema.invoices);
  await db.delete(schema.sessions);
  await db.delete(schema.students);
  await db.delete(schema.syllabusItems);

  console.log("   ✓ Cleared existing data");

  // ─── Students ───────────────────────────────────────────────────────────────
  const studentData: schema.NewStudent[] = [
    {
      id: "student-kenji",
      name: "Kenji Sato",
      subject: "English (Eiken Prep)",
      level: "Eiken Grade Pre-1",
      hourlyRate: 90,
      testDate: "2026-10-04",
      testName: "Eiken Pre-1 Stage 1 Written",
      createdAt: now,
    },
    {
      id: "student-aaliyah",
      name: "Aaliyah Tan",
      subject: "Additional Mathematics",
      level: "GCE O-Level",
      hourlyRate: 80,
      testDate: "2026-10-22",
      testName: "A-Math Paper 1",
      createdAt: now,
    },
    {
      id: "student-lucas",
      name: "Lucas Lim",
      subject: "Primary Science",
      level: "PSLE",
      hourlyRate: 70,
      testDate: "2026-09-29",
      testName: "Science Written",
      createdAt: now,
    },
  ];

  await db.insert(schema.students).values(studentData);
  console.log("   ✓ Inserted 3 students (Kenji Sato, Aaliyah Tan, Lucas Lim)");

  // ─── Eiken Pre-1 Syllabus ──────────────────────────────────────────────────
  const syllabusData = [
    // Stage 1 — Reading & Vocabulary
    {
      id: "s1-rv-1",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Reading & Vocabulary",
      topicName: "Academic & Abstract Vocabulary Gap-Fill",
      description: "High-frequency academic and abstract vocabulary used in gap-fill contexts",
      orderIndex: 1,
    },
    {
      id: "s1-rv-2",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Reading & Vocabulary",
      topicName: "Idioms, Phrasal Verbs & Prepositions",
      description: "Idiomatic expressions, phrasal verbs, and prepositional use",
      orderIndex: 2,
    },
    {
      id: "s1-rv-3",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Reading & Vocabulary",
      topicName: "Explanatory & Critical Essay Gap-Fill",
      description: "Vocabulary in context of analytical and argumentative writing",
      orderIndex: 3,
    },
    // Stage 1 — Reading Comprehension
    {
      id: "s1-rc-1",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Reading Comprehension",
      topicName: "Social Issues & Environmental Science Passages",
      description: "Reading comprehension on social and environmental science topics",
      orderIndex: 4,
    },
    {
      id: "s1-rc-2",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Reading Comprehension",
      topicName: "History, Humanities & Technology Passages",
      description: "Reading comprehension on history, humanities and tech topics",
      orderIndex: 5,
    },
    // Stage 1 — Writing
    {
      id: "s1-wr-1",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Writing",
      topicName: "Task A — Summary Writing (60–70 words)",
      description: "Summarise a passage in 60–70 words accurately and concisely",
      orderIndex: 6,
    },
    {
      id: "s1-wr-2",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Writing",
      topicName: "Task B — Opinion Essay (120–150 words, 2 given points)",
      description: "Write a structured opinion essay using two provided supporting points",
      orderIndex: 7,
    },
    // Stage 1 — Listening
    {
      id: "s1-ls-1",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Listening",
      topicName: "Part 1 — Conversation Comprehension",
      description: "Listen to short conversations and answer multiple-choice Qs",
      orderIndex: 8,
    },
    {
      id: "s1-ls-2",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Listening",
      topicName: "Part 2 — Passage Comprehension",
      description: "Listen to longer passages and answer comprehension questions",
      orderIndex: 9,
    },
    {
      id: "s1-ls-3",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Listening",
      topicName: "Part 3 — Real-life Situation Questions",
      description: "Listen to real-life scenarios and respond to situation Qs",
      orderIndex: 10,
    },
    // Stage 2 — Speaking
    {
      id: "s2-sp-1",
      studentSubject: "eiken-pre1",
      stage: "stage2",
      category: "Speaking / Interview",
      topicName: "4-Frame Narrative Sequence",
      description: "1-min prep, 2-min oral story based on 4-panel picture sequence",
      orderIndex: 11,
    },
    {
      id: "s2-sp-2",
      studentSubject: "eiken-pre1",
      stage: "stage2",
      category: "Speaking / Interview",
      topicName: "Picture Sequence Q&A",
      description: "Answer questions about characters' reactions and thoughts",
      orderIndex: 12,
    },
    {
      id: "s2-sp-3",
      studentSubject: "eiken-pre1",
      stage: "stage2",
      category: "Speaking / Interview",
      topicName: "Social & Abstract Q&A",
      description: "Express opinions on technology, ethics, culture, and politics",
      orderIndex: 13,
    },
    // Themes (Stage 1 & 2)
    {
      id: "s1-th-1",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Themes",
      topicName: "Environment & Ecology",
      description: "Recurring essay and reading theme",
      orderIndex: 14,
    },
    {
      id: "s1-th-2",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Themes",
      topicName: "Technology & Society",
      description: "Recurring essay and reading theme",
      orderIndex: 15,
    },
    {
      id: "s1-th-3",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Themes",
      topicName: "Education & Youth",
      description: "Recurring essay and reading theme",
      orderIndex: 16,
    },
    {
      id: "s1-th-4",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Themes",
      topicName: "Business & Economics",
      description: "Recurring essay and reading theme",
      orderIndex: 17,
    },
    {
      id: "s1-th-5",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Themes",
      topicName: "Health & Medicine",
      description: "Recurring essay and reading theme",
      orderIndex: 18,
    },
    {
      id: "s1-th-6",
      studentSubject: "eiken-pre1",
      stage: "stage1",
      category: "Themes",
      topicName: "Culture & History",
      description: "Recurring essay and reading theme",
      orderIndex: 19,
    },
  ];

  await db.insert(schema.syllabusItems).values(syllabusData);
  console.log("   ✓ Inserted 19 Eiken Pre-1 syllabus items");

  // ─── Sessions ──────────────────────────────────────────────────────────────
  const sessionData: schema.NewSession[] = [
    // Kenji — past session (AI-tagged) + upcoming
    {
      id: "session-kenji-1",
      studentId: "student-kenji",
      scheduledAt: "2026-08-07T15:00:00",
      durationMin: 90,
      location: "Tutor's home",
      mode: "in-person",
      status: "completed",
      createdAt: now,
    },
    {
      id: "session-kenji-2",
      studentId: "student-kenji",
      scheduledAt: "2026-08-14T15:00:00",
      durationMin: 90,
      location: "Tutor's home",
      mode: "in-person",
      status: "upcoming",
      createdAt: now,
    },
    {
      id: "session-kenji-3",
      studentId: "student-kenji",
      scheduledAt: "2026-08-21T15:00:00",
      durationMin: 90,
      location: "Tutor's home",
      mode: "in-person",
      status: "upcoming",
      createdAt: now,
    },
    // Aaliyah — past + upcoming
    {
      id: "session-aaliyah-1",
      studentId: "student-aaliyah",
      scheduledAt: "2026-08-09T10:00:00",
      durationMin: 120,
      location: "Online (Zoom)",
      mode: "online",
      status: "completed",
      createdAt: now,
    },
    {
      id: "session-aaliyah-2",
      studentId: "student-aaliyah",
      scheduledAt: "2026-08-16T10:00:00",
      durationMin: 120,
      location: "Online (Zoom)",
      mode: "online",
      status: "upcoming",
      createdAt: now,
    },
    // Lucas — past + upcoming
    {
      id: "session-lucas-1",
      studentId: "student-lucas",
      scheduledAt: "2026-08-08T09:00:00",
      durationMin: 60,
      location: "Student's home",
      mode: "in-person",
      status: "completed",
      createdAt: now,
    },
    {
      id: "session-lucas-2",
      studentId: "student-lucas",
      scheduledAt: "2026-08-15T09:00:00",
      durationMin: 60,
      location: "Student's home",
      mode: "in-person",
      status: "upcoming",
      createdAt: now,
    },
  ];

  await db.insert(schema.sessions).values(sessionData);
  console.log("   ✓ Inserted 7 sessions");

  // ─── Session Notes ─────────────────────────────────────────────────────────
  await db.insert(schema.sessionNotes).values([
    {
      id: "note-kenji-1",
      sessionId: "session-kenji-1",
      content: `Kenji did really well on the Task B opinion essay today — we worked on the "Technology & Society" theme. He structured his arguments clearly and used good linking phrases like "furthermore" and "in contrast". 

We also drilled vocab gap-fill from the STEP Eiken Pre-1 word list, focusing on academic words: "advocate", "scrutinize", "mitigate". He got 8/10 correct unprompted.

Listening Part 2 was tricky — he struggled with the passage comprehension speed, especially when there were background noises. Suggested he use the official practice tracks at 1.0x speed then work up to 1.1x.

Next session: focus on Task A summary writing (he tends to go over word limit). Also want to do a timed run of Stage 2 narrative — the exam is 7 weeks out.`,
      updatedAt: now,
    },
    {
      id: "note-aaliyah-1",
      sessionId: "session-aaliyah-1",
      content: `Covered differentiation and integration — specifically the chain rule and product rule. Aaliyah gets the mechanics but made errors under time pressure.

Did 5 past paper questions from 2023 A-Math Paper 1. She got 3/5 correct, errors mainly in sign handling during integration.

Homework: 10 differentiation drill problems from Chapter 8 of Marshall Cavendish.

Next session: Start on trigonometric identities (sin²θ + cos²θ = 1 chain). She hasn't touched this topic yet.`,
      updatedAt: now,
    },
    {
      id: "note-lucas-1",
      sessionId: "session-lucas-1",
      content: `Lucas is shaky on classification of living things — couldn't name the 5 kingdoms confidently. We used flashcards and he improved by end of session.

Also revised the water cycle: evaporation, condensation, precipitation. He drew a diagram from memory — got all the labels right.

Seemed distracted in the second half, probably tired from school. Kept the session shorter. 

Next session: Systems of the human body — focus on digestive system since PSLE often tests this.`,
      updatedAt: now,
    },
  ]);
  console.log("   ✓ Inserted 3 session notes");

  // ─── AI-tagged syllabus topics ─────────────────────────────────────────────
  await db.insert(schema.sessionSyllabusTopics).values([
    { sessionId: "session-kenji-1", syllabusItemId: "s1-wr-2" },
    { sessionId: "session-kenji-1", syllabusItemId: "s1-rv-1" },
    { sessionId: "session-kenji-1", syllabusItemId: "s1-ls-2" },
    { sessionId: "session-kenji-1", syllabusItemId: "s1-th-2" },
  ]);
  console.log("   ✓ Inserted 4 AI-tagged syllabus topics for Kenji session 1");

  // ─── Materials ─────────────────────────────────────────────────────────────
  await db.insert(schema.materials).values([
    {
      id: "mat-1",
      studentId: "student-kenji",
      name: "STEP Eiken Pre-1 Official Practice Test Book Vol. 2",
      cost: 28.9,
      receiptPath: null,
      createdAt: "2026-08-01T00:00:00",
    },
    {
      id: "mat-2",
      studentId: "student-kenji",
      name: "Printed listening transcripts (30 pages)",
      cost: 3.6,
      receiptPath: null,
      createdAt: "2026-08-07T00:00:00",
    },
    {
      id: "mat-3",
      studentId: "student-aaliyah",
      name: "Marshall Cavendish A-Math Textbook (Additional copy)",
      cost: 22.5,
      receiptPath: null,
      createdAt: "2026-08-05T00:00:00",
    },
    {
      id: "mat-4",
      studentId: "student-lucas",
      name: "My Pals Are Here! Science P6 Assessment",
      cost: 12.8,
      receiptPath: null,
      createdAt: "2026-08-08T00:00:00",
    },
  ]);
  console.log("   ✓ Inserted 4 materials");

  // ─── Invoices ──────────────────────────────────────────────────────────────
  await db.insert(schema.invoices).values([
    {
      id: "inv-kenji-aug",
      studentId: "student-kenji",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-31",
      totalSessions: 135, // 1.5h × $90
      totalMaterials: 32.5,
      status: "pending",
      createdAt: now,
    },
    {
      id: "inv-aaliyah-aug",
      studentId: "student-aaliyah",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-31",
      totalSessions: 160, // 2h × $80
      totalMaterials: 22.5,
      status: "pending",
      createdAt: now,
    },
    {
      id: "inv-lucas-aug",
      studentId: "student-lucas",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-31",
      totalSessions: 70, // 1h × $70
      totalMaterials: 12.8,
      status: "paid",
      createdAt: now,
    },
  ]);
  console.log("   ✓ Inserted 3 invoices");

  console.log("\n✅ Seed complete!");
  console.log("   Students : 3 (Kenji Sato, Aaliyah Tan, Lucas Lim)");
  console.log("   Sessions : 7 total");
  console.log("   Syllabus : 19 Eiken Pre-1 items");
  console.log("   Notes    : 3 with realistic content");
  console.log("   Tagged   : 4 topics for Kenji session 1");
  console.log("   Materials: 4");
  console.log("   Invoices : 3");

  await client.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
