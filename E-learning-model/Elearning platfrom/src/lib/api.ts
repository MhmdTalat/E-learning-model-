import axios, { AxiosInstance, AxiosError } from 'axios';

type RequestData = Record<string, unknown>;

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

console.log('[API Client] Base URL:', API_BASE_URL);

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log PUT requests for student updates
      if (config.method === 'put' && config.url?.includes('/student')) {
        console.log('[API] Student update request:', {
          url: config.url,
          method: config.method,
          tokenExists: !!token,
          tokenLength: token.length,
          data: config.data,
        });
      }
    } else {
      console.warn('[API] No token found in localStorage for request to:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => {
    // Log department endpoint responses for debugging
    if (response.config.url?.includes('/department')) {
      console.log('[API] Departments response:', response.status, response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Log 403 errors for debugging
    if (error.response?.status === 403) {
      console.error('[API] 403 Forbidden:', {
        url: error.config?.url,
        method: error.config?.method,
        tokenExists: !!localStorage.getItem('token'),
        response: error.response?.data,
        status: error.response?.status,
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth API
export const authAPI = {
  register: (data: RequestData) => apiClient.post('/api/auth/register', data),
  login: (data: RequestData) => apiClient.post('/api/auth/login', data),
  me: () => apiClient.get('/api/auth/me'),
  logout: () => apiClient.post('/api/auth/logout'),
  forgotPassword: (email: string) => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (data: RequestData) => apiClient.post('/api/auth/reset-password', data),
};

// Courses API
export const coursesAPI = {
  getAll: () => apiClient.get('/api/courses'),
  getById: (id: number) => apiClient.get(`/api/courses/${id}`),
  getByDepartment: (departmentId: number) => apiClient.get(`/api/courses/department/${departmentId}`),
  create: (data: RequestData) => apiClient.post('/api/courses', data),
  update: (data: RequestData) => apiClient.put('/api/courses', data),
  delete: (id: number) => apiClient.delete(`/api/courses/${id}`),
};

// Departments API
export const departmentsAPI = {
  getAll: () => apiClient.get('/api/department'),
  getById: (id: number) => apiClient.get(`/api/department/${id}`),
  create: (data: RequestData) => apiClient.post('/api/department', data),
  update: (data: RequestData) => apiClient.put('/api/department', data), // body must include departmentID
  delete: (id: number) => apiClient.delete(`/api/department/${id}`),
};

// Students API
export const studentsAPI = {
  getAll: () => apiClient.get('/api/student'),
  getById: (id: number) => apiClient.get(`/api/student/${id}`),
  create: (data: RequestData) => apiClient.post('/api/student', data),
  update: (id: number, data: RequestData) => apiClient.put(`/api/student/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/student/${id}`),
};

// Instructors API
export const instructorsAPI = {
  getAll: () => apiClient.get('/api/instructor'),
  getById: (id: number) => apiClient.get(`/api/instructor/${id}`),
  create: (data: RequestData) => apiClient.post('/api/instructor', data),
  update: (id: number, data: RequestData) => apiClient.put(`/api/instructor/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/instructor/${id}`),
  assignCourse: (instructorId: number, courseId: number) => 
    apiClient.post(`/api/instructor/${instructorId}/assign-course/${courseId}`),
  removeCourse: (instructorId: number, courseId: number) => 
    apiClient.delete(`/api/instructor/${instructorId}/remove-course/${courseId}`),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: () => apiClient.get('/api/enrollment'),
  getById: (id: number) => apiClient.get(`/api/enrollment/${id}`),
  create: (data: RequestData) => apiClient.post('/api/enrollment', data),
  update: (id: number, data: RequestData) => apiClient.put(`/api/enrollment/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/enrollment/${id}`),
};

// Admins API
export const adminsAPI = {
  getAll: () => apiClient.get('/api/admin'),
  getByRoleId: (roleId: number) => apiClient.get(`/api/admin/role/${roleId}`),
  getById: (id: number) => apiClient.get(`/api/admin/${id}`),
  create: (data: RequestData) => apiClient.post('/api/admin', data),
  update: (id: number, data: RequestData) => apiClient.put(`/api/admin/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/admin/${id}`),
};

// Analysis API
export const analysisAPI = {
  getAnalytics: () => apiClient.get('/api/analysis'),
};
