// ============================================================================
// 🛒 USE CART HOOK - Hook para exponer el carrito global
// ============================================================================

import { useCartStore } from '../store/cartStore';
import type { UseCartResult } from '../types/product.types';
import { useEffect } from 'react';

export const useCart = (): UseCartResult => {
  const {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch
  } = useCartStore();

  // Computed values
  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  const isEmpty = itemCount === 0;

  // Cargar carrito al montar
  useEffect(() => {
    if (!cart && !loading) {
      refetch();
    }
  }, [cart, loading, refetch]);

  return {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch,
    itemCount,
    isEmpty
  };
}; 