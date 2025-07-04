// ============================================================================
// 🎯 USE PRODUCTS HOOK - Hook para manejar productos con filtros
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import * as productService from '../api/productService';
import type {
  Product,
  ProductFilters,
  PaginationInfo,
  UseProductsResult
} from '../types/product.types';

export const useProducts = (initialFilters: ProductFilters = {}): UseProductsResult => {
  // Estados
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  // Función para cargar productos
  const loadProducts = useCallback(async (newFilters?: ProductFilters, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const filtersToUse = newFilters || filters;
      const response = await productService.getProducts(filtersToUse);

      if (response.success) {
        setProducts(prevProducts => 
          append ? [...prevProducts, ...response.data] : response.data
        );
        setPagination(response.pagination);
      } else {
        throw new Error('Error al cargar productos');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset página al filtrar
    setFilters(updatedFilters);
    
    // Cargar productos con nuevos filtros
    loadProducts(updatedFilters);
  }, [filters, loadProducts]);

  // Función para cambiar página
  const changePage = useCallback((page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    
    // Cargar productos de la nueva página
    loadProducts(updatedFilters);
  }, [filters, loadProducts]);

  // Función para cargar más productos (scroll infinito)
  const loadMore = useCallback(() => {
    if (pagination && pagination.hasNext && !loading) {
      const nextPage = pagination.page + 1;
      const updatedFilters = { ...filters, page: nextPage };
      setFilters(updatedFilters);
      loadProducts(updatedFilters, true); // append = true
    }
  }, [pagination, loading, filters, loadProducts]);

  // Función para refetch
  const refetch = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  // Cargar productos iniciales
  useEffect(() => {
    loadProducts();
  }, []); // Solo al montar el componente

  // Computed values
  const hasMore = pagination ? pagination.hasNext : false;

  return {
    products,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    loadMore,
    refetch,
    hasMore
  };
};

// ============================================================================
// 🎯 USE PRODUCT HOOK - Hook para un producto individual
// ============================================================================

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProduct(id);
      
      if (response.success) {
        setProduct(response.data.product);
      } else {
        throw new Error('Producto no encontrado');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar producto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    loading,
    error,
    refetch
  };
};

// ============================================================================
// 🏷️ USE CATEGORIES HOOK - Hook para categorías
// ============================================================================

export const useCategories = () => {
  const [categories, setCategories] = useState<import('../types/product.types').Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getCategories();
      
      if (response.success) {
        setCategories(response.data);
      } else {
        throw new Error('Error al cargar categorías');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refetch
  };
}; 