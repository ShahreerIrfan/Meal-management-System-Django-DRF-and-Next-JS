"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { mealApi, flatApi } from "@/lib/api";
import { useDebounce } from "@/hooks";
import { getDatesInMonth, MONTH_NAMES, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MealEntry, FlatMembership, UserBalance, MonthSummary } from "@/lib/types";
import { Lock, Unlock, ChevronLeft, ChevronRight, UtensilsCrossed, ArrowUpRight, ArrowDownRight, CalendarDays } from "lucide-react";
import { usePermission } from "@/hooks";

export default function MealsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const queryClient = useQueryClient();

  const canAddMeal = usePermission("add_meal");
  const canLock = usePermission("close_month");

  const { data: gridData, isLoading } = useQuery({
    queryKey: ["mealGrid", year, month],
    queryFn: () => mealApi.getGrid(year, month).then((r) => r.data),
  });

  const { data: membersData } = useQuery({
    queryKey: ["members"],
    queryFn: () => flatApi.getMembers().then((r) => r.data),
  });

  const entries: MealEntry[] = gridData?.entries || [];
  const summary: MonthSummary | undefined = gridData?.summary;
  const balances: UserBalance[] = gridData?.balances || [];
  const members: FlatMembership[] = Array.isArray(membersData) ? membersData : [];

  const dates = useMemo(() => getDatesInMonth(year, month), [year, month]);

  const entryMap = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      map[`${e.user}-${e.date}`] = e.meal_count;
    });
    return map;
  }, [entries]);

  const saveCellRaw = useCallback(
    async (userId: string, date: string, mealCount: number) => {
      try {
        await mealApi.updateCell({ user_id: userId, date, meal_count: mealCount });
        queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
        queryClient.invalidateQueries({ queryKey: ["monthSummary", year, month] });
      } catch {
        toast.error("Failed to save");
      }
    },
    [year, month, queryClient]
  );

  const saveCell = useDebounce(saveCellRaw, 500);

  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});

  const handleCellChange = (userId: string, date: string, value: string) => {
    const key = `${userId}-${date}`;
    setLocalEdits((prev: Record<string, string>) => ({ ...prev, [key]: value }));
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      saveCell(userId, date, numValue);
    }
  };

  const getCellValue = (userId: string, date: string): string => {
    const key = `${userId}-${date}`;
    if (localEdits[key] !== undefined) return localEdits[key];
    const val = entryMap[key];
    return val !== undefined ? String(val) : "";
  };

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); } else { setMonth(month - 1); }
    setLocalEdits({});
  };
  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); } else { setMonth(month + 1); }
    setLocalEdits({});
  };

  const handleLock = async () => {
    try {
      await mealApi.lockMonth(year, month);
      toast.success("Month locked");
      queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
    } catch { toast.error("Failed to lock month"); }
  };

  const handleUnlock = async () => {
    try {
      await mealApi.unlockMonth(year, month);
      toast.success("Month unlocked");
      queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
    } catch { toast.error("Failed to unlock month"); }
  };

  // Get day name from date
  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en", { weekday: "short" });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-brand-500" />
            Meal Entries
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click any cell to edit — auto-saves instantly
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft size={16} className="text-gray-500" />
            </button>
            <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[140px] text-center">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight size={16} className="text-gray-500" />
            </button>
          </div>

          {canLock && summary && (
            <button
              onClick={summary.is_locked ? handleUnlock : handleLock}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
                summary.is_locked
                  ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"
              )}
            >
              {summary.is_locked ? <Unlock size={14} /> : <Lock size={14} />}
              {summary.is_locked ? "Unlock" : "Lock Month"}
            </button>
          )}
        </div>
      </div>

      {/* Summary bar */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
          {[
            {
              label: "Meals",
              value: summary.total_meals,
              icon: "🍽️",
              bg: "bg-blue-50 dark:bg-blue-900/15",
              border: "border-blue-100 dark:border-blue-800/30",
              labelColor: "text-blue-600 dark:text-blue-400",
              valueColor: "text-blue-700 dark:text-blue-200",
            },
            {
              label: "Expense",
              value: formatCurrency(summary.total_expense),
              icon: "💰",
              bg: "bg-violet-50 dark:bg-violet-900/15",
              border: "border-violet-100 dark:border-violet-800/30",
              labelColor: "text-violet-600 dark:text-violet-400",
              valueColor: "text-violet-700 dark:text-violet-200",
            },
            {
              label: "Rate",
              value: formatCurrency(summary.meal_rate),
              icon: "📊",
              bg: "bg-emerald-50 dark:bg-emerald-900/15",
              border: "border-emerald-100 dark:border-emerald-800/30",
              labelColor: "text-emerald-600 dark:text-emerald-400",
              valueColor: "text-emerald-700 dark:text-emerald-200",
            },
            {
              label: "Status",
              value: summary.is_locked ? "Locked 🔒" : "Open ✅",
              icon: "",
              bg: "bg-amber-50 dark:bg-amber-900/15",
              border: "border-amber-100 dark:border-amber-800/30",
              labelColor: "text-amber-600 dark:text-amber-400",
              valueColor: "text-amber-700 dark:text-amber-200",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-2xl p-4 text-center border transition-all duration-200",
                item.bg,
                item.border
              )}
            >
              <p className={cn("text-[11px] font-bold uppercase tracking-wider mb-1", item.labelColor)}>
                {item.label}
              </p>
              <p className={cn("text-xl font-bold", item.valueColor)}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="h-96 skeleton" />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <th className="sticky left-0 z-20 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-r border-gray-200 dark:border-gray-700 min-w-[120px]">
                    Date
                  </th>
                  {members.map((m) => (
                    <th
                      key={m.user.id}
                      className="px-3 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 min-w-[90px]"
                    >
                      <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-[10px] mx-auto mb-1 shadow-sm">
                        {m.user.full_name?.[0]?.toUpperCase()}
                      </div>
                      {m.user.full_name.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {dates.map((date) => {
                  const today = isToday(date);
                  return (
                    <tr
                      key={date}
                      className={cn(
                        "hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors",
                        today && "bg-brand-50/50 dark:bg-brand-900/15"
                      )}
                    >
                      <td
                        className={cn(
                          "sticky left-0 z-10 px-4 py-2 border-r border-gray-200 dark:border-gray-700",
                          today
                            ? "bg-brand-50/80 dark:bg-brand-900/20"
                            : "bg-white/80 dark:bg-gray-900/80",
                          "backdrop-blur-sm"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {today && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />}
                          <span className={cn("font-mono text-xs", today ? "font-bold text-brand-600 dark:text-brand-400" : "text-gray-600 dark:text-gray-400")}>
                            {date}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {getDayName(date)}
                          </span>
                        </div>
                      </td>
                      {members.map((m) => (
                        <td key={m.user.id} className="px-2 py-1.5 text-center meal-cell">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="10"
                            value={getCellValue(m.user.id, date)}
                            onChange={(e) => handleCellChange(m.user.id, date, e.target.value)}
                            disabled={!canAddMeal || !!summary?.is_locked}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member totals */}
      {balances.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/80">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Member Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Member</th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Meals</th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Paid</th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Cost</th>
                  <th className="text-right px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {balances.map((b) => (
                  <tr key={b.user_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                          {b.full_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{b.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">{b.total_meals}</td>
                    <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(b.total_paid)}</td>
                    <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(b.individual_cost)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {b.balance >= 0 ? <ArrowUpRight size={13} className="text-emerald-500" /> : <ArrowDownRight size={13} className="text-red-500" />}
                        <span className={cn("font-bold", b.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                          {b.balance >= 0 ? "+" : ""}{formatCurrency(b.balance)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
