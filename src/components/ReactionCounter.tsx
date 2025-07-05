import React, { useEffect, useState } from 'react';
import { FaThumbsUp, FaHeart, FaLightbulb, FaThumbsDown, FaLaugh, FaSurprise } from 'react-icons/fa';
import type { TargetType } from '../api/reactionService';
import { useReactions } from '../hooks/useReactions';
import clsx from 'clsx';

interface ReactionCounterProps {
  targetType: TargetType;
  targetId: string;
  size?: 'sm' | 'md' | 'lg';
  onReactionChange?: () => void;
}

const reactionConfig = {
  like: {
    icon: FaThumbsUp,
    color: 'text-blue-500',
    hoverColor: 'hover:text-blue-600',
    bgColor: 'bg-blue-50/50',
    label: 'Me gusta'
  },
  love: {
    icon: FaHeart,
    color: 'text-pink-500',
    hoverColor: 'hover:text-pink-600',
    bgColor: 'bg-pink-50/50',
    label: 'Me encanta'
  },
  helpful: {
    icon: FaLightbulb,
    color: 'text-yellow-500',
    hoverColor: 'hover:text-yellow-600',
    bgColor: 'bg-yellow-50/50',
    label: 'Útil'
  },
  dislike: {
    icon: FaThumbsDown,
    color: 'text-gray-500',
    hoverColor: 'hover:text-gray-600',
    bgColor: 'bg-gray-50/50',
    label: 'No me gusta'
  },
  laugh: {
    icon: FaLaugh,
    color: 'text-green-500',
    hoverColor: 'hover:text-green-600',
    bgColor: 'bg-green-50/50',
    label: 'Me divierte'
  },
  wow: {
    icon: FaSurprise,
    color: 'text-purple-500',
    hoverColor: 'hover:text-purple-600',
    bgColor: 'bg-purple-50/50',
    label: 'Me sorprende'
  }
};

export const ReactionCounter: React.FC<ReactionCounterProps> = ({ targetType, targetId, size = 'md', onReactionChange }) => {
  const { getStats } = useReactions();
  const [reactionStats, setReactionStats] = useState<{ [key: string]: number }>({});

  const sizeClasses = {
    sm: 'h-4 w-4 text-sm',
    md: 'h-5 w-5 text-base',
    lg: 'h-6 w-6 text-lg'
  };

  const numberClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const loadStats = async () => {
    const stats = await getStats(targetType, targetId);
    if (stats?.data?.byType) {
      setReactionStats(stats.data.byType);
    }
  };

  useEffect(() => {
    loadStats();
  }, [targetType, targetId]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {Object.entries(reactionConfig).map(([type, config]) => {
        const count = reactionStats[type] || 0;
        if (count > 0) {
          const { icon: Icon, color, bgColor } = config;
          return (
            <div
              key={type}
              className={clsx(
                "flex items-center gap-2 px-2 py-1 rounded-full",
                "transition-all duration-200",
                bgColor,
                "backdrop-blur-sm"
              )}
            >
              <Icon className={clsx(
                sizeClasses[size],
                color,
                "transition-transform"
              )} />
              <span className={clsx(
                "font-medium",
                color
              )}>
                {count}
              </span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}; 