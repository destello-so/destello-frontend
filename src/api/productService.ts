// ============================================================================
// 📦 PRODUCT SERVICE - Servicios de API para productos
// ============================================================================

import api from './axios';
import type {
  ProductsResponse,
  ProductResponse,
  StockCheckResponse,
  ProductFilters,
  CategoriesResponse,
  CartResponse,
  AddToCartRequest,
  UpdateCartRequest,
  RemoveFromCartRequest,
  WishlistResponse,
  WishlistCheckResponse,
  WishlistStatsResponse,
  WishlistRequest
} from '../types/product.types';

// ============================================================================
// 📋 PRODUCTOS
// ============================================================================

/**
 * Obtener lista de productos con filtros
 */
export const getProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.search) params.append('search', filters.search);
  
  const response = await api.get(`/products?${params.toString()}`);
  return response.data;
};

/**
 * Obtener detalle de un producto
 */
export const getProduct = async (id: string): Promise<ProductResponse> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

/**
 * Verificar disponibilidad de stock
 */
export const checkStock = async (productId: string, quantity: number): Promise<StockCheckResponse> => {
  const response = await api.get(`/products/${productId}/stock?quantity=${quantity}`);
  return response.data;
};

// ============================================================================
// 🏷️ CATEGORÍAS
// ============================================================================

/**
 * Obtener todas las categorías activas
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await api.get('/categories');
  return response.data;
};

/**
 * Obtener detalle de una categoría
 */
export const getCategory = async (id: string): Promise<{ success: boolean; data: { category: import('../types/product.types').Category } }> => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// ============================================================================
// 🛒 CARRITO
// ============================================================================

/**
 * Obtener carrito actual
 */
export const getCart = async (): Promise<CartResponse> => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Agregar producto al carrito
 */
export const addToCart = async (data: AddToCartRequest): Promise<CartResponse> => {
  const response = await api.post('/cart/add', data);
  return response.data;
};

/**
 * Actualizar cantidad en carrito
 */
export const updateCartItem = async (data: UpdateCartRequest): Promise<CartResponse> => {
  const response = await api.put('/cart/update', data);
  return response.data;
};

/**
 * Remover producto del carrito
 */
export const removeFromCart = async (data: RemoveFromCartRequest): Promise<CartResponse> => {
  const response = await api.delete('/cart/remove', { data: { productId: data.productId } });
  return response.data;
};

/**
 * Vaciar carrito completo
 */
export const clearCart = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete('/cart/clear');
  return response.data;
};

/**
 * Transformar datos del carrito del API al formato de la UI
 */
export const transformCartData = (apiCart: import('../types/product.types').ApiCart, wishlistItems: string[] = []): import('../types/product.types').Cart => {
  const items = apiCart.items.map(apiItem => ({
    id: apiItem._id,
    productId: apiItem.productId._id,
    name: apiItem.productId.name,
    sku: apiItem.productId.sku,
    price: apiItem.price,
    quantity: apiItem.quantity,
    imageUrl: getProductImageUrl(apiItem.productId.imageUrl),
    categories: apiItem.productId.categories || [],
    stockQty: apiItem.productId.stockQty,
    inWishlist: wishlistItems.includes(apiItem.productId._id)
  }));

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxes = subtotal * 0.18; // 18% IGV
  const total = subtotal + taxes;

  return {
    items,
    subtotal,
    taxes,
    total
  };
};

// ============================================================================
// ❤️ WISHLIST
// ============================================================================

/**
 * Obtener wishlist del usuario
 */
export const getWishlist = async (page?: number, limit?: number): Promise<WishlistResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await api.get(`/wishlist?${params.toString()}`);
  console.log(response.data);
  return response.data;
};

/**
 * Agregar producto a wishlist
 */
export const addToWishlist = async (data: WishlistRequest): Promise<WishlistResponse> => {
  const response = await api.post('/wishlist/add', data);
  return response.data;
};

/**
 * Remover producto de wishlist
 */
export const removeFromWishlist = async (data: WishlistRequest): Promise<WishlistResponse> => {
  const response = await api.delete('/wishlist/remove', { data });
  return response.data;
};

/**
 * Vaciar wishlist completa
 */
export const clearWishlist = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete('/wishlist/clear');
  return response.data;
};

/**
 * Verificar si producto está en wishlist
 */
export const checkWishlist = async (productId: string): Promise<WishlistCheckResponse> => {
  const response = await api.get(`/wishlist/check?productId=${productId}`);
  return response.data;
};

/**
 * Obtener estadísticas de wishlist
 */
export const getWishlistStats = async (): Promise<WishlistStatsResponse> => {
  const response = await api.get('/wishlist/stats');
  return response.data;
};

// ============================================================================
// 🎯 UTILIDADES
// ============================================================================

/**
 * Construir URL de imagen con fallback
 */
export const getProductImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) {
    return 'https://www.allaboardeducators.com/images/productimages/1.jpg';
  }
  console.log(imageUrl);
  
  // Si es una URL completa, usarla tal como está
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Si es una ruta relativa, construir URL completa
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${imageUrl}`;
};

/**
 * Formatear precio en soles peruanos
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Verificar si producto está en stock
 */
export const isInStock = (stockQty: number): boolean => {
  return stockQty > 0;
};

/**
 * Obtener badge de stock
 */
export const getStockBadge = (stockQty: number): { text: string; variant: 'success' | 'warning' | 'danger' } => {
  if (stockQty > 10) {
    return { text: 'Disponible', variant: 'success' };
  } else if (stockQty > 0) {
    return { text: `Solo ${stockQty} disponible${stockQty > 1 ? 's' : ''}`, variant: 'warning' };
  } else {
    return { text: 'Agotado', variant: 'danger' };
  }
};

/**
 * Construir filtros para URL
 */
export const buildFilterParams = (filters: ProductFilters): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params.toString();
};

/**
 * Parsear filtros desde URL
 */
export const parseFilterParams = (searchParams: URLSearchParams): ProductFilters => {
  const filters: ProductFilters = {};
  
  const page = searchParams.get('page');
  if (page) filters.page = parseInt(page);
  
  const limit = searchParams.get('limit');
  if (limit) filters.limit = parseInt(limit);
  
  const category = searchParams.get('category');
  if (category) filters.category = category;
  
  const minPrice = searchParams.get('minPrice');
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  
  const maxPrice = searchParams.get('maxPrice');
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
  
  const search = searchParams.get('search');
  if (search) filters.search = search;
  
  const sortBy = searchParams.get('sortBy');
  if (sortBy) filters.sortBy = sortBy as 'name' | 'price' | 'createdAt';
  
  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';
  
  return filters;
}; 