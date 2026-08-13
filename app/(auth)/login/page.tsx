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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-khan-navy via-khan-navy-light to-[#1e4d8c]" />

      {/* Decorative circles */}
      <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full bg-teal-500/10 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] rounded-full bg-white/5 blur-2xl" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Wordmark */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            TutorSched
          </span>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-xl font-700 text-white mb-1">Welcome back</h1>
            <p className="text-sm text-white/60">Sign in to manage your students</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-600 text-white/70 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500 focus:bg-white/15 transition-all"
                  placeholder="you@tutorsched.sg"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-600 text-white/70 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500 focus:bg-white/15 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-600 text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 mt-2"
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
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-xs text-white/40 text-center">
              Demo credentials pre-filled above
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/30 mt-6">
          TutorSched · Built for Singapore private tutors
        </p>
      </div>
    </div>
  );
}
