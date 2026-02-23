import { useState, useEffect, FC, FormEvent, ChangeEvent, ReactNode } from "react";
import * as instrApi from "@/api/instructors";
import * as deptApi from "@/api/departments";
import "./DataPage.css";
import type { Instructor } from "@/api/instructors";
import type { Department } from "@/api/departments";

interface InstructorForm {
  instructorID: string;
  lastName: string;
  firstName: string;
  hireDate: string;
  departmentID: string;
  email: string;
  phoneNumber: string;
}

const InstructorsPage: FC = (): ReactNode => {
  const [items, setItems] = useState<Instructor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [form, setForm] = useState<InstructorForm>({
    instructorID: "",
    lastName: "",
    firstName: "",
    hireDate: new Date().toISOString().slice(0, 10),
    departmentID: "",
    email: "",
    phoneNumber: "",
  });
  const [searchId, setSearchId] = useState("");

  useEffect(() => {
    load();
    deptApi.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  async function load(): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const data = await instrApi.getInstructors();
      setItems(data);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to load instructors");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!searchId) {
        await load();
      } else {
        const data = await instrApi.getInstructorById(searchId);
        setItems([data]);
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to search");
    } finally {
      setLoading(false);
    }
  }

  function update(field: keyof InstructorForm, value: string): void {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function resetForm(): void {
    setEditing(null);
    setForm({
      instructorID: "",
      lastName: "",
      firstName: "",
      hireDate: new Date().toISOString().slice(0, 10),
      departmentID: "",
      email: "",
      phoneNumber: "",
    });
  }

  function startEdit(item: Instructor): void {
    setEditing(item);
    setForm({
      instructorID: item.instructorID,
      lastName: item.lastName,
      firstName: item.firstName,
      hireDate: item.hireDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      departmentID: item.departmentID ?? "",
      email: item.email || "",
      phoneNumber: item.phoneNumber || "",
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
        phoneNumber: form.phoneNumber,
        hireDate: form.hireDate,
        departmentID: form.departmentID ? form.departmentID : null,
      };
      if (editing) {
        await instrApi.updateInstructor(form.instructorID, dto);
      } else {
        if (!form.email) {
          setError("Email is required for new instructor");
          return;
        }
        await instrApi.createInstructor(dto);
      }
      resetForm();
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to save instructor");
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm("Delete this instructor?")) return;
    setError("");
    try {
      await instrApi.deleteInstructor(id);
      load();
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete instructor");
    }
  }

  return (
    <div className="data-page animate-fade-in">
      <div className="page-header">
        <h2>Instructors</h2>
        <p>Manage instructors and assignments</p>
      </div>
      {error && <div className="data-error">{error}</div>}
      <form className="search-form" onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <h3>Search by Instructor ID</h3>
        <div className="search-fields">
          <div className="search-field">
            <label>Instructor ID</label>
            <input
              type="text"
              value={searchId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchId(e.target.value)}
              placeholder="Enter instructor ID"
            />
          </div>
        </div>
        <button type="submit">Search</button>
        <button type="button" className="secondary" onClick={load} style={{ marginLeft: 8 }}>Clear</button>
      </form>
      <div className="data-layout">
        <form className="data-form" onSubmit={handleSubmit}>
          <h3>{editing ? "Edit" : "Add"} Instructor</h3>
          <label>First name</label>
          <input value={form.firstName} onChange={(e: ChangeEvent<HTMLInputElement>) => update("firstName", e.target.value)} required />
          <label>Last name</label>
          <input value={form.lastName} onChange={(e: ChangeEvent<HTMLInputElement>) => update("lastName", e.target.value)} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e: ChangeEvent<HTMLInputElement>) => update("email", e.target.value)} required={!editing} />
          <label>Phone</label>
          <input type="tel" value={form.phoneNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => update("phoneNumber", e.target.value)} />
          <label>Hire date</label>
          <input
            type="date"
            value={form.hireDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update("hireDate", e.target.value)}
            required
          />
          <label>Department</label>
          <select
            value={form.departmentID}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => update("departmentID", e.target.value)}
          >
            <option value="">— None —</option>
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
          <h3>All Instructors</h3>
          {loading ? (
            <p className="data-loading">Loading...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Hire date</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.instructorID}>
                    <td>{i.instructorID}</td>
                    <td>{i.firstName} {i.lastName}</td>
                    <td>{i.email}</td>
                    <td>{i.hireDate?.slice(0, 10)}</td>
                    <td>{i.departmentID || "—"}</td>
                    <td>
                      <button className="btn-sm" onClick={() => startEdit(i)}>Edit</button>
                      <button className="btn-sm danger" onClick={() => handleDelete(i.instructorID)}>Delete</button>
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

export default InstructorsPage;
