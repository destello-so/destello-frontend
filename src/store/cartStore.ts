import { create } from 'zustand';
import * as productService from '../api/productService';
import type { Cart, CartResponse } from '../types/product.types';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  loadCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  // Cargar carrito desde el servidor
  loadCart: async () => {
    try {
      set({ loading: true, error: null });
      const response: CartResponse = await productService.getCart();
      if (response.success) {
        const transformed = productService.transformCartData(response.data);
        set({ cart: transformed, loading: false });
      } else {
        set({ error: 'Error al cargar carrito', loading: false, cart: { items: [], subtotal: 0, taxes: 0, total: 0 } });
      }
    } catch (error) {
      console.error('Error loadCart:', error);
      set({ error: 'Error al cargar carrito', loading: false });
    }
  },

  // Agregar producto
  addToCart: async (productId: string, quantity: number = 1) => {
    try {
      set({ error: null });
      const response: CartResponse = await productService.addToCart({ productId, quantity });
      if (response.success) {
        const transformed = productService.transformCartData(response.data);
        set({ cart: transformed });
        // Refetch para asegurar sincronización completa (por si el backend no envía todos los items)
        await get().loadCart();
      } else {
        set({ error: 'Error al agregar producto' });
      }
    } catch (error) {
      console.error('Error addToCart:', error);
      set({ error: 'Error al agregar producto' });
    }
  },

  // Actualizar cantidad
  updateQuantity: async (productId: string, quantity: number) => {
    try {
      set({ error: null });
      if (quantity <= 0) {
        await get().removeFromCart(productId);
        return;
      }
      const response: CartResponse = await productService.updateCartItem({ productId, quantity });
      if (response.success) {
        const transformed = productService.transformCartData(response.data);
        set({ cart: transformed });
      } else {
        set({ error: 'Error al actualizar cantidad' });
      }
    } catch (error) {
      console.error('Error updateQuantity:', error);
      set({ error: 'Error al actualizar cantidad' });
    }
  },

  // Remover item
  removeFromCart: async (productId: string) => {
    try {
      set({ error: null });
      const response: CartResponse = await productService.removeFromCart({ productId });
      if (response.success) {
        const transformed = productService.transformCartData(response.data);
        set({ cart: transformed });
      } else {
        set({ error: 'Error al remover producto' });
      }
    } catch (error) {
      console.error('Error removeFromCart:', error);
      set({ error: 'Error al remover producto' });
    }
  },

  // Vaciar carrito
  clearCart: async () => {
    try {
      set({ error: null });
      const response = await productService.clearCart();
      if (response.success) {
        set({ cart: { items: [], subtotal: 0, taxes: 0, total: 0 } });
      } else {
        set({ error: 'Error al vaciar carrito' });
      }
    } catch (error) {
      console.error('Error clearCart:', error);
      set({ error: 'Error al vaciar carrito' });
    }
  },

  refetch: () => {
    get().loadCart();
  }
})); 