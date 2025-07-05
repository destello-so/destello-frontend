// Tipos para el usuario
export interface HomeUser {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

// Tipos para posts
export interface PostUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Post {
  _id: string;
  userId: PostUser;
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface TrendingPost {
  post: Post;
  totalReactions: number;
  reactionsByType: {
    [key: string]: number;
  };
}

// Tipos para feed
export interface Feed {
  personalizedPosts: Post[];
  trendingPosts: TrendingPost[];
  recentGlobalPosts: Post[];
}

// Tipos para seguidores y social
export interface NewFollower {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  targetUserId: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface RecentInteraction {
  _id: string;
  userId: string;
  targetId: string;
  type: string;
  createdAt: string;
}

export interface UserSuggestion {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
}

export interface FollowingActivity {
  activeToday: number;
  totalFollowing: number;
  recentlyActive: Post[];
}

export interface Social {
  newFollowers: NewFollower[];
  recentInteractions: RecentInteraction[];
  suggestions: UserSuggestion[];
  followingActivity: FollowingActivity;
}

// Tipos para productos y comercio
export interface ProductCategory {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  weight: number;
  dimensions: string;
  stockQty: number;
  imageUrl: string;
  categories: ProductCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  avgRating?: number;
  reviewCount?: number;
}

export interface CartSummary {
  total: number;
  itemCount: number;
  items: number;
}

export interface WishlistSummary {
  totalItems: number;
  totalValue: number;
  availableItems?: number;
  outOfStockItems?: number;
}

export interface PendingOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Commerce {
  recommendedProducts: Product[];
  trendingProducts: Product[];
  newProducts: Product[];
  cartSummary: CartSummary;
  wishlistSummary: WishlistSummary;
  pendingOrders: PendingOrder[];
}

// Tipos para estadísticas
export interface PersonalStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  totalReviews: number;
  totalOrders: number;
}

export interface RecentActivity {
  postsThisWeek: number;
  reactionsReceived: number;
  commentsReceived: number;
}

export interface Stats {
  personal: PersonalStats;
  recentActivity: RecentActivity;
}

// Tipos para insights
export interface TopCategory {
  _id: string;
  name: string;
  count: number;
}

export interface TopTag {
  _id: string;
  count: number;
}

export interface ReactionStyle {
  _id: string;
  count: number;
}

export interface Insights {
  myTopCategories: TopCategory[];
  myTopTags: TopTag[];
  myReactionStyle: ReactionStyle[];
}

// Tipos para trending
export interface TrendingTag {
  _id: string;
  count: number;
}

export interface TrendingReview {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  helpfulCount: number;
  createdAt: string;
}

export interface ActiveUser {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  postCount: number;
}

export interface Trending {
  tags: TrendingTag[];
  reviews: TrendingReview[];
  activeUsers: ActiveUser[];
}

// Tipos para highlights
export interface LastPost {
  _id: string;
  userId?: string;
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface LastReview {
  _id: string;
  productId: string;
  rating: number;
  title: string;
  createdAt: string;
}

export interface LastOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface MyRecentActivity {
  lastPost: LastPost | null;
  lastReview: LastReview | null;
  lastOrder: LastOrder | null;
}

export interface Highlights {
  newProducts: Product[];
  topRatedProducts: Product[];
  myRecentActivity: MyRecentActivity;
}

// Tipo principal para toda la data de inicio
export interface HomeData {
  user: HomeUser;
  feed: Feed;
  social: Social;
  commerce: Commerce;
  stats: Stats;
  insights: Insights;
  trending: Trending;
  highlights: Highlights;
}

// Tipo para la respuesta completa de la API
export interface HomeResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    home: HomeData;
  };
} 