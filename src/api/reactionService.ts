import axios from './axios';

export type ReactionType = 'like' | 'love' | 'helpful' | 'dislike' | 'laugh' | 'wow';
export type TargetType = 'post' | 'comment';

interface ReactionRequest {
  targetType: TargetType;
  targetId: string;
  reactionType: ReactionType;
}

interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Reaction {
  _id: string;
  targetType: TargetType;
  targetId: string;
  userId: UserInfo;
  type: ReactionType;
  createdAt: string;
  updatedAt: string;
}

interface ReactionResponse {
  success: boolean;
  message: string;
  data: {
    action: 'created' | 'updated' | 'deleted';
    reaction: Reaction;
  };
}

interface GetReactionsResponse {
  success: boolean;
  message: string;
  data: {
    reactions: Reaction[];
    reactionsByType: {
      [key in ReactionType]: Reaction[];
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const reactionService = {
  toggleReaction: async (data: ReactionRequest): Promise<ReactionResponse> => {
    const response = await axios.post('/reactions', {
      ...data,
      type: data.reactionType // Ajustando el nombre del campo para coincidir con el backend
    });
    return response.data;
  },

  getReactions: async (targetType: TargetType, targetId: string): Promise<GetReactionsResponse> => {
    const response = await axios.get<GetReactionsResponse>(`/reactions/${targetType}/${targetId}`);
    return response.data;
  }
}; 