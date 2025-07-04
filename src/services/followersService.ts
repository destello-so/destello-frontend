import { api } from '../api/axios';
import type { FollowersResponse } from '../types/followers.types';

export const getFollowers = async (
  userId: string, 
  page: number = 1, 
  limit: number = 20
): Promise<FollowersResponse> => {
  try {
    const response = await api.get(`/follow/users/${userId}/followers?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener seguidores:', error);
    throw error;
  }
};

export const searchFollowers = async (
  userId: string,
  searchTerm: string,
  page: number = 1,
  limit: number = 20
): Promise<FollowersResponse> => {
  try {
    const response = await api.get(
      `/follow/users/${userId}/followers?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al buscar seguidores:', error);
    throw error;
  }
}; 