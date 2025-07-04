import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'destello_auth_token';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const tokenManager = {
  // Guardar token en localStorage
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token guardado exitosamente');
    } catch (error) {
      console.error('❌ Error saving token to localStorage:', error);
    }
  },

  // Obtener token de localStorage  
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log('🔍 Token obtenido:', token ? 'Existe' : 'No existe');
      return token;
    } catch (error) {
      console.error('❌ Error getting token from localStorage:', error);
      return null;
    }
  },

  // Eliminar token de localStorage
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Token eliminado');
    } catch (error) {
      console.error('❌ Error removing token from localStorage:', error);
    }
  },

  // Verificar si el token es válido (no expirado)
  isTokenValid: (token: string): boolean => {
    try {
      console.log('🔍 Validando token...');
      const decoded = jwtDecode<TokenPayload>(token);
      console.log('✅ Token decodificado exitosamente:', { id: decoded.id, email: decoded.email, exp: decoded.exp });
      
      const currentTime = Date.now() / 1000;
      const isValid = decoded.exp > currentTime;
      console.log(`⏰ Token ${isValid ? 'válido' : 'expirado'}. Expira: ${new Date(decoded.exp * 1000)}`);
      
      return isValid;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return false;
    }
  },

  // Decodificar token para obtener información del usuario
  decodeToken: (token: string): TokenPayload | null => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      console.log('✅ Token decodificado para uso:', { id: decoded.id, email: decoded.email });
      return decoded;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  },

  // Verificar si hay un token válido almacenado
  hasValidToken: (): boolean => {
    const token = tokenManager.getToken();
    if (!token) {
      console.log('❌ No hay token almacenado');
      return false;
    }
    const isValid = tokenManager.isTokenValid(token);
    console.log(`🔍 hasValidToken: ${isValid}`);
    return isValid;
  }
}; 