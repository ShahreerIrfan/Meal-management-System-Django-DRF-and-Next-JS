import Link from "next/link";
import {
  UtensilsCrossed,
  Calculator,
  BarChart3,
  Shield,
  Users,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: "Meal Tracking",
    desc: "Excel-like grid with auto-save. Click and type — no submit button needed.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Calculator,
    title: "Auto Calculation",
    desc: "Real-time meal rate, individual costs, and balance computed instantly.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Beautiful charts showing meal trends, expense shares, and monthly comparisons.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: Shield,
    title: "Permissions",
    desc: "16 granular permissions per member. Owner controls who can do what.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Users,
    title: "Invite System",
    desc: "Share a link. Members join in one click. Track usage and expiry.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    desc: "Optimistic UI with React Query. Changes reflect everywhere immediately.",
    color: "from-brand-500 to-blue-500",
    bg: "bg-brand-50 dark:bg-brand-900/20",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Production-Ready SaaS
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Smart Flat
            <span className="block bg-gradient-to-r from-brand-600 via-violet-500 to-brand-400 bg-clip-text text-transparent">
              Meal & Expense
            </span>
            Manager
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Track daily meals, manage bazar expenses, auto-calculate meal rates, and settle
            balances — all in one beautiful platform. Built for shared flats.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base">
              Get Started Free
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3.5 text-base">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 pt-8">
            {[
              { num: "10K+", label: "Flats Ready" },
              { num: "16", label: "Permissions" },
              { num: "Auto", label: "Save" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.num}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              A complete toolkit for managing shared living expenses with transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group glass-card rounded-2xl p-6 card-hover cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 bg-gradient-to-br ${f.color} bg-clip-text`} style={{ color: "transparent", WebkitBackgroundClip: "text" }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="gradient-brand rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to simplify your flat?
              </h2>
              <p className="text-brand-100 mb-8 text-lg">
                Create an account, invite your flatmates, and start tracking in minutes.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3.5 bg-white text-brand-600 rounded-xl font-bold text-base hover:bg-brand-50 shadow-xl shadow-brand-900/30 transition-all duration-200 active:scale-[0.97]"
              >
                Create Your Flat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Built with Django &amp; Next.js — Smart Flat Meal Manager &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
