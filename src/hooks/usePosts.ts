import { useState, useEffect } from 'react';
import type { Post, PostPagination, PostWithReactions } from '../types/post.types';
import { postService } from '../api/postService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../store/authStore';

export const usePosts = () => {
  const [posts, setPosts] = useState<PostWithReactions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PostPagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  const { token } = useAuthStore();

  const loadPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Asegurarse de que el token esté configurado en el servicio
      postService.setAuthToken(token);
      
      const response = await postService.getFeed(page);
      
      if (!response?.data) {
        console.error('La respuesta no tiene la estructura esperada:', response);
        throw new Error('La respuesta no tiene la estructura esperada');
      }
      
      setPosts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error al cargar los posts:', err);
      setError('Error al cargar los posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: es 
    });
  };

  // No cargar posts automáticamente al montar el componente
  // ya que ahora lo manejamos con el efecto en el componente Feed

  return {
    posts,
    loading,
    error,
    pagination,
    loadPosts,
    formatTimeAgo
  };
}; 