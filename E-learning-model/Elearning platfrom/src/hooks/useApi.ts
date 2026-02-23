import { useState, useEffect, useCallback } from 'react';
import { coursesAPI, departmentsAPI, studentsAPI, instructorsAPI, enrollmentsAPI, analysisAPI } from '@/lib/api';

// Generic fetch hook
function useFetch<T>(
  fetchFn: () => Promise<any>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchFn();
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, dependencies);

  return { data, loading, error, refetch: fetch };
}

// Courses
export const useCourses = () => useFetch(() => coursesAPI.getAll());
export const useCourseById = (id: number) => useFetch(() => coursesAPI.getById(id), [id]);
export const createCourse = async (data: any) => await coursesAPI.create(data);
export const updateCourse = async (data: any) => await coursesAPI.update(data);
export const deleteCourse = async (id: number) => await coursesAPI.delete(id);

// Departments
export const useDepartments = () => useFetch(() => departmentsAPI.getAll());
export const useDepartmentById = (id: number) => useFetch(() => departmentsAPI.getById(id), [id]);
export const createDepartment = async (data: any) => await departmentsAPI.create(data);
export const updateDepartment = async (data: any) => await departmentsAPI.update(data);
export const deleteDepartment = async (id: number) => await departmentsAPI.delete(id);

// Students
export const useStudents = () => useFetch(() => studentsAPI.getAll());
export const useStudentById = (id: number) => useFetch(() => studentsAPI.getById(id), [id]);
export const createStudent = async (data: any) => await studentsAPI.create(data);
export const updateStudent = async (data: any) => await studentsAPI.update(data.id ?? data.studentID, data);
export const deleteStudent = async (id: number) => await studentsAPI.delete(id);

// Instructors
export const useInstructors = () => useFetch(() => instructorsAPI.getAll());
export const useInstructorById = (id: number) => useFetch(() => instructorsAPI.getById(id), [id]);
export const createInstructor = async (data: any) => await instructorsAPI.create(data);
export const updateInstructor = async (data: any) => await instructorsAPI.update(data.instructorID ?? data.id, data);
export const deleteInstructor = async (id: number) => await instructorsAPI.delete(id);

// Enrollments
export const useEnrollments = () => useFetch(() => enrollmentsAPI.getAll());
export const useEnrollmentById = (id: number) => useFetch(() => enrollmentsAPI.getById(id), [id]);
export const createEnrollment = async (data: any) => await enrollmentsAPI.create(data);
export const updateEnrollment = async (data: any) => await enrollmentsAPI.update(data.enrollmentID ?? data.id, data);
export const deleteEnrollment = async (id: number) => await enrollmentsAPI.delete(id);

// Analytics
export const useAnalytics = () => useFetch(() => analysisAPI.getAnalytics());
