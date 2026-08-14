"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, CreditCard, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/students", label: "Students", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border h-16 flex items-center justify-around px-2 safe-area-inset-bottom">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-150 ${
              active ? "text-action-blue" : "text-muted-foreground hover:text-deep-navy"
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-action-blue rounded-full" />
            )}
            <span className="relative flex flex-col items-center gap-0.5">
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? "text-action-blue" : ""}
              />
              <span className={`text-[10px] font-semibold ${active ? "text-action-blue" : ""}`}>
                {label}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
