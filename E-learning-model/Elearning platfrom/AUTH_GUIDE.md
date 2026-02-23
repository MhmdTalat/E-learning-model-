# Authorization & Authentication Guide

This guide explains how to use the role-based authorization and authentication system in your E-Learning platform.

## Overview

The system includes:

- **Authentication**: Login, Registration, Token Management
- **Authorization**: Role-based access control (Admin, Instructor, Student)
- **Permissions**: Fine-grained permission checking
- **Protected Routes**: Automatic redirection based on user roles

---

## User Roles

### Admin

- Full platform access
- Can manage all users (admins, instructors, students)
- Can manage departments, courses, and enrollments
- Can view analytics and reports
- Permissions: `manage_users`, `manage_departments`, `manage_courses`, `view_analytics`, etc.

### Instructor

- Can create and manage their own courses
- Can view enrolled students
- Can grade assignments
- Can view course analytics
- Permissions: `manage_own_courses`, `view_students`, `grade_assignments`, etc.

### Student

- Can view available courses
- Can enroll in courses
- Can view course materials
- Can submit assignments
- Permissions: `view_courses`, `enroll_courses`, `view_materials`, etc.

---

## Usage Examples

### 1. Using Auth Context (in any component)

```tsx
import { useAuth } from "@/context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}!</h1>
      <p>Your role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Using Permissions Hook (recommended)

```tsx
import { usePermissions } from "@/hooks/usePermissions";

function AdminPanel() {
  const { isAdmin, canManageUsers, hasPermission } = usePermissions();

  if (!isAdmin()) {
    return <div>Admin access required</div>;
  }

  return (
    <div>
      {canManageUsers() && <button>Manage Users</button>}

      {hasPermission("view_analytics") && <div>Analytics Section</div>}
    </div>
  );
}
```

### 3. Conditional Rendering with RoleBasedAccess Component

```tsx
import { RoleBasedAccess } from "@/components/RoleBasedAccess";

function Dashboard() {
  return (
    <div>
      {/* Only admins see this */}
      <RoleBasedAccess roles="Admin">
        <AdminPanel />
      </RoleBasedAccess>

      {/* Only instructors see this */}
      <RoleBasedAccess roles="Instructor">
        <InstructorPanel />
      </RoleBasedAccess>

      {/* Anyone except students see this */}
      <RoleBasedAccess roles={["Admin", "Instructor"]}>
        <ManagementSection />
      </RoleBasedAccess>

      {/* Users with permission see this */}
      <RoleBasedAccess permissions="view_analytics">
        <AnalyticsSection />
      </RoleBasedAccess>

      {/* Users with ANY of these permissions */}
      <RoleBasedAccess permissions={["manage_courses", "manage_own_courses"]}>
        <CourseManagement />
      </RoleBasedAccess>

      {/* Fallback for users without permission */}
      <RoleBasedAccess roles="Admin" fallback={<p>You need admin access</p>}>
        <AdminOnly />
      </RoleBasedAccess>
    </div>
  );
}
```

### 4. Protected Routes (in App.tsx)

Routes are automatically protected:

```tsx
// Admin only
<Route path="/admin/users" element={
  <ProtectedRoute requiredRoles={['Admin']}>
    <UserManagement />
  </ProtectedRoute>
} />

// Instructors and Admins
<Route path="/manage/courses" element={
  <ProtectedRoute requiredRoles={['Admin', 'Instructor']}>
    <CourseManagement />
  </ProtectedRoute>
} />

// Any authenticated user
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### 5. Permission Checks in Components

```tsx
import { usePermissions } from "@/hooks/usePermissions";

function CourseCard({ course }) {
  const { canManageContent, isStudent, hasPermission } = usePermissions();

  return (
    <div>
      <h3>{course.title}</h3>

      {canManageContent() && <button>Edit Course</button>}

      {isStudent() && <button>Enroll Course</button>}

      {hasPermission("view_analytics") && <button>View Analytics</button>}
    </div>
  );
}
```

---

## Permission Methods

### `hasPermission(permission: string): boolean`

Check if user has a specific permission.

```tsx
if (permissions.hasPermission("manage_users")) {
  // Show user management
}
```

