"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("tutor@tutorsched.sg");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Use demo credentials.");
      setLoading(false);
    } else {
      router.push("/schedule");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      {/* Login card */}
      <div className="w-full max-w-sm mx-4">
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-action-blue rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-deep-navy tracking-tight">
            TutorSched
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-xl font-700 text-deep-navy mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your students</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-600 text-deep-navy uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-page border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-deep-navy placeholder-muted-foreground focus:outline-none focus:border-action-blue transition-colors"
                  placeholder="you@tutorsched.sg"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-600 text-deep-navy uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-page border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-deep-navy placeholder-muted-foreground focus:outline-none focus:border-action-blue transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-action-blue hover:bg-action-blue-600 text-white font-600 text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo credentials pre-filled above
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          TutorSched · Built for Singapore private tutors
        </p>
      </div>
    </div>
  );
}
