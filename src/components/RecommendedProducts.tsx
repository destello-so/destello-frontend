// ============================================================================
// 🌟 RECOMMENDED PRODUCTS - Componente de productos recomendados con liquid glass design
// ============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiStar, FiShoppingCart, FiHeart, FiEye, FiTrendingUp,
  FiPackage, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import * as productService from '../api/productService';

// ============================================================================
// 💎 RECOMMENDED PRODUCTS COMPONENT
// ============================================================================

export const RecommendedProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const navigate = useNavigate();
  // Usar el hook de productos para obtener datos reales
  const { products: recommendedProducts, loading, error } = useProducts({
    page: 1,
    limit: 12
  });

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const itemsPerView = 3;
  const maxIndex = Math.max(0, recommendedProducts.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      // Simular delay para mejor UX
      setTimeout(() => {
        setAddingToCart(null);
      }, 1000);
    }
  };

  const visibleProducts = recommendedProducts;

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl shadow-rose-500/20">
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-rose-300 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Cargando productos recomendados...</p>
        </div>
      </div>
    );
  }

  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl shadow-rose-500/20">
        <div className="text-center py-12">
          <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-gray-700 mb-2">Error al cargar productos</h4>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl shadow-rose-500/20
                    relative overflow-hidden">
      
      <div className="relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <FiStar className="w-7 h-7 text-amber-500" />
              <span>Productos recomendados</span>
            </h3>
            <p className="text-gray-600 mt-2">
              Productos que podrían interesarte basado en tu carrito
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <button
              onClick={() => {
                navigate('/productos');
              }}
              className="px-4 py-2 rounded-xl bg-white/30 text-gray-700 hover:bg-white/50 
                         transition-all duration-300 text-sm font-medium"
            >
              Ver todos
            </button>

            {/* Navigation (solo visible cuando no está en "ver todos") */}
            {recommendedProducts.length > itemsPerView && (
              <div className="flex space-x-2">
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-2 rounded-xl transition-all duration-300
                    ${currentIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white/30 text-gray-700 hover:bg-white/50'
                    }
                  `}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    p-2 rounded-xl transition-all duration-300
                    ${currentIndex >= maxIndex
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white/30 text-gray-700 hover:bg-white/50'
                    }
                  `}
                >
                  <FiChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className={`
          grid gap-6 transition-all duration-500
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        `}>
          <AnimatePresence mode="popLayout">
            {visibleProducts.map((product, index) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/30 
                           bg-white/10 shadow-xl shadow-rose-500/10 hover:shadow-rose-400/20 
                           transition-all duration-500 cursor-pointer"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Popular Badge - Solo mostrar si tiene buen stock */}
                {product.stockQty > 10 && (
                  <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-amber-400 to-orange-500 
                                  text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg
                                  flex items-center space-x-1">
                    <FiTrendingUp className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  onClick={() => handleToggleWishlist(product._id)}
                  className={`
                    absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-xl border-2 shadow-lg transition-all duration-300
                    ${isInWishlist(product._id)
                      ? 'bg-pink-100/90 border-pink-300/60 text-pink-600' 
                      : 'bg-white/90 border-white/60 text-rose-400 hover:text-pink-600 hover:bg-pink-50/90'
                    }
                  `}
                >
                  <motion.div
                    animate={{ scale: isInWishlist(product._id) ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <FiHeart className={`w-3 h-3 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                  </motion.div>
                </button>

                <Link to={`/productos/${product._id}`} className="block">
                  
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <motion.img
                      src={productService.getProductImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        (e.target as HTMLImageElement).src = 'https://www.allaboardeducators.com/images/productimages/1.jpg';
                      }}
                    />

                    {/* Overlay con acciones */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                                 flex items-end justify-center p-4 pointer-events-none group-hover:pointer-events-auto"
                    >
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-600 
                                     hover:bg-white hover:text-rose-700 transition-all duration-200 pointer-events-auto"
                        >
                          <FiEye className="w-3 h-3" />
                        </motion.button>

                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product._id);
                          }}
                          disabled={addingToCart === product._id || product.stockQty === 0}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            p-2 rounded-full transition-all duration-200 pointer-events-auto
                            ${product.stockQty > 0 && addingToCart !== product._id
                              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                          `}
                        >
                          {addingToCart === product._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-3 h-3 border border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <FiShoppingCart className="w-3 h-3" />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 bg-white/5 backdrop-blur-sm">
                    {/* Category */}
                    {product.categories && product.categories.length > 0 && (
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded-full 
                                       bg-rose-100/60 text-rose-700 border border-rose-200/50 mb-2">
                        {product.categories[0].name}
                      </span>
                    )}

                    {/* Product Name */}
                    <h4 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm leading-tight 
                                   group-hover:text-rose-800 transition-colors">
                      {product.name}
                    </h4>

                    {/* Rating - Placeholder por ahora */}
                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex items-center text-amber-400">
                        <FiStar className="w-3 h-3 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">4.5</span>
                      </div>
                      <span className="text-xs text-gray-500">(128)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                        {productService.formatPrice(product.price)}
                      </span>
                      
                      {/* Stock indicator */}
                      <div className={`
                        text-xs px-2 py-1 rounded-full font-medium
                        ${product.stockQty > 10 
                          ? 'bg-emerald-100/80 text-emerald-700' 
                          : product.stockQty > 0 
                            ? 'bg-amber-100/80 text-amber-700' 
                            : 'bg-red-100/80 text-red-700'
                        }
                      `}>
                        {product.stockQty > 10 ? 'Stock' : 
                         product.stockQty > 0 ? `${product.stockQty} left` : 'Agotado'}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && recommendedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-700 mb-2">No hay productos disponibles</h4>
            <p className="text-gray-600">
              Por el momento no hay productos recomendados disponibles
            </p>
          </motion.div>
        )}

        {/* Pagination Dots (solo visible cuando no está en "ver todos") */}
        {recommendedProducts.length > itemsPerView && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: Math.ceil(recommendedProducts.length / itemsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${Math.floor(currentIndex / itemsPerView) === index
                    ? 'bg-rose-500 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 