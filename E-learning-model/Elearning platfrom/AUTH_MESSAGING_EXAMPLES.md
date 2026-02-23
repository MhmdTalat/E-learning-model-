# Authorization & Authentication Message Implementation Examples

This document provides practical code examples for implementing the new auth messaging system in your application pages.

## Quick Start Template

Use this template when creating a new admin page:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage, canAccessAdminFeatures } from '@/lib/authMessages';
import { AuthAlert } from '@/components/AuthAlert';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const YourAdminPage = () => {
  // Initialize auth hooks
  const { user } = useAuth();
  const adminAccess = canAccessAdminFeatures(user);

  const [data, setData] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authorization early
  if (!adminAccess.canAccess) {
    return <AuthAlert type="insufficient_permissions" currentUser={user} />;
  }

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Your API call
      } catch (err: unknown) {
        const errorMessage = getAuthErrorMessage(err, user, {
          action: 'load data',
          resource: 'your resource',
          requiredRole: 'Admin',
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (error) {
    return <AuthAlert type="access_denied" message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Your page content */}
    </div>
  );
};

export default YourAdminPage;
```

## Example 1: Instructor Page (View Own Resources)

```typescript
import { usePermissions } from '@/hooks/usePermissions';
import { getActionRestrictedMessage } from '@/lib/authMessages';

export const InstructorDashboard = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Check if user can view instructor dashboard
  if (!hasPermission('manage_own_courses')) {
    return (
      <AuthAlert
        type="access_denied"
        message={getActionRestrictedMessage('manage_own_courses', user?.role || 'Student')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1>My Courses</h1>
      {/* Show only instructor's own courses */}
    </div>
  );
};
```

## Example 2: Departments Page (Admin-Only CRUD)

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AuthAlert } from '@/components/AuthAlert';
import { getAuthErrorMessage, canAccessAdminFeatures } from '@/lib/authMessages';

const DepartmentsPage = () => {
  const { user } = useAuth();
  const adminAccess = canAccessAdminFeatures(user);
  const [departments, setDepartments] = useState([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Authorization check
  if (!adminAccess.canAccess) {
    return <AuthAlert type="insufficient_permissions" currentUser={user} />;
  }

  const handleCreate = async (departmentData: any) => {
    try {
      await departmentsAPI.create(departmentData);
      setOpenDialog(false);
      // Refresh list
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'create departments',
        resource: 'departments',
        requiredRole: 'Admin',
      });
      setFormError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await departmentsAPI.delete(id);
      // Refresh list
    } catch (err: unknown) {
      const errorMessage = getAuthErrorMessage(err, user, {
        action: 'delete departments',
        resource: 'departments',
        requiredRole: 'Admin',
      });
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Departments</h2>
        <Button onClick={() => setOpenDialog(true)}>Add Department</Button>
      </div>

      {/* Form error */}
      {formError && (
        <AuthAlert type="access_denied" message={formError} />
      )}

      {/* Departments table/list */}
      {/* ... */}

      {/* Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          {/* Form */}
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

## Example 3: Enrollment Management (Instructor + Admin)

```typescript
import { usePermissions } from '@/hooks/usePermissions';
import { canPerformAction } from '@/lib/authMessages';

const EnrollmentPage = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Different views based on role
  const canManageAll = hasPermission('manage_enrollments'); // Admin only
  const canViewStudents = hasPermission('view_students'); // Instructor
  const canViewOwn = hasPermission('view_enrollments'); // Student

  // Admin view - full control
  if (canManageAll) {
    return <AdminEnrollmentManager />;
  }

  // Instructor view - own courses
  if (canViewStudents) {
    return <InstructorEnrollmentView />;
  }

  // Student view - own enrollments
  if (canViewOwn) {
    return <StudentEnrollmentView />;
  }

  // No permission
  return (
    <AuthAlert
      type="insufficient_permissions"
      currentUser={user}
      message="You don't have permission to view enrollments."
    />
  );
};
```

## Example 4: Bulk Operations with Error Tracking

```typescript
const handleBulkImport = async (file: File) => {
  try {
    const data = await parseFile(file);
    let successes = 0;
    let failures = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        await api.create(data[i]);
        successes++;
      } catch (err: unknown) {
        failures++;
        const errMsg = getAuthErrorMessage(err, user, {
          action: "create record",
          resource: "records",
          requiredRole: "Admin",
        });
        errors.push(`Row ${i + 2}: ${errMsg}`);
      }
    }

    // Show results
    if (failures > 0) {
      const errorDisplay =
        errors.slice(0, 3).join("\n") +
        (errors.length > 3 ? `\n... and ${errors.length - 3} more` : "");
      alert(`${successes} successful, ${failures} failed:\n${errorDisplay}`);
    } else {
      alert(`All ${successes} records imported successfully!`);
    }
  } catch (err: unknown) {
    const errorMessage = getAuthErrorMessage(err, user, {
      action: "bulk import",
      resource: "records",
      requiredRole: "Admin",
    });
    setError(errorMessage);
  }
};
```

## Example 5: Role-Specific Features

```typescript
import { usePermissions } from '@/hooks/usePermissions';

