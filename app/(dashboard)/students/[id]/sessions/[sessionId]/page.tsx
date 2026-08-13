import { notFound } from "next/navigation";
import { getPreLessonBrief } from "@/lib/actions/sessions";
import PreLessonBriefClient from "@/components/sessions/PreLessonBriefClient";

export default async function PreLessonBriefPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  const data = await getPreLessonBrief(id, sessionId);
  if (!data) notFound();
  return <PreLessonBriefClient data={data} />;
}
