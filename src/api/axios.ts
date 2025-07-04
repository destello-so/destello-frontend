import axios from 'axios';
import { tokenManager } from '../utils/tokenManager';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  console.log('🔗 [Axios Interceptor] Token obtenido para request:', token ? 'Existe' : 'No existe');
  
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    console.log('✅ [Axios Interceptor] Header Authorization agregado');
  } else {
    console.log('❌ [Axios Interceptor] No hay token, request sin Authorization');
  }
  return config;
});

// Agregar interceptor de respuesta para debuggear
api.interceptors.response.use(
  (response) => {
    console.log('📥 [Axios Interceptor] Respuesta recibida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ [Axios Interceptor] Error en la respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api; 