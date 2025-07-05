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

  // Cargar carrito al montar - SIN refetch en dependencias para evitar bucle infinito
  useEffect(() => {
    if (!cart && !loading) {
      refetch();
    }
  }, [cart, loading]); // ✅ Eliminamos refetch de las dependencias

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