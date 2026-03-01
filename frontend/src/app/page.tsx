import Link from "next/link";
import {
  UtensilsCrossed,
  Calculator,
  BarChart3,
  Shield,
  Users,
  Zap,
  ArrowRight,
  CheckCircle2,
  Download,
  Pencil,
  Bell,
  UserCircle,
  Keyboard,
} from "lucide-react";

const FEATURES = [
  {
    icon: UtensilsCrossed,
    title: "Meal Tracking",
    desc: "Excel-like grid with auto-save. Click and type — no submit button needed.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-500",
  },
  {
    icon: Calculator,
    title: "Auto Calculation",
    desc: "Real-time meal rate, individual costs, and balance computed instantly.",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Rich Analytics",
    desc: "Beautiful charts showing meal trends, expense shares, and monthly comparisons.",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    iconColor: "text-violet-500",
  },
  {
    icon: Shield,
    title: "Granular Permissions",
    desc: "16 granular permissions per member. Owner controls who can do what.",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    title: "Invite System",
    desc: "Share a link. Members join in one click. Track usage and expiry.",
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    iconColor: "text-pink-500",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    desc: "Optimistic UI with React Query. Changes reflect everywhere immediately.",
    color: "from-brand-500 to-blue-500",
    bg: "bg-brand-50 dark:bg-brand-900/20",
    iconColor: "text-brand-500",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create Your Flat",
    desc: "Sign up and set up your flat in seconds. Give it a name and you're ready.",
    icon: UserCircle,
  },
  {
    step: "02",
    title: "Invite Members",
    desc: "Generate invite links with custom permissions. Members join with one click.",
    icon: Users,
  },
  {
    step: "03",
    title: "Track & Manage",
    desc: "Log meals, add expenses, and let the system calculate everything automatically.",
    icon: UtensilsCrossed,
  },
];

const NEW_FEATURES = [
  { icon: Pencil, label: "Edit Expenses Inline" },
  { icon: Download, label: "Export CSV Data" },
  { icon: Bell, label: "Confirm Dialogs" },
  { icon: Keyboard, label: "Keyboard Shortcuts" },
  { icon: UserCircle, label: "Profile & Security" },
  { icon: BarChart3, label: "Quick Meal Buttons" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-md shadow-brand-500/20">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
              MealManager
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary !py-2 !px-5 !text-sm !rounded-xl">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-brand-200/10 to-violet-200/10 dark:from-brand-800/10 dark:to-violet-800/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-fadeIn">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Open Source & Self-Hosted
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
            balances — all in one beautiful platform. Built for shared flats and hostels.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3.5 text-base">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 pt-8">
            {[
              { num: "∞", label: "Scalable" },
              { num: "16", label: "Permissions" },
              { num: "Auto", label: "Save & Calc" },
              { num: "CSV", label: "Export" },
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider mb-4">
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              A complete toolkit for managing shared living expenses with transparency and ease.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group glass-card rounded-2xl p-6 card-hover cursor-default"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Up and running in 3 steps
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              From sign-up to full management in under 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, idx) => (
              <div key={s.step} className="relative text-center group">
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-brand-200 to-transparent dark:from-brand-800" />
                )}
                <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
                  <s.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-2">{s.step}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[240px] mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Features Showcase ────────────────────────── */}
      <section className="py-24 px-4 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider mb-4">
              What&apos;s New
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Latest additions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Continuously improving with features that matter.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {NEW_FEATURES.map((f) => (
              <div key={f.label} className="glass-card rounded-2xl p-4 text-center card-hover cursor-default">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-5 h-5 text-brand-500" />
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Checklist Section ────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Built for real-world use
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Multi-tenant flat isolation",
              "JWT authentication with auto-refresh",
              "Role-based access control (RBAC)",
              "Soft-delete preserves member data",
              "Month lock/unlock for finalization",
              "Mobile-responsive dark mode",
              "Activity logs for full auditability",
              "Export to CSV for offline use",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to simplify your flat?
              </h2>
              <p className="text-brand-100 mb-8 text-lg">
                Create an account, invite your flatmates, and start tracking in minutes.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-600 rounded-xl font-bold text-base hover:bg-brand-50 shadow-xl shadow-brand-900/30 transition-all duration-200 active:scale-[0.97]"
              >
                Create Your Flat
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center">
              <UtensilsCrossed className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">MealManager</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with Django &amp; Next.js &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Django 6</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>Next.js 16</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
