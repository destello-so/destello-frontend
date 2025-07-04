// Tipos de usuario según la API
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  _id?: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

// Respuesta exitosa de autenticación
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
  timestamp: string;
}

// Respuesta de perfil de usuario
export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
  timestamp: string;
}

// Estructura de error de la API
export interface ErrorDetail {
  field: string;
  message: string;
  value: unknown;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: ErrorDetail[];
  };
  timestamp: string;
}

// Requests de formularios
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Formularios del frontend (con validaciones extra)
export interface LoginForm extends LoginRequest {
  rememberMe?: boolean; // Campo adicional para "recordarme"
}

export interface RegisterForm extends RegisterRequest {
  confirmPassword: string; // Solo para validación frontend
}

// Estados del store
export interface AuthState {
  // Estado de datos
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Estados de UI
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  loadUserFromToken: () => Promise<void>;
  checkAuthStatus: () => void;
}

// Tipos de error para manejo específico
export type AuthErrorType = 
  | 'VALIDATION_ERROR'      // 400
  | 'UNAUTHORIZED'          // 401 
  | 'EMAIL_ALREADY_EXISTS'  // 409
  | 'USER_DISABLED'         // 401 con mensaje específico
  | 'INVALID_CREDENTIALS'   // 401 
  | 'TOKEN_EXPIRED'         // 401
  | 'SERVER_ERROR'          // 500
  | 'NETWORK_ERROR';        // Sin conexión 