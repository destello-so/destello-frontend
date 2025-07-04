import { api } from '../api/axios';
import type { HomeResponse } from '../types/home.types';

export const homeService = {
  // Obtener toda la data de inicio para el usuario
  getHomeData: async (userId: string): Promise<HomeResponse> => {
    try {
      const response = await api.get(`/users/${userId}/home`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener data de inicio:', error);
      throw error;
    }
  }
}; 