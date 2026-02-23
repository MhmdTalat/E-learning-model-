import client from "./client";

export interface Student {
  studentID: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  enrollmentDate: string;
  applicationUserID?: string;
  roleType?: number;
  userName?: string;
}

export interface StudentCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  enrollmentDate: string;
  applicationUserID?: string;
  roleType?: number;
}

export const getStudents = (): Promise<Student[]> => {
  return client.get("/api/student")
    .then(res => res.data);
};

export const getStudentById = (id: string): Promise<Student> => {
  return client.get(`/api/student/${id}`)
    .then(res => res.data);
};

export const createStudent = (payload: StudentCreatePayload): Promise<Student> => {
  return client.post("/api/student", payload)
    .then(res => res.data);
};

export const updateStudent = (id: string, payload: StudentCreatePayload): Promise<Student> => {
  return client.put(`/api/student/${id}`, payload)
    .then(res => res.data);
};

export const deleteStudent = (id: string): Promise<void> => {
  return client.delete(`/api/student/${id}`)
    .then(res => res.data);
};
