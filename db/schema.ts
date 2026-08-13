import {
  pgTable,
  text,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Students ───────────────────────────────────────────────────────────────

export const students = pgTable("students", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  level: text("level").notNull(),
  hourlyRate: real("hourly_rate").notNull().default(80),
  testDate: text("test_date"), // ISO date string
  testName: text("test_name"),
  createdAt: text("created_at").notNull().default(""),
});

// ─── Sessions ────────────────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  scheduledAt: text("scheduled_at").notNull(), // ISO datetime
  durationMin: integer("duration_min").notNull().default(90),
  location: text("location").notNull().default("Online"),
  mode: text("mode").notNull().default("online"), // 'online' | 'in-person'
  status: text("status").notNull().default("upcoming"), // 'upcoming' | 'completed' | 'cancelled'
  createdAt: text("created_at").notNull().default(""),
});

// ─── Session Notes ────────────────────────────────────────────────────────────

export const sessionNotes = pgTable("session_notes", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  content: text("content").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(""),
});

// ─── Syllabus Items ──────────────────────────────────────────────────────────

export const syllabusItems = pgTable("syllabus_items", {
  id: text("id").primaryKey(),
  studentSubject: text("student_subject").notNull(), // e.g. 'eiken-pre1'
  stage: text("stage").notNull(), // 'stage1' | 'stage2'
  category: text("category").notNull(), // e.g. 'Reading & Vocabulary'
  topicName: text("topic_name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
});

// ─── Session Syllabus Topics (AI-tagged results) ─────────────────────────────

export const sessionSyllabusTopics = pgTable(
  "session_syllabus_topics",
  {
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    syllabusItemId: text("syllabus_item_id")
      .notNull()
      .references(() => syllabusItems.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sessionId, t.syllabusItemId] }),
  })
);

// ─── Materials ────────────────────────────────────────────────────────────────

export const materials = pgTable("materials", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  cost: real("cost").notNull(),
  receiptPath: text("receipt_path"), // uploaded file path
  createdAt: text("created_at").notNull().default(""),
});

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  periodStart: text("period_start").notNull(),
  periodEnd: text("period_end").notNull(),
  totalSessions: real("total_sessions").notNull().default(0),
  totalMaterials: real("total_materials").notNull().default(0),
  status: text("status").notNull().default("pending"), // 'pending' | 'paid'
  createdAt: text("created_at").notNull().default(""),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const studentsRelations = relations(students, ({ many }) => ({
  sessions: many(sessions),
  materials: many(materials),
  invoices: many(invoices),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  student: one(students, {
    fields: [sessions.studentId],
    references: [students.id],
  }),
  note: one(sessionNotes, {
    fields: [sessions.id],
    references: [sessionNotes.sessionId],
  }),
  syllabusTopics: many(sessionSyllabusTopics),
}));

export const sessionNotesRelations = relations(sessionNotes, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionNotes.sessionId],
    references: [sessions.id],
  }),
}));

export const syllabusItemsRelations = relations(syllabusItems, ({ many }) => ({
  sessionTopics: many(sessionSyllabusTopics),
}));

export const sessionSyllabusTopicsRelations = relations(
  sessionSyllabusTopics,
  ({ one }) => ({
    session: one(sessions, {
      fields: [sessionSyllabusTopics.sessionId],
      references: [sessions.id],
    }),
    syllabusItem: one(syllabusItems, {
      fields: [sessionSyllabusTopics.syllabusItemId],
      references: [syllabusItems.id],
    }),
  })
);

export const materialsRelations = relations(materials, ({ one }) => ({
  student: one(students, {
    fields: [materials.studentId],
    references: [students.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  student: one(students, {
    fields: [invoices.studentId],
    references: [students.id],
  }),
}));

// ─── Type exports ─────────────────────────────────────────────────────────────

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type SessionNote = typeof sessionNotes.$inferSelect;
export type SyllabusItem = typeof syllabusItems.$inferSelect;
export type SessionSyllabusTopic = typeof sessionSyllabusTopics.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
