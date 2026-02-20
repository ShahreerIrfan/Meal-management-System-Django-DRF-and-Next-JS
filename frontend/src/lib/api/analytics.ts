/**
 * Analytics API calls.
 */
import api from "../axios";
import type { ChartDataPoint, DailyMealPoint, MonthlyComparisonPoint } from "../types";

export const analyticsApi = {
  mealPerUser: (year: number, month: number) =>
    api.get<{ success: boolean; data: ChartDataPoint[] }>(
      "/analytics/meal-per-user/",
      { params: { year, month } }
    ),

  expenseShare: (year: number, month: number) =>
    api.get<{ success: boolean; data: ChartDataPoint[] }>(
      "/analytics/expense-share/",
      { params: { year, month } }
    ),

  dailyMeals: (year: number, month: number) =>
    api.get<{ success: boolean; data: DailyMealPoint[] }>(
      "/analytics/daily-meals/",
      { params: { year, month } }
    ),

  monthlyComparison: (year: number) =>
    api.get<{ success: boolean; data: MonthlyComparisonPoint[] }>(
      "/analytics/monthly-comparison/",
      { params: { year } }
    ),
};
