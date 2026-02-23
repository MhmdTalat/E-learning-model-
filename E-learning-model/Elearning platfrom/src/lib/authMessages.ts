import { User } from '@/context/AuthContext';
import { UserRole } from './permissions';

/**
 * Authorization error messages based on context
 */
export interface AuthErrorContext {
  action?: string;
  resource?: string;
  requiredRole?: UserRole;
  requiredPermission?: string;
  statusCode?: number;
}

/**
 * Axios error response data structure
 */
interface ErrorResponse {
  message?: string;
  [key: string]: string | undefined;
}

/**
 * Get appropriate error message for authorization failures
 */
export const getAuthErrorMessage = (
  error: unknown,
  user: User | null,
  context?: AuthErrorContext
): string => {
  // Check if it's an Axios error
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: ErrorResponse } };
    
    switch (axiosError.response?.status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return getPermissionDeniedMessage(user, context);
      case 400:
        return axiosError.response?.data?.message || 'Invalid request. Please check your input.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return axiosError.response?.data?.message || 'This record already exists.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return axiosError.response?.data?.message || 'An error occurred. Please try again.';
    }
  }

  // Check if it's a standard Error
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Get specific permission denied message based on user role
 */
export const getPermissionDeniedMessage = (
  user: User | null,
  context?: AuthErrorContext
): string => {
  if (!user) {
    return 'You are not logged in. Please log in to perform this action.';
  }

  const action = context?.action || 'perform this action';
  const resource = context?.resource || 'this resource';
  const userRole = user.role || 'User';

  // Build a helpful message based on role
  const roleMessages: Record<string, string> = {
    Student: `Students do not have permission to ${action}. This action requires administrator privileges.`,
    Instructor: `Instructors can only ${action} their own content. Please contact an administrator if you need to ${action} other ${resource}.`,
    Admin: `You do not have permission to ${action}. Please contact the system administrator.`,
  };

  return roleMessages[userRole] || `You do not have permission to ${action}.`;
};

/**
 * Get message for specific action restriction
 */
export const getActionRestrictedMessage = (action: string, requiredRole: UserRole): string => {
  const messages: Record<string, Record<string, string>> = {
    create_students: {
      Student: 'Only administrators can create student records.',
      Instructor: 'Only administrators can create student records. Instructors can only manage their own courses.',
      Admin: 'You have permission to create students.',
    },
    edit_students: {
      Student: 'Students cannot edit other student records.',
      Instructor: 'Instructors can only view student information, not edit it. Contact an administrator to make changes.',
      Admin: 'Administrators can edit any student record.',
    },
    delete_students: {
      Student: 'Students cannot delete records.',
      Instructor: 'Instructors cannot delete student records. Contact an administrator.',
      Admin: 'Administrators can delete student records.',
    },
    manage_departments: {
      Student: 'Only administrators can manage departments.',
      Instructor: 'Only administrators can manage departments.',
      Admin: 'You can manage departments.',
    },
    view_analytics: {
      Student: 'Students can only view their own analytics.',
      Instructor: 'Instructors can view analytics for their courses.',
      Admin: 'Administrators can view all analytics.',
    },
  };

  return messages[action]?.[requiredRole] || `You don't have permission to ${action}.`;
};

/**
 * Get success message for auth actions
 */
export const getAuthSuccessMessage = (action: string): string => {
  const messages: Record<string, string> = {
    create_student: 'Student created successfully.',
    update_student: 'Student updated successfully.',
    delete_student: 'Student deleted successfully.',
    bulk_import_students: 'Students imported successfully.',
    create_course: 'Course created successfully.',
    update_course: 'Course updated successfully.',
    delete_course: 'Course deleted successfully.',
    enroll_student: 'Student enrolled successfully.',
    assign_instructor: 'Instructor assigned successfully.',
  };

  return messages[action] || 'Action completed successfully.';
};

/**
 * Get warning message for restricted features
 */
export const getFeatureRestrictedWarning = (feature: string, userRole: UserRole): string => {
  const warnings: Record<string, Record<string, string>> = {
    bulk_import: {
      Student: 'Bulk import is only available to administrators.',
      Instructor: 'Bulk import is only available to administrators.',
      Admin: '',
    },
    export_data: {
      Student: 'You can only export your own data.',
      Instructor: 'You can only export data for your courses.',
      Admin: 'You can export all data.',
    },
    analytics: {
      Student: 'You can only view your own analytics.',
      Instructor: 'You can view analytics for your courses.',
      Admin: 'You can view all analytics.',
    },
  };

  return warnings[feature]?.[userRole] || '';
};

/**
 * Check if user should see admin-only features
 */
export const canAccessAdminFeatures = (user: User | null): { canAccess: boolean; reason?: string } => {
  if (!user) {
    return { canAccess: false, reason: 'You must be logged in to access admin features.' };
  }

  if (user.role !== 'Admin') {
    return {
      canAccess: false,
      reason: `Admin features are only available to administrators. Your current role is ${user.role}.`,
    };
  }

  return { canAccess: true };
};

/**
 * Check if user can perform action on resource
 */
export const canPerformAction = (
  user: User | null,
  action: string,
  requiredRoles: UserRole[]
): { allowed: boolean; message?: string } => {
  if (!user) {
    return { allowed: false, message: 'Please log in to perform this action.' };
  }

  if (!requiredRoles.includes(user.role)) {
    return {
      allowed: false,
      message: getPermissionDeniedMessage(user, { action }),
    };
  }

  return { allowed: true };
};

/**
 * Format role name for display
 */
export const formatRoleName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    Admin: 'Administrator',
    Instructor: 'Instructor',
    Student: 'Student',
  };
  return roleNames[role];
};

/**
 * Get role-specific feature description
 */
export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    Admin: 'Full system access. Can manage users, courses, departments, and view all analytics.',
    Instructor: 'Can manage own courses, view students, grade assignments, and view course analytics.',
    Student: 'Can view courses, enroll, view materials, submit assignments, and track progress.',
  };
  return descriptions[role];
};
