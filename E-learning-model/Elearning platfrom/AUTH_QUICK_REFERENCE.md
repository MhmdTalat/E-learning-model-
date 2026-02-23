# Frontend Auth Messaging - Quick Reference

## Imports

```typescript
// From context
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

// From utilities
import {
  getAuthErrorMessage,
  getPermissionDeniedMessage,
  getActionRestrictedMessage,
  getAuthSuccessMessage,
  canAccessAdminFeatures,
  canPerformAction,
  formatRoleName,
  getRoleDescription,
} from "@/lib/authMessages";

// From components
import { AuthAlert } from "@/components/AuthAlert";
```

## Most Common Usage Scenarios

### 1. Check if User Can Access Admin Features

```typescript
const { user } = useAuth();
const adminAccess = canAccessAdminFeatures(user);

if (!adminAccess.canAccess) {
  return <AuthAlert type="insufficient_permissions" currentUser={user} />;
}
```

### 2. Handle API Error in Create/Update/Delete

```typescript
try {
  await api.create(data);
} catch (err: unknown) {
  const msg = getAuthErrorMessage(err, user, {
    action: "create items",
    resource: "items",
    requiredRole: "Admin",
  });
  setError(msg);
}
```

### 3. Quick Role Check

```typescript
const { isAdmin, isInstructor, isStudent } = usePermissions();

if (!isAdmin()) {
  return <p>Admin only</p>;
}
```

### 4. Show/Hide Based on Permission

```typescript
const { hasPermission } = usePermissions();

<Button disabled={!hasPermission('manage_students')}>
  Manage Students
</Button>
```

### 5. Display Auth Alert

```typescript
{error && <AuthAlert type="access_denied" message={error} />}
```

---

## Function Reference

### Check Authorization

| Function                                | Returns                                   | When to Use                      |
| --------------------------------------- | ----------------------------------------- | -------------------------------- |
| `canAccessAdminFeatures(user)`          | `{ canAccess: boolean; reason?: string }` | Before rendering admin pages     |
| `canPerformAction(user, action, roles)` | `{ allowed: boolean; message?: string }`  | Before allowing specific actions |

### Get User-Friendly Messages

| Function                                    | Returns  | Common Uses                  |
| ------------------------------------------- | -------- | ---------------------------- |
| `getAuthErrorMessage(err, user, context)`   | `string` | Error handler catch blocks   |
| `getPermissionDeniedMessage(user, context)` | `string` | 403 errors specifically      |
| `getActionRestrictedMessage(action, role)`  | `string` | Action availability messages |
| `getAuthSuccessMessage(action)`             | `string` | Success notifications        |

### Get Readable Names

| Function                   | Returns  | When to Use             |
| -------------------------- | -------- | ----------------------- |
| `formatRoleName(role)`     | `string` | Display user role to UI |
| `getRoleDescription(role)` | `string` | Show role capabilities  |

---

## Permission Checks with usePermissions Hook

```typescript
const permissions = usePermissions();

// Role checks
permissions.isAdmin(); // → boolean
permissions.isInstructor(); // → boolean
permissions.isStudent(); // → boolean

// Permission checks
permissions.hasPermission("manage_users"); // → boolean
permissions.hasAnyPermission(["manage_users"]); // → boolean
permissions.hasAllPermissions(["manage_users"]); // → boolean
permissions.hasRole("Admin"); // → boolean

// Specialized checks
permissions.canManageContent(); // → boolean
permissions.canViewAnalytics(); // → boolean
permissions.canManageUsers(); // → boolean

// Get info
permissions.user; // → User | null
permissions.getPermissions(); // → string[]
```

---

## AuthAlert Component Types

```typescript
<AuthAlert
  type="unauthorized"              // User not logged in
  type="insufficient_permissions"  // User lacks required role
  type="session_expired"           // Auth token expired
  type="access_denied"             // Specific action denied
  type="info"                      // General info message
  message="Custom message"         // Optional: override default
  currentUser={user}               // Optional: show current role
  requiredRole="Admin"             // Optional: show required role
/>
```

