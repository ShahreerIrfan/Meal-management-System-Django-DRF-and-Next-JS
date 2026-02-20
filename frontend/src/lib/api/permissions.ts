/**
 * Permissions API calls.
 */
import api from "../axios";
import type { AppPermission } from "../types";

// Helper to extract results array from paginated or plain responses
function extractResults<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export const permissionApi = {
  getAll: () =>
    api.get("/permissions/all/").then((res) => ({
      ...res,
      data: extractResults<AppPermission>(res.data),
    })),

  getMine: () =>
    api.get<{ success: boolean; codenames: string[] }>("/permissions/mine/"),

  getMember: (membershipId: string) =>
    api.get<{ success: boolean; codenames: string[] }>(
      `/permissions/member/${membershipId}/`
    ),

  setMember: (membershipId: string, codenames: string[]) =>
    api.post<{ success: boolean; codenames: string[]; message: string }>(
      "/permissions/set/",
      { membership_id: membershipId, codenames }
    ),
};
