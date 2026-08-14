import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/profile/SignOutButton";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div>
      <h1 className="text-lg font-medium text-deep-navy mb-4">Profile</h1>

      <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-4">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
            Name
          </p>
          <p className="text-[13px] text-deep-navy">
            {session.user?.name ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
            Email
          </p>
          <p className="text-[13px] text-deep-navy">
            {session.user?.email ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <SignOutButton />
      </div>
    </div>
  );
}
