# SchoolHub – Pure Model Overview

All domain entities, properties, and relationships in one place.

---

## 1. UserRoleType (enum)

| Value     | Description |
|----------|-------------|
| Student  | 1           |
| Instructor | 2         |
| Admin    | 3           |

Maps to AspNetRoles. Used on `ApplicationUser.RoleType`.

---

## 2. ApplicationUser (Identity)

**Table:** AspNetUsers  
**Base:** IdentityUser&lt;int&gt;

| Property         | Type         | Required | Description                    |
|------------------|-------------|----------|--------------------------------|
| Id               | int         | ✓        | PK (Identity)                  |
| LastName         | string(50)  | ✓        |                                |
| FirstMidName     | string(50)  | ✓        |                                |
| EnrollmentDate   | DateTime    | ✓        |                                |
| RoleType         | UserRoleType| ✓        | Student / Instructor / Admin   |
| UserName         | string      | (Identity)                      |
| Email            | string      | (Identity)                      |
| PhoneNumber      | string      | (Identity)                      |
| PasswordHash     | string      | (Identity)                      |
| …                | …           | (other Identity fields)         |

**Navigation**

- `Enrollments` → ICollection&lt;Enrollment&gt; (when RoleType = Student)

**Note:** Students are ApplicationUser with RoleType = Student. Enrollments.StudentID → AspNetUsers.Id.

---

## 3. Instructor

**Table:** Instructors

| Property     | Type      | Required | Description        |
|-------------|-----------|----------|--------------------|
| InstructorID| int       | ✓ PK     |                    |
| LastName    | string(50)| ✓        |                    |
| FirstMidName| string(50)| ✓        |                    |
| HireDate    | DateTime  | ✓        |                    |
| DepartmentID| int?      |          | FK → Departments  |

**Navigation**

- `Department` → Department?
- `Courses` → ICollection&lt;Course&gt; (many-to-many)
- `OfficeAssignment` → OfficeAssignment? (1:0..1)
- `DepartmentsAdministered` → ICollection&lt;Department&gt; (Department.Administrator)

---

## 4. Department

**Table:** Departments

| Property     | Type      | Required | Description           |
|-------------|-----------|----------|------------------------|
| DepartmentID| int       | ✓ PK     |                        |
| Name        | string(50)| ✓        |                        |
| Budget      | decimal   | ✓ (money)|                        |
| StartDate   | DateTime  | ✓        |                        |
| InstructorID| int?      |          | FK → Administrator    |

**Navigation**

- `Administrator` → Instructor?
- `Courses` → ICollection&lt;Course&gt;
- `Instructors` → ICollection&lt;Instructor&gt;

---

## 5. Course

**Table:** Courses

| Property   | Type       | Required | Description        |
|-----------|------------|----------|--------------------|
| CourseID  | int        | ✓ PK     |                    |
| Title     | string(100)| ✓        |                    |
| Credits   | int (0–10) | ✓        |                    |
| DepartmentID | int     | ✓        | FK → Departments   |

**Navigation**

- `Department` → Department
- `Enrollments` → ICollection&lt;Enrollment&gt;
- `Instructors` → ICollection&lt;Instructor&gt; (many-to-many)

---

## 6. Enrollment

**Table:** Enrollments

| Property     | Type    | Required | Description              |
|-------------|---------|----------|--------------------------|
| EnrollmentID| int     | ✓ PK     |                          |
| CourseID    | int     | ✓        | FK → Courses, CASCADE     |
| StudentID   | int     | ✓        | FK → AspNetUsers.Id, CASCADE |
| Grade       | decimal?|          |                          |

**Navigation**

- `Course` → Course
- `Student` → ApplicationUser

**Constraint:** Unique (StudentID, CourseID) – one enrollment per student per course.

---

## 7. OfficeAssignment

**Table:** OfficeAssignments

| Property     | Type       | Required | Description     |
|-------------|------------|----------|-----------------|
| InstructorID| int        | ✓ PK, FK | 1:0..1 Instructor |
| Location    | string(100)| ✓        |                 |

**Navigation**

- `Instructor` → Instructor

---

## 8. CourseInstructor (join)

**Table:** CourseInstructor

| Property     | Type | Description      |
|-------------|------|------------------|
| CourseID    | int  | FK → Courses     |
| InstructorID| int  | FK → Instructors |

**Navigation**

- `Course` → Course
- `Instructor` → Instructor

Many-to-many: Course ↔ Instructor. In EF this can be configured via `UsingEntity` (shadow or explicit CourseInstructor).

---

## Relationship Summary

```
ApplicationUser (Students) ──< Enrollments >── Course
                                    │
                                    └── Grade

Department ──< Course
    │
    ├── Administrator (Instructor?) 1:0..1
    └── Instructors (many)

Instructor ──< CourseInstructor >── Course   (many-to-many)
    │
    └── OfficeAssignment (1:0..1)
```

---

## File List

| File               | Entity           |
|--------------------|------------------|
| UserRoleType.cs    | UserRoleType     |
| ApplicationUser.cs| ApplicationUser  |
| Instructor.cs     | Instructor       |
| Department.cs     | Department       |
| Course.cs         | Course           |
| Enrollment.cs     | Enrollment       |
| OfficeAssignment.cs | OfficeAssignment |
| CourseInstructor.cs | CourseInstructor |

All in namespace: `ELearningModels.model`.
