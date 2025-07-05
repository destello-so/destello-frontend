import api from '../api/axios';

export interface CreatePostRequest {
  text: string;
  tags: string[];
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    text: string;
    tags: string[];
    _id: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export const postService = {
  async createPost(postData: CreatePostRequest): Promise<CreatePostResponse> {
    console.log('📝 [PostService] Creando post:', postData);
    
    try {
      const response = await api.post<CreatePostResponse>('/posts', postData);
      console.log('✅ [PostService] Post creado exitosamente:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [PostService] Error al crear post:', error);
      
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Error al crear el post');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error desconocido al crear el post');
      }
    }
  }
}; 