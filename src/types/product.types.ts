// ============================================================================
// 📦 PRODUCT TYPES - Interfaces para el ecosistema de productos
// ============================================================================

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  weight?: number;
  dimensions?: string;
  stockQty: number;
  imageUrl?: string;
  categories: Category[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// 🔍 FILTROS Y BÚSQUEDA
// ============================================================================

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// 📋 RESPUESTAS DE LA API
// ============================================================================

export interface ProductsResponse {
  success: boolean;
  message?: string;
  data: Product[];
  pagination: PaginationInfo;
  timestamp: string;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: {
    product: Product;
  };
  timestamp: string;
}

export interface CategoriesResponse {
  success: boolean;
  message?: string;
  data: Category[];
  timestamp: string;
}

export interface StockCheckResponse {
  success: boolean;
  data: {
    available: boolean;
  };
  timestamp: string;
}

// ============================================================================
// 🛒 CARRITO
// ============================================================================

// Respuesta real del API - Item individual del carrito
export interface ApiCartItem {
  productId: Product;
  quantity: number;
  price: number;
  _id: string;
}

// Respuesta real del API - Carrito completo
export interface ApiCart {
  _id: string;
  userId: string;
  items: ApiCartItem[];
  updatedAt: string;
  createdAt: string;
  __v: number;
}

// Interfaces para el frontend (transformadas)
export interface CartItem {
  id: string; // _id del item
  productId: string; // _id del producto
  name: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string;
  categories: Category[];
  stockQty: number;
  inWishlist: boolean; // Lo agregaremos localmente
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  taxes: number;
  total: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  data: ApiCart;
  timestamp: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartRequest {
  productId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  productId: string;
}

// ============================================================================
// ❤️ WISHLIST
// ============================================================================

export interface Wishlist {
  products: Product[];
  pagination?: PaginationInfo;
}

export interface WishlistResponse {
  success: boolean;
  message?: string;
  data: Wishlist;
  timestamp: string;
}

export interface WishlistCheckResponse {
  success: boolean;
  data: {
    inWishlist: boolean;
  };
  timestamp: string;
}

export interface WishlistStatsResponse {
  success: boolean;
  data: {
    totalItems: number;
  };
  timestamp: string;
}

export interface WishlistRequest {
  productId: string;
}

// ============================================================================
// 🎨 UI STATES
// ============================================================================

export interface ProductsPageState {
  products: Product[];
  categories: Category[];
  filters: ProductFilters;
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  priceRange: [number, number];
  sortBy: string;
  viewMode: 'grid' | 'list';
}

export interface ProductCardState {
  loading: boolean;
  addingToCart: boolean;
  togglingWishlist: boolean;
  inWishlist: boolean;
  stockAvailable: boolean;
}

// ============================================================================
// 🚀 HOOKS TYPES
// ============================================================================

export interface UseProductsResult {
  products: Product[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  filters: ProductFilters;
  updateFilters: (newFilters: Partial<ProductFilters>) => void;
  changePage: (page: number) => void;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseCartResult {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
  itemCount: number;
  isEmpty: boolean;
}

export interface UseWishlistResult {
  wishlist: Product[];
  loading: boolean;
  error: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  checkWishlist: (productId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<void>;
  refetch: () => void;
  count: number;
  isEmpty: boolean;
} 