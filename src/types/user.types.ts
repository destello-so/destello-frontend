export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  addresses?: Address[];
  createdAt: string;
  updatedAt?: string;
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface SocialStats {
  followers: number;
  following: number;
  isFollowing: boolean;
}

export interface PostStats {
  totalPosts: number;
  recentPosts: number;
  lastMonthPosts: number;
  averagePostsPerWeek: number;
  activityLevel: 'active' | 'inactive' | 'very_active';
}

export interface Post {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostsData {
  stats: PostStats;
  recent: Post[];
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewsData {
  total: number;
  averageRating: number;
  recent: Review[];
}

export interface CommentsData {
  total: number;
}

export interface CartData {
  total: number;
  itemCount: number;
  items: number;
}

export interface WishlistData {
  totalItems: number;
  totalValue: number;
  availableItems: number;
  outOfStockItems: number;
}

export interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrdersData {
  total: number;
  totalSpent: number;
  recent: Order[];
}

export interface CommerceData {
  cart: CartData;
  wishlist: WishlistData;
  orders: OrdersData;
}

export interface UserProfileData {
  user: UserProfile;
  social: SocialStats;
  posts: PostsData;
  reviews: ReviewsData;
  comments: CommentsData;
  commerce?: CommerceData;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    profile: UserProfileData;
  };
} 