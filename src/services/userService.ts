import { api } from '../api/axios';
import type { UserProfileResponse } from '../types/user.types';

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    throw error;
  }
};

export const getMyProfile = async (userId: string): Promise<UserProfileResponse> => {
  try {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener mi perfil:', error);
    throw error;
  }
}; 