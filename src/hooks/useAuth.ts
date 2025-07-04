import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  return {
    // Estado
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Acciones
    login: store.login,
    register: store.register,
    logout: store.logout,
    clearError: store.clearError,
    loadUserFromToken: store.loadUserFromToken,

    // Helpers
    isLoggedIn: store.isAuthenticated && !!store.user,
    isGuest: !store.isAuthenticated || !store.user,
  };
}; 