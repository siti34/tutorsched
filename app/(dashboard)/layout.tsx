import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BottomNav from "@/components/shared/BottomNav";
import DashboardHeader from "@/components/shared/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader tutorName={session.user?.name ?? "Tutor"} />
      <main className="flex-1 pt-16 pb-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
