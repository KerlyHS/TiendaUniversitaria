import axios from 'axios';

/**
 * API Client - TiendaUniversitaria
 * 
 * Cliente HTTP reutilizable para todas las llamadas a Django REST API
 * Maneja JWT, refresh automático y errores globales
 * 
 * Spec-Kit Metadata:
 * @spec Spec-003: JWT Authentication con refresh
 * @spec Spec-002: GET /api/v1/productos/
 * @spec Spec-005: GET /api/v1/pedidos/
 */

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Agregar JWT token a headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Manejar errores 401 y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('jwt_refresh');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('jwt_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Logout y redirigir a login
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_refresh');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
