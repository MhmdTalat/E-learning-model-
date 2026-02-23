import { useState, useEffect, FC, FormEvent, ChangeEvent, ReactNode } from "react";
import * as studentApi from "@/api/students";
import { useAuth } from "@/context/AuthContext";
import "./DataPage.css";
import type { Student } from "@/api/students";

interface StudentForm {
  studentID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  enrollmentDate: string;
  roleType: number;
}

const StudentsPage: FC = (): ReactNode => {
  const { user } = useAuth();
  const canManage = user?.role === "Instructor" || user?.role === "Admin";
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>({
    studentID: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    enrollmentDate: new Date().toISOString().slice(0, 10),
    roleType: 2,
  });

  useEffect(() => {
    load();
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const data = await studentApi.getStudents();
      setItems(data);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof StudentForm, value: string | number): void {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm(): void {
    setEditing(null);
    setForm({
      studentID: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      enrollmentDate: new Date().toISOString().slice(0, 10),
      roleType: 2,
    });
  }

  function startEdit(item: Student): void {
    setEditing(item);
    setForm({
      studentID: item.studentID,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phoneNumber: item.phoneNumber || "",
      enrollmentDate: item.enrollmentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      roleType: item.roleType || 2,
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dto: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber || null,
        enrollmentDate: form.enrollmentDate,
        roleType: form.roleType,
      };
      if (editing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await studentApi.updateStudent(form.studentID, dto as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await studentApi.createStudent(dto as any);
      }
      resetForm();
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to save student");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Delete this student?")) return;
    setError("");
    try {
      await studentApi.deleteStudent(id);
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete student");
    }
  }

  return (
    <div className="data-page animate-fade-in">
      <div className="page-header">
        <h2>Students</h2>
        <p>Manage students and enrollments</p>
      </div>
      {error && <div className="data-error">{error}</div>}
      {!canManage && <p className="data-info">You are viewing as a student. Only instructors and admins can add or edit students.</p>}

      <div className={`data-layout ${!canManage ? "data-layout-single" : ""}`}>
        {canManage && (
          <form className="data-form" onSubmit={handleSubmit}>
            <h3>{editing ? "Edit" : "Add"} Student</h3>
            <label>First name</label>
            <input value={form.firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => update("firstName", e.target.value)} required />
            <label>Last name</label>
            <input value={form.lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => update("lastName", e.target.value)} required />
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update("email", e.target.value)}
              required
              disabled={!!editing}
            />
            {editing && <small>Email cannot be changed</small>}
            <label>Phone</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update("phoneNumber", e.target.value)}
            />
            <label>Enrollment date</label>
            <input
              type="date"
              value={form.enrollmentDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update("enrollmentDate", e.target.value)}
              required
            />
            <label>Role</label>
            <select
              value={form.roleType}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => update("roleType", Number(e.target.value))}
            >
              <option value={2}>Student</option>
              <option value={1}>Instructor</option>
              <option value={3}>Admin</option>
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
        )}
        <div className="data-table-wrap">
          <h3>All Students</h3>
          {loading ? (
            <p className="data-loading">Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.studentID}>
                    <td>{s.studentID}</td>
                    <td>{s.firstName} {s.lastName}</td>
                    <td>{s.email}</td>
                    <td>{s.enrollmentDate?.slice(0, 10)}</td>
                    <td>
                      {canManage && (
                        <>
                          <button className="btn-sm" onClick={() => startEdit(s)}>Edit</button>
                          <button className="btn-sm danger" onClick={() => handleDelete(s.studentID)}>Delete</button>
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

export default StudentsPage;
