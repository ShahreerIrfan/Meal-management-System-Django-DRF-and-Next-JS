"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { UserPlus, User, Mail, Lock, Building, MapPin, ArrowRight } from "lucide-react";

const FIELDS = [
  { label: "Full Name", field: "full_name", type: "text", placeholder: "John Doe", icon: User },
  { label: "Email", field: "email", type: "email", placeholder: "you@email.com", icon: Mail },
  { label: "Password", field: "password", type: "password", placeholder: "Min 8 characters", icon: Lock },
  { label: "Flat Name", field: "flat_name", type: "text", placeholder: "My Flat", icon: Building },
  { label: "Flat Address", field: "flat_address", type: "text", placeholder: "123 Main St (optional)", icon: MapPin, optional: true },
];

export default function RegisterPage() {
  const router = useRouter();
  const { tokens } = useAuthStore();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    flat_name: "",
    flat_address: "",
  });
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (tokens) {
      router.push("/dashboard");
    }
  }, [tokens, router]);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev: typeof form) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success("Registration successful! Please login.");
      router.push("/login");
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-20 -right-20 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -left-20 w-64 h-64 bg-brand-400/15 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fadeInScale">
        <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Register as a Flat Owner to get started
            </p>
          </div>

          {/* Stepper dots */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">1</span>
              Your info
            </div>
            <div className="w-8 h-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">2</span>
              Flat setup
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {FIELDS.map(({ label, field, type, placeholder, icon: Icon, optional }) => (
              <div key={field} className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                  <input
                    type={type}
                    value={form[field as keyof typeof form]}
                    onChange={update(field)}
                    required={!optional}
                    className="input-base pl-12"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account & Flat
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center mt-6 text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
