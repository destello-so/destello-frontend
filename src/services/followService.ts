import axios from '../api/axios';

// Interfaces para las respuestas de la API
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  profilePicture?: string;
  addresses?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSuggestion {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UserStats {
  following: number;
  followers: number;
}

export interface FollowCheckResponse {
  isFollowing: boolean;
}

export interface FollowResponse {
  _id: string;
  userId: User;
  targetUserId: User;
  createdAt: string;
  updatedAt: string;
}

export interface UnfollowResponse {
  message: string;
}

// Interfaces para las respuestas completas de la API
interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

class FollowService {
  /**
   * Obtener usuarios sugeridos
   */
  async getSuggestions(limit: number = 6): Promise<UserSuggestion[]> {
    try {
      const response = await axios.get<ApiResponse<UserSuggestion[]>>(
        `/follow/suggestions?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error al obtener usuarios sugeridos:', apiError);
      throw new Error(apiError.response?.data?.message || 'Error al obtener usuarios sugeridos');
    }
  }

  /**
   * Obtener estadísticas de un usuario (seguidores y siguiendo)
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const response = await axios.get<ApiResponse<UserStats>>(
        `/follow/users/${userId}/stats`
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error al obtener estadísticas del usuario:', apiError);
      throw new Error(apiError.response?.data?.message || 'Error al obtener estadísticas del usuario');
    }
  }

  /**
   * Seguir a un usuario
   */
  async followUser(targetUserId: string): Promise<FollowResponse> {
    try {
      const response = await axios.post<ApiResponse<FollowResponse>>(
        '/follow',
        { targetUserId }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error al seguir usuario:', apiError);
      throw new Error(apiError.response?.data?.message || 'Error al seguir usuario');
    }
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(targetUserId: string): Promise<UnfollowResponse> {
    try {
      const response = await axios.delete<ApiResponse<UnfollowResponse>>(
        '/follow',
        { data: { targetUserId } }
      );
      return response.data.data;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error al dejar de seguir usuario:', apiError);
      throw new Error(apiError.response?.data?.message || 'Error al dejar de seguir usuario');
    }
  }

  /**
   * Verificar si el usuario actual sigue a otro usuario
   */
  async checkFollowStatus(targetUserId: string): Promise<boolean> {
    try {
      const response = await axios.get<ApiResponse<FollowCheckResponse>>(
        `/follow/check?targetUserId=${targetUserId}`
      );
      return response.data.data.isFollowing;
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error al verificar estado de seguimiento:', apiError);
      throw new Error(apiError.response?.data?.message || 'Error al verificar estado de seguimiento');
    }
  }

  /**
   * Obtener estadísticas de múltiples usuarios en paralelo
   */
  async getMultipleUsersStats(userIds: string[]): Promise<Record<string, UserStats>> {
    try {
      const promises = userIds.map(async (userId) => {
        try {
          const stats = await this.getUserStats(userId);
          return { userId, stats };
        } catch (error) {
          console.warn(`Error al obtener stats del usuario ${userId}:`, error);
          return { userId, stats: { following: 0, followers: 0 } };
        }
      });

      const results = await Promise.all(promises);
      
      return results.reduce((acc, { userId, stats }) => {
        acc[userId] = stats;
        return acc;
      }, {} as Record<string, UserStats>);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error al obtener estadísticas múltiples:', apiError);
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }

  /**
   * Verificar estado de seguimiento de múltiples usuarios
   */
  async checkMultipleFollowStatus(userIds: string[]): Promise<Record<string, boolean>> {
    try {
      const promises = userIds.map(async (userId) => {
        try {
          const isFollowing = await this.checkFollowStatus(userId);
          return { userId, isFollowing };
        } catch (error) {
          console.warn(`Error al verificar seguimiento del usuario ${userId}:`, error);
          return { userId, isFollowing: false };
        }
      });

      const results = await Promise.all(promises);
      
      return results.reduce((acc, { userId, isFollowing }) => {
        acc[userId] = isFollowing;
        return acc;
      }, {} as Record<string, boolean>);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error al verificar múltiples estados de seguimiento:', apiError);
      throw new Error('Error al verificar estados de seguimiento');
    }
  }
}

export const followService = new FollowService(); 