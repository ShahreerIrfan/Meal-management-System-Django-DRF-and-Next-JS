"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { flatApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function JoinFlatPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { tokens, setActiveFlatId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (!tokens) {
      toast.error("Please login first");
      router.push(`/login?redirect=/join/${token}`);
      return;
    }
    setLoading(true);
    try {
      const res = await flatApi.joinFlat(token);
      setActiveFlatId(res.data.flat.id);
      setJoined(true);
      toast.success(res.data.message || "Joined flat successfully!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errors?: { token?: string[] } } } };
      toast.error(error.response?.data?.errors?.token?.[0] || "Failed to join flat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join a Flat</h1>
        <p className="text-gray-500 dark:text-gray-400">
          You&apos;ve been invited to join a flat. Click below to accept.
        </p>
        <p className="text-sm text-gray-400 font-mono break-all">
          Token: {token}
        </p>

        {joined ? (
          <div className="text-green-600 dark:text-green-400 font-semibold">
            Joined! Redirecting to dashboard…
          </div>
        ) : (
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? "Joining…" : "Join Flat"}
          </button>
        )}
      </div>
    </div>
  );
}
