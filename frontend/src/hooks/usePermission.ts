/**
 * Permission hook – check if current user has a specific permission.
 */
import { useAuthStore } from "@/lib/store";

export function usePermission(codename: string): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return permissions.includes(codename);
}

export function useAnyPermission(...codenames: string[]): boolean {
  const permissions = useAuthStore((s) => s.permissions);
  return codenames.some((c) => permissions.includes(c));
}
