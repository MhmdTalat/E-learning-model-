import client from "./client";

export interface Enrollment {
  enrollmentID: string;
  studentID: string;
  courseID: string;
  grade?: string;
  enrollmentDate: string;
  studentName?: string;
  courseName?: string;
}

export interface EnrollmentCreatePayload {
  studentID: string;
  courseID: string;
  grade?: string;
  enrollmentDate: string;
}

export const getEnrollments = (): Promise<Enrollment[]> => {
  return client.get("/api/enrollment")
    .then(res => res.data);
};

export const getEnrollmentById = (id: string): Promise<Enrollment> => {
  return client.get(`/api/enrollment/${id}`)
    .then(res => res.data);
};

export const createEnrollment = (payload: EnrollmentCreatePayload): Promise<Enrollment> => {
  return client.post("/api/enrollment", payload)
    .then(res => res.data);
};

export const updateEnrollment = (id: string, payload: EnrollmentCreatePayload & { enrollmentID?: number }): Promise<Enrollment> => {
  const body = { ...payload, enrollmentID: parseInt(id, 10) };
  return client.put(`/api/enrollment/${id}`, body)
    .then(res => res.data);
};

export const deleteEnrollment = (id: string): Promise<void> => {
  return client.delete(`/api/enrollment/${id}`)
    .then(res => res.data);
};
