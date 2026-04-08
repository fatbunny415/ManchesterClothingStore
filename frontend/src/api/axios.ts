import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5220/api",
  withCredentials: true, // Crucial para enviar y recibir la cookie HttpOnly
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar el token JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales y el ciclo del Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si da 401, no estamos en /login, y no hemos re-intentado ya:
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      window.location.pathname !== "/login"
    ) {
      originalRequest._retry = true;

      try {
        // Hacemos el llamado a refresh-token silenciosamente usando la instancia api con withCredentials
        const res = await api.post(
          '/auth/refresh-token',
          {},
          { withCredentials: true }
        );

        // Si fue exitoso, actualizamos el store central con el nuevo JWT
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setAuth(
          {
            id: res.data.userId || currentUser?.id || 'N/A',
            email: res.data.email || currentUser?.email || 'N/A',
            fullName: res.data.fullName || currentUser?.fullName || 'Usuario',
            role: res.data.role || currentUser?.role || 'Cliente'
          },
          res.data.token
        );

        // Agregamos el nuevo token a la request original y la re-lanzamos
        originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // El Refresh Token también expiró (o no hay cookie). Cerrar todo.
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
