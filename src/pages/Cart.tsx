// ============================================================================
// 🛒 CART PAGE - Vista de carrito más hermosa del universo
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingCart, FiArrowLeft, FiRefreshCw, FiHeart
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { CartItem } from '../components/CartItem';
import { CartSummary } from '../components/CartSummary';
import { RecommendedProducts } from '../components/RecommendedProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

// ============================================================================
// 💎 CART PAGE COMPONENT
// ============================================================================

export default function Cart() {
  // Hooks para datos reales
  const { 
    cart, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    isEmpty,
    itemCount,
    refetch
  } = useCart();

  const { toggleWishlist } = useWishlist();

  // Estados de la UI
  const showRecommendations = true;

  // Handlers
  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      // Refrescar carrito y wishlist para reflejar cambios
      refetch();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-rose-100/50 
                      relative overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-rose-300 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-rose-100/50 
                    relative overflow-hidden">
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link 
                  to="/productos"
                  className="flex items-center space-x-2 text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <FiArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Seguir comprando</span>
                </Link>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center space-x-3">
                <FiShoppingCart className="w-10 h-10 text-rose-500" />
                <span>Mi Carrito</span>
              </h1>
              <p className="text-gray-600 mt-2">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu carrito
              </p>
              {error && (
                <p className="text-red-600 mt-2 text-sm">
                  {error}
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="flex space-x-3">
              <motion.button
                onClick={refetch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl
                           text-gray-600 hover:bg-white/30 transition-all duration-300"
              >
                <FiRefreshCw className="w-5 h-5" />
              </motion.button>
              
              <Link to="/wishlist">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl
                             text-gray-600 hover:bg-white/30 transition-all duration-300"
                >
                  <FiHeart className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items Header */}
            {!isEmpty && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl shadow-rose-500/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Productos en tu carrito</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      Subtotal: <span className="font-bold text-rose-600">S/ {cart?.subtotal.toFixed(2)}</span>
                    </span>
                    <motion.button
                      onClick={handleClearCart}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      Vaciar carrito
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              <AnimatePresence>
                {cart?.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <CartItem 
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty cart message */}
            {isEmpty && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-12 text-center"
              >
                <FiShoppingCart className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Tu carrito está vacío</h3>
                <p className="text-gray-600 mb-6">
                  ¡Descubre nuestros increíbles productos y comienza a llenar tu carrito!
                </p>
                <Link
                  to="/productos"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-all duration-300"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Explorar productos</span>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Cart Summary Sidebar */}
          {!isEmpty && cart && (
            <div className="space-y-6">
              
              {/* Cart Summary */}
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <CartSummary
                  subtotal={cart.subtotal}
                  taxes={cart.taxes}
                  total={cart.total}
                  itemCount={itemCount}
                />
              </motion.div>
            </div>
          )}
        </div>

        {/* Recommended Products */}
        {showRecommendations && !isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <RecommendedProducts />
          </motion.div>
        )}
      </div>
    </div>
  );
} 