import type { AxiosResponse } from 'axios';
import api from './axios';
import type { 
  AuthResponse, 
  ProfileResponse, 
  LoginRequest, 
  RegisterRequest 
} from '../types/auth.types';

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Registrar nuevo usuario
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', userData);
    return response.data;
  },

  // Obtener perfil del usuario autenticado
  getProfile: async (): Promise<ProfileResponse> => {
    const response: AxiosResponse<ProfileResponse> = await api.get('/auth/me');
    return response.data;
  },

  // Verificar si el token es válido haciendo una llamada al backend
  verifyToken: async (): Promise<boolean> => {
    try {
      await authService.getProfile();
      return true;
    } catch {
      return false;
    }
  }
}; 