const CourseCard = ({ course }: { course: Course }) => {
  const { isAdmin, isInstructor, isStudent } = usePermissions();

  return (
    <div className="border rounded-lg p-4">
      <h3>{course.name}</h3>

      {/* Admin - Full control */}
      {isAdmin() && (
        <div className="flex gap-2 mt-4">
          <Button>Edit</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      )}

      {/* Instructor - Own courses only */}
      {isInstructor() && course.instructorId === user?.id && (
        <div className="flex gap-2 mt-4">
          <Button>Manage</Button>
        </div>
      )}

      {/* Student - Enroll only */}
      {isStudent() && (
        <Button onClick={handleEnroll}>Enroll</Button>
      )}

      {/* No permission - Show locked */}
      {!isAdmin() && !isInstructor() && !isStudent() && (
        <p className="text-muted-foreground">No access</p>
      )}
    </div>
  );
};
```

## Example 6: Form Validation with Auth Messages

```typescript
const EditCourseForm = ({ courseId }: { courseId: number }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);

  // First, check if user can edit
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const courseData = await api.getCourse(courseId);

        // Check if user is instructor of this course
        if (user?.role === 'Instructor' && courseData.instructorId !== user.id) {
          setError(
            getActionRestrictedMessage('edit_courses', 'Instructor')
          );
          return;
        }

        setCourse(courseData);
      } catch (err: unknown) {
        const errorMsg = getAuthErrorMessage(err, user, {
          action: 'load course',
          resource: 'courses',
        });
        setError(errorMsg);
      }
    };

    checkAccess();
  }, [courseId, user]);

  if (error) {
    return <AuthAlert type="access_denied" message={error} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## Error Handling Best Practices

### Pattern 1: Try-Catch with Auth Context

```typescript
try {
  // API call
  await api.someAction();
  // Success message
} catch (err: unknown) {
  // Use auth message utility
  const message = getAuthErrorMessage(err, user, {
    action: "perform action",
    resource: "resource type",
    requiredRole: "Email-required role",
  });

  // Display to user
  setError(message);

  // Log for debugging
  console.error("[Component]", message, err);
}
```

### Pattern 2: Pre-Action Validation

```typescript
const handleAction = async () => {
  // Validate permission before action
  const canPerform = canPerformAction(user, "action_name", ["Admin"]);

  if (!canPerform.allowed) {
    setError(canPerform.message);
    return;
  }

  // Proceed with action
};
```

### Pattern 3: Conditional UI Rendering

```typescript
// Hide button if no permission
<Button
  onClick={handleCreate}
  disabled={!isAdmin()}
  title={!isAdmin() ? 'Requires admin privileges' : ''}
>
  Create New
</Button>

// Show message if no access
{!isAdmin() && (
  <AuthAlert
    type="insufficient_permissions"
    currentUser={user}
  />
)}
```

## Testing Scenarios

### Test 1: Invalid Session

```typescript
// User logged in but token expired
// Expected: 401 error → "Your session has expired. Please log in again."
localStorage.removeItem("token");
// Try to perform action
```

### Test 2: Wrong Role

```typescript
// Student trying to create course
// Expected: 403 error → "Students do not have permission to create courses..."
// as logged in student, try admin action
```

### Test 3: Bulk Import Failures

```typescript
// Import file with some invalid records
// Expected: Row-specific errors with auth context
// "Row 5: You do not have permission to create student records"
```

### Test 4: Permission Check Before UI

```typescript
// User without admin access visits admin page
// Expected: Page shows AuthAlert instead of content
// "This page requires administrator privileges"
```

## CommonPatterns to Avoid

❌ **Don't do this:**

```typescript
// Generic error
try {
} catch (err) {
  setError("Error occurred");
}

// No context
if (err.status === 403) {
  setError("Access denied");
}

// Complex error handling
if (
  err instanceof AxiosError &&
  err.response?.status === 403 &&
  err.response?.data?.code === "PERMISSION_DENIED"
) {
  // ...
}
```

✅ **Do this instead:**

```typescript
// Use utility function
const message = getAuthErrorMessage(err, user, {
  action: 'your action',
  resource: 'your resource',
  requiredRole: 'Admin',
});
setError(message);

// Use component
<AuthAlert type="insufficient_permissions" currentUser={user} />

// Use permission hooks
const { isAdmin } = usePermissions();
if (!isAdmin()) {
  return <AuthAlert type="insufficient_permissions" />;
}
```

## Integration Checklist

When implementing auth messaging in a new page:

- [ ] Import `useAuth` hook
- [ ] Import `usePermissions` hook (if checking permissions)
- [ ] Import auth message utilities
- [ ] Add initial authorization check
- [ ] Update all error handlers with `getAuthErrorMessage`
- [ ] Add `AuthAlert` component for displaying errors
- [ ] Test with different user roles
- [ ] Verify error messages are helpful
- [ ] Check console logs for debugging info
