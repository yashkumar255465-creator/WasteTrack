import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../types";

interface PermissionGuardProps {
  roles?: Role | Role[];
  zone?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  roles,
  zone,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { user, hasRole, canAccessZone } = useAuth();

  if (!user) return <>{fallback}</>;

  if (roles && !hasRole(roles)) {
    return <>{fallback}</>;
  }

  if (zone && !canAccessZone(zone)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
