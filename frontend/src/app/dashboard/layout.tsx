"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { authApi, permissionApi, flatApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  ScrollText,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, perm: null },
  { label: "Meals", href: "/dashboard/meals", icon: UtensilsCrossed, perm: "view_meals" },
  { label: "Expenses", href: "/dashboard/expenses", icon: ShoppingCart, perm: "view_expenses" },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, perm: "view_analytics" },
  { label: "Members", href: "/dashboard/members", icon: Users, perm: "view_members" },
  { label: "Activity Log", href: "/dashboard/activity", icon: ScrollText, perm: null },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, perm: null },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, tokens, setUser, setPermissions, permissions, logout, activeFlatId, setActiveFlatId } =
    useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Hydrate user & permissions on mount
  useEffect(() => {
    if (!tokens) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch profile
        const profileRes = await authApi.getProfile();
        setUser(profileRes.data);

        // 2. Ensure we have an active flat ID FIRST (needed for permission header)
        let currentFlatId = activeFlatId;
        if (!currentFlatId) {
          const flatsRes = await flatApi.getMyFlats();
          const flats = flatsRes.data;
          if (Array.isArray(flats) && flats.length > 0) {
            currentFlatId = flats[0].flat;
            setActiveFlatId(currentFlatId);
            // Give axios interceptor time to pick up the new flat ID from localStorage
            await new Promise((r) => setTimeout(r, 50));
          }
        }

        // 3. NOW fetch permissions (with correct X-Flat-ID header)
        const permRes = await permissionApi.getMine();
        setPermissions(permRes.data.codenames || []);
        setPermissionsLoaded(true);
      } catch {
        logout();
        router.push("/login");
      }
    };
    fetchData();
  }, [tokens]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dark mode toggle
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    setDarkMode((prev: boolean) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const hasPerm = (perm: string | null) => {
    if (!perm) return true;
    // Show all nav items while permissions are still loading
    if (!permissionsLoaded) return true;
    return permissions.includes(perm);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  if (!tokens) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-[280px] flex flex-col transition-transform duration-300 ease-in-out",
          "bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-md shadow-brand-500/20">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
              MealManager
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-3">
            Menu
          </p>
          {NAV_ITEMS.filter((item) => hasPerm(item.perm)).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                    active
                      ? "bg-brand-100 dark:bg-brand-800/30"
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      active ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                </div>
                {item.label}
                {active && (
                  <ChevronRight size={14} className="ml-auto text-brand-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 dark:border-gray-800/80 p-4 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-500/20">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDark}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              {darkMode ? "Light" : "Dark"}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {NAV_ITEMS.find((n) => isActive(n.href))?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {user?.full_name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
