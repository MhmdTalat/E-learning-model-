import { useAuth } from '@/context/AuthContext';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  isAdmin,
  isInstructor,
  isStudent,
  canManageContent,
  canViewAnalytics,
  canManageUsers,
  getPermissions,
  UserRole,
} from '@/lib/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    // Check specific permission
    hasPermission: (permission: string) => hasPermission(user, permission),
    
    // Check any permission from list
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(user, permissions),
    
    // Check all permissions in list
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(user, permissions),
    
    // Check role
    hasRole: (role: UserRole | UserRole[]) => hasRole(user, role),
    
    // Quick role checks
    isAdmin: () => isAdmin(user),
    isInstructor: () => isInstructor(user),
    isStudent: () => isStudent(user),
    
    // Common permission checks
    canManageContent: () => canManageContent(user),
    canViewAnalytics: () => canViewAnalytics(user),
    canManageUsers: () => canManageUsers(user),
    
    // Get all permissions for current user
    getPermissions: () => getPermissions(user?.role || 'Student'),
    
    // Get current user
    user,
  };
};

export default usePermissions;
