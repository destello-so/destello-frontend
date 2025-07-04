// ============================================================================
// 🛒 CART ITEM - Componente de item del carrito con liquid glass design
// ============================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrash2, FiPlus, FiMinus, FiHeart, FiStar, FiPackage,
  FiAlertTriangle, FiCheck
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import * as productService from '../api/productService';
import type { CartItem as CartItemType } from '../types/product.types';
import { useWishlist } from '../hooks/useWishlist';

// ============================================================================
// 🎯 INTERFACES
// ============================================================================

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
}

// ============================================================================
// 💎 CART ITEM COMPONENT
// ============================================================================

export const CartItem = ({ item, onUpdateQuantity, onRemove, onToggleWishlist }: CartItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { isInWishlist } = useWishlist();
  const isFav = isInWishlist(item.productId);

  // Computed values
  const isInStock = item.stockQty > 0;
  const isLowStock = item.stockQty <= 5 && item.stockQty > 0;
  const itemTotal = item.price * item.quantity;
  const maxQuantity = Math.min(item.stockQty, 10); // Límite máximo de 10

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxQuantity) return;
    onUpdateQuantity(item.productId, newQuantity);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.productId), 300);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        x: isRemoving ? -300 : 0,
        scale: isRemoving ? 0.8 : 1
      }}
      transition={{ duration: 0.3 }}
      className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl shadow-rose-500/20
                 hover:shadow-rose-400/30 transition-all duration-300 relative overflow-hidden"
    >


      <div className="relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32 lg:w-24 lg:h-24 overflow-hidden rounded-2xl">
            {/* Loading placeholder */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                <div className="text-rose-400">
                  <FiPackage className="w-6 h-6" />
                </div>
              </div>
            )}

            {/* Product Image */}
            <img
              src={productService.getProductImageUrl(item.imageUrl)}
              alt={item.name}
              className={`
                w-full h-full object-cover transition-all duration-500
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />

            {/* Image Error */}
            {imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 flex flex-col items-center justify-center text-rose-500">
                <FiPackage className="w-8 h-8 mb-1" />
                <span className="text-xs">Sin imagen</span>
              </div>
            )}

            {/* Stock badge */}
            {isLowStock && (
              <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                ¡{item.stockQty} left!
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              {/* Categories */}
              {item.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.categories.slice(0, 2).map((category) => (
                    <span
                      key={category._id}
                      className="px-2 py-1 text-xs font-medium rounded-full 
                                 bg-rose-100/60 text-rose-700 border border-rose-200/50"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Product Name */}
              <Link 
                to={`/productos/${item.productId}`}
                className="block"
              >
                <h3 className="text-lg font-bold text-gray-800 hover:text-rose-600 transition-colors
                               line-clamp-2 mb-2">
                  {item.name}
                </h3>
              </Link>

              {/* SKU */}
              <p className="text-sm text-gray-500 font-mono mb-2">
                SKU: {item.sku}
              </p>

              {/* Stock Status */}
              <div className="flex items-center space-x-4 mb-3">
                {isInStock ? (
                  <div className="flex items-center space-x-1 text-emerald-600">
                    <FiCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">En stock</span>
                    {isLowStock && <span className="text-xs text-amber-600">({item.stockQty} disponibles)</span>}
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-red-600">
                    <FiAlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Sin stock</span>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center text-amber-400">
                  <FiStar className="w-4 h-4 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">4.5</span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex lg:hidden items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 bg-white/30 rounded-xl p-1">
                    <motion.button
                      onClick={() => handleQuantityChange(item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${item.quantity <= 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                        }
                      `}
                    >
                      <FiMinus className="w-3 h-3" />
                    </motion.button>

                    <span className="w-8 text-center font-bold text-gray-800">
                      {item.quantity}
                    </span>

                    <motion.button
                      onClick={() => handleQuantityChange(item.quantity + 1)}
                      disabled={item.quantity >= maxQuantity}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${item.quantity >= maxQuantity
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                        }
                      `}
                    >
                      <FiPlus className="w-3 h-3" />
                    </motion.button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Precio unitario</p>
                    <p className="text-lg font-bold text-gray-900">S/ {item.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => onToggleWishlist(item.productId)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      p-2 rounded-xl border-2 transition-all duration-300
                      ${isFav
                        ? 'bg-pink-100/90 border-pink-300/60 text-pink-600' 
                        : 'bg-white/30 border-white/60 text-gray-600 hover:text-pink-600'
                      }
                    `}
                  >
                    <FiHeart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </motion.button>

                  <motion.button
                    onClick={handleRemove}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl border-2 border-red-300/60 bg-red-100/90 text-red-600
                               hover:bg-red-200/90 transition-all duration-300"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex lg:flex-col lg:items-end lg:space-y-4">
              
              {/* Price Info */}
              <div className="text-right">
                <p className="text-sm text-gray-600">Precio unitario</p>
                <p className="text-xl font-bold text-gray-900">S/ {item.price.toFixed(2)}</p>
                <p className="text-sm text-rose-600 font-semibold">
                  Total: S/ {itemTotal.toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2 bg-white/30 rounded-xl p-1">
                <motion.button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${item.quantity <= 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                    }
                  `}
                >
                  <FiMinus className="w-3 h-3" />
                </motion.button>

                <span className="w-12 text-center font-bold text-gray-800">
                  {item.quantity}
                </span>

                <motion.button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= maxQuantity}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                    ${item.quantity >= maxQuantity
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                    }
                  `}
                >
                  <FiPlus className="w-3 h-3" />
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => onToggleWishlist(item.productId)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`
                    p-3 rounded-xl border-2 transition-all duration-300
                    ${isFav
                      ? 'bg-pink-100/90 border-pink-300/60 text-pink-600' 
                      : 'bg-white/30 border-white/60 text-gray-600 hover:text-pink-600'
                    }
                  `}
                >
                  <FiHeart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </motion.button>

                <motion.button
                  onClick={handleRemove}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-xl border-2 border-red-300/60 bg-red-100/90 text-red-600
                             hover:bg-red-200/90 transition-all duration-300"
                >
                  <FiTrash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low stock warning */}
      {isLowStock && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-amber-50/80 rounded-2xl border border-amber-200/60 flex items-center space-x-2"
        >
          <FiAlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm text-amber-700 font-medium">
            ¡Solo quedan {item.stockQty} unidades en stock!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}; 