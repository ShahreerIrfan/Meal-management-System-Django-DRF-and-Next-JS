/* =============================================
   TypeScript type definitions for the entire app
   ============================================= */

// ----- Auth & User -----
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar: string | null;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  flat_name: string;
  flat_address?: string;
}

// ----- Flat -----
export interface Flat {
  id: string;
  name: string;
  address: string;
  owner: string;
  owner_name: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
}

export interface FlatMembership {
  id: string;
  user: User;
  flat: string;
  role: "owner" | "member";
  is_active: boolean;
  created_at: string;
}

export interface InviteToken {
  id: string;
  flat: string;
  token: string;
  expires_at: string;
  max_uses: number;
  times_used: number;
  is_active: boolean;
  is_valid: boolean;
  invite_url: string;
  created_at: string;
}

// ----- Permissions -----
export interface AppPermission {
  id: number;
  codename: string;
  label: string;
  description: string;
  module: string;
}

// ----- Member Month Status -----
export interface MemberMonthStatus {
  id: string;
  membership: string;
  flat: string;
  year: number;
  month: number;
  is_active: boolean;
  active_from: string | null;
  active_until: string | null;
  note: string;
  user_name: string;
  user_id: string;
  created_at: string;
}

// ----- Meals -----
export interface MealEntry {
  id: string;
  user: string;
  user_name: string;
  date: string;
  meal_count: number;
  updated_at: string;
}

export interface MealCellUpdate {
  user_id: string;
  date: string;
  meal_count: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  total_meals: number;
  total_expense: number;
  meal_rate: number;
  is_locked: boolean;
}

export interface UserBalance {
  user_id: string;
  full_name: string;
  total_meals: number;
  total_paid: number;
  individual_cost: number;
  balance: number;
}

export interface MealGridResponse {
  success: boolean;
  entries: MealEntry[];
  summary: MonthSummary;
  balances: UserBalance[];
}

// ----- Expenses -----
export interface Expense {
  id: string;
  flat: string;
  paid_by: string;
  paid_by_name: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreatePayload {
  paid_by: string;
  amount: number;
  description: string;
  date: string;
}

// ----- Analytics -----
export interface ChartDataPoint {
  name: string;
  meals?: number;
  amount?: number;
}

export interface DailyMealPoint {
  date: string;
  meals: number;
}

export interface MonthlyComparisonPoint {
  month: number;
  total_meals: number;
  total_expense: number;
  meal_rate: number;
}

// ----- API envelope -----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Record<string, unknown>;
  message?: string;
}
