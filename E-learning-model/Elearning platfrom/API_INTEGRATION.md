# API Integration Guide

## Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:5000
```

Or copy from `.env.example`:

```bash
cp .env.example .env
```

### 2. Start the Backend

Make sure your .NET backend (SchoolHubAPI) is running on port 5000:

```bash
cd E:\react\typescript\SchoolHubAPI\ELearningModels
dotnet run
```

### 3. Start the Frontend

```bash
npm install
npm run dev
```

## API Integration

### Authentication

All API requests automatically include the JWT token from localStorage. The token is added to request headers:

```
Authorization: Bearer {token}
```

### Available API Services

#### Authentication

```typescript
import { authAPI } from "@/lib/api";

await authAPI.register({ name, email, password });
await authAPI.login({ email, password });
await authAPI.me(); // Get current user
await authAPI.logout();
await authAPI.forgotPassword(email);
await authAPI.resetPassword({ token, newPassword });
```

#### Courses

```typescript
import { coursesAPI } from "@/lib/api";

await coursesAPI.getAll();
await coursesAPI.getById(id);
await coursesAPI.create(data);
await coursesAPI.update(data);
await coursesAPI.delete(id);
```

#### Departments

```typescript
import { departmentsAPI } from "@/lib/api";

// Same methods as coursesAPI
```

#### Students, Instructors, Enrollments

```typescript
import { studentsAPI, instructorsAPI, enrollmentsAPI } from "@/lib/api";

// All have the same CRUD methods
```

#### Analytics

```typescript
import { analysisAPI } from "@/lib/api";

await analysisAPI.getAnalytics();
```

### Custom Hooks for Data Fetching

Use the provided hooks for automatic loading and error handling:

```typescript
import { useCourses, useDepartments, useStudents, useAnalytics } from '@/hooks/useApi';

function MyComponent() {
  const { data: courses, loading, error, refetch } = useCourses();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {courses?.map(course => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
}
```

### Available Hooks

- `useCourses()` - Get all courses
- `useCourseById(id)` - Get single course
- `useDepartments()` - Get all departments
- `useDepartmentById(id)` - Get single department
- `useStudents()` - Get all students
- `useStudentById(id)` - Get single student
- `useInstructors()` - Get all instructors
- `useInstructorById(id)` - Get single instructor
- `useEnrollments()` - Get all enrollments
- `useEnrollmentById(id)` - Get single enrollment
- `useAnalytics()` - Get analytics data

### Create/Update/Delete Operations

```typescript
import { createCourse, updateCourse, deleteCourse } from '@/hooks/useApi';

// Create
await createCourse({ name: 'New Course', ... });

// Update
await updateCourse({ id: 1, name: 'Updated Name', ... });

// Delete
await deleteCourse(1);
```

### Error Handling

The API client automatically handles:

- **401 Unauthorized**: Clears tokens and redirects to login
- **Network Errors**: Returns error message in hook
- **Server Errors**: Caught and returned as error strings

### Using AuthContext

```typescript
import { useAuth } from '@/context/AuthContext';

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // User is now logged in
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    // Your login form
  );
}
```

## Proxying API Requests (Optional)

If you want to proxy API requests through the dev server, update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

Then use relative paths in API calls:

```typescript
const API_BASE_URL = ""; // Empty for relative paths
```

## Troubleshooting

### CORS Errors

Make sure your backend has CORS enabled for your frontend URL. Check `Program.cs`:

```csharp
policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
```

### 401 Unauthorized

- Token may have expired
- Token not being sent with requests (check localStorage)
- Invalid token format

### API Not Responding

- Verify backend is running on port 5000
- Check `VITE_API_URL` environment variable
- Verify network connectivity

## Next Steps

1. Implement data fetching in your pages
2. Add error boundaries and loading states
3. Update forms to use API instead of mock data
4. Implement real-time data updates with websockets (optional)
