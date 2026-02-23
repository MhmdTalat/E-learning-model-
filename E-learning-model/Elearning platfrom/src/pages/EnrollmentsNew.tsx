import { useState, useEffect, FC, FormEvent, ChangeEvent, ReactNode } from "react";
import * as enrollmentApi from "@/api/enrollments";
import * as studentApi from "@/api/students";
import * as courseApi from "@/api/courses";
import { useAuth } from "@/context/AuthContext";
import "./DataPage.css";
import type { Enrollment } from "@/api/enrollments";
import type { Student } from "@/api/students";
import type { Course } from "@/api/courses";

interface EnrollmentForm {
  enrollmentID: string;
  courseID: string;
  studentID: string;
  grade: string;
}

const EnrollmentsPage: FC = (): ReactNode => {
  const { user } = useAuth();
  const canManage = user?.role === "Instructor" || user?.role === "Admin";
  const [items, setItems] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Enrollment | null>(null);
  const [form, setForm] = useState<EnrollmentForm>({
    enrollmentID: "",
    courseID: "",
    studentID: "",
    grade: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const [enrollmentsData, studentsData, coursesData] = await Promise.all([
        enrollmentApi.getEnrollments(),
        studentApi.getStudents(),
        courseApi.getCourses()
      ]);
      setItems(enrollmentsData);
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof EnrollmentForm, value: string): void {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm(): void {
    setEditing(null);
    setForm({
      enrollmentID: "",
      courseID: "",
      studentID: "",
      grade: "",
    });
  }

  function startEdit(item: Enrollment): void {
    setEditing(item);
    setForm({
      enrollmentID: item.enrollmentID,
      courseID: item.courseID.toString(),
      studentID: item.studentID.toString(),
      grade: item.grade?.toString() || '',
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    
    try {
      if (!form.studentID || form.studentID === "") {
        setError("Please select a student.");
        return;
      }
      if (!form.courseID || form.courseID === "") {
        setError("Please select a course.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dto: any = {
        studentID: form.studentID,
        courseID: form.courseID,
        grade: form.grade ? form.grade : null,
        enrollmentDate: new Date().toISOString().split("T")[0],
      };

      if (editing) {
        await enrollmentApi.updateEnrollment(form.enrollmentID, dto);
      } else {
        await enrollmentApi.createEnrollment(dto);
      }
      resetForm();
      loadData();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to save enrollment");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Delete this enrollment?")) return;
    setError("");
    try {
      await enrollmentApi.deleteEnrollment(id);
      loadData();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete enrollment");
    }
  }

  function getStudentName(studentID: string): string {
    const student = students.find(s => s.studentID === studentID);
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  }

  function getCourseName(courseID: string): string {
    const course = courses.find(c => c.courseID === courseID);
    return course ? course.courseName : "Unknown Course";
  }

  return (
    <div className="data-page animate-fade-in">
      <div className="page-header">
        <h2>Enrollments</h2>
        <p>Manage student course enrollments and grades</p>
      </div>
      {error && <div className="data-error">{error}</div>}
      {!canManage && <p className="data-info">You are viewing as a student. Only instructors and admins can manage enrollments.</p>}
      <div className={`data-layout ${!canManage ? "data-layout-single" : ""}`}>
        {canManage && (
          <form className="data-form" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit" : "Add"} Enrollment</h3>
            <div style={{ marginBottom: 16 }}>
              <button type="button" onClick={loadData} style={{ marginRight: 8 }}>Refresh Data</button>
              <small>Click to reload students and courses lists. To add new students, go to the Students page first.</small>
            </div>
            <label>Student</label>
            <select
              value={form.studentID}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => update("studentID", e.target.value)}
              required
              disabled={!!editing}
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={`student-${student.studentID}`} value={student.studentID}>
                  {student.firstName} {student.lastName} ({student.email})
                </option>
              ))}
            </select>
            {editing && <small>Student cannot be changed</small>}

            <label>Course</label>
            <select
              value={form.courseID}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => update("courseID", e.target.value)}
              required
              disabled={!!editing}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={`course-${course.courseID}`} value={course.courseID}>
                  {course.courseName} (ID: {course.courseID})
                </option>
              ))}
            </select>
            {editing && <small>Course cannot be changed</small>}

            <label>Grade (0-100, optional)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={form.grade}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update("grade", e.target.value)}
              placeholder="Leave blank if not graded"
            />

            <div className="form-actions">
              <button type="submit">{editing ? "Update" : "Create"}</button>
              {editing && (
                <button type="button" className="secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
        <div className="data-table-wrap">
          <h3>All Enrollments</h3>
          {loading ? (
            <p className="data-loading">Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.enrollmentID}>
                    <td>{e.enrollmentID}</td>
                    <td>{getStudentName(e.studentID)}</td>
                    <td>{getCourseName(e.courseID)}</td>
                    <td>{e.grade ?? "—"}</td>
                    <td>
                      {canManage && (
                        <>
                          <button className="btn-sm" onClick={() => startEdit(e)}>Edit</button>
                          <button className="btn-sm danger" onClick={() => handleDelete(e.enrollmentID)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentsPage;
