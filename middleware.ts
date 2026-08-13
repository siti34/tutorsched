import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Public routes
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/schedule", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes — redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
