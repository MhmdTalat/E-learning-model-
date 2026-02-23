import { useAuth } from '@/context/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, UserRole } from '@/lib/permissions';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  roles?: UserRole | UserRole[];
  permissions?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user role or permissions
 * @param roles - Required role(s) to view content
 * @param permissions - Required permission(s) to view content
 * @param requireAll - If true, user must have ALL permissions/roles. If false, ANY is sufficient
 */
export const RoleBasedAccess = ({
  children,
  roles,
  permissions,
  requireAll = false,
  fallback = null,
}: RoleBasedAccessProps) => {
  const { user } = useAuth();

  let hasAccess = true;

  if (roles) {
    hasAccess = hasRole(user, roles);
  }

  if (hasAccess && permissions) {
    const perms = Array.isArray(permissions) ? permissions : [permissions];
    hasAccess = requireAll ? hasAllPermissions(user, perms) : hasAnyPermission(user, perms);
  }

  return <>{hasAccess ? children : fallback}</>;
};

export default RoleBasedAccess;
