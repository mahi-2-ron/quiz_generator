import axios, { type AxiosError } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token when available
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — redirect to login on 401 from authenticated routes
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isUnauthorized = error.response?.status === 401;
    const isLoginRoute = error.config?.url?.includes('/auth/login');

    if (isUnauthorized && !isLoginRoute) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
