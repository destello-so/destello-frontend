import type { User } from './auth.types';
import { FaThumbsUp, FaHeart, FaLightbulb, FaThumbsDown, FaLaugh, FaSurprise } from "react-icons/fa";
import type { ReactNode } from 'react';

export interface Post {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  text: string;
  tags: string[];
  reactions: PostReactions;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PostsResponse {
  success: boolean;
  message: string;
  data: Post[];
  pagination: PostPagination;
  timestamp: string;
}

export interface PostReactions {
  like: number;
  love: number;
  helpful: number;
  dislike: number;
  laugh: number;
  wow: number;
}

export interface PostWithReactions extends Post {
  reactions: PostReactions;
  comments: number;
  shares: number;
}

export interface Comment {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  text: string;
  reactions: PostReactions;
  createdAt: string;
  updatedAt: string;
}

export const reactionIcons = {
  like: FaThumbsUp,
  love: FaHeart,
  helpful: FaLightbulb,
  dislike: FaThumbsDown,
  laugh: FaLaugh,
  wow: FaSurprise,
} as const;

export type ReactionType = keyof typeof reactionIcons;

export const reactionColors = {
  like: 'text-blue-500',
  love: 'text-red-500',
  helpful: 'text-yellow-500',
  dislike: 'text-gray-500',
  laugh: 'text-orange-500',
  wow: 'text-purple-500',
} as const; 