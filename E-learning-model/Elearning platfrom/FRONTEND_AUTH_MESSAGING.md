# Frontend Authorization and Role Authentication Messaging Guide

## Overview

This guide explains the new comprehensive authorization and role authentication messaging system implemented in your E-learning platform. The system provides consistent, user-friendly error messages and authorization handling across the application.

## Files Added/Modified

### 1. **`src/lib/authMessages.ts`** (NEW)

Core utility file containing all authorization-related message functions.

#### Main Functions:

- **`getAuthErrorMessage(error, user, context)`**
  - Converts API errors into user-friendly messages
  - Handles 401, 403, 400, 404, 409, 500 status codes
  - Contextual messages based on user role

  ```typescript
  const errorMessage = getAuthErrorMessage(err, user, {
    action: "create student records",
    resource: "students",
    requiredRole: "Admin",
  });
  ```

- **`getPermissionDeniedMessage(user, context)`**
  - Generates role-specific permission denied messages
  - Provides helpful guidance based on user type

- **`getActionRestrictedMessage(action, requiredRole)`**
  - Specific messages for restricted actions
  - Pre-defined for common operations

- **`getAuthSuccessMessage(action)`**
  - Positive feedback for successful operations

- **`canAccessAdminFeatures(user)`**
  - Checks if user has admin privileges
  - Returns access status and reason

- **`canPerformAction(user, action, requiredRoles)`**
  - Validates if user can perform specific actions

- **`formatRoleName(role)`**
  - User-friendly role name formatting

- **`getRoleDescription(role)`**
  - Detailed role capability descriptions

### 2. **`src/components/AuthAlert.tsx`** (NEW)

Reusable React component for displaying auth-related alerts.

#### Usage:

```typescript
<AuthAlert
  type="insufficient_permissions"
  message="Students cannot create new courses"
  requiredRole="Admin"
  currentUser={user}
/>
```

#### Alert Types:

- `unauthorized` - User not logged in
- `insufficient_permissions` - User lacks required role/permissions
- `session_expired` - Auth session expired
- `access_denied` - Specific action denied
- `info` - General information alert

### 3. **`src/pages/Students.tsx`** (MODIFIED)

Updated with comprehensive auth error handling.

## Implementation Examples

### Example 1: Basic Error Message in Create Action

**Before:**

```typescript
catch (err: unknown) {
  let errorMessage = 'Failed to create student';
  if (err instanceof Error) {
    errorMessage = err.message;
  }
  setFormError(errorMessage);
}
```

**After:**

```typescript
catch (err: unknown) {
  const errorMessage = getAuthErrorMessage(err, user, {
    action: 'create student records',
    resource: 'students',
    requiredRole: 'Admin',
  });
  setFormError(errorMessage);
}
```

### Example 2: Pre-Action Authorization Check

```typescript
const handleAddStudent = async () => {
  // Check authorization before showing/enabling button
  const permission = canPerformAction(user, "create_student", ["Admin"]);

  if (!permission.allowed) {
    setFormError(permission.message);
    return;
  }

  // Proceed with student creation
};
```

### Example 3: Conditional UI Rendering Based on Role

```typescript
// Hide admin-only features from non-admins
if (!adminAccess.canAccess) {
  return (
    <AuthAlert
      type="insufficient_permissions"
      requiredRole="Admin"
      currentUser={user}
    />
  );
}
```

### Example 4: Bulk Import Error Handling

```typescript
try {
  await studentsAPI.create(payload);
  successCount++;
} catch (err: unknown) {
  const errMsg = getAuthErrorMessage(err, user, {
    action: "create student",
    resource: "students",
    requiredRole: "Admin",
  });
  errors.push(`Row ${i + 2}: ${errMsg}`);
}
```

## Error Message Examples by Status Code

### 401 Unauthorized

```
"Your session has expired. Please log in again."
```

### 403 Forbidden

For Student:

```
"Students do not have permission to perform this action.
This action requires administrator privileges."
```

For Instructor:

```
"Instructors can only [action] their own content.
Please contact an administrator if you need to [action] other [resource]."
```

For Admin:

```
"You do not have permission to perform this action.
Please contact the system administrator."
```

### 400 Bad Request

```
"Invalid request. Please check your input."
```

### 404 Not Found

```
"The requested resource was not found."
```

### 409 Conflict

```
"This record already exists."
```

### 500 Server Error

