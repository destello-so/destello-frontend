// ============================================================================
// 🎨 PRODUCT CARD - Carta de producto súper hermosa con liquid glass
// ============================================================================

import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, FiShoppingCart, FiEye, FiStar, FiPackage,
  FiTrendingUp, FiCheck, FiAlertTriangle, FiX
} from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/product.types';
import * as productService from '../api/productService';

// ============================================================================
// 🎯 INTERFACES
// ============================================================================

interface ProductCardProps {
  product: Product;
  inWishlist: boolean;
  onToggleWishlist: (productId: string) => Promise<void>;
  className?: string;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

// ============================================================================
// 💎 PRODUCT CARD COMPONENT
// ============================================================================

export const ProductCard = memo(({ 
  product, 
  inWishlist,
  onToggleWishlist,
  className = '', 
  showQuickView = true,
  onQuickView 
}: ProductCardProps) => {
  const { addToCart } = useCart();
  
  // Estados locales
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Computed values
  const stockBadge = productService.getStockBadge(product.stockQty);
  const productImage = productService.getProductImageUrl(product.imageUrl);
  const formattedPrice = productService.formatPrice(product.price);
  const isInStock = productService.isInStock(product.stockQty);
  const hasDiscount = false; // Placeholder para futuras promociones

  // Función para mostrar toast
  const showToast = (type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    const toast: ToastMessage = { id, type, message };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove después de 3 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Manejar agregar al carrito
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInStock || addingToCart) return;
    
    try {
      setAddingToCart(true);
      await addToCart(product._id, 1);
      showToast('success', '¡Producto agregado al carrito! 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('error', 'Error al agregar al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  // Manejar toggle wishlist
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (togglingWishlist) return;
    
    try {
      setTogglingWishlist(true);
      await onToggleWishlist(product._id);
      showToast('success', inWishlist ? 'Removido de favoritos' : '¡Agregado a favoritos! ❤️');
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast('error', 'Error al actualizar favoritos');
    } finally {
      setTogglingWishlist(false);
    }
  };

  // Manejar vista rápida
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <>
      {/* Toast Messages */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 pointer-events-none"
          >
            <div className={`
              px-4 py-3 rounded-2xl backdrop-blur-2xl border-2 shadow-2xl
              ${toast.type === 'success' ? 'bg-emerald-100/90 border-emerald-300/60 text-emerald-800' : ''}
              ${toast.type === 'error' ? 'bg-red-100/90 border-red-300/60 text-red-800' : ''}
              ${toast.type === 'warning' ? 'bg-amber-100/90 border-amber-300/60 text-amber-800' : ''}
            `}>
              <div className="flex items-center space-x-2">
                {toast.type === 'success' && <FiCheck className="text-emerald-600" />}
                {toast.type === 'error' && <FiX className="text-red-600" />}
                {toast.type === 'warning' && <FiAlertTriangle className="text-amber-600" />}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Product Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`
          relative group overflow-hidden rounded-3xl backdrop-blur-3xl border border-white/30 
          bg-white/10 shadow-2xl shadow-rose-500/20 hover:shadow-rose-400/40 
          transition-all duration-500 cursor-pointer
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-pink-100/20 before:to-transparent before:rounded-3xl before:backdrop-blur-2xl before:pointer-events-none
          after:absolute after:inset-0 after:bg-gradient-to-t after:from-rose-200/20 after:to-transparent after:rounded-3xl after:pointer-events-none
          ${className}
        `}
      >
        {/* Efectos de fondo animados */}
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(244, 114, 182, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(251, 113, 133, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Link wrapper */}
        <Link to={`/productos/${product._id}`} className="block relative z-10">
          
          {/* Header con badges */}
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start">
            {/* Stock Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`
                px-3 py-1 rounded-full text-xs font-bold backdrop-blur-2xl border shadow-lg
                ${stockBadge.variant === 'success' ? 'bg-emerald-100/90 border-emerald-300/60 text-emerald-800' : ''}
                ${stockBadge.variant === 'warning' ? 'bg-amber-100/90 border-amber-300/60 text-amber-800' : ''}
                ${stockBadge.variant === 'danger' ? 'bg-red-100/90 border-red-300/60 text-red-800' : ''}
              `}
            >
              {stockBadge.text}
            </motion.div>

            {/* Wishlist Button */}
            <motion.button
              onClick={handleToggleWishlist}
              disabled={togglingWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`
                p-2 rounded-full backdrop-blur-2xl border-2 shadow-xl transition-all duration-300
                ${inWishlist 
                  ? 'bg-pink-100/90 border-pink-300/60 text-pink-600' 
                  : 'bg-white/90 border-white/60 text-rose-400 hover:text-pink-600 hover:bg-pink-50/90'
                }
                ${togglingWishlist ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <motion.div
                animate={{ scale: inWishlist ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
              </motion.div>
            </motion.button>
          </div>

          {/* Imagen del producto */}
          <div className="relative aspect-square overflow-hidden rounded-t-3xl">
            {/* Placeholder mientras carga */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-3 border-rose-300 border-t-transparent rounded-full"
                />
              </div>
            )}

            {/* Imagen principal */}
            <motion.img
              src={productImage}
              alt={product.name}
              className={`
                w-full h-full object-cover transition-all duration-500 group-hover:scale-110
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />

            {/* Error de imagen */}
            {imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 flex flex-col items-center justify-center text-rose-500">
                <FiPackage className="w-12 h-12 mb-2" />
                <span className="text-sm font-medium">Sin imagen</span>
              </div>
            )}

            {/* Overlay con acciones (aparece en hover) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                         flex items-end justify-center p-4 pointer-events-none group-hover:pointer-events-auto"
            >
              <div className="flex space-x-2">
                {/* Botón de vista rápida */}
                {showQuickView && (
                  <motion.button
                    onClick={handleQuickView}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-600 
                               hover:bg-white hover:text-rose-700 transition-all duration-200 pointer-events-auto"
                  >
                    <FiEye className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Botón agregar al carrito */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!isInStock || addingToCart}
                  whileHover={{ scale: isInStock ? 1.05 : 1 }}
                  whileTap={{ scale: isInStock ? 0.95 : 1 }}
                  className={`
                    p-2 backdrop-blur-sm rounded-full transition-all duration-200 pointer-events-auto
                    ${isInStock && !addingToCart
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <motion.div
                    animate={{ rotate: addingToCart ? 360 : 0 }}
                    transition={{ duration: 1, repeat: addingToCart ? Infinity : 0 }}
                  >
                    <FiShoppingCart className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Información del producto */}
          <div className="relative z-10 p-4 bg-white/5 backdrop-blur-sm">
            {/* Categorías */}
            {product.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {product.categories.slice(0, 2).map((category) => (
                  <span
                    key={category._id}
                    className="px-2 py-1 text-xs font-medium rounded-full 
                               bg-rose-100/60 text-rose-700 border border-rose-200/50"
                  >
                    {category.name}
                  </span>
                ))}
                {product.categories.length > 2 && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full 
                                   bg-gray-100/60 text-gray-600 border border-gray-200/50">
                    +{product.categories.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Nombre del producto */}
            <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm leading-tight group-hover:text-rose-800 transition-colors">
              {product.name}
            </h3>

            {/* SKU */}
            <p className="text-xs text-gray-500 mb-3 font-mono">
              SKU: {product.sku}
            </p>

            {/* Precio */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                  {formattedPrice}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through">
                    S/ {(product.price * 1.2).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Rating placeholder */}
              <div className="flex items-center text-amber-400">
                <FiStar className="w-4 h-4 fill-current" />
                <span className="text-sm text-gray-600 ml-1">4.5</span>
              </div>
            </div>

            {/* Tendencia/Popular badge */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 
                         text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg
                         flex items-center space-x-1"
            >
              <FiTrendingUp className="w-3 h-3" />
              <span>Popular</span>
            </motion.div>
          </div>
        </Link>
      </motion.div>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 