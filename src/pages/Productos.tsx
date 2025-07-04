// ============================================================================
// 🛍️ PRODUCTOS PAGE - La vista de productos más hermosa del universo
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiGrid, FiList, FiChevronDown,
  FiRefreshCw, FiX, FiSliders, FiArrowUp, FiPackage, FiShoppingCart
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import { useWishlist } from '../hooks/useWishlist';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types/product.types';

// ============================================================================
// 🎯 INTERFACES
// ============================================================================

interface PriceRange {
  min: number;
  max: number;
}

interface SortOption {
  value: string;
  label: string;
  field: 'name' | 'price' | 'createdAt';
  order: 'asc' | 'desc';
}

// ============================================================================
// 🎨 OPCIONES DE CONFIGURACIÓN
// ============================================================================

// Opciones de ordenamiento visibles en el select
const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Más recientes', field: 'createdAt', order: 'desc' },
  { value: 'oldest', label: 'Más antiguos', field: 'createdAt', order: 'asc' },
  { value: 'name-asc', label: 'Nombre A-Z', field: 'name', order: 'asc' },
  { value: 'name-desc', label: 'Nombre Z-A', field: 'name', order: 'desc' },
  { value: 'price-asc', label: 'Precio menor', field: 'price', order: 'asc' },
  { value: 'price-desc', label: 'Precio mayor', field: 'price', order: 'desc' }
];

// ============================================================================
// 💎 PRODUCTOS PAGE COMPONENT
// ============================================================================

