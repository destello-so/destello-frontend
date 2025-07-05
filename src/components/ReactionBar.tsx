import { motion, AnimatePresence } from 'framer-motion';
import type { ReactionType, TargetType } from '../api/reactionService';
import { useReactions } from '../hooks/useReactions';
import { reactionIcons, reactionColors } from '../types/post.types';
import { FaHeart } from 'react-icons/fa';
import clsx from 'clsx';
import { useState } from 'react';

interface ReactionBarProps {
  targetType: TargetType;
  targetId: string;
  className?: string;
  onReactionChange?: () => void;
}

const reactionLabels = {
  like: 'Me gusta',
  love: 'Me encanta',
  helpful: 'Útil',
  dislike: 'No me gusta',
  laugh: 'Me divierte',
  wow: 'Me sorprende',
} as const;

export const ReactionBar: React.FC<ReactionBarProps> = ({ targetType, targetId, className, onReactionChange }) => {
  const { toggleReaction, isLoading } = useReactions();
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = async (reactionType: ReactionType) => {
    if (isLoading) return;

    try {
      await toggleReaction(targetId, reactionType, targetType);
      onReactionChange?.();
      setShowReactions(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowReactions(!showReactions)}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          "text-pink-500 hover:text-pink-600",
          "transition-all duration-200",
          "bg-pink-50/50 hover:bg-pink-100/50",
          "font-medium",
          className
        )}
      >
        <FaHeart className="h-5 w-5" />
        <span>Reaccionar</span>
      </button>

      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              "absolute bottom-full left-0 mb-2",
              "flex items-center gap-1 p-2",
              "bg-white rounded-xl shadow-lg",
              "backdrop-blur-sm bg-white/90"
            )}
          >
            {Object.entries(reactionIcons).map(([type, Icon]) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReaction(type as ReactionType)}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  "hover:bg-gray-100"
                )}
                disabled={isLoading}
                title={reactionLabels[type as keyof typeof reactionLabels]}
              >
                <Icon className={clsx(
                  "h-6 w-6",
                  reactionColors[type as ReactionType]
                )} />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 