"use server";

import { db } from "@/lib/db";
import { invoices, sessions, materials, students } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import type { Student, Session, Material, Invoice } from "@/db/schema";
import { getStudentColor } from "@/lib/constants";

export type SessionLineItem = {
  session: Session;
  fee: number;
};

export type StudentInvoiceData = {
  student: Student;
  sessions: SessionLineItem[];
  materials: Material[];
  sessionTotal: number;
  materialsTotal: number;
  grandTotal: number;
  invoice: Invoice | null;
  periodStart: string;
  periodEnd: string;
  month: string;
};

export type BillingStudentOverview = {
  studentId: string;
  studentName: string;
  color: string;
  sessionsCount: number;
  sessionFee: number;
  materialsTotal: number;
  total: number;
  status: "pending" | "paid";
};

export type BillingOverview = {
  month: string;
  grandTotal: number;
  pendingTotal: number;
  students: BillingStudentOverview[];
};

export async function getBillingOverview(): Promise<BillingOverview> {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const month = now.toLocaleDateString("en-SG", { month: "long", year: "numeric" });

  const allStudents = await db.select().from(students);

  const overview: BillingStudentOverview[] = [];

  for (let idx = 0; idx < allStudents.length; idx++) {
    const student = allStudents[idx];

    const completedSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.studentId, student.id),
          eq(sessions.status, "completed"),
          gte(sessions.scheduledAt, periodStart),
          lte(sessions.scheduledAt, periodEnd)
        )
      );

    const sessionFee = completedSessions.reduce(
      (sum, s) => sum + student.hourlyRate * (s.durationMin / 60),
      0
    );

    const mats = await db
      .select()
      .from(materials)
      .where(
        and(
          eq(materials.studentId, student.id),
          gte(materials.createdAt, periodStart),
          lte(materials.createdAt, periodEnd)
        )
      );

    const materialsTotal = mats.reduce((sum, m) => sum + m.cost, 0);

    // Check if there's a paid invoice for this period
    const paidInvoice = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.studentId, student.id),
          eq(invoices.status, "paid"),
          gte(invoices.periodStart, periodStart)
        )
      )
      .then((r) => r[0] ?? null);

    overview.push({
      studentId: student.id,
      studentName: student.name,
      color: getStudentColor(student.id, allStudents),
      sessionsCount: completedSessions.length,
      sessionFee,
      materialsTotal,
      total: sessionFee + materialsTotal,
      status: paidInvoice ? "paid" : "pending",
    });
  }

  const grandTotal = overview.reduce((s, o) => s + o.total, 0);
  const pendingTotal = overview
    .filter((o) => o.status === "pending")
    .reduce((s, o) => s + o.total, 0);

  return { month, grandTotal, pendingTotal, students: overview };
}

export async function getStudentInvoiceData(
  studentId: string
): Promise<StudentInvoiceData | null> {
  const student = await db
    .select()
    .from(students)
    .where(eq(students.id, studentId))
    .then((r) => r[0] ?? null);

  if (!student) return null;

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  const month = now.toLocaleDateString("en-SG", { month: "long", year: "numeric" });

  const completedSessions = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.studentId, studentId),
        eq(sessions.status, "completed"),
        gte(sessions.scheduledAt, periodStart),
        lte(sessions.scheduledAt, periodEnd)
      )
    );

  const sessionLineItems: SessionLineItem[] = completedSessions.map((s) => ({
    session: s,
    fee: student.hourlyRate * (s.durationMin / 60),
  }));

  const mats = await db
    .select()
    .from(materials)
    .where(
      and(
        eq(materials.studentId, studentId),
        gte(materials.createdAt, periodStart),
        lte(materials.createdAt, periodEnd)
      )
    );

  const sessionTotal = sessionLineItems.reduce((sum, l) => sum + l.fee, 0);
  const materialsTotal = mats.reduce((sum, m) => sum + m.cost, 0);

  const existingInvoice = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.studentId, studentId),
        gte(invoices.periodStart, periodStart)
      )
    )
    .then((r) => r[0] ?? null);

  return {
    student,
    sessions: sessionLineItems,
    materials: mats,
    sessionTotal,
    materialsTotal,
    grandTotal: sessionTotal + materialsTotal,
    invoice: existingInvoice,
    periodStart,
    periodEnd,
    month,
  };
}

export async function markInvoicePaid(studentId: string) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const existing = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.studentId, studentId),
        gte(invoices.periodStart, periodStart)
      )
    )
    .then((r) => r[0] ?? null);

  if (existing) {
    await db.update(invoices).set({ status: "paid" }).where(eq(invoices.id, existing.id));
  } else {
    await db.insert(invoices).values({
      id: randomUUID(),
      studentId,
      periodStart,
      periodEnd,
      totalSessions: 0,
      totalMaterials: 0,
      status: "paid",
      createdAt: now.toISOString(),
    });
  }

  revalidatePath("/billing");
}
