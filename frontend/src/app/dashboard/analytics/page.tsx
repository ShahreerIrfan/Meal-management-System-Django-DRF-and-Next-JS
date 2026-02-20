"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { MONTH_NAMES } from "@/lib/utils";
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp, PieChart as PieIcon, Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const tooltipStyle = {
  backgroundColor: "rgba(17,24,39,0.95)",
  border: "1px solid rgba(99,102,241,0.2)",
  borderRadius: "12px",
  color: "#f3f4f6",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
  padding: "10px 14px",
  fontSize: "12px",
};

const CHART_CARDS = [
  { key: "mealPerUser", title: "Meal Count per Member", icon: BarChart3, color: "brand" },
  { key: "expenseShare", title: "Expense Share", icon: PieIcon, color: "violet" },
  { key: "dailyMeals", title: "Daily Meal Trend", icon: TrendingUp, color: "emerald" },
  { key: "monthlyComparison", title: "Monthly Comparison", icon: Activity, color: "amber" },
];

export default function AnalyticsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: mealPerUser } = useQuery({
    queryKey: ["analytics-mealPerUser", year, month],
    queryFn: () => analyticsApi.mealPerUser(year, month).then((r) => r.data.data),
  });

  const { data: expenseShare } = useQuery({
    queryKey: ["analytics-expenseShare", year, month],
    queryFn: () => analyticsApi.expenseShare(year, month).then((r) => r.data.data),
  });

  const { data: dailyMeals } = useQuery({
    queryKey: ["analytics-dailyMeals", year, month],
    queryFn: () => analyticsApi.dailyMeals(year, month).then((r) => r.data.data),
  });

  const { data: monthlyComparison } = useQuery({
    queryKey: ["analytics-monthlyComparison", year],
    queryFn: () => analyticsApi.monthlyComparison(year).then((r) => r.data.data),
  });

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); } else setMonth(month + 1);
  };

  const monthlyCompFormatted = (monthlyComparison || []).map((m) => ({
    ...m,
    name: MONTH_NAMES[m.month - 1]?.slice(0, 3),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-500" />
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visual insights for your flat&apos;s meal &amp; expense data
          </p>
        </div>
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
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        {/* Bar: Meal count per user */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <BarChart3 size={16} className="text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Meal Count per Member</h3>
          </div>
          <div className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={mealPerUser || []}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                <Bar dataKey="meals" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie: Expense share */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <PieIcon size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Expense Share</h3>
          </div>
          <div className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expenseShare || []}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(expenseShare || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line: Daily meal trend */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Daily Meal Trend</h3>
          </div>
          <div className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailyMeals || []}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="meals"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Composed: Monthly comparison */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Activity size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Monthly Comparison <span className="text-gray-400 font-normal">({year})</span>
            </h3>
          </div>
          <div className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyCompFormatted}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="total_expense" fill="url(#areaGradient)" stroke="#6366f1" strokeWidth={1.5} name="Expense" />
                <Bar dataKey="total_meals" fill="#10b981" radius={[4, 4, 0, 0]} name="Meals" barSize={20} />
                <Line type="monotone" dataKey="meal_rate" stroke="#f59e0b" strokeWidth={2} name="Rate" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
