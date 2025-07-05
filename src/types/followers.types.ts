export interface Follower {
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

export interface FollowersResponse {
  success: boolean;
  message: string;
  data: Follower[];
  pagination: Pagination;
  timestamp: string;
}

export interface ExtendedFollower extends Follower {
  bio: string;
  location: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isFollowingBack: boolean;
  lastActive: string;
  interests: string[];
} 