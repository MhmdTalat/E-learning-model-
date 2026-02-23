import axios, { AxiosInstance, AxiosError, AxiosConfig } from "axios";

interface CustomError extends Error {
  response?: AxiosError['response'];
}

// Prefer explicit Vite env var, fall back to common backend launch URL
const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_URL) || process.env.REACT_APP_API_URL || "http://localhost:52103";

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing to avoid multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers of new token
const notifyTokenRefresh = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Request interceptor - add token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let axios set multipart/form-data with boundary when body is FormData
  if (config.data instanceof FormData && config.headers) {
    delete (config.headers as Record<string, unknown>)['Content-Type'];
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
    hasToken: !!token,
  });
  return config;
});

console.log('[API client] Using base URL:', API_BASE_URL);

// Response interceptor for error handling and token refresh
client.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
    });
    return response;
  },
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const data = error.response?.data;
    const status = error.response?.status;
    const originalRequest = error.config as AxiosConfig & { _retry?: boolean };
    
    console.error(`[API] ✗ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: status,
      message: data?.message ?? data?.error ?? error.message,
    });
    if (data && Object.keys(data).length > 0) {
      console.error('[API] Response body:', data);
    }

    // Handle 401 - Try to refresh token
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const currentToken = localStorage.getItem("token");

        if (!refreshToken || !currentToken) {
          // No refresh token available, clear auth and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // Call refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          token: currentToken,
          refreshToken: refreshToken,
        });

        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        localStorage.setItem("token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        isRefreshing = false;
        
        // Notify all queued requests and retry with new token
        notifyTokenRefresh(newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        console.error("[API] Token refresh failed:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    
    if (status === 403) {
      const errorMessage = data?.message || "You don't have permission to access this resource";
      const customError = new Error(errorMessage) as CustomError;
      customError.response = error.response;
      return Promise.reject(customError);
    }
    
    if (status === 400) {
      const errorMessage = data?.message || data?.error || "Invalid request";
      const customError = new Error(errorMessage) as CustomError;
      customError.response = error.response;
      return Promise.reject(customError);
    }
    
    if (status === 404) {
      const errorMessage = data?.message || "Resource not found";
      const customError = new Error(errorMessage) as CustomError;
      customError.response = error.response;
      return Promise.reject(customError);
    }
    
    if (status === 500) {
      const errorMessage = data?.message || "Server error. Please try again later";
      const customError = new Error(errorMessage) as CustomError;
      customError.response = error.response;
      return Promise.reject(customError);
    }
    
    return Promise.reject(error);
  }
);

export const apiRequest = client;
export default client;
