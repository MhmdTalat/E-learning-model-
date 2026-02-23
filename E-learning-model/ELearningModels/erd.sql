CREATE TABLE "AspNetRoleClaims" (
	"Id"	INTEGER NOT NULL,
	"RoleId"	INTEGER NOT NULL,
	"ClaimType"	TEXT,
	"ClaimValue"	TEXT,
	CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY("Id"),
	CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY("RoleId") REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE
);


CREATE TABLE "AspNetRoles" (
	"Id"	INTEGER NOT NULL,
	"Name"	TEXT,
	"NormalizedName"	TEXT,
	"ConcurrencyStamp"	TEXT,
	CONSTRAINT "PK_AspNetRoles" PRIMARY KEY("Id" )
);


CREATE TABLE "AspNetUserClaims" (
	"Id"	INTEGER NOT NULL,
	"UserId"	INTEGER NOT NULL,
	"ClaimType"	TEXT,
	"ClaimValue"	TEXT,
	CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY("Id"),
	CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);

CREATE TABLE "AspNetUserLogins" (
	"LoginProvider"	TEXT NOT NULL,
	"ProviderKey"	TEXT NOT NULL,
	"ProviderDisplayName"	TEXT,
	"UserId"	INTEGER NOT NULL,
	CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY("LoginProvider","ProviderKey"),
	CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);


CREATE TABLE "AspNetUserRoles" (
	"UserId"	INTEGER NOT NULL,
	"RoleId"	INTEGER NOT NULL,
	CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY("UserId","RoleId"),
	CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY("RoleId") REFERENCES "AspNetRoles"("Id") ON DELETE CASCADE,
	CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);


CREATE TABLE "AspNetUserTokens" (
	"UserId"	INTEGER NOT NULL,
	"LoginProvider"	TEXT NOT NULL,
	"Name"	TEXT NOT NULL,
	"Value"	TEXT,
	CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY("UserId","LoginProvider","Name"),
	CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY("UserId") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);



CREATE TABLE "AspNetUsers" (
	"Id"	INTEGER NOT NULL,
	"LastName"	TEXT NOT NULL,
	"FirstMidName"	TEXT NOT NULL,
	"EnrollmentDate"	TEXT NOT NULL,
	"UserName"	TEXT,
	"NormalizedUserName"	TEXT,
	"Email"	TEXT,
	"NormalizedEmail"	TEXT,
	"EmailConfirmed"	INTEGER NOT NULL,
	"PasswordHash"	TEXT,
	"SecurityStamp"	TEXT,
	"ConcurrencyStamp"	TEXT,
	"PhoneNumber"	TEXT,
	"PhoneNumberConfirmed"	INTEGER NOT NULL,
	"TwoFactorEnabled"	INTEGER NOT NULL,
	"LockoutEnd"	TEXT,
	"LockoutEnabled"	INTEGER NOT NULL,
	"AccessFailedCount"	INTEGER NOT NULL,
	CONSTRAINT "PK_AspNetUsers" PRIMARY KEY("Id")
);


CREATE TABLE "CourseInstructor" (
	"CoursesCourseID"	INTEGER NOT NULL,
	"InstructorsInstructorID"	INTEGER NOT NULL,
	CONSTRAINT "PK_CourseInstructor" PRIMARY KEY("CoursesCourseID","InstructorsInstructorID"),
	CONSTRAINT "FK_CourseInstructor_Courses_CoursesCourseID" FOREIGN KEY("CoursesCourseID") REFERENCES "Courses"("CourseID") ON DELETE CASCADE,
	CONSTRAINT "FK_CourseInstructor_Instructors_InstructorsInstructorID" FOREIGN KEY("InstructorsInstructorID") REFERENCES "Instructors"("InstructorID") ON DELETE CASCADE
);


CREATE TABLE "Courses" (
	"CourseID"	INTEGER NOT NULL,
	"Title"	TEXT NOT NULL,
	"Credits"	INTEGER NOT NULL,
	"DepartmentID"	INTEGER NOT NULL,
	CONSTRAINT "PK_Courses" PRIMARY KEY("CourseID"),
	CONSTRAINT "FK_Courses_Departments_DepartmentID" FOREIGN KEY("DepartmentID") REFERENCES "Departments"("DepartmentID") ON DELETE CASCADE
);

CREATE TABLE "Departments" (
	"DepartmentID"	INTEGER NOT NULL,
	"Name"	TEXT NOT NULL,
	"Budget"	money NOT NULL,
	"StartDate"	TEXT NOT NULL,
	"InstructorID"	INTEGER,
	CONSTRAINT "PK_Departments" PRIMARY KEY("DepartmentID"),
	CONSTRAINT "FK_Departments_Instructors_InstructorID" FOREIGN KEY("InstructorID") REFERENCES "Instructors"("InstructorID") ON DELETE SET NULL
);




CREATE TABLE "Enrollments" (
	"EnrollmentID"	INTEGER NOT NULL,
	"CourseID"	INTEGER NOT NULL,
	"StudentID"	INTEGER NOT NULL,
	"Grade"	TEXT,
	CONSTRAINT "PK_Enrollments" PRIMARY KEY("EnrollmentID"),
	CONSTRAINT "FK_Enrollments_Courses_CourseID" FOREIGN KEY("CourseID") REFERENCES "Courses"("CourseID") ON DELETE CASCADE,
	CONSTRAINT "FK_Enrollments_AspNetUsers_StudentID" FOREIGN KEY("StudentID") REFERENCES "AspNetUsers"("Id") ON DELETE CASCADE
);



CREATE TABLE "Instructors" (
	"InstructorID"	INTEGER NOT NULL,
	"LastName"	TEXT NOT NULL,
	"FirstMidName"	TEXT NOT NULL,
	"HireDate"	TEXT NOT NULL,
	"DepartmentID"	INTEGER,
	CONSTRAINT "PK_Instructors" PRIMARY KEY("InstructorID"),
	CONSTRAINT "FK_Instructors_Departments_DepartmentID" FOREIGN KEY("DepartmentID") REFERENCES "Departments"("DepartmentID") ON DELETE SET NULL
);

CREATE TABLE "OfficeAssignments" (
	"InstructorID"	INTEGER NOT NULL,
	"Location"	TEXT NOT NULL,
	CONSTRAINT "PK_OfficeAssignments" PRIMARY KEY("InstructorID"),
	CONSTRAINT "FK_OfficeAssignments_Instructors_InstructorID" FOREIGN KEY("InstructorID") REFERENCES "Instructors"("InstructorID") ON DELETE CASCADE
);