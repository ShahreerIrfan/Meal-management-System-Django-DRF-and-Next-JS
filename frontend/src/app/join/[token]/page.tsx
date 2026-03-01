"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { flatApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Users, Mail, Lock, ArrowRight, Loader2, CheckCircle2, User } from "lucide-react";

export default function JoinFlatPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { tokens, setTokens, setActiveFlatId } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{
    flat_name: string;
    is_valid: boolean;
    expires_at: string;
  } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [inviteError, setInviteError] = useState("");

  // Register form state (for logged-out users)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLoggedIn = !!tokens;

  // Fetch public invite info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await flatApi.getInviteInfo(token);
        setInviteInfo(res.data.invite);
      } catch {
        setInviteError("Invalid or expired invite link.");
      } finally {
        setInviteLoading(false);
      }
    };
    fetchInfo();
  }, [token]);

  // Handle join for logged-in users
  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await flatApi.joinFlat(token);
      setActiveFlatId(res.data.flat.id);
      setJoined(true);
      toast.success(res.data.message || "Joined flat successfully!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error("Failed to join flat");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle register + join for logged-out users
  const handleRegisterAndJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await flatApi.registerAndJoin({ email, password, full_name: fullName, token });
      setTokens({ access: res.data.tokens.access, refresh: res.data.tokens.refresh });
      setActiveFlatId(res.data.flat.id);
      setJoined(true);
      toast.success(res.data.message || "Account created & joined flat!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative z-10">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  // Error state
  if (inviteError || !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative z-10 w-full max-w-md animate-fadeInScale">
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invalid Invite</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {inviteError || "This invite link is invalid or has expired."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="btn-secondary mx-auto"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invite expired
  if (!inviteInfo.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative z-10 w-full max-w-md animate-fadeInScale">
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invite Expired</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This invite link has expired or reached its maximum uses.
            </p>
            <button
              onClick={() => router.push("/")}
              className="btn-secondary mx-auto"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (joined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative z-10 w-full max-w-md animate-fadeInScale">
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome!</h1>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              You&apos;ve joined {inviteInfo.flat_name}. Redirecting to dashboard…
            </p>
            <Loader2 size={20} className="animate-spin text-brand-500 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-20 -right-20 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -left-20 w-64 h-64 bg-brand-400/15 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fadeInScale">
        <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Join {inviteInfo.flat_name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isLoggedIn
                ? "You've been invited to join this flat. Click below to accept."
                : "Create an account to join this flat."}
            </p>
          </div>

          {/* Flat info badge */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40">
              <Users size={14} className="text-brand-500" />
              <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                {inviteInfo.flat_name}
              </span>
            </span>
          </div>

          {isLoggedIn ? (
            /* ── Logged-in: simple join button ── */
            <button
              onClick={handleJoin}
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Join Flat
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            /* ── Logged-out: register + join form ── */
            <form onSubmit={handleRegisterAndJoin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-base pl-12"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-base pl-12"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="input-base pl-12"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Register & Join this Flat
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {!isLoggedIn && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => router.push(`/login?redirect=/join/${token}`)}
                className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
              >
                Sign in first
              </button>
            </p>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-gray-400">
          <button
            onClick={() => router.push("/")}
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            &larr; Back to home
          </button>
        </p>
      </div>
    </div>
  );
}
