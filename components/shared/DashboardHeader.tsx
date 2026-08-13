"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";

interface Props {
  tutorName: string;
}

const PAGE_TITLES: Record<string, string> = {
  "/schedule": "Schedule",
  "/students": "Students",
  "/billing": "Billing",
};

export default function DashboardHeader({ tutorName }: Props) {
  const pathname = usePathname();

  const matched = Object.entries(PAGE_TITLES).find(([href]) =>
    pathname.startsWith(href)
  );
  const pageTitle = matched ? matched[1] : "TutorSched";

  return (
    <header className="fixed top-0 inset-x-0 z-30 bg-white border-b border-border h-16 flex items-center px-4 sm:px-6">
      {/* Wordmark */}
      <Link href="/schedule" className="flex-shrink-0 flex items-center gap-2">
        <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3h10M2 7h7M2 11h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-khan-navy font-bold text-base tracking-tight">
          Tutor<span className="text-teal-500">Sched</span>
        </span>
      </Link>

      {/* Page title (mobile) */}
      {pageTitle !== "TutorSched" && (
        <span className="ml-3 text-slate-400 text-sm font-medium sm:hidden">
          · {pageTitle}
        </span>
      )}

      <div className="flex-1" />

      {/* Tutor name + bell */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-ice-100 transition-colors text-slate-400 hover:text-khan-navy cursor-pointer">
          <Bell size={17} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-khan-navy flex items-center justify-center text-white text-xs font-bold">
            {tutorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="text-khan-navy text-sm font-semibold hidden sm:inline">
            {tutorName}
          </span>
        </div>
      </div>
    </header>
  );
}
