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

export default api; 