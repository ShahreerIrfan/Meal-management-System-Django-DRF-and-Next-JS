"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { flatApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { usePermission } from "@/hooks";
import { Building, Save, Link2, Trash2, Clock, Settings, Loader2, AlertTriangle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { activeFlatId } = useAuthStore();
  const canEdit = usePermission("edit_flat");

  const { data: flat, isLoading } = useQuery({
    queryKey: ["flatDetail"],
    queryFn: () => flatApi.getDetail().then((r) => r.data),
  });

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [inited, setInited] = useState(false);

  if (flat && !inited) {
    setName(flat.name);
    setAddress(flat.address || "");
    setInited(true);
  }

  const updateFlat = useMutation({
    mutationFn: () => flatApi.updateDetail({ name, address }),
    onSuccess: () => {
      toast.success("Flat updated");
      queryClient.invalidateQueries({ queryKey: ["flatDetail"] });
    },
    onError: () => toast.error("Update failed"),
  });

  const { data: invitesData } = useQuery({
    queryKey: ["invites"],
    queryFn: () => flatApi.getInvites().then((r) => r.data),
  });
  const invites = Array.isArray(invitesData) ? invitesData : [];

  const copyFlatId = () => {
    navigator.clipboard.writeText(activeFlatId || "");
    toast.success("Flat ID copied!");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-500" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your flat configuration and invite links
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-64 skeleton" />
          <div className="h-40 skeleton" />
        </div>
      ) : (
        <div className="space-y-6 stagger-children">
          {/* Flat details */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <Building className="text-brand-600 dark:text-brand-400" size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Flat Details</h2>
                <p className="text-xs text-gray-400">Basic information about your flat</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Flat Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit}
                  className="input-base"
                  placeholder="e.g., Green Valley Flat"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!canEdit}
                  rows={3}
                  className="input-base resize-none"
                  placeholder="Full address of the flat…"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">
                  Flat ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={activeFlatId || ""}
                    className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm text-gray-400 dark:text-gray-500 font-mono"
                  />
                  <button
                    onClick={copyFlatId}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Copy size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {canEdit && (
              <button
                onClick={() => updateFlat.mutate()}
                disabled={updateFlat.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {updateFlat.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {updateFlat.isPending ? "Saving…" : "Save Changes"}
              </button>
            )}
          </div>

          {/* Active invites */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Link2 className="text-emerald-600 dark:text-emerald-400" size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Invite Links
                </h2>
                <p className="text-xs text-gray-400">{invites.length} invite{invites.length !== 1 ? "s" : ""} generated</p>
              </div>
            </div>

            {invites.length === 0 ? (
              <div className="py-8 text-center">
                <Link2 size={32} className="mx-auto text-gray-200 dark:text-gray-700 mb-2" />
                <p className="text-sm text-gray-400">No invite links yet</p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Go to Members page to generate one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invites.map((inv: any) => (
                  <div
                    key={inv.id}
                    className={cn(
                      "flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors",
                      inv.is_valid
                        ? "bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800/50"
                        : "bg-gray-50/50 dark:bg-gray-800/20 border-gray-100 dark:border-gray-800/30 opacity-60"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-mono text-gray-700 dark:text-gray-300 truncate">
                        {inv.token}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {inv.times_used}/{inv.max_uses} uses
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg",
                        inv.is_valid
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {inv.is_valid ? "Active" : "Expired"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border-2 border-dashed border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/5 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
                <p className="text-xs text-red-500/70 dark:text-red-400/50">Irreversible actions</p>
              </div>
            </div>
            <p className="text-sm text-red-600/80 dark:text-red-400/60 mb-4 pl-[52px]">
              Deleting the flat will permanently remove all meal records, expenses, and member data. This cannot be undone.
            </p>
            <div className="pl-[52px]">
              <button
                disabled
                className="btn-danger opacity-50 cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Flat (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
