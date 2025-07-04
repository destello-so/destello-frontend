import { create } from 'zustand';
import { AxiosError } from 'axios';
import type { 
  AuthState, 
  LoginRequest, 
  RegisterRequest, 
  ApiError,
  AuthErrorType 
} from '../types/auth.types';
import { authService } from '../api/authService';
import { tokenManager } from '../utils/tokenManager';

// Helper para manejar errores de la API
const handleAuthError = (error: unknown): { message: string; type: AuthErrorType } => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    const status = error.response?.status;

    switch (status) {
      case 400:
        return { 
          message: apiError?.error?.message || 'Datos inválidos', 
          type: 'VALIDATION_ERROR' 
        };
      case 401:
        if (apiError?.error?.message?.includes('Credenciales inválidas')) {
          return { message: 'Email o contraseña incorrectos', type: 'INVALID_CREDENTIALS' };
        }
        if (apiError?.error?.message?.includes('Usuario desactivado')) {
          return { message: 'Tu cuenta ha sido desactivada', type: 'USER_DISABLED' };
        }
        if (apiError?.error?.message?.includes('Token')) {
          return { message: 'Sesión expirada', type: 'TOKEN_EXPIRED' };
        }
        return { message: 'No autorizado', type: 'UNAUTHORIZED' };
      case 409:
        return { message: 'Este email ya está registrado', type: 'EMAIL_ALREADY_EXISTS' };
      case 500:
        return { message: 'Error del servidor. Intenta más tarde', type: 'SERVER_ERROR' };
      default:
        return { message: 'Error de conexión', type: 'NETWORK_ERROR' };
    }
  }
  
  return { message: 'Error desconocido', type: 'NETWORK_ERROR' };
};

// 🔧 ARREGLO: Función para determinar el estado inicial basado en el token almacenado
const getInitialState = (): Pick<AuthState, 'user' | 'token' | 'isAuthenticated' | 'isLoading' | 'error'> => {
  const storedToken = tokenManager.getToken();
  const hasValidToken = Boolean(storedToken && tokenManager.isTokenValid(storedToken));
  
  console.log('🔍 [getInitialState] Token almacenado:', storedToken ? 'Existe' : 'No existe');
  console.log('🔍 [getInitialState] ¿Token válido?', hasValidToken);
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    // 🚀 CLAVE: Si hay token válido, empezar con isLoading: true para evitar redirecciones prematuras
    isLoading: hasValidToken,
    error: null
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial inteligente
  ...getInitialState(),

  // Acción: Login
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;
      
      // Guardar token en localStorage
      tokenManager.setToken(token);
      
      // Actualizar estado
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      const { message } = handleAuthError(error);
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: message 
      });
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  },

  // Acción: Register
  register: async (userData: RegisterRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.register(userData);
      const { user, token } = response.data;
      
      // Guardar token en localStorage
      tokenManager.setToken(token);
      
      // Actualizar estado
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      const { message } = handleAuthError(error);
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false, 
        error: message 
      });
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  },

  // Acción: Logout
  logout: () => {
    tokenManager.removeToken();
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false, 
      isLoading: false, 
      error: null 
    });
  },

  // Acción: Limpiar errores
  clearError: () => {
    set({ error: null });
  },

  // Acción: Cargar usuario desde token almacenado
  loadUserFromToken: async () => {
    console.log('🔄 [loadUserFromToken] Iniciando...');
    
    const storedToken = tokenManager.getToken();
    console.log('🔍 [loadUserFromToken] Token obtenido:', storedToken ? 'Existe' : 'No existe');
    
    if (!storedToken) {
      console.log('❌ [loadUserFromToken] No hay token almacenado, ejecutando logout');
      set({ isLoading: false }); // 🔧 ARREGLO: Asegurar que isLoading se resetee
      get().logout();
      return;
    }

    console.log('🔍 [loadUserFromToken] Validando token...');
    const isTokenValid = tokenManager.isTokenValid(storedToken);
    console.log('🔍 [loadUserFromToken] ¿Token válido?', isTokenValid);
    
    if (!isTokenValid) {
      console.log('❌ [loadUserFromToken] Token inválido o expirado, ejecutando logout');
      set({ isLoading: false }); // 🔧 ARREGLO: Asegurar que isLoading se resetee
      get().logout();
      return;
    }

    console.log('⏳ [loadUserFromToken] Token válido, obteniendo perfil del usuario...');
    set({ isLoading: true });
    
    try {
      console.log('📡 [loadUserFromToken] Llamando a authService.getProfile()...');
      const response = await authService.getProfile();
      console.log('✅ [loadUserFromToken] Perfil obtenido exitosamente:', response.data.user);
      
      const { user } = response.data;
      
      set({ 
        user, 
        token: storedToken, 
        isAuthenticated: true, 
        isLoading: false, 
        error: null 
      });
      
      console.log('✅ [loadUserFromToken] Estado actualizado - Usuario autenticado:', user.email);
    } catch (error) {
      console.error('❌ [loadUserFromToken] Error al obtener perfil:', error);
      // Si falla, eliminar token y hacer logout
      set({ isLoading: false }); // 🔧 ARREGLO: Asegurar que isLoading se resetee
      get().logout();
    }
  },

  // Acción: Verificar estado de autenticación
  checkAuthStatus: () => {
    const { token } = get();
    const storedToken = tokenManager.getToken();
    
    if (storedToken && tokenManager.isTokenValid(storedToken) && !token) {
      // Hay un token válido pero no está en el store, cargarlo
      get().loadUserFromToken();
    } else if (!storedToken || !tokenManager.isTokenValid(storedToken)) {
      // No hay token válido, hacer logout
      get().logout();
    }
  }
}));

// Helper función para obtener el token (mantener compatibilidad)
export const getAuthToken = () => useAuthStore.getState().token; 