### `hasAnyPermission(permissions: string[]): boolean`

Check if user has any of the given permissions.

```tsx
if (permissions.hasAnyPermission(["manage_courses", "manage_own_courses"])) {
  // Show course management
}
```

### `hasAllPermissions(permissions: string[]): boolean`

Check if user has all of the given permissions.

```tsx
if (permissions.hasAllPermissions(["view_analytics", "manage_users"])) {
  // Show admin dashboard
}
```

### `hasRole(role: UserRole | UserRole[]): boolean`

Check if user has a specific role.

```tsx
if (permissions.hasRole(["Admin", "Instructor"])) {
  // Show management panel
}
```

### Quick Role Checks

```tsx
const { isAdmin, isInstructor, isStudent } = usePermissions();

if (isAdmin()) {
}
if (isInstructor()) {
}
if (isStudent()) {
}
```

### Common Checks

```tsx
const {
  canManageContent, // Can manage courses
  canViewAnalytics, // Can view analytics
  canManageUsers, // Can manage users
} = usePermissions();
```

---

## Available Permissions by Role

### Admin Permissions

```
view_dashboard
manage_users
manage_departments
manage_courses
manage_instructors
manage_students
manage_enrollments
view_analytics
manage_admins
view_reports
view_settings
```

### Instructor Permissions

```
view_dashboard
manage_own_courses
view_students
grade_assignments
view_analytics
view_enrollments
edit_profile
```

### Student Permissions

```
view_dashboard
view_courses
enroll_courses
view_enrollments
view_materials
submit_assignments
edit_profile
```

---

## Unauthorized Access

When users try to access a page they don't have permission for:

1. They are automatically redirected to `/unauthorized`
2. A 403 Access Denied page is shown
3. They can go back or return to dashboard

---

## Adding New Permissions

To add new permissions:

1. Edit `src/lib/permissions.ts`
2. Add the permission to the appropriate role in `rolePermissions`:

```tsx
const rolePermissions: Record<UserRole, string[]> = {
  Admin: [
    // ... existing
    "new_permission_name", // Add here
  ],
  // ...
};
```

3. Create a helper function if it's commonly used:

```tsx
export const canNewFeature = (user: User | null): boolean => {
  return hasPermission(user, "new_permission_name");
};
```

4. Use in your components:

```tsx
const { canNewFeature } = usePermissions(); // or use helper
if (canNewFeature()) {
  // Show feature
}
```

---

## Best Practices

✅ **Do:**

- Use `usePermissions()` hook for permission checks
- Use `<RoleBasedAccess>` for conditional rendering
- Protect routes with `<ProtectedRoute>`
- Check permissions on sensitive operations
- Provide fallback content for users without access

❌ **Don't:**

- Rely solely on frontend checks (always validate on backend)
- Store sensitive data in localStorage
- Trust user role without server verification
- Show error messages that reveal security details
- Override permission checks on the frontend

---

## Server-Side Validation

⚠️ **Important**: Always validate authorization on the server!

Example (Backend):

```csharp
[Authorize(Roles = "Admin")]
[HttpPost("api/users")]
public async Task<IActionResult> CreateUser(CreateUserDto dto)
{
  // Verify user has Admin role
  // Create user
  return Ok();
}
```

The frontend is just for UX - the real security is on the backend!

---

## Testing Authorization

```tsx
function TestComponent() {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, isInstructor, isStudent, hasPermission } = usePermissions();

  return (
    <div>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>User: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p>Is Admin: {isAdmin()}</p>
      <p>Is Instructor: {isInstructor()}</p>
      <p>Is Student: {isStudent()}</p>
      <p>Can Manage Content: {hasPermission("manage_courses")}</p>
    </div>
  );
}
```

---

## Logout and Token Management

```tsx
function AccountMenu() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirects to login automatically
  };

  return (
    <div>
      <p>{user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

For more details, see the source files:

- `src/context/AuthContext.tsx` - Authentication logic
- `src/lib/permissions.ts` - Permission definitions
- `src/hooks/usePermissions.ts` - Permission hook
- `src/components/ProtectedRoute.tsx` - Route protection
- `src/components/RoleBasedAccess.tsx` - Conditional rendering
