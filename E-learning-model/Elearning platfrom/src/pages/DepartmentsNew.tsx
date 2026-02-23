import { useState, useEffect, FC, FormEvent, ChangeEvent, ReactNode } from "react";
import * as deptApi from "@/api/departments";
import * as instrApi from "@/api/instructors";
import "./DataPage.css";
import type { Department } from "@/api/departments";
import type { Instructor } from "@/api/instructors";

interface DepartmentForm {
  departmentID: string;
  departmentName: string;
  instructorID: string;
}

const DepartmentsPage: FC = (): ReactNode => {
  const [items, setItems] = useState<Department[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentForm>({
    departmentID: "",
    departmentName: "",
    instructorID: "",
  });

  useEffect(() => {
    load();
    instrApi.getInstructors().then(setInstructors).catch(() => {});
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError('');
    try {
      const data = await deptApi.getDepartments();
      setItems(data);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof DepartmentForm, value: string): void {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm(): void {
    setEditing(null);
    setForm({
      departmentID: "",
      departmentName: "",
      instructorID: "",
    });
  }

  function startEdit(item: Department): void {
    setEditing(item);
    setForm({
      departmentID: item.departmentID,
      departmentName: item.departmentName,
      instructorID: item.instructorID ?? '',
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    try {
      const dto: Partial<Department> = {
        departmentName: form.departmentName,
        instructorID: form.instructorID ? form.instructorID : undefined,
      };
      if (editing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await deptApi.updateDepartment(form.departmentID, dto as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await deptApi.createDepartment(dto as any);
      }
      resetForm();
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to save department");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Delete this department?")) return;
    setError("");
    try {
      await deptApi.deleteDepartment(id);
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete department");
    }
  }

  return (
    <div className="data-page animate-fade-in">
      <div className="page-header">
        <h2>Departments</h2>
        <p>Manage departments and assignments</p>
      </div>
      {error && <div className="data-error">{error}</div>}
      <div className="data-layout">
        <form className="data-form" onSubmit={handleSubmit}>
          <h3>{editing ? "Edit" : "Add"} Department</h3>
          <label>Name</label>
          <input value={form.departmentName} onChange={(e: ChangeEvent<HTMLInputElement>) => update('departmentName', e.target.value)} required />
          <label>Administrator (Instructor)</label>
          <select
            value={form.instructorID}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => update("instructorID", e.target.value)}
          >
            <option value="">— None —</option>
            {instructors.map((i) => (
              <option key={i.instructorID} value={i.instructorID}>
                {i.firstName} {i.lastName}
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
          <h3>All Departments</h3>
          {loading ? (
            <p className="data-loading">Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Administrator</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.departmentID}>
                    <td>{d.departmentID}</td>
                    <td>{d.departmentName}</td>
                    <td>{d.instructorName || "—"}</td>
                    <td>
                      <button className="btn-sm" onClick={() => startEdit(d)}>Edit</button>
                      <button className="btn-sm danger" onClick={() => handleDelete(d.departmentID)}>Delete</button>
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

export default DepartmentsPage;
