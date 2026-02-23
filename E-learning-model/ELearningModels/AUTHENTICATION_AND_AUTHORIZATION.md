# Authentication & Authorization Guide - E-learning Platform

## Overview

This document outlines the complete authentication and authorization system for the E-learning platform backend.

## Authentication Methods

### 1. JWT Token-Based Authentication

The system uses **JWT (JSON Web Tokens)** for stateless authentication with refresh token support.

#### Token Types

| Token Type        | Duration   | Purpose                    | Storage                 |
| ----------------- | ---------- | -------------------------- | ----------------------- |
| **Access Token**  | 15 minutes | API request authentication | localStorage (client)   |
| **Refresh Token** | 7 days     | Generate new access tokens | localStorage + Database |

### 2. Token Structure

**Access Token Claims:**

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roleType": "1|2|3",
  "departmentId": "number or empty",
  "role": ["Admin|Instructor|Student"],
  "iss": "YourApp",
  "aud": "YourAppUsers",
  "exp": 1700000000
}
```

## Authorization Roles

### Role Types

- **1 = Student** - Can view courses, enroll, submit assignments
- **2 = Instructor** - Can create/manage courses, grade assignments
- **3 = Admin** - Full platform access, manage users and system settings

## API Endpoints Authorization

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint               | Requirements               | Role          |
| ------ | ---------------------- | -------------------------- | ------------- |
| POST   | `/register`            | Email, Password, RoleType  | Public        |
| POST   | `/register-with-photo` | FormData with ProfilePhoto | Public        |
| POST   | `/login`               | Email, Password            | Public        |
| POST   | `/refresh`             | Token, RefreshToken        | Public        |
| POST   | `/logout`              | -                          | Authenticated |
| GET    | `/me`                  | JWT Token                  | Authenticated |
| PUT    | `/profile`             | JWT Token, FormData        | Authenticated |
| POST   | `/forgot-password`     | Email                      | Public        |
| POST   | `/reset-password`      | Email, Token, NewPassword  | Public        |

### Courses Endpoints (`/api/courses`)

| Method | Endpoint           | Role Required              |
| ------ | ------------------ | -------------------------- |
| GET    | `/`                | Student, Instructor, Admin |
| GET    | `/department/{id}` | Student, Instructor, Admin |
| POST   | `/`                | Instructor, Admin          |
| PUT    | `/`                | Instructor, Admin          |
| DELETE | `/{id}`            | Instructor, Admin          |

### Students Endpoints (`/api/students`)

| Method | Endpoint | Role Required               |
| ------ | -------- | --------------------------- |
| GET    | `/`      | Admin, Instructor           |
| GET    | `/{id}`  | Admin, Instructor, Own User |
| POST   | `/`      | Admin                       |
| PUT    | `/{id}`  | Admin, Own User             |
| DELETE | `/{id}`  | Admin                       |

### Instructors Endpoints (`/api/instructors`)

| Method | Endpoint | Role Required   |
| ------ | -------- | --------------- |
| GET    | `/`      | Admin           |
| GET    | `/{id}`  | Admin, Own User |
| POST   | `/`      | Admin           |
| PUT    | `/{id}`  | Admin, Own User |
| DELETE | `/{id}`  | Admin           |

### Departments Endpoints (`/api/departments`)

| Method | Endpoint | Role Required          |
| ------ | -------- | ---------------------- |
| GET    | `/`      | Any Authenticated User |
| POST   | `/`      | Admin                  |
| PUT    | `/`      | Admin                  |
| DELETE | `/{id}`  | Admin                  |

### Enrollments Endpoints (`/api/enrollments`)

| Method | Endpoint        | Role Required                  |
| ------ | --------------- | ------------------------------ |
| GET    | `/`             | Admin, Instructor              |
| GET    | `/student/{id}` | Admin, Instructor, Own Student |
| GET    | `/course/{id}`  | Admin, Instructor              |
| POST   | `/`             | Student, Admin                 |
| PUT    | `/{id}`         | Admin, Instructor              |
| DELETE | `/{id}`         | Admin                          |

### Analysis Endpoints (`/api/analysis`)

| Method | Endpoint        | Role Required                  |
| ------ | --------------- | ------------------------------ |
| GET    | `/dashboard`    | Admin, Instructor              |
| GET    | `/student/{id}` | Admin, Instructor, Own Student |

## How Authorization Works

### 1. Request Flow

```
Client Request
    ↓
JWT Token in Authorization Header (Bearer token)
    ↓
Token Validation in Middleware
    ↓
Claims Extraction (sub, role, email, etc.)
    ↓
[Authorize] Attribute Validation
    ↓
Role Checking via [Authorize(Roles = "...")]
    ↓
