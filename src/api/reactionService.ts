import axios from './axios';

export type ReactionType = 'like' | 'love' | 'helpful' | 'dislike' | 'laugh' | 'wow';
export type TargetType = 'post' | 'comment';

export interface ReactionRequest {
  targetType: TargetType;
  targetId: string;
  reactionType: ReactionType;
}

export interface ReactionResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    action: 'created' | 'updated' | 'deleted';
    reaction: {
      _id: string;
      targetType: TargetType;
      targetId: string;
      userId: string;
      type: ReactionType;
      createdAt: string;
      updatedAt: string;
    };
  };
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

export interface ReactionStats {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    total: number;
    byType: {
      [key in ReactionType]: number;
    };
  };
}

export const reactionService = {
  toggleReaction: async (data: ReactionRequest): Promise<ReactionResponse> => {
    const response = await axios.post('/reactions', {
      targetType: data.targetType,
      targetId: data.targetId,
      reactionType: data.reactionType
    });
    return response.data;
  },

  getReactions: async (targetType: TargetType, targetId: string): Promise<ReactionResponse> => {
    const response = await axios.get(`/reactions/${targetType}/${targetId}/check`);
    return response.data;
  },

  getReactionStats: async (targetType: TargetType, targetId: string): Promise<ReactionStats> => {
    const response = await axios.get(`/reactions/${targetType}/${targetId}/stats`);
    return response.data;
  },

  addReaction: async (targetId: string, reactionType: ReactionType, targetType: TargetType = 'post'): Promise<ReactionResponse> => {
    const response = await axios.post('/reactions', {
      targetType,
      targetId,
      reactionType
    });
    return response.data;
  },

  removeReaction: async (targetId: string, reactionType: ReactionType, targetType: TargetType = 'post'): Promise<ReactionResponse> => {
    const response = await axios.delete(`/reactions/${targetType}/${targetId}/${reactionType}`);
    return response.data;
  }
}; 