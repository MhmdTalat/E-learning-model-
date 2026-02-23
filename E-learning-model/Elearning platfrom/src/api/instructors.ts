import client from "./client";

export interface Instructor {
  instructorID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  hireDate: string;
  departmentID?: string;
  applicationUserID?: string;
  roleType?: number;
  userName?: string;
}

export interface InstructorCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  hireDate: string;
  departmentID?: string;
  applicationUserID?: string;
  roleType?: number;
}

export const getInstructors = (): Promise<Instructor[]> => {
  return client.get("/api/instructor")
    .then(res => res.data);
};

export const getInstructorById = (id: string): Promise<Instructor> => {
  return client.get(`/api/instructor/${id}`)
    .then(res => res.data);
};

export const createInstructor = (payload: InstructorCreatePayload): Promise<Instructor> => {
  return client.post("/api/instructor", payload)
    .then(res => res.data);
};

export const updateInstructor = (id: string, payload: InstructorCreatePayload): Promise<Instructor> => {
  return client.put(`/api/instructor/${id}`, payload)
    .then(res => res.data);
};

export const deleteInstructor = (id: string): Promise<void> => {
  return client.delete(`/api/instructor/${id}`)
    .then(res => res.data);
};
