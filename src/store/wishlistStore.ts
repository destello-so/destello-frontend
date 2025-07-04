import { create } from 'zustand';
import * as productService from '../api/productService';
import type { Product, WishlistResponse } from '../types/product.types';

interface WishlistState {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refetch: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  loadWishlist: async () => {
    try {
      set({ loading: true, error: null });
      const response: WishlistResponse = await productService.getWishlist();
      if (response.success) {
        let products: Product[] = [];
        if (Array.isArray(response.data)) {
          // Mapear la estructura del endpoint: data[].productId contiene el producto
          products = (response.data as any[])
            .map((item: any) => item.productId)
            .filter((product: any) => {
              // Filtrar productos válidos con todas las propiedades necesarias
              return product && 
                     product._id && 
                     product.name && 
                     typeof product.name === 'string' &&
                     typeof product.price === 'number';
            });
        } else if (Array.isArray((response.data as any).products)) {
          products = (response.data as any).products.filter((product: any) => {
            return product && 
                   product._id && 
                   product.name && 
                   typeof product.name === 'string' &&
                   typeof product.price === 'number';
          });
        }
        console.log('Productos cargados en wishlist:', products);
        set({ products, loading: false });
      } else {
        set({ error: 'Error al cargar wishlist', loading: false, products: [] });
      }
    } catch (error) {
      console.error('Error loadWishlist:', error);
      set({ error: 'Error al cargar wishlist', loading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      await productService.addToWishlist({ productId });
      set((state) => ({ products: [...state.products.filter(p=>p._id!==productId), { _id: productId } as Product] }));
    } catch (error) {
      console.error('Error addToWishlist', error);
      set({ error: 'Error al agregar a wishlist' });
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      await productService.removeFromWishlist({ productId });
      set((state) => ({ products: state.products.filter(p => p._id !== productId) }));
    } catch (error) {
      console.error('Error removeFromWishlist', error);
      set({ error: 'Error al remover de wishlist' });
    }
  },

  toggleWishlist: async (productId: string) => {
    const inList = get().isInWishlist(productId);
    if (inList) {
      await get().removeFromWishlist(productId);
    } else {
      await get().addToWishlist(productId);
    }
  },

  isInWishlist: (productId: string) => {
    return get().products.some(p => p._id === productId);
  },

  refetch: () => {
    get().loadWishlist();
  }
})); 