export default function Productos() {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 10000 });
  const [currentSort, setCurrentSort] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Hooks
  const { 
    products, 
    pagination, 
    loading, 
    error, 
    updateFilters, 
    changePage, 
    refetch 
  } = useProducts({
    limit: 24
  });
  
  const { categories, loading: categoriesLoading } = useCategories();

  // Wishlist hook (solo una vez para toda la vista)
  const {
    isInWishlist,
    toggleWishlist
  } = useWishlist();

  // Efectos
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers
  const handleSearch = () => {
    const sortOption = SORT_OPTIONS.find(opt => opt.value === currentSort);
    updateFilters({
      search: searchTerm.trim() || undefined,
      category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
      minPrice: priceRange.min > 0 ? priceRange.min : undefined,
      maxPrice: priceRange.max < 10000 ? priceRange.max : undefined,
      sortBy: sortOption?.field,
      sortOrder: sortOption?.order as 'asc' | 'desc',
      page: 1
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 10000 });
    setCurrentSort('newest');
    updateFilters({
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1
    });
  };

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Contadores para los filtros
  const activeFiltersCount = [
    searchTerm.trim(),
    selectedCategories.length > 0,
    priceRange.min > 0,
    priceRange.max < 10000
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-rose-100/50 
                    relative overflow-hidden">
      
      {/* Efectos de fondo animados */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-rose-300/30 to-pink-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-rose-300/30 rounded-full blur-2xl"
          animate={{
            scale: [1, 0.8, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Nuestros Productos
              </h1>
              <p className="text-gray-600">
                Descubre los mejores productos de {categories.length > 0 ? categories.length : ''} categorías
              </p>
            </div>
            <Link 
              to="/carrito"
              className="flex items-center space-x-2 px-6 py-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 
                         transition-all duration-300 shadow-xl shadow-rose-500/30"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span className="font-medium">Ver Carrito</span>
            </Link>
          </div>
        </motion.div>

        {/* Barra de búsqueda y controles principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl shadow-rose-500/20"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <div className="relative flex">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 pl-12 pr-4 py-3 rounded-l-2xl border border-white/30 bg-white/20 backdrop-blur-xl
                           text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-300
                           focus:border-transparent transition-all duration-300"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-rose-500 text-white rounded-r-2xl hover:bg-rose-600 transition-all duration-300"
                >
                  Buscar
                </button>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      handleSearch();
                    }}
                    className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="flex gap-3 flex-wrap lg:flex-nowrap">
              
              {/* Toggle filtros */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center space-x-2 px-4 py-3 rounded-2xl backdrop-blur-xl border-2 transition-all duration-300
                  ${showFilters 
                    ? 'bg-rose-100/80 border-rose-300/60 text-rose-700' 
                    : 'bg-white/20 border-white/30 text-gray-600 hover:bg-rose-50/80'
                  }
                `}
              >
                <FiFilter className="w-4 h-4" />
                <span className="font-medium">Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>

              {/* Ordenamiento */}
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => {
                    setCurrentSort(e.target.value);
                    // Auto-aplicar cuando cambia
                    setTimeout(handleSearch, 100);
                  }}
                  className="appearance-none px-4 py-3 pr-10 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl
                           text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all duration-300"
                >
                  {/* Opciones de ordenamiento */}
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
              </div>

              {/* Vista */}
              <div className="flex border border-white/30 rounded-2xl overflow-hidden backdrop-blur-xl bg-white/20">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-rose-500 text-white' 
                      : 'text-gray-600 hover:bg-white/30'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-rose-500 text-white' 
                      : 'text-gray-600 hover:bg-white/30'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh */}
              <motion.button
                onClick={refetch}
                whileHover={{ scale: 1.05, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl
                           text-gray-600 hover:bg-white/30 transition-all duration-300"
              >
                <FiRefreshCw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-6">
          
          {/* Sidebar de filtros */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
                className="w-80 space-y-6"
              >
                
                {/* Panel de filtros */}
                <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl shadow-rose-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      <FiSliders className="w-5 h-5 mr-2 text-rose-500" />
                      Filtros
                    </h3>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-rose-500 hover:text-rose-600 font-medium"
                      >
                        Limpiar todo
                      </button>
                    )}
                  </div>

                  {/* Categorías */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Categorías</h4>
                    {categoriesLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-10 bg-white/30 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {categories.map((category) => (
                          <label
                            key={category._id}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/30 transition-all duration-200 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category._id)}
                              onChange={() => {
                                handleCategoryToggle(category._id);
                                // Auto-aplicar cuando cambia
                                setTimeout(handleSearch, 100);
                              }}
                              className="w-4 h-4 text-rose-600 border-rose-300 rounded focus:ring-rose-500"
                            />
                            <span className="flex-1 text-sm font-medium text-gray-700">
                              {category.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rango de precios */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Precio</h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                          <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                            onBlur={handleSearch}
                            className="w-full px-3 py-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl
                                     text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            min="0"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                          <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                            onBlur={handleSearch}
                            className="w-full px-3 py-2 rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl
                                     text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={handleSearch}
                        className="w-full py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all duration-300"
                      >
                        Aplicar filtro de precio
                      </button>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Contenido principal */}
          <div className="flex-1">
            
            {/* Información de resultados */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between"
            >
              <div className="text-gray-600">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-rose-300 border-t-transparent rounded-full"
                    />
                    <span>Cargando productos...</span>
                  </div>
                ) : pagination ? (
                  <span>
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} productos
                  </span>
                ) : (
                  <span>0 productos encontrados</span>
                )}
              </div>
            </motion.div>

            {/* Grid de productos */}
            {error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="backdrop-blur-2xl bg-red-100/80 border border-red-300/60 rounded-3xl p-8 text-center"
              >
                <FiPackage className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-800 mb-2">Error al cargar productos</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all duration-300"
                >
                  Reintentar
                </button>
              </motion.div>
            ) : products.length === 0 && !loading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-12 text-center"
              >
                <FiPackage className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No se encontraron productos</h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar tus filtros o búsqueda para encontrar lo que buscas.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all duration-300"
                >
                  Limpiar filtros
                </button>
              </motion.div>
            ) : (
              <>
                {/* Loading skeletons */}
                {loading && (
                  <div className={`
                    grid gap-6 mb-8
                    ${viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1'
                    }
                  `}>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="bg-white/20 rounded-3xl p-6 animate-pulse">
                        <div className="aspect-square bg-white/30 rounded-2xl mb-4" />
                        <div className="h-4 bg-white/30 rounded mb-2" />
                        <div className="h-3 bg-white/30 rounded w-3/4 mb-4" />
                        <div className="h-6 bg-white/30 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Productos */}
                {!loading && (
                  <motion.div
                    layout
                    className={`
                      grid gap-6 mb-8
                      ${viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
                      }
                    `}
                  >
                    <AnimatePresence mode="popLayout">
                      {products.map((product, index) => (
                        <motion.div
                          key={product._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ProductCard
                            product={product}
                            inWishlist={isInWishlist(product._id)}
                            onToggleWishlist={toggleWishlist}
                            onQuickView={handleQuickView}
                            className={viewMode === 'list' ? 'flex' : ''}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Paginación */}
                {pagination && pagination.pages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center items-center space-x-2 mt-8"
                  >
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className={`
                        px-4 py-2 rounded-xl transition-all duration-300
                        ${pagination.hasPrev
                          ? 'bg-white/30 text-gray-700 hover:bg-white/50'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      Anterior
                    </button>

                    {/* Números de página */}
                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => changePage(pageNum)}
                          className={`
                            w-10 h-10 rounded-xl transition-all duration-300
                            ${pageNum === pagination.page
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                              : 'bg-white/30 text-gray-700 hover:bg-white/50'
                            }
                          `}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className={`
                        px-4 py-2 rounded-xl transition-all duration-300
                        ${pagination.hasNext
                          ? 'bg-white/30 text-gray-700 hover:bg-white/50'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      Siguiente
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botón scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-rose-500 text-white rounded-full shadow-2xl shadow-rose-500/30
                       hover:bg-rose-600 transition-all duration-300 z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal de vista rápida - placeholder */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Vista Rápida</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center py-12">
                <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Vista rápida próximamente...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Producto: {selectedProduct.name}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 