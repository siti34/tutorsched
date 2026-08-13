import { getStudentsWithNextSession } from "@/lib/actions/sessions";
import StudentsClient from "@/components/students/StudentsClient";

export default async function StudentsPage() {
  const students = await getStudentsWithNextSession();
  return <StudentsClient students={students} />;
}
