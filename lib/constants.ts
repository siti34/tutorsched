export const STUDENT_COLORS = [
  "#2563EB",
  "#0EA5A4",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
] as const;

export const STUDENT_COLOR_FALLBACK = "#2563EB";

export function getStudentColor(
  studentId: string,
  students: { id: string }[]
): string {
  const idx = students.findIndex((s) => s.id === studentId);
  return STUDENT_COLORS[idx >= 0 ? idx % STUDENT_COLORS.length : 0];
}
