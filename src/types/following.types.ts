export interface Following {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FollowingResponse {
  success: boolean;
  message: string;
  data: Following[];
  pagination: Pagination;
  timestamp: string;
}

// Tipo extendido para mostrar más información en la UI
export interface ExtendedFollowing extends Following {
  avatar?: string;
  bio?: string;
  location?: string;
  isVerified?: boolean;
  isActive?: boolean;
  lastActive?: string;
  mutualFollowers?: number;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  interests?: string[];
  joinedDate?: string;
  isFollowingBack?: boolean;
}

export interface FollowingFilters {
  search: string;
  filter: 'all' | 'verified' | 'active' | 'mutual';
  sortBy: 'recent' | 'name' | 'activity';
  viewMode: 'grid' | 'list';
}

export interface FollowingStats {
  total: number;
  verified: number;
  activeToday: number;
  mutualFollowers: number;
} 