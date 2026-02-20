"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { expenseApi, flatApi } from "@/lib/api";
import { formatCurrency, MONTH_NAMES } from "@/lib/utils";
import { usePermission } from "@/hooks";
import type { Expense, FlatMembership } from "@/lib/types";
import { Plus, Trash2, ChevronLeft, ChevronRight, Wallet, ShoppingCart, X, Loader2, Receipt } from "lucide-react";

export default function ExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const canAdd = usePermission("add_expense");
  const canDelete = usePermission("delete_expense");

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", year, month],
    queryFn: () => expenseApi.list(year, month).then((r) => r.data),
  });

  const { data: membersData } = useQuery({
    queryKey: ["members"],
    queryFn: () => flatApi.getMembers().then((r) => r.data),
  });

  const expenses: Expense[] = expensesData?.results || [];
  const members: FlatMembership[] = Array.isArray(membersData) ? membersData : [];
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const createMutation = useMutation({
    mutationFn: expenseApi.create,
    onSuccess: () => {
      toast.success("Expense added");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
      queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
      queryClient.invalidateQueries({ queryKey: ["monthSummary", year, month] });
    },
    onError: () => toast.error("Failed to add expense"),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseApi.remove,
    onSuccess: () => {
      toast.success("Expense deleted");
      queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
      queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
      queryClient.invalidateQueries({ queryKey: ["monthSummary", year, month] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  const [form, setForm] = useState({ paid_by: "", amount: "", description: "", date: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      paid_by: form.paid_by,
      amount: parseFloat(form.amount),
      description: form.description,
      date: form.date,
    });
    setForm({ paid_by: "", amount: "", description: "", date: "" });
  };

  const prevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); } else setMonth(month + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-brand-500" />
            Bazar / Expenses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            This month: <span className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(totalExpense)}</span> across {expenses.length} entries
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
          {canAdd && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2 !rounded-xl"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Cancel" : "Add Expense"}
            </button>
          )}
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="glass-card rounded-2xl p-6 animate-slideDown"
        >
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <ShoppingCart size={14} className="text-brand-500" />
            New Expense Entry
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                Paid By
              </label>
              <select
                value={form.paid_by}
                onChange={(e) => setForm({ ...form, paid_by: e.target.value })}
                required
                className="input-base"
              >
                <option value="">Select member…</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                Amount (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                className="input-base"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-base"
                placeholder="Rice, Oil, etc."
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="input-base"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {createMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Expense list */}
      {isLoading ? (
        <div className="h-64 skeleton" />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Date</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Paid By</th>
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Description</th>
                  <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Amount</th>
                  {canDelete && (
                    <th className="text-center px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {expenses.map((exp, idx) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                        {exp.date}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                          {exp.paid_by_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{exp.paid_by_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 dark:text-gray-400">{exp.description || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(exp.amount)}
                      </span>
                    </td>
                    {canDelete && (
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => deleteMutation.mutate(exp.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Receipt size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No expenses this month</p>
                      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Add your first expense to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer total bar */}
          {expenses.length > 0 && (
            <div className="px-6 py-3.5 bg-gray-50/80 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{expenses.length} entries</span>
              <span className="font-bold text-gray-900 dark:text-white">Total: {formatCurrency(totalExpense)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
