import { User } from '@/context/AuthContext';

export type UserRole = 'Admin' | 'Instructor' | 'Student';

// Define permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  Admin: [
    'view_dashboard',
    'manage_users',
    'manage_departments',
    'manage_courses',
    'manage_instructors',
    'manage_students',
    'manage_enrollments',
    'view_analytics',
    'manage_admins',
    'view_reports',
    'view_settings',
  ],
  Instructor: [
    'view_dashboard',
    'manage_own_courses',
    'view_students',
    'grade_assignments',
    'view_analytics',
    'view_enrollments',
    'edit_profile',
  ],
  Student: [
    'view_dashboard',
    'view_courses',
    'enroll_courses',
    'view_enrollments',
    'view_materials',
    'submit_assignments',
    'edit_profile',
  ],
};

// Check if user has permission
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  return rolePermissions[user.role].includes(permission);
};

// Check if user has any of the given permissions
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  return permissions.some(permission => rolePermissions[user.role].includes(permission));
};

// Check if user has all of the given permissions
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  return permissions.every(permission => rolePermissions[user.role].includes(permission));
};

// Check if user has a specific role
export const hasRole = (user: User | null, role: UserRole | UserRole[]): boolean => {
  if (!user) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
};

// Get all permissions for a role
export const getPermissions = (role: UserRole): string[] => {
  return rolePermissions[role];
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'Admin');
};

// Check if user is instructor
export const isInstructor = (user: User | null): boolean => {
  return hasRole(user, 'Instructor');
};

// Check if user is student
export const isStudent = (user: User | null): boolean => {
  return hasRole(user, 'Student');
};

// Check if user can manage content (admin or instructor)
export const canManageContent = (user: User | null): boolean => {
  return hasAnyPermission(user, ['manage_courses', 'manage_own_courses']);
};

// Check if user can view analytics
export const canViewAnalytics = (user: User | null): boolean => {
  return hasPermission(user, 'view_analytics');
};

// Check if user can manage users
export const canManageUsers = (user: User | null): boolean => {
  return hasPermission(user, 'manage_users');
};