Endpoint Execution or 403 Forbidden
```

### 2. JWT Configuration

**appsettings.json:**

```json
{
  "JWT": {
    "Key": "YOUR_SECRET_KEY_AT_LEAST_32_CHARS",
    "Issuer": "YourApp",
    "Audience": "YourAppUsers"
  }
}
```

**Program.cs:**

```csharp
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]!)
        )
    };
});
```

## Using Authorization in Controllers

### Basic Protect Endpoint (Any Authenticated User)

```csharp
[HttpGet("me")]
[Authorize]  // Any authenticated user
public async Task<IActionResult> GetCurrentUser()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    // ...
}
```

### Role-Based Protection

```csharp
[HttpPost]
[Authorize(Roles = "Instructor,Admin")]  // Only Instructors and Admins
public async Task<IActionResult> Create([FromBody] CourseCreateDto dto)
{
    // ...
}
```

### Multiple Policies

```csharp
[HttpDelete("{id}")]
[Authorize]  // Must be authenticated
[Authorize(Roles = "Admin")]  // AND must be Admin
public async Task<IActionResult> Delete(int id)
{
    // ...
}
```

### Extract User Claims

```csharp
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
var roleType = User.FindFirst("roleType")?.Value;
var departmentId = User.FindFirst("departmentId")?.Value;
```

## Token Refresh Flow

### 1. When Access Token Expires

```
Client attempts API request with expired access token
    ↓
API returns 401 Unauthorized
    ↓
Client detects 401 and calls /api/auth/refresh
    ↓
Server validates refresh token and issues new access token
    ↓
Client retries original request with new access token
```

### 2. Refresh Token Request

**Request:**

```json
POST /api/auth/refresh
{
  "token": "expired_access_token",
  "refreshToken": "refresh_token_from_login"
}
```

**Response:**

```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token",
  "expiration": "2026-02-22T12:30:00Z",
  "expiresIn": 900
}
```

## Security Best Practices

### 1. Token Storage

- **✅ DO:** Store tokens in httpOnly cookies (if possible) or secure localStorage
- **❌ DON'T:** Store sensitive data in sessionStorage or as global variables

### 2. Token Transmission

- **✅ DO:** Send tokens in Authorization header: `Authorization: Bearer <token>`
- **❌ DON'T:** Send tokens in URL parameters or request body (unless refresh endpoint)

### 3. Token Expiration

- **✅ DO:** Use short-lived access tokens (15-30 minutes)
- **✅ DO:** Use long-lived refresh tokens (7-30 days)
- **❌ DON'T:** Use single long-lived tokens for everything

### 4. Role-Based Access

- **✅ DO:** Validate roles on backend consistently
- **✅ DO:** Check ownership when accessing user-specific resources
- **❌ DON'T:** Rely solely on frontend role checking

### 5. Password Security

- **✅ DO:** Hash passwords (bcrypt via Identity)
- **✅ DO:** Enforce password complexity requirements
- **✅ DO:** Provide password reset functionality
- **❌ DON'T:** Store plain text passwords

### 6. HTTPS

- **✅ MUST:** Use HTTPS in production
- **❌ DON'T:** Transmit tokens over HTTP

## Handling Authorization Errors

### 401 Unauthorized

- **Meaning:** User is not authenticated or token is invalid/expired
- **Action:** Redirect to login, clear stored token

### 403 Forbidden

- **Meaning:** User is authenticated but lacks required roles/permissions
- **Action:** Show "Access Denied" message, redirect to home page

### Error Response Format

```json
{
  "message": "Unauthorized access",
  "statusCode": 401
}
```

## Migration Notes

### Database Changes Required

Run migrations to add refresh token fields to ApplicationUser:

```bash
cd ELearningModels
dotnet ef migrations add AddRefreshTokenSupport
dotnet ef database update
```

The migration adds:

- `RefreshToken` (string, nullable)
- `RefreshTokenExpiryTime` (DateTime, nullable)

## Testing Authorization

### Using Postman/Thunder Client

1. **Login to get token:**

   ```
   POST /api/auth/login
   Body: {"email": "user@example.com", "password": "password"}
   ```

2. **Copy the access token and refresh token** from response

3. **Add token to Authorization header:**

   ```
   Authorization: Bearer <access_token>
   ```

4. **Test protected endpoint:**

   ```
   GET /api/students
   Header: Authorization: Bearer <access_token>
   ```

5. **Test refresh token:**
   ```
   POST /api/auth/refresh
   Body: {
       "token": "<expired_access_token>",
       "refreshToken": "<refresh_token>"
   }
   ```

## Frontend Implementation

See [Frontend Auth Guide](../Elearning%20platfrom/AUTH_GUIDE.md) for:

- Setting up API interceptors for token refresh
- Storing tokens securely
- Handling authentication state
- Protected route components
