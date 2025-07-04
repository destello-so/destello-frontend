import { motion } from 'framer-motion';
import type { ReactionType } from '../api/reactionService';
import { useReactions } from '../hooks/useReactions';
import { reactionIcons, reactionColors } from '../types/post.types';
import clsx from 'clsx';

interface ReactionBarProps {
  targetType: 'post' | 'comment';
  targetId: string;
  className?: string;
}

const reactionLabels = {
  like: 'Me gusta',
  love: 'Me encanta',
  helpful: 'Útil',
  dislike: 'No me gusta',
  laugh: 'Me divierte',
  wow: 'Me sorprende',
} as const;

export const ReactionBar = ({
  targetType,
  targetId,
  className
}: ReactionBarProps) => {
  const { reactions, userReaction, toggleReaction, isLoading } = useReactions(targetType, targetId);

  const handleReaction = async (type: ReactionType) => {
    if (isLoading) return;
    await toggleReaction(type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={clsx(
        "bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-2 z-50",
        className
      )}
    >
      <div className="flex items-center space-x-1">
        {(Object.entries(reactionIcons) as Array<[ReactionType, typeof reactionIcons[keyof typeof reactionIcons]]>).map(([type, Icon]) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleReaction(type)}
            className={clsx(
              "relative group p-2 rounded-xl transition-colors",
              type === userReaction ? "bg-gray-100" : "hover:bg-gray-50"
            )}
            disabled={isLoading}
          >
            <Icon 
              className={clsx(
                "h-6 w-6 transition-transform group-hover:scale-110",
                reactionColors[type as keyof typeof reactionColors],
                type === userReaction ? "scale-110" : ""
              )} 
            />
            
            {/* Contador de reacciones */}
            {reactions[type] > 0 && (
              <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center text-xs font-medium shadow-sm">
                {reactions[type]}
              </div>
            )}
            
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {reactionLabels[type as keyof typeof reactionLabels]}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}; 