/**
 * Expenses API calls.
 */
import api from "../axios";
import type { Expense, ExpenseCreatePayload } from "../types";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const expenseApi = {
  list: (year: number, month: number) =>
    api.get<PaginatedResponse<Expense>>("/expenses/", { params: { year, month } }),

  create: (data: ExpenseCreatePayload) =>
    api.post<Expense>("/expenses/", data),

  update: (id: string, data: Partial<ExpenseCreatePayload>) =>
    api.patch<Expense>(`/expenses/${id}/`, data),

  remove: (id: string) =>
    api.delete(`/expenses/${id}/`),
};
