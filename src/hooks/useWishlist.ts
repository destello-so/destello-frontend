// ============================================================================
// ❤️ USE WISHLIST HOOK - Wrapper del store global de wishlist
// ============================================================================

import { useEffect, useRef } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import type { UseWishlistResult } from '../types/product.types';

export const useWishlist = (): UseWishlistResult => {
  const {
    products,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refetch
  } = useWishlistStore();

  const hasInitialized = useRef(false);

  // Cargar wishlist al montar - SOLO UNA VEZ al inicializar
  useEffect(() => {
    if (!hasInitialized.current && !loading) {
      hasInitialized.current = true;
      refetch();
    }
  }, [loading]); // Solo depende de loading, no de products.length

  return {
    wishlist: products,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist: async () => {
      // not implemented in store yet but fallback
      const ids = products.map(p => p._id);
      for (const id of ids) {
        await removeFromWishlist(id);
      }
    },
    isInWishlist,
    checkWishlist: async (productId: string): Promise<boolean> => {
      return isInWishlist(productId);
    },
    toggleWishlist,
    refetch,
    count: products.length,
    isEmpty: products.length === 0
  };
}; 