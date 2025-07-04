import { useState, useEffect } from 'react';
import { reactionService } from '../api/reactionService';
import type { ReactionType, TargetType } from '../api/reactionService';
import { toast } from 'react-hot-toast';

interface UseReactionsReturn {
  reactions: { [key in ReactionType]: number };
  userReaction: ReactionType | null;
  toggleReaction: (type: ReactionType) => Promise<void>;
  isLoading: boolean;
}

export const useReactions = (targetType: TargetType, targetId: string): UseReactionsReturn => {
  const [reactions, setReactions] = useState<{ [key in ReactionType]: number }>({
    like: 0,
    love: 0,
    helpful: 0,
    dislike: 0,
    laugh: 0,
    wow: 0,
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const loadReactions = async () => {
      try {
        const response = await reactionService.getReactions(targetType, targetId);
        const reactionCounts: { [key in ReactionType]: number } = {
          like: 0,
          love: 0,
          helpful: 0,
          dislike: 0,
          laugh: 0,
          wow: 0,
        };
        
        let userCurrentReaction: ReactionType | null = null;
        
        // Procesar las reacciones
        Object.entries(response.data.reactionsByType).forEach(([type, reactions]) => {
          const reactionType = type as ReactionType;
          reactionCounts[reactionType] = reactions.length;
          
          // Verificar si el usuario actual tiene esta reacción
          if (reactions.some(reaction => reaction.userId.email === userEmail)) {
            userCurrentReaction = reactionType;
          }
        });
        
        setReactions(reactionCounts);
        setUserReaction(userCurrentReaction);
      } catch (error) {
        console.error('Error al cargar reacciones:', error);
        if (!isInitialLoad) {
          toast.error('No se pudieron cargar las reacciones');
        }
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadReactions();
  }, [targetId, targetType]);

  const toggleReaction = async (type: ReactionType) => {
    setIsLoading(true);
    try {
      await reactionService.toggleReaction({
        targetType,
        targetId,
        reactionType: type,
      });
      
      // Actualizar el estado local optimistamente
      if (userReaction === type) {
        // Si ya tenía esta reacción, la quitamos
        setUserReaction(null);
        setReactions(prev => ({
          ...prev,
          [type]: Math.max(0, prev[type] - 1)
        }));
      } else {
        // Si tenía otra reacción, la quitamos y agregamos la nueva
        if (userReaction) {
          setReactions(prev => ({
            ...prev,
            [userReaction]: Math.max(0, prev[userReaction] - 1),
            [type]: prev[type] + 1
          }));
        } else {
          // Si no tenía ninguna reacción, solo agregamos la nueva
          setReactions(prev => ({
            ...prev,
            [type]: prev[type] + 1
          }));
        }
        setUserReaction(type);
      }
    } catch (error: any) {
      console.error('Error al reaccionar:', error);
      const errorMessage = error.response?.data?.message || 'No se pudo procesar tu reacción';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reactions,
    userReaction,
    toggleReaction,
    isLoading
  };
}; 