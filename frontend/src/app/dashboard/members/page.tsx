"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { flatApi, permissionApi } from "@/lib/api";
import { usePermission } from "@/hooks";
import type { FlatMembership, AppPermission, MemberMonthStatus } from "@/lib/types";
import { UserPlus, Shield, Trash2, Copy, Check, Users, X, Loader2, Crown, CalendarOff, CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MONTH_NAMES } from "@/lib/utils";

export default function MembersPage() {
  const queryClient = useQueryClient();
  const canManagePerms = usePermission("manage_permissions");
  const canInvite = usePermission("create_invite");

  const now = new Date();
  const [statusYear, setStatusYear] = useState(now.getFullYear());
  const [statusMonth, setStatusMonth] = useState(now.getMonth() + 1);

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: () => flatApi.getMembers().then((r) => r.data),
  });
  const members: FlatMembership[] = Array.isArray(membersData) ? membersData : [];

  const { data: allPermsData } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: () => permissionApi.getAll().then((r) => r.data),
    enabled: canManagePerms,
  });
  const allPerms: AppPermission[] = Array.isArray(allPermsData) ? allPermsData : [];

  // Month status data
  const { data: monthStatusData } = useQuery({
    queryKey: ["memberMonthStatus", statusYear, statusMonth],
    queryFn: () => flatApi.getMemberMonthStatuses(statusYear, statusMonth).then((r) => r.data),
  });
  const monthStatuses: MemberMonthStatus[] = monthStatusData?.statuses || [];

  const getMemberMonthActive = (membershipId: string): boolean => {
    const status = monthStatuses.find((s) => s.membership === membershipId);
    if (!status) return true; // Default: active
    return status.is_active;
  };

  const toggleMonthStatus = useMutation({
    mutationFn: (data: { membership: string; is_active: boolean }) =>
      flatApi.updateMemberMonthStatus({
        membership: data.membership,
        year: statusYear,
        month: statusMonth,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberMonthStatus", statusYear, statusMonth] });
      toast.success("Member status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const prevStatusMonth = () => {
    if (statusMonth === 1) { setStatusYear(statusYear - 1); setStatusMonth(12); } else { setStatusMonth(statusMonth - 1); }
  };
  const nextStatusMonth = () => {
    if (statusMonth === 12) { setStatusYear(statusYear + 1); setStatusMonth(1); } else { setStatusMonth(statusMonth + 1); }
  };

  const [inviteUrl, setInviteUrl] = useState("");
  const inviteMutation = useMutation({
    mutationFn: () => flatApi.createInvite({ max_uses: 10 }),
    onSuccess: (res) => {
      const url = res.data.invite_url || `http://localhost:3000/join/${res.data.token}`;
      setInviteUrl(url);
      toast.success("Invite link created!");
    },
    onError: () => toast.error("Failed to create invite"),
  });

  const removeMutation = useMutation({
    mutationFn: flatApi.removeMember,
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => toast.error("Failed to remove"),
  });

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const loadPerms = async (membershipId: string) => {
    try {
      const res = await permissionApi.getMember(membershipId);
      setEditPerms(res.data.codenames);
      setEditingMemberId(membershipId);
    } catch {
      toast.error("Failed to load permissions");
    }
  };

  const togglePerm = (codename: string) => {
    setEditPerms((prev: string[]) =>
      prev.includes(codename) ? prev.filter((p: string) => p !== codename) : [...prev, codename]
    );
  };

  const savePerm = useMutation({
    mutationFn: () => permissionApi.setMember(editingMemberId!, editPerms),
    onSuccess: () => {
      toast.success("Permissions updated");
      setEditingMemberId(null);
    },
    onError: () => toast.error("Failed to update permissions"),
  });

  const [copied, setCopied] = useState(false);
  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const permsByModule: Record<string, AppPermission[]> = {};
  allPerms.forEach((p) => {
    if (!permsByModule[p.module]) permsByModule[p.module] = [];
    permsByModule[p.module].push(p);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" />
            Members
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {members.length} active member{members.length !== 1 ? "s" : ""} in your flat
          </p>
        </div>
        {canInvite && (
          <button
            onClick={() => inviteMutation.mutate()}
            disabled={inviteMutation.isPending}
            className="btn-primary flex items-center gap-2 !rounded-xl"
          >
            {inviteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Generate Invite Link
          </button>
        )}
      </div>

      {/* Invite URL */}
      {inviteUrl && (
        <div className="animate-slideDown rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-900/15 p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center flex-shrink-0">
            <Copy size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 bg-transparent text-sm text-emerald-800 dark:text-emerald-200 outline-none font-mono truncate"
          />
          <button
            onClick={copyInvite}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
              copied
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Monthly Member Status (Onboard/Offboard) */}
      {members.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <CalendarOff size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Monthly Status</h3>
                <p className="text-[10px] text-gray-400">Toggle members on/off for a specific month</p>
              </div>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
              <button onClick={prevStatusMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ChevronLeft size={14} className="text-gray-500" />
              </button>
              <span className="text-xs font-bold text-gray-900 dark:text-white min-w-[110px] text-center">
                {MONTH_NAMES[statusMonth - 1]} {statusYear}
              </span>
              <button onClick={nextStatusMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <ChevronRight size={14} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {members.filter((m) => m.role !== "owner").map((m) => {
              const isActive = getMemberMonthActive(m.id);
              return (
                <div key={m.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
                      {m.user.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{m.user.full_name}</p>
                      <p className="text-[10px] text-gray-400">{m.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMonthStatus.mutate({ membership: m.id, is_active: !isActive })}
                    disabled={toggleMonthStatus.isPending}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                      isActive
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800"
                    )}
                  >
                    {isActive ? <CalendarCheck size={13} /> : <CalendarOff size={13} />}
                    {isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              );
            })}
            {members.filter((m) => m.role !== "owner").length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-gray-400">
                No general members to manage
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members list */}
      {isLoading ? (
        <div className="h-64 skeleton" />
      ) : members.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Users size={40} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-sm font-medium text-gray-400">No members yet</p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Invite members to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {members.map((m) => (
            <div
              key={m.id}
              className="glass-card rounded-2xl p-5 card-hover group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                    {m.user.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.user.full_name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[180px]">{m.user.email}</p>
                  </div>
                </div>
                {m.role === "owner" && (
                  <Crown size={16} className="text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg",
                    m.role === "owner"
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  )}
                >
                  {m.role}
                </span>
                <div className="flex items-center gap-1">
                  {canManagePerms && m.role !== "owner" && (
                    <button
                      onClick={() => loadPerms(m.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-150"
                      title="Manage Permissions"
                    >
                      <Shield size={15} />
                    </button>
                  )}
                  {m.role !== "owner" && (
                    <button
                      onClick={() => removeMutation.mutate(m.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
                      title="Remove Member"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permission editing modal */}
      {editingMemberId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-800 animate-fadeInScale">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                  <Shield size={16} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Manage Permissions</h2>
              </div>
              <button
                onClick={() => setEditingMemberId(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(permsByModule).map(([mod, perms]) => (
                <div key={mod}>
                  <h4 className="text-[11px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-2.5 tracking-wider">
                    {mod}
                  </h4>
                  <div className="space-y-1">
                    {perms.map((p) => (
                      <label
                        key={p.codename}
                        className={cn(
                          "flex items-center gap-3 cursor-pointer rounded-xl px-3.5 py-2.5 transition-all duration-150 border",
                          editPerms.includes(p.codename)
                            ? "bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800/40"
                            : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={editPerms.includes(p.codename)}
                          onChange={() => togglePerm(p.codename)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{p.label}</span>
                          <span className="text-[10px] text-gray-400 ml-2 font-mono">({p.codename})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800/80 flex justify-end gap-3">
              <button
                onClick={() => setEditingMemberId(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={() => savePerm.mutate()}
                disabled={savePerm.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {savePerm.isPending && <Loader2 size={14} className="animate-spin" />}
                {savePerm.isPending ? "Saving…" : "Save Permissions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
