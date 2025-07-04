import axios from './axios';

interface CommentRequest {
  parentType: 'post';
  parentId: string;
  text: string;
}

interface Comment {
  _id: string;
  parentType: string;
  parentId: string;
  userId: {
    _id: string;
    email: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
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
  }
}; 