"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { expenseApi, flatApi } from "@/lib/api";
import { formatCurrency, MONTH_NAMES } from "@/lib/utils";
import { usePermission } from "@/hooks";
import { ConfirmDialog } from "@/components";
import type { Expense, FlatMembership } from "@/lib/types";
import {
  Plus, Trash2, ChevronLeft, ChevronRight, Wallet, ShoppingCart, X,
  Loader2, Receipt, Pencil, Search, Download, Save,
} from "lucide-react";

interface MemberGroup {
  userId: string;
  userName: string;
  expenses: Expense[];
  total: number;
}

export default function ExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  // Edit state
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState({ paid_by: "", amount: "", description: "", date: "" });

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const canAdd = usePermission("add_expense");
  const canDelete = usePermission("delete_expense");
  const canEdit = usePermission("edit_expense");

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", year, month],
    queryFn: () => expenseApi.list(year, month).then((r) => r.data),
  });

  const { data: membersData } = useQuery({
    queryKey: ["members"],
    queryFn: () => flatApi.getMembers().then((r) => r.data),
  });

  const allExpenses: Expense[] = expensesData?.results || [];
  const members: FlatMembership[] = Array.isArray(membersData) ? membersData : [];

  // Filter by search
  const expenses = useMemo(() => {
    if (!search.trim()) return allExpenses;
    const q = search.toLowerCase();
    return allExpenses.filter(
      (e) =>
        e.description?.toLowerCase().includes(q) ||
        e.paid_by_name?.toLowerCase().includes(q) ||
        e.date.includes(q) ||
        String(e.amount).includes(q)
    );
  }, [allExpenses, search]);

  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Group expenses by member
  const memberGroups: MemberGroup[] = useMemo(() => {
    const groupMap: Record<string, MemberGroup> = {};
    for (const exp of expenses) {
      const key = exp.paid_by;
      if (!groupMap[key]) {
        groupMap[key] = {
          userId: exp.paid_by,
          userName: exp.paid_by_name || "Unknown",
          expenses: [],
          total: 0,
        };
      }
      groupMap[key].expenses.push(exp);
      groupMap[key].total += Number(exp.amount);
    }
    // Sort groups by total descending
    return Object.values(groupMap).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const createMutation = useMutation({
    mutationFn: expenseApi.create,
    onSuccess: () => {
      toast.success("Expense added successfully!");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
      queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
      queryClient.invalidateQueries({ queryKey: ["monthSummary", year, month] });
    },
    onError: () => toast.error("Failed to add expense"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ paid_by: string; amount: number; description: string; date: string }> }) =>
      expenseApi.update(id, data),
    onSuccess: () => {
      toast.success("Expense updated successfully!");
      setEditingExpense(null);
      queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
      queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
      queryClient.invalidateQueries({ queryKey: ["monthSummary", year, month] });
    },
    onError: () => toast.error("Failed to update expense"),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseApi.remove,
    onSuccess: () => {
      toast.success("Expense deleted successfully!");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["expenses", year, month] });
      queryClient.invalidateQueries({ queryKey: ["mealGrid", year, month] });
      queryClient.invalidateQueries({ queryKey: ["monthSummary", year, month] });
    },
    onError: () => toast.error("Failed to delete expense"),
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

  const openEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setEditForm({
      paid_by: exp.paid_by,
      amount: String(exp.amount),
      description: exp.description || "",
      date: exp.date,
    });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    updateMutation.mutate({
      id: editingExpense.id,
      data: {
        paid_by: editForm.paid_by,
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        date: editForm.date,
      },
    });
  };

  const exportCSV = () => {
    if (expenses.length === 0) { toast.error("No expenses to export"); return; }
    const header = "Date,Paid By,Description,Amount\n";
    const rows = expenses.map((e) => `${e.date},"${e.paid_by_name}","${e.description || ""}",${e.amount}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${year}_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
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
        <div className="flex items-center gap-3 flex-wrap">
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
          <button onClick={exportCSV} className="btn-ghost flex items-center gap-2" title="Export CSV">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
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

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses…"
          className="input-base pl-11 !py-2.5"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={14} className="text-gray-400" />
          </button>
        )}
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

      {/* Expense list grouped by member */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-48 skeleton rounded-2xl" />
        </div>
      ) : memberGroups.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Receipt size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            {search ? "No expenses match your search" : "No expenses this month"}
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
            {search ? "Try a different search term" : "Add your first expense to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {memberGroups.map((group) => (
            <div key={group.userId} className="glass-card rounded-2xl overflow-hidden">
              {/* Member header */}
              <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {group.userName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {group.userName}
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      {group.expenses.length} {group.expenses.length === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total</p>
                  <p className="font-bold text-brand-600 dark:text-brand-400 text-lg">
                    {formatCurrency(group.total)}
                  </p>
                </div>
              </div>

              {/* Expense rows */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/30 dark:bg-gray-800/30">
                      <th className="text-left px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Date</th>
                      <th className="text-left px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Description</th>
                      <th className="text-right px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Amount</th>
                      {(canDelete || canEdit) && (
                        <th className="text-center px-6 py-2.5 w-24"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {group.expenses.map((exp, idx) => (
                      <tr
                        key={exp.id}
                        className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <td className="px-6 py-3">
                          <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {exp.date}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                          {exp.description || <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(exp.amount)}
                          </span>
                        </td>
                        {(canDelete || canEdit) && (
                          <td className="px-6 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {canEdit && (
                                <button
                                  onClick={() => openEdit(exp)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-150"
                                  title="Edit expense"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => setDeleteTarget(exp)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
                                  title="Delete expense"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Grand total bar */}
          <div className="glass-card rounded-2xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-brand-500" />
              <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Grand Total — {memberGroups.length} {memberGroups.length === 1 ? "member" : "members"}, {expenses.length} entries
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setEditingExpense(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />
          <div className="relative w-full max-w-lg animate-fadeInScale" onClick={(e) => e.stopPropagation()}>
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Pencil size={18} className="text-brand-500" />
                  Edit Expense
                </h3>
                <button onClick={() => setEditingExpense(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleEditSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Paid By</label>
                    <select value={editForm.paid_by} onChange={(e) => setEditForm({ ...editForm, paid_by: e.target.value })} required className="input-base">
                      <option value="">Select member…</option>
                      {members.map((m) => (
                        <option key={m.user.id} value={m.user.id}>{m.user.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Amount (৳)</label>
                    <input type="number" step="0.01" min="0" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} required className="input-base" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Description</label>
                    <input type="text" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-base" placeholder="Rice, Oil, etc." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Date</label>
                    <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required className="input-base" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditingExpense(null)} className="btn-ghost">Cancel</button>
                  <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex items-center gap-2">
                    {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {updateMutation.isPending ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Expense"
        message={`Delete "${deleteTarget?.description || "this expense"}" (${deleteTarget ? formatCurrency(deleteTarget.amount) : ""})? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
