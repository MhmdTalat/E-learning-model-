# Authentication & Authorization - Quick Reference

## 🔐 Token Overview

```
Access Token (15 min)  ───────────────────────────────  Refresh Token (7 days)
├─ Short-lived         │                                ├─ Long-lived
├─ Used for API calls  │                                ├─ Stored in DB
├─ In Authorization    │                                ├─ Used to get new
│  header              │                                │  access tokens
├─ Claims:            │   Refresh on                    └─ Rotates on each
│  - user_id          │   401 errors                       refresh
│  - email            │   automatically
│  - role             │
│  - department_id    │
└─ Signed by backend  │
```

## 📋 API Endpoints

### Authentication

```
POST /api/auth/login
├─ Body: { email, password }
└─ Response: { token, refreshToken, user, expiresIn }

POST /api/auth/register
├─ Body: { FirstMidName, LastName, Email, Password, RoleType, DepartmentID }
└─ Response: { token, refreshToken, user, expiresIn }

POST /api/auth/refresh
├─ Body: { token, refreshToken }
└─ Response: { token, refreshToken, expiresIn }

GET /api/auth/me [Authorize]
└─ Response: { id, email, firstName, lastName, role }
```

### Protected Endpoints (Examples)

```
GET /api/students [Authorize(Roles="Admin,Instructor")]
POST /api/courses [Authorize(Roles="Instructor,Admin")]
DELETE /api/students/{id} [Authorize(Roles="Admin")]
```

## 🧠 Frontend Usage

### Initialize

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

### Check Auth

```tsx
const { user, isAuthenticated, loading } = useAuth();
```

### Login

```tsx
const { login } = useAuth();
await login("email@example.com", "password");
```

### Logout

```tsx
const { logout } = useAuth();
logout();
```

### Make API Calls

```tsx
import client from "@/api/client";

// Token added automatically
const data = await client.get("/api/students");
```

### Protected Routes

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

### Role-Based UI

```tsx
<RoleBasedAccess requiredRoles={["Admin"]}>
  <AdminPanel />
</RoleBasedAccess>
```

## 🔧 Backend Authorization

### Protect Endpoint

```csharp
[HttpGet]
[Authorize] // Any authenticated user
public async Task<IActionResult> GetAll() { }
```

### Role-Based Protection

```csharp
[HttpPost]
[Authorize(Roles = "Instructor,Admin")] // Specific roles
public async Task<IActionResult> Create() { }
```

### Extract User Claims

```csharp
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
var email = User.FindFirst(ClaimTypes.Email)?.Value;
var role = User.FindFirst(ClaimTypes.Role)?.Value;
```

## 🔄 Token Refresh Flow

```
Request with expired token
       ↓
401 Unauthorized
       ↓
Interceptor detects 401
       ↓
POST /api/auth/refresh
       ↓
✅ Success                    ❌ Fail
       ↓                             ↓
Return new token              Clear tokens
       ↓                             ↓
Retry original request        Redirect to login
       ↓
✅ Request succeeds
```

## 🛡️ Security Checklist

- [ ] Change JWT secret key (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting on login/refresh
- [ ] Log authentication events
- [ ] Audit access to sensitive endpoints
- [ ] Test token expiration scenarios
- [ ] Verify role-based access works
- [ ] Check concurrent request handling

## 📁 Key Files

| Backend             | Frontend                 |
| ------------------- | ------------------------ |
| AuthController.cs   | auth.ts                  |
| AuthService.cs      | AuthContext.tsx          |
| TokenService.cs     | client.ts (interceptors) |
| ApplicationUser.cs  | ProtectedRoute.tsx       |
| Program.cs (Config) | RoleBasedAccess.tsx      |

## 🐛 Debug Tips

```javascript
// Check stored tokens
console.log(localStorage.getItem("token"));
console.log(localStorage.getItem("refreshToken"));

// Decode JWT (install jwt-decode)
import { jwtDecode } from "jwt-decode";
console.log(jwtDecode(localStorage.getItem("token")));

// Check API requests
// Open DevTools → Network tab → See Authorization header
```

## ⏱️ Token Durations

| Token   | Duration | Change Location         |
| ------- | -------- | ----------------------- |
| Access  | 15 min   | TokenService.cs line 42 |
| Refresh | 7 days   | AuthService.cs line 116 |

## ❌ Common Errors

| Error                  | Cause                 | Fix                  |
| ---------------------- | --------------------- | -------------------- |
| 401 Unauthorized       | No token or invalid   | Login again          |
| 403 Forbidden          | Insufficient roles    | Check user role      |
| Token keeps refreshing | Refresh token expired | Clear localStorage   |
| "user not found"       | Database issue        | Check if user exists |

## ✅ Status Check

- [x] JWT Authentication
- [x] Token Refresh
- [x] Role-Based Access
- [x] Auto Token Injection
- [x] Protected Routes
- [x] Error Handling
- [x] Database Fields Added
- [x] Documentation Complete

## 🚀 Getting Started

### Backend

```bash
# 1. Run migration
cd ELearningModels
dotnet ef migrations add AddRefreshTokenSupport
dotnet ef database update

# 2. Run server
dotnet run
```

### Frontend

```bash
# 1. App already configured with AuthProvider
# 2. Just ensure token/refreshToken are in localStorage after login
# 3. All API calls include token automatically
```

### Test

```bash
# 1. Login via UI
# 2. Check browser DevTools → Storage → localStorage
# 3. See token and refreshToken stored
# 4. Make API call
# 5. Check DevTools → Network → Authorization header
```

## 📚 Full Docs

- **Backend**: [AUTHENTICATION_AND_AUTHORIZATION.md](./ELearningModels/AUTHENTICATION_AND_AUTHORIZATION.md)
- **Frontend**: [FRONTEND_AUTH_GUIDE.md](./Elearning%20platfrom/FRONTEND_AUTH_GUIDE.md)
- **Overview**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Last Updated:** February 22, 2026
