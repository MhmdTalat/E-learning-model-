import React, { useState, useEffect, ChangeEvent } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { departmentsAPI, instructorsAPI, coursesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ChevronRight } from "lucide-react";

// ------------------- Type Definitions -------------------
interface ApiResponse<T> {
  data?: T;
}

type ApiResult<T> = T[] | ApiResponse<T[]>;

interface Department {
  departmentID?: number;
  departmentId?: number;
  id?: number;
  departmentName?: string;
  name?: string;
}

interface Instructor {
  instructorID?: number;
  instructorId?: number;
  id?: number;
  firstMidName?: string;
  firstName?: string;
  lastName?: string;
  departmentID?: number;
  departmentId?: number;
}

interface Course {
  courseID?: number;
  courseId?: number;
  id?: number;
  title?: string;
  name?: string;
  departmentID?: number;
  departmentId?: number;
}

interface AssignmentResult {
  instructorName: string;
  courseName: string;
  timestamp: string;
}

// Helper to safely extract array from ApiResult<T>
function getResultArray<T>(res: ApiResult<T> | unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === 'object' && 'data' in res) {
    const r = res as { data?: unknown };
    const d = r.data;
    if (Array.isArray(d)) return d as T[];
  }
  return [];
}

const AssignInstructorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const instructorParam = searchParams.get("instructor");
  const departmentParam = searchParams.get("department");
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number | "">("");
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<number | "">("");
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState<AssignmentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ------------------ Fetch Departments ------------------
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepts(true);
      try {
        const res = await departmentsAPI.getAll();
        const deptArray = getResultArray<Department>(res);
        
        // Map departments to ensure consistent field names
        const mappedDepts = deptArray.map((dept: Department) => ({
          departmentID: dept.departmentID ?? dept.departmentId ?? dept.id,
          departmentId: dept.departmentID ?? dept.departmentId ?? dept.id,
          id: dept.departmentID ?? dept.departmentId ?? dept.id,
          departmentName: dept.departmentName ?? dept.name ?? "",
          name: dept.departmentName ?? dept.name ?? "",
        }));
        
        console.log("Parsed Departments:", mappedDepts); // DEBUG
        setDepartments(mappedDepts);
      } catch (err) {
        setErrorMessage("Failed to load departments. Please try again.");
        setDepartments([]);
        console.error("Department Fetch Error:", err);
      } finally {
        setLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  // ------------------ Handle Query Parameters ------------------
  useEffect(() => {
    if (departmentParam) {
      const deptId = Number(departmentParam);
      setSelectedDept(deptId);
    }
  }, [departmentParam]);

  useEffect(() => {
    if (instructorParam && selectedDept) {
      const instrId = Number(instructorParam);
      setSelectedInstructor(instrId);
    }
  }, [instructorParam, selectedDept]);

  // ------------------ Fetch Instructors & Courses by Department ------------------
  useEffect(() => {
    if (!selectedDept) {
      setInstructors([]);
      setCourses([]);
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [instructorsRes, coursesRes] = await Promise.all([
          instructorsAPI.getAll(),
          coursesAPI.getAll(),
        ]);
        
        // Extract arrays from responses
        const allInstructors = getResultArray<Instructor>(instructorsRes);
        const allCourses = getResultArray<Course>(coursesRes);
        
        // Filter by selected department and map fields
        const filteredInstructors = allInstructors
          .filter((inst: Instructor) => {
            const deptId = inst.departmentID ?? inst.departmentId;
            return deptId === selectedDept;
          })
          .map((inst: Instructor) => ({
            instructorID: inst.instructorID ?? inst.instructorId ?? inst.id,
            instructorId: inst.instructorID ?? inst.instructorId ?? inst.id,
            id: inst.instructorID ?? inst.instructorId ?? inst.id,
            firstMidName: inst.firstMidName ?? inst.firstName ?? "",
            firstName: inst.firstMidName ?? inst.firstName ?? "",
            lastName: inst.lastName ?? "",
          }));
        
        const filteredCourses = allCourses
          .filter((course: Course) => {
            const deptId = course.departmentID ?? course.departmentId;
            return deptId === selectedDept;
          })
          .map((course: Course) => ({
            courseID: course.courseID ?? course.courseId ?? course.id,
            courseId: course.courseID ?? course.courseId ?? course.id,
            id: course.courseID ?? course.courseId ?? course.id,
            title: course.title ?? course.name ?? "",
            name: course.title ?? course.name ?? "",
          }));
        
        setInstructors(filteredInstructors);
        setCourses(filteredCourses);
      } catch (err) {
        setErrorMessage("Failed to load instructors or courses. Please try again.");
        setInstructors([]);
        setCourses([]);
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedDept]);

  // ------------------ Handlers ------------------
  const handleAssign = async () => {
    if (!selectedInstructor || !selectedCourse) {
      setErrorMessage("Please select both an instructor and a course.");
      return;
    }

    setAssigning(true);
    const instructorId = typeof selectedInstructor === "number" ? selectedInstructor : Number(selectedInstructor);
    const courseId = typeof selectedCourse === "number" ? selectedCourse : Number(selectedCourse);
    
    console.log(`Assigning - Instructor: ${instructorId}, Course: ${courseId}, Department: ${selectedDept}`);

    try {
      const response = await instructorsAPI.assignCourse(instructorId, courseId);
      console.log("Assignment Response:", response);

      const instructor = instructors.find(i => (i.instructorID ?? i.instructorId ?? i.id) === instructorId);
      const course = courses.find(c => (c.courseID ?? c.courseId ?? c.id) === courseId);

      setSuccessMessage({
        instructorName: instructor ? `${instructor.firstMidName} ${instructor.lastName}` : "Instructor",
        courseName: course ? course.title : "Course",
        timestamp: new Date().toLocaleTimeString(),
      });

      // Reset form
      setSelectedInstructor("");
      setSelectedCourse("");
      
      // Navigate back to instructors page after 2 seconds to show success message
      setTimeout(() => {
        navigate("/dashboard/instructors");
      }, 2000);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Assignment Error Details:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });

      let errorMsg = "Failed to assign course. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.response?.status === 404) {
        errorMsg = "Instructor or course not found. Please verify your selections.";
      } else if (error?.response?.status === 403) {
        errorMsg = "You don't have permission to assign courses. Admin access required.";
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setAssigning(false);
    }
  };

  const handleDepartmentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : "";
    setSelectedDept(value);
    setSelectedInstructor("");
    setSelectedCourse("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Assign Instructor to Course</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-accent" />
            Assign Instructor to Course
          </h2>
          <p className="text-muted-foreground mt-1">Select a department, instructor, and course to assign the instructor to teach that course.</p>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-fade-in">
          <p className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2">
            ✓ Assignment Successful!
          </p>
          <p className="text-emerald-600 dark:text-emerald-300 text-sm mt-2">
            <strong>{successMessage.instructorName}</strong> has been assigned to <strong>{successMessage.courseName}</strong>
          </p>
          <p className="text-emerald-500 dark:text-emerald-400 text-xs mt-1">{successMessage.timestamp}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg animate-fade-in">
          <p className="text-destructive font-semibold">✗ Error</p>
          <p className="text-destructive/80 text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Form Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Assignment Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Department Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Department <span className="text-destructive">*</span>
              </label>
              {loadingDepts ? (
                <div className="p-3 bg-muted rounded text-muted-foreground text-sm">
                  Loading departments...
                </div>
              ) : (
                <select
                  value={selectedDept}
                  onChange={handleDepartmentChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                >
                  <option value="">Select a Department</option>
                  {departments.length > 0 ? (
                    departments.map(d => (
                      <option key={d.departmentID ?? d.id} value={d.departmentID ?? d.id}>
                        {d.departmentName ?? d.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No departments available</option>
                  )}
                </select>
              )}
            </div>

            {/* Instructor Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Instructor <span className="text-destructive">*</span>
              </label>
              {!selectedDept ? (
                <div className="p-3 bg-muted rounded text-muted-foreground text-sm">
                  Please select a department first
                </div>
              ) : loadingData ? (
                <div className="p-3 bg-muted rounded text-muted-foreground text-sm">
                  Loading instructors...
                </div>
              ) : (
                <select
                  value={selectedInstructor}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setSelectedInstructor(Number(e.target.value) || "")
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                >
                  <option value="">Select an Instructor</option>
                  {instructors.length > 0 ? (
                    instructors.map(i => (
                      <option key={i.instructorID ?? i.id} value={i.instructorID ?? i.id}>
                        {i.firstMidName ?? i.firstName} {i.lastName}
                      </option>
                    ))
                  ) : (
                    <option disabled>No instructors in this department</option>
                  )}
                </select>
              )}
            </div>

            {/* Course Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Course <span className="text-destructive">*</span>
              </label>
              {!selectedDept ? (
                <div className="p-3 bg-muted rounded text-muted-foreground text-sm">
                  Please select a department first
                </div>
              ) : loadingData ? (
                <div className="p-3 bg-muted rounded text-muted-foreground text-sm">
                  Loading courses...
                </div>
              ) : (
                <select
                  value={selectedCourse}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setSelectedCourse(Number(e.target.value) || "")
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                >
                  <option value="">Select a Course</option>
                  {courses.length > 0 ? (
                    courses.map(c => (
                      <option key={c.courseID ?? c.id} value={c.courseID ?? c.id}>
                        {c.title ?? c.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No courses in this department</option>
                  )}
                </select>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleAssign}
                disabled={assigning || !selectedDept || !selectedInstructor || !selectedCourse}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigning ? "Assigning..." : "Assign Course"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedDept("");
                  setSelectedInstructor("");
                  setSelectedCourse("");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignInstructorPage;