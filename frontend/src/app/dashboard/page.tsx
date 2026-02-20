"use client";

import { useQuery } from "@tanstack/react-query";
import { mealApi } from "@/lib/api";
import { formatCurrency, MONTH_NAMES } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import type { UserBalance, MonthSummary } from "@/lib/types";
import { UtensilsCrossed, Wallet, TrendingUp, Lock, ArrowUpRight, ArrowDownRight } from "lucide-react";

const CARD_CONFIG = [
  {
    key: "meals",
    label: "Total Meals",
    icon: UtensilsCrossed,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    iconBg: "bg-blue-100 dark:bg-blue-800/30",
    getValue: (s: MonthSummary) => String(s.total_meals ?? 0),
    getSub: () => "This month",
  },
  {
    key: "expense",
    label: "Total Expense",
    icon: Wallet,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    iconBg: "bg-violet-100 dark:bg-violet-800/30",
    getValue: (s: MonthSummary) => formatCurrency(s.total_expense ?? 0),
    getSub: () => "All bazar",
  },
  {
    key: "rate",
    label: "Meal Rate",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-800/30",
    getValue: (s: MonthSummary) => formatCurrency(s.meal_rate ?? 0),
    getSub: () => "Per meal",
  },
  {
    key: "status",
    label: "Status",
    icon: Lock,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    iconBg: "bg-amber-100 dark:bg-amber-800/30",
    getValue: (s: MonthSummary) => (s.is_locked ? "Locked" : "Open"),
    getSub: (s: MonthSummary) => (s.is_locked ? "Month finalized" : "Entries allowed"),
  },
];

export default function DashboardPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data, isLoading } = useQuery({
    queryKey: ["monthSummary", year, month],
    queryFn: () => mealApi.getSummary(year, month).then((r) => r.data),
  });

  const summary: MonthSummary | undefined = data?.summary;
  const balances: UserBalance[] = data?.balances || [];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {MONTH_NAMES[month - 1]} {year} — Overview
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
            {CARD_CONFIG.map((card) => (
              <div
                key={card.key}
                className="glass-card rounded-2xl p-5 card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className={`w-5 h-5 text-${card.gradient.split("-")[1]}-600 dark:text-${card.gradient.split("-")[1]}-400`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {card.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary ? card.getValue(summary) : "—"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {summary ? card.getSub(summary) : ""}
                </p>
              </div>
            ))}
          </div>

          {/* Balances Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Member Balances
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{balances.length} members</p>
              </div>
              <div className="flex items-center gap-2">
                {summary && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Meal Rate: <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(summary.meal_rate)}</span>
                  </span>
                )}
                <span className="badge badge-brand">
                  {MONTH_NAMES[month - 1]}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Member
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Total Meals
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Meal Cost
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Total Bazar
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Balance
                    </th>
                    <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {balances.map((b) => (
                    <tr key={b.user_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-xs shadow-sm">
                            {b.full_name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{b.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400 font-medium">
                        {b.total_meals}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-gray-700 dark:text-gray-300 font-semibold">
                          {formatCurrency(b.individual_cost)}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {b.total_meals} × {summary ? formatCurrency(summary.meal_rate) : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(b.total_paid)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.balance >= 0 ? (
                            <ArrowUpRight size={14} className="text-emerald-500" />
                          ) : (
                            <ArrowDownRight size={14} className="text-red-500" />
                          )}
                          <span
                            className={`font-bold ${
                              b.balance >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {b.balance >= 0 ? "+" : ""}
                            {formatCurrency(b.balance)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            b.balance >= 0
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {b.balance >= 0 ? "Will Receive" : "Will Pay"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {balances.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-300 dark:text-gray-600 mb-2">
                          <UtensilsCrossed className="w-10 h-10 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-400">No data for this month yet.</p>
                        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                          Start adding meals and expenses to see balances here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
