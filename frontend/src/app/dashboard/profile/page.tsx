"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { ProfileSkeleton } from "@/components/Skeleton";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Save,
  Loader2,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authApi.getProfile().then((r) => r.data),
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Initialize form when profile loads
  if (profile && !initialized) {
    setFullName(profile.full_name || "");
    setPhone(profile.phone || "");
    setInitialized(true);
  }

  const updateProfile = useMutation({
    mutationFn: () => authApi.updateProfile({ full_name: fullName, phone }).then((r) => r.data),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const changePassword = useMutation({
    mutationFn: () => authApi.changePassword(oldPassword, newPassword).then((r) => r.data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors)
          .flat()
          .forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error("Failed to change password");
      }
    },
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePassword.mutate();
  };

  if (isLoading) return <ProfileSkeleton />;

  const initials = (profile?.full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account details
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/25">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {profile?.full_name || "User"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Mail size={13} />
              {profile?.email}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mt-1">
              <Calendar size={12} />
              Joined {new Date(profile?.created_at || "").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-800/50" />

        {/* Edit Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-base pl-12"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-base pl-12"
                placeholder="Phone number"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
              <input
                type="email"
                value={profile?.email || ""}
                readOnly
                className="input-base pl-12 opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {updateProfile.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <Shield className="text-violet-600 dark:text-violet-400" size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Security</h2>
            <p className="text-xs text-gray-400">Manage your password</p>
          </div>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Lock size={14} />
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <input
                  type={showOld ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="input-base pl-12 pr-12"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-base pl-12 pr-12"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-base pl-12"
                  placeholder="Re-enter new password"
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {changePassword.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                {changePassword.isPending ? "Changing…" : "Change Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