---

## Common Error Codes & Messages

| Status           | Message                                          | User Action           |
| ---------------- | ------------------------------------------------ | --------------------- |
| 401              | "Your session has expired. Please log in again." | Re-login              |
| 403 (Student)    | "Students...requires administrator privileges"   | Contact admin         |
| 403 (Instructor) | "Instructors can only...their own content"       | Contact admin         |
| 400              | "Invalid request. Check your input."             | Fix form data         |
| 404              | "The requested resource not found."              | Check resource exists |
| 409              | "This record already exists."                    | Use existing record   |
| 500              | "Server error. Try again later."                 | Retry later           |

---

## Common Context Objects

```typescript
// For create operations
{
  action: 'create student records',
  resource: 'students',
  requiredRole: 'Admin'
}

// For update operations
{
  action: 'edit student records',
  resource: 'students',
  requiredRole: 'Admin'
}

// For delete operations
{
  action: 'delete student records',
  resource: 'students',
  requiredRole: 'Admin'
}

// For view operations
{
  action: 'view analytics',
  resource: 'analytics',
  requiredRole: 'Admin'
}
```

---

## Typical Page Structure

```typescript
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage, canAccessAdminFeatures } from '@/lib/authMessages';
import { AuthAlert } from '@/components/AuthAlert';

export const MyAdminPage = () => {
  const { user } = useAuth();
  const adminAccess = canAccessAdminFeatures(user);
  const [error, setError] = useState<string | null>(null);

  // 1. Authorization check
  if (!adminAccess.canAccess) {
    return <AuthAlert type="insufficient_permissions" currentUser={user} />;
  }

  // 2. Error display
  if (error) {
    return <AuthAlert type="access_denied" message={error} />;
  }

  // 3. Action with error handling
  const handleCreate = async (data: any) => {
    try {
      await api.create(data);
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, user, {
        action: 'create items',
        resource: 'items',
        requiredRole: 'Admin',
      }));
    }
  };

  // 4. Page content
  return (
    <div className="space-y-6">
      {/* Your content */}
    </div>
  );
};
```

---

## Role-Based Permissions

### Admin Permissions

```
view_dashboard, manage_users, manage_departments
manage_courses, manage_instructors, manage_students
manage_enrollments, view_analytics, manage_admins
view_reports, view_settings
```

### Instructor Permissions

```
view_dashboard, manage_own_courses, view_students
grade_assignments, view_analytics, view_enrollments
edit_profile
```

### Student Permissions

```
view_dashboard, view_courses, enroll_courses
view_enrollments, view_materials, submit_assignments
edit_profile
```

---

## Error Handling Pattern

```typescript
try {
  // Do something
} catch (err: unknown) {
  // Get message with context
  const msg = getAuthErrorMessage(err, user, {
    action: "what you were doing",
    resource: "what resource",
    requiredRole: "needed role",
  });

  // Display to user
  setError(msg);

  // Log for debugging
  console.error("[ComponentName] Error:", msg, err);
}
```

---

## Before & After Comparison

### Before (Generic)

```typescript
catch (err) {
  setError('Operation failed');
}
```

### After (Helpful)

```typescript
catch (err: unknown) {
  const msg = getAuthErrorMessage(err, user, {
    action: 'create student',
    resource: 'students',
    requiredRole: 'Admin'
  });
  setError(msg);
  // → "Students do not have permission to create students..."
}
```

---

## Quick Checklist for New Pages

- [ ] Use `useAuth()` and `canAccessAdminFeatures()`
- [ ] Check auth before returning JSX
- [ ] Use `getAuthErrorMessage()` in all catch blocks
- [ ] Display errors with `<AuthAlert />`
- [ ] Import `usePermissions()` for permission checks
- [ ] Test with different user roles
- [ ] Log errors for debugging

---

## Need Help?

See detailed examples: `AUTH_MESSAGING_EXAMPLES.md`
Full documentation: `FRONTEND_AUTH_MESSAGING.md`
