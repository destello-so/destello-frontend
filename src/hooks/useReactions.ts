import { useState } from 'react';
import { reactionService, type TargetType, type ReactionStats } from '../api/reactionService';
import type { ReactionType } from '../types/post.types';
import { toast } from 'react-hot-toast';

interface UseReactionsReturn {
  isLoading: boolean;
  addReaction: (targetId: string, reactionType: ReactionType, targetType: TargetType) => Promise<void>;
  removeReaction: (targetId: string, reactionType: ReactionType, targetType: TargetType) => Promise<void>;
  toggleReaction: (targetId: string, reactionType: ReactionType, targetType: TargetType) => Promise<void>;
  getStats: (targetType: TargetType, targetId: string) => Promise<ReactionStats | null>;
}

export const useReactions = (): UseReactionsReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const getStats = async (targetType: TargetType, targetId: string) => {
    try {
      const stats = await reactionService.getReactionStats(targetType, targetId);
      return stats;
    } catch (error) {
      console.error('Error getting reaction stats:', error);
      toast.error('No se pudieron cargar las reacciones');
      return null;
    }
  };

  const toggleReaction = async (targetId: string, reactionType: ReactionType, targetType: TargetType) => {
    try {
      setIsLoading(true);
      await reactionService.toggleReaction({
        targetType,
        targetId,
        reactionType
      });
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast.error('No se pudo procesar la reacción');
    } finally {
      setIsLoading(false);
    }
  };

  const addReaction = async (targetId: string, reactionType: ReactionType, targetType: TargetType) => {
    try {
      setIsLoading(true);
      await reactionService.addReaction(targetId, reactionType, targetType);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('No se pudo agregar la reacción');
    } finally {
      setIsLoading(false);
    }
  };

  const removeReaction = async (targetId: string, reactionType: ReactionType, targetType: TargetType) => {
    try {
      setIsLoading(true);
      await reactionService.removeReaction(targetId, reactionType, targetType);
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('No se pudo quitar la reacción');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addReaction,
    removeReaction,
    toggleReaction,
    getStats
  };
}; 