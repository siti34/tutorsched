import { getSessions, getStudents } from "@/lib/actions/sessions";
import ScheduleClient from "@/components/schedule/ScheduleClient";

export default async function SchedulePage() {
  const [sessions, students] = await Promise.all([getSessions(), getStudents()]);
  return <ScheduleClient sessions={sessions} students={students} />;
}
