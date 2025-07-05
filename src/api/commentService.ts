import axios from './axios';
import type { Comment } from '../types/post.types';

interface CommentRequest {
  parentType: 'post';
  parentId: string;
  text: string;
}

interface CommentsResponse {
  success: boolean;
  message: string;
  data: {
    comments: Comment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const commentService = {
  createComment: async (data: CommentRequest) => {
    const response = await axios.post('/comments', data);
    return response.data;
  },

  getComments: async (parentType: string, parentId: string, page = 1, limit = 20) => {
    const response = await axios.get<CommentsResponse>(`/comments/parent/${parentType}/${parentId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  addReaction: async (commentId: string, reactionType: string) => {
    const response = await axios.post(`/comments/${commentId}/reactions`, { type: reactionType });
    return response.data;
  },

  removeReaction: async (commentId: string, reactionType: string) => {
    const response = await axios.delete(`/comments/${commentId}/reactions/${reactionType}`);
    return response.data;
  }
}; 