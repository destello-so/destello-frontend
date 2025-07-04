import api from './axios';
import type { Address } from '../types/auth.types';

export const userService = {
  addAddress: async (address: Address): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/users/addresses', address);
    return response.data;
  }
}; 