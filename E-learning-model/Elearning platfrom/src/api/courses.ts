import client from "./client";

export interface Course {
  courseID: string;
  courseName: string;
  courseCode: string;
  description?: string;
  credits: number;
  departmentID?: string;
  departmentName?: string;
}

export interface CourseCreatePayload {
  courseName: string;
  courseCode: string;
  description?: string;
  credits: number;
  departmentID?: string;
}

export const getCourses = (): Promise<Course[]> => {
  return client.get("/api/courses")
    .then(res => res.data);
};

export const getCourseById = (id: string): Promise<Course> => {
  return client.get(`/api/courses/${id}`)
    .then(res => res.data);
};

export const createCourse = (payload: CourseCreatePayload): Promise<Course> => {
  return client.post("/api/courses", payload)
    .then(res => res.data);
};

export const updateCourse = (id: string, payload: CourseCreatePayload): Promise<Course> => {
  return client.put(`/api/courses/${id}`, payload)
    .then(res => res.data);
};

export const deleteCourse = (id: string): Promise<void> => {
  return client.delete(`/api/courses/${id}`)
    .then(res => res.data);
};
