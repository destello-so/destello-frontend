import axiosInstance from './axios';
import type { Post, PostsResponse } from '../types/post.types';

class PostService {
  private token: string | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  async getFeed(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    try {
      const response = await axiosInstance.get<PostsResponse>('/posts', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener el feed:', error);
      throw error;
    }
  }

  async updatePost(postId: string, data: { text: string; tags: string[] }): Promise<Post> {
    try {
      const response = await axiosInstance.put<{ data: Post }>(`/posts/${postId}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar el post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
    } catch (error) {
      console.error('Error al eliminar el post:', error);
      throw error;
    }
  }
}

export const postService = new PostService(); 