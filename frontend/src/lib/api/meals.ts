/**
 * Meals API calls.
 */
import api from "../axios";
import type { MealGridResponse, MealCellUpdate, MonthSummary, UserBalance } from "../types";

export const mealApi = {
  getGrid: (year: number, month: number) =>
    api.get<MealGridResponse>("/meals/grid/", { params: { year, month } }),

  updateCell: (data: MealCellUpdate) =>
    api.patch<MealGridResponse>("/meals/cell/", data),

  getSummary: (year: number, month: number) =>
    api.get<{ success: boolean; summary: MonthSummary; balances: UserBalance[] }>(
      "/meals/summary/",
      { params: { year, month } }
    ),

  lockMonth: (year: number, month: number) =>
    api.post("/meals/lock-month/", { year, month }),

  unlockMonth: (year: number, month: number) =>
    api.post("/meals/unlock-month/", { year, month }),
};
