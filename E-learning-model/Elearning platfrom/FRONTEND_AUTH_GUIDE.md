# Frontend Authentication & Authorization Guide

## Overview

The frontend implements JWT-based authentication with automatic token refresh using Axios interceptors. This guide explains how to use the authentication system in your React components.

## Architecture

### Token Management Flow

```
Login
  ↓
Server returns access token + refresh token
  ↓
Store both in localStorage
  ↓
Add access token to request header
  ↓
Request expires (401)
  ↓
API interceptor detects 401
  ↓
Auto-refresh using refresh token
  ↓
Retry original request with new token
  ↓
If refresh fails, redirect to login
```

## Setup

### 1. Initialize AuthProvider

Wrap your app with `AuthProvider` in `main.tsx`:

```tsx
import { AuthProvider } from "@/context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
```

### 2. API Client Configuration

The API client (`src/api/client.ts`) includes:

- **Request Interceptor**: Adds JWT token to every request
- **Response Interceptor**: Handles 401 errors and auto-refreshes tokens

## Usage Examples

### Check Authentication Status

```tsx
import { useAuth } from "@/context/AuthContext";

export function MyComponent() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.firstName}!</div>;
}
```

### Login

```tsx
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Register

```tsx
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.role,
      );
      navigate("/dashboard");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Registration failed";
      console.error("Registration error:", errorMsg);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="Student">Student</option>
        <option value="Instructor">Instructor</option>
        <option value="Admin">Admin</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
}
```

### Logout

```tsx
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
```

### Protected Routes

Use the `ProtectedRoute` component to require authentication:

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### Role-Based Access

Use the `RoleBasedAccess` component to show content only for specific roles:

```tsx
import { RoleBasedAccess } from "@/components/RoleBasedAccess";

export function AdminPanel() {
  return (
    <RoleBasedAccess requiredRoles={["Admin"]}>
      <div>
        <h1>Admin Panel</h1>
        {/* Admin content */}
      </div>
    </RoleBasedAccess>
  );
}
```

## Token Refresh Mechanism

### Automatic Token Refresh

When an access token expires (after 15 minutes):

1. Client makes API request with expired token
2. API returns 401 Unauthorized
3. Axios interceptor automatically:
   - Calls `/api/auth/refresh` with current token + refresh token
   - Gets new access token
   - Retries original request with new token
4. If refresh fails, user is logged out and redirected to login

### Manual Token Refresh

If you need to manually refresh tokens:

```tsx
import * as authAPI from "@/api/auth";

const handleManualRefresh = async () => {
  try {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) {
      throw new Error("No tokens available");
    }

    const response = await authAPI.refreshToken(token, refreshToken);

    localStorage.setItem("token", response.token);
    if (response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    // Redirect to login
  }
};
```

## API Calls

### Making Authenticated Requests

All requests automatically include the JWT token:

```tsx
import client from "@/api/client";

// GET request
const response = await client.get("/api/students");

// POST request
const response = await client.post("/api/courses", courseData);

// PUT request
const response = await client.put(`/api/students/${id}`, updateData);

// DELETE request
await client.delete(`/api/students/${id}`);
```

### Error Handling

```tsx
import { useAuth } from "@/context/AuthContext";

export function StudentList() {
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await client.get("/api/students");
        setStudents(response.data);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load students";

        if (errorMsg.includes("session has expired")) {
          // Token refresh will be attempted automatically
          // If it fails, user will be logged out
          logout();
        } else if (errorMsg.includes("permission")) {
          setError("You do not have permission to view this page");
        } else {
          setError(errorMsg);
        }
      }
    };

    fetchStudents();
  }, [logout]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      {students.map((student) => (
        <div key={student.id}>
          {student.firstName} {student.lastName}
        </div>
      ))}
    </div>
  );
}
```

## Storage Strategy

### localStorage Keys

| Key            | Value              | Cleared When            |
| -------------- | ------------------ | ----------------------- |
| `token`        | JWT access token   | Logout or token expires |
| `refreshToken` | JWT refresh token  | Logout or refresh fails |
| `user`         | User object (JSON) | Logout                  |

### Security Considerations

✅ **DO:**

- Store tokens in localStorage (read by JS) or httpOnly cookies (secure)
- Always send tokens in Authorization header
- Clear tokens on logout
- Handle token expiration gracefully

❌ **DON'T:**

- Store sensitive data with tokens
- Send tokens in URL parameters
- Store tokens in sessionStorage without additional protection
- Rely on frontend-only role checking (always validate on backend)

## Token Claims

The JWT access token contains these claims:

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roleType": "1",
  "departmentId": "5",
  "role": ["Student"],
  "iss": "YourApp",
  "aud": "YourAppUsers",
  "exp": 1700000000
}
```

You can decode and inspect the token in browser console:

```javascript
// Install jwt-decode: npm install jwt-decode
import { jwtDecode } from "jwt-decode";

const token = localStorage.getItem("token");
const decoded = jwtDecode(token);
console.log(decoded);
```

## Troubleshooting

### Token Not Being Sent

**Problem:** API requests return 401
**Solution:** Check that token exists in localStorage

```tsx
console.log("Token:", localStorage.getItem("token"));
console.log("RefreshToken:", localStorage.getItem("refreshToken"));
```

### Token Keeps Refreshing

**Problem:** User is stuck in refresh loop
**Solution:** Check refresh token expiry and clear tokens to force re-login

```tsx
localStorage.clear();
window.location.reload();
```

### API Returns 403

**Problem:** User lacks required permissions
**Solution:** Check user role matches endpoint requirements

```tsx
const { user } = useAuth();
console.log("User role:", user?.role);
// Compare with endpoint's required roles
```

### Auto-Refresh Not Working

**Problem:** Token isn't automatically refreshing
**Solution:** Ensure:

1. Refresh token is stored in localStorage
2. Backend `/api/auth/refresh` endpoint is accessible
3. Refresh token hasn't expired (7 days)

```tsx
const refreshToken = localStorage.getItem("refreshToken");
console.log("RefreshToken exists:", !!refreshToken);
```

## Migration from Old Version

If upgrading from a version without refresh tokens:

1. **Clear localStorage** to avoid conflicts:

   ```tsx
   localStorage.clear();
   ```

2. **Update AuthContext usage** - now supports refresh tokens automatically

3. **Re-login** users to get new tokens with refresh token support

4. **Update API calls** - no changes needed, interceptors handle everything

## Best Practices

1. **Always wrap components needing auth with ProtectedRoute**

   ```tsx
   <Route
     path="/dashboard"
     element={
       <ProtectedRoute>
         <Dashboard />
       </ProtectedRoute>
     }
   />
   ```

2. **Use useAuth hook for auth state**

   ```tsx
   const { user, isAuthenticated, loading } = useAuth();
   ```

3. **Handle errors gracefully**

   ```tsx
   try {
     // API call
   } catch (err) {
     // Handle error, check if it's auth-related
   }
   ```

4. **Validate roles on backend always**
   - Frontend checks improve UX
   - Backend checks ensure security

5. **Use environment variables for API URL**
   ```
   VITE_API_URL=http://localhost:52103
   ```
