import client from "./client";

export interface Department {
  departmentID: string;
  departmentName: string;
  instructorID?: string;
  instructorName?: string;
}

export interface DepartmentCreatePayload {
  departmentName: string;
  instructorID?: string;
}

export const getDepartments = (): Promise<Department[]> => {
  return client.get("/api/department")
    .then(res => res.data);
};

export const getDepartmentById = (id: string): Promise<Department> => {
  return client.get(`/api/department/${id}`)
    .then(res => res.data);
};

export const createDepartment = (payload: DepartmentCreatePayload): Promise<Department> => {
  return client.post("/api/department", payload)
    .then(res => res.data);
};

export const updateDepartment = (id: string, payload: DepartmentCreatePayload | { name?: string; budget?: number; startDate?: string; instructorID?: string | number | null }): Promise<Department> => {
  const body = {
    departmentID: parseInt(id, 10),
    name: ('name' in payload ? payload.name : payload.departmentName) ?? '',
    budget: ('budget' in payload ? payload.budget : undefined) ?? 0,
    startDate: ('startDate' in payload ? payload.startDate : undefined) ?? new Date().toISOString().slice(0, 10),
    instructorID: ('instructorID' in payload && payload.instructorID != null && payload.instructorID !== '')
      ? (typeof payload.instructorID === 'string' ? parseInt(payload.instructorID, 10) : payload.instructorID)
      : null,
  };
  return client.put('/api/department', body)
    .then(res => res.data);
};

export const deleteDepartment = (id: string): Promise<void> => {
  return client.delete(`/api/department/${id}`)
    .then(res => res.data);
};
