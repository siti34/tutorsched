"use client";

import { signOutAction } from "@/lib/actions/auth";

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="border border-border text-deep-navy hover:bg-page rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
      >
        Sign out
      </button>
    </form>
  );
}
