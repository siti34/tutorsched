import { notFound } from "next/navigation";
import { getStudentDetail } from "@/lib/actions/sessions";
import StudentDetailClient from "@/components/students/StudentDetailClient";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getStudentDetail(id);
  if (!data) notFound();
  return <StudentDetailClient data={data} />;
}
