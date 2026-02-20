/**
 * Auth API calls.
 */
import api from "../axios";
import type { RegisterPayload, User, AuthTokens } from "../types";

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<{ success: boolean; user: User; message: string }>("/auth/register/", data),

  login: (email: string, password: string) =>
    api.post<AuthTokens>("/auth/login/", { email, password }),

  refreshToken: (refresh: string) =>
    api.post<AuthTokens>("/auth/token/refresh/", { refresh }),

  getProfile: () =>
    api.get<User>("/auth/profile/"),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>("/auth/profile/", data),

  changePassword: (old_password: string, new_password: string) =>
    api.post("/auth/change-password/", { old_password, new_password }),
};
