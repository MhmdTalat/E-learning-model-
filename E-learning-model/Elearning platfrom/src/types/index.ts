export interface User {
  id?: string;
  email: string;
  userName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: "Student" | "Instructor" | "Admin";
  enrollmentDate?: string;
  departmentId?: number;
  department?: string;
  // Profile fields
  profilePhotoUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  phoneNumber?: string;
  company?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
  role?: "Student" | "Instructor" | "Admin";
  departmentId?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface AnalysisData {
  uptime?: number;
  memory?: number;
  cpu?: number;
  studentsPerCourse?: Array<{ courseName: string; count: number }>;
  instructorsPerCourse?: Array<{ courseName: string; count: number }>;
  userRoleDistribution?: Array<{ role: string; value: number }>;
  totalStudents?: number;
  totalInstructors?: number;
  totalCourses?: number;
}

export interface PasswordResetResponse {
  message?: string;
  token?: string;
  email?: string;
}
