import { api } from '../api/axios';
import type { FollowingResponse } from '../types/following.types';

export const followingService = {
  // Obtener usuarios seguidos con paginación
  getFollowing: async (userId: string, page: number = 1, limit: number = 20): Promise<FollowingResponse> => {
    try {
      const response = await api.get(`/follow/users/${userId}/following?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios seguidos:', error);
      throw error;
    }
  },

  // Buscar usuarios seguidos
  searchFollowing: async (userId: string, searchTerm: string, page: number = 1, limit: number = 20): Promise<FollowingResponse> => {
    try {
      const response = await api.get(`/follow/users/${userId}/following?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios seguidos:', error);
      throw error;
    }
  }
}; 