import { useState, useEffect, FC, FormEvent, ChangeEvent, ReactNode } from "react";
import * as courseApi from "@/api/courses";
import * as deptApi from "@/api/departments";
import "./DataPage.css";
import type { Course } from "@/api/courses";
import type { Department } from "@/api/departments";

interface CourseForm {
  courseID: string;
  courseName: string;
  courseCode: string;
  credits: number;
  description: string;
  departmentID: string;
}

const CoursesPage: FC = (): ReactNode => {
  const [items, setItems] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>({
    courseID: "",
    courseName: "",
    courseCode: "",
    credits: 3,
    description: "",
    departmentID: "",
  });

  useEffect(() => {
    load();
    deptApi.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const data = await courseApi.getCourses();
      setItems(data);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof CourseForm, value: string | number): void {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm(): void {
    setEditing(null);
    setForm({
      courseID: "",
      courseName: "",
      courseCode: "",
      credits: 3,
      description: "",
      departmentID: departments[0]?.departmentID ?? "",
    });
  }

  function startEdit(item: Course): void {
    setEditing(item);
    setForm({
      courseID: item.courseID,
      courseName: item.courseName,
      courseCode: item.courseCode,
      credits: item.credits,
      description: item.description || "",
      departmentID: item.departmentID || "",
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    try {
      const dto: Partial<Course> = {
        courseName: form.courseName,
        courseCode: form.courseCode,
        credits: Number(form.credits),
        description: form.description,
        departmentID: form.departmentID ? form.departmentID : undefined,
      };
      if (editing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await courseApi.updateCourse(form.courseID, dto as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await courseApi.createCourse(dto as any);
      }
      resetForm();
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to save course");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Delete this course?")) return;
    setError("");
    try {
      await courseApi.deleteCourse(id);
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  }

  return (
    <div className="data-page animate-fade-in">
      <div className="page-header">
        <h2>Courses</h2>
        <p>Manage courses and credits</p>
      </div>
      {error && <div className="data-error">{error}</div>}
      <div className="data-layout">
        <form className="data-form" onSubmit={handleSubmit}>
          <h3>{editing ? "Edit" : "Add"} Course</h3>
          <label>Course Code</label>
          <input
            value={form.courseCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update("courseCode", e.target.value)}
            required
            disabled={!!editing}
            placeholder="e.g. CS101"
          />
          {editing && <small>Code cannot be changed</small>}
          <label>Course Name</label>
          <input value={form.courseName} onChange={(e: ChangeEvent<HTMLInputElement>) => update("courseName", e.target.value)} required />
          <label>Credits</label>
          <input
            type="number"
            min="0"
            max="10"
            value={form.credits}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update("credits", Number(e.target.value))}
            required
          />
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => update("description", e.target.value)}
            rows={3}
          />
          <label>Department</label>
          <select
            value={form.departmentID}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => update("departmentID", e.target.value)}
          >
            <option value="">— Select —</option>
            {departments.map((d) => (
              <option key={d.departmentID} value={d.departmentID}>
                {d.departmentName}
              </option>
            ))}
          </select>
          <div className="form-actions">
            <button type="submit">{editing ? "Update" : "Create"}</button>
            {editing && (
              <button type="button" className="secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="data-table-wrap">
          <h3>All Courses</h3>
          {loading ? (
            <p className="data-loading">Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th>Dept</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.courseID}>
                    <td>{c.courseCode}</td>
                    <td>{c.courseName}</td>
                    <td>{c.credits}</td>
                    <td>{c.departmentName || c.departmentID}</td>
                    <td>
                      <button className="btn-sm" onClick={() => startEdit(c)}>Edit</button>
                      <button className="btn-sm danger" onClick={() => handleDelete(c.courseID)}>Delete</button>
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

export default CoursesPage;