```
"Server error. Please try again later."
```

## Using AuthAlert Component in Other Pages

### Example: In a Course Management Page

```typescript
import { AuthAlert } from '@/components/AuthAlert';
import { useAuth } from '@/context/AuthContext';
import { canAccessAdminFeatures } from '@/lib/authMessages';

export const CoursesPage = () => {
  const { user } = useAuth();
  const adminAccess = canAccessAdminFeatures(user);

  if (!adminAccess.canAccess) {
    return (
      <div className="space-y-6">
        <AuthAlert
          type="insufficient_permissions"
          requiredRole="Admin"
          currentUser={user}
        />
      </div>
    );
  }

  // Rest of component...
};
```

## Role-Based Permission Checks

### Quick Role Checks

```typescript
import { usePermissions } from "@/hooks/usePermissions";

const { isAdmin, isInstructor, isStudent } = usePermissions();

if (isAdmin()) {
  // Show admin features
}
```

### Specific Permission Checks

```typescript
const { hasPermission, hasAnyPermission } = usePermissions();

if (hasPermission("manage_students")) {
  // Show student management UI
}

if (hasAnyPermission(["manage_students", "manage_instructors"])) {
  // Show either feature
}
```

## Best Practices

1. **Always Include Context Information**

   ```typescript
   getAuthErrorMessage(err, user, {
     action: "specific action",
     resource: "resource type",
     requiredRole: "Required role",
   });
   ```

2. **Check Authorization Before Showing UI**

   ```typescript
   const adminAccess = canAccessAdminFeatures(user);

   if (!adminAccess.canAccess) {
     return <AuthAlert type="insufficient_permissions" />;
   }
   ```

3. **Use Consistent Messaging**
   - Same message format for same operation types
   - Helps users understand patterns

4. **Provide Helpful Guidance**
   - Include what role is needed
   - Suggest contacting administrator
   - Show current user role

5. **Log Errors for Debugging**
   ```typescript
   catch (err: unknown) {
     console.error('[Component] Auth error:', err);
     const message = getAuthErrorMessage(err, user, context);
     setError(message);
   }
   ```

## Migration Guide for Existing Pages

To update any existing page to use the new system:

1. **Add imports:**

   ```typescript
   import { useAuth } from "@/context/AuthContext";
   import {
     getAuthErrorMessage,
     canAccessAdminFeatures,
   } from "@/lib/authMessages";
   ```

2. **Initialize hooks in component:**

   ```typescript
   const { user } = useAuth();
   const adminAccess = canAccessAdminFeatures(user);
   ```

3. **Update error handlers:**

   ```typescript
   const errorMessage = getAuthErrorMessage(err, user, {
     action: "your action",
     resource: "your resource",
     requiredRole: "Admin|Instructor|Student",
   });
   ```

4. **Add auth checks before main content:**

   ```typescript
   if (!adminAccess.canAccess) {
     return <AuthAlert type="insufficient_permissions" />;
   }
   ```

5. **Use AuthAlert for visual feedback:**
   ```typescript
   {formError && <AuthAlert type="access_denied" message={formError} />}
   ```

## Testing Authorization Messages

### Scenario 1: Student Tries to Create Student

- Expected: Permission Denied message with explanation
- Message: "Students do not have permission to create students. This action requires administrator privileges."

### Scenario 2: Session Expires

- Expected: 401 error handled gracefully
- Message: "Your session has expired. Please log in again."

### Scenario 3: Invalid Data in Bulk Import

- Expected: Row-specific error with clear reason
- Message: "Row 3: Invalid data: Email format is invalid"

### Scenario 4: Instructor Tries to Delete Another User's Resource

- Expected: Clear permission denied with role explanation
- Message: "Instructors can only edit their own content..."

## Files Affected

```
src/
├── lib/
│   ├── authMessages.ts (NEW - Core utility)
│   └── permissions.ts (existing - works with new system)
├── components/
│   └── AuthAlert.tsx (NEW - Reusable alert component)
└── pages/
    └── Students.tsx (MODIFIED - Enhanced auth handling)
```

## Future Enhancements

1. **Multilingual Support** - Add translation keys to messages
2. **Custom Error Codes** - Map specific API errors to detailed codes
3. **Action Logging** - Track failed auth attempts
4. **Permission Granularity** - Add more specific permission levels
5. **Role Inheritance** - Support role hierarchies
