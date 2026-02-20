"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { activityApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  ScrollText,
  UtensilsCrossed,
  Wallet,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  Shield,
  Settings,
  LogIn,
  CalendarOff,
  Filter,
} from "lucide-react";

interface ActivityLogEntry {
  id: string;
  user: string;
  user_name: string;
  flat: string;
  action: string;
  action_label: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const ACTION_ICONS: Record<string, { icon: typeof ScrollText; color: string; bg: string }> = {
  login: { icon: LogIn, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  logout: { icon: LogIn, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
  meal_add: { icon: UtensilsCrossed, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  meal_update: { icon: UtensilsCrossed, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/30" },
  month_lock: { icon: Lock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  month_unlock: { icon: Unlock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  expense_add: { icon: Wallet, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30" },
  expense_update: { icon: Wallet, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  expense_delete: { icon: Wallet, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  member_invite: { icon: UserPlus, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-100 dark:bg-brand-900/30" },
  member_join: { icon: UserPlus, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  member_remove: { icon: UserMinus, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  member_status: { icon: CalendarOff, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  permission_update: { icon: Shield, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-100 dark:bg-brand-900/30" },
  flat_update: { icon: Settings, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
};

const ACTION_FILTERS = [
  { value: "", label: "All Activities" },
  { value: "meal_add", label: "Meal Entries" },
  { value: "meal_update", label: "Meal Updates" },
  { value: "expense_add", label: "Expenses Added" },
  { value: "expense_delete", label: "Expenses Deleted" },
  { value: "month_lock", label: "Month Locked" },
  { value: "month_unlock", label: "Month Unlocked" },
  { value: "member_invite", label: "Invites Created" },
  { value: "member_join", label: "Members Joined" },
  { value: "member_remove", label: "Members Removed" },
  { value: "member_status", label: "Member Status" },
  { value: "permission_update", label: "Permission Changes" },
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

export default function ActivityPage() {
  const [actionFilter, setActionFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["activityLogs", actionFilter],
    queryFn: () =>
      activityApi.getLogs(actionFilter ? { action: actionFilter } : undefined).then((r) => r.data),
  });

  const logs: ActivityLogEntry[] = data?.logs || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-brand-500" />
            Activity Log
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all actions in your flat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-base !w-auto !py-2 !px-3 !text-xs !rounded-xl"
          >
            {ACTION_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <ScrollText size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-sm font-medium text-gray-400">No activity yet</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
            Actions will appear here as members use the app
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {logs.map((log, idx) => {
              const actionConfig = ACTION_ICONS[log.action] || {
                icon: ScrollText,
                color: "text-gray-600 dark:text-gray-400",
                bg: "bg-gray-100 dark:bg-gray-800",
              };
              const Icon = actionConfig.icon;

              return (
                <div
                  key={log.id}
                  className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", actionConfig.bg)}>
                      <Icon size={16} className={actionConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {log.user_name || "System"}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {log.action_label}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                          {log.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
