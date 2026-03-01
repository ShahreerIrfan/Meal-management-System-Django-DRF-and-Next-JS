/**
 * Flat & Membership API calls.
 */
import api from "../axios";
import type { Flat, FlatMembership, InviteToken, MemberMonthStatus } from "../types";

// Helper to extract results array from paginated or plain responses
function extractResults<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export const flatApi = {
  getMyFlats: () =>
    api.get("/flats/me/").then((res) => ({
      ...res,
      data: extractResults<FlatMembership>(res.data),
    })),

  getCurrentFlat: () =>
    api.get<Flat>("/flats/current/"),

  // Alias for settings page
  getDetail: () =>
    api.get<Flat>("/flats/current/"),

  updateFlat: (data: Partial<Flat>) =>
    api.patch<Flat>("/flats/current/", data),

  // Alias for settings page
  updateDetail: (data: Partial<Flat>) =>
    api.patch<Flat>("/flats/current/", data),

  getMembers: () =>
    api.get("/flats/members/").then((res) => ({
      ...res,
      data: extractResults<FlatMembership>(res.data),
    })),

  removeMember: (membershipId: string) =>
    api.post(`/flats/members/${membershipId}/remove/`),

  createInvite: (data: { max_uses?: number; expires_at?: string; permission_codenames?: string[] }) =>
    api.post<InviteToken>("/flats/invite/", data),

  listInvites: () =>
    api.get("/flats/invites/").then((res) => ({
      ...res,
      data: extractResults<InviteToken>(res.data),
    })),

  // Alias for settings page
  getInvites: () =>
    api.get("/flats/invites/").then((res) => ({
      ...res,
      data: extractResults<InviteToken>(res.data),
    })),

  // Public invite info (no auth required)
  getInviteInfo: (token: string) =>
    api.get<{ success: boolean; invite: { token: string; flat_name: string; is_valid: boolean; expires_at: string } }>(
      `/flats/invite/${token}/info/`
    ),

  joinFlat: (token: string) =>
    api.post<{ success: boolean; flat: Flat; message: string }>("/flats/join/", { token }),

  registerAndJoin: (data: { email: string; password: string; full_name?: string; token: string }) =>
    api.post<{
      success: boolean;
      user: { id: string; email: string; full_name: string };
      flat: Flat;
      tokens: { access: string; refresh: string };
      message: string;
    }>("/flats/register-and-join/", data),

  // Member Month Status (onboard/offboard)
  getMemberMonthStatuses: (year: number, month: number) =>
    api.get("/flats/member-month-status/", { params: { year, month } }),

  updateMemberMonthStatus: (data: {
    membership: string;
    year: number;
    month: number;
    is_active: boolean;
    active_from?: string | null;
    active_until?: string | null;
    note?: string;
  }) => api.post("/flats/member-month-status/update/", data),
};
