import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiX, 
  FiGrid,
  FiList,
  FiSearch,
  FiStar,
  FiTrendingUp,
  FiGift,
  FiZap,
  FiShare,
  FiEye,
  FiPackage,
  FiCheck,
  FiAlertTriangle
} from 'react-icons/fi';
import { useWishlistStore } from '../store/wishlistStore';
import type { Product } from '../types/product.types';
import { useCart } from '../hooks/useCart';

export default function Wishlist() {
  const { products, loading, error, loadWishlist, removeFromWishlist } = useWishlistStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('date');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => {
    // Verificar que el producto existe y tiene las propiedades necesarias
    if (!product || !product.name || !product._id || typeof product.name !== 'string') {
      console.warn('Producto inválido encontrado:', product);
      return false;
    }
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (product.categories && product.categories.some(cat => cat.name === selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Verificar que ambos productos existen
    if (!a || !b) return 0;
    
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'date':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(
    products
      .filter(p => p.categories && Array.isArray(p.categories))
      .flatMap(p => p.categories.map(c => c.name))
  ));

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Magical Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-300/50 via-pink-300/40 to-purple-300/30 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-pink-400/40 via-rose-300/35 to-purple-300/25 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/35 via-pink-300/30 to-rose-300/25 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute -bottom-32 -right-40 w-96 h-96 bg-gradient-to-br from-rose-400/45 via-pink-400/35 to-purple-400/30 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating magical particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${4 + Math.random() * 6}s`
            }}
          >
            <div className="w-3 h-3 bg-gradient-to-br from-rose-400/60 to-pink-400/60 rounded-full blur-sm shadow-lg shadow-rose-400/30" />
          </div>
        ))}
        
        {/* Sparkle effects */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <FiZap className="w-4 h-4 text-rose-400/40" />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {/* Magical Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full" />
              <FiHeart className="w-12 h-12 text-white relative z-10" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                <FiZap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-400/20 via-pink-400/20 to-purple-400/20 blur-xl rounded-full animate-pulse" />
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4 relative">
            Mi Lista de Deseos
            <div className="absolute -top-2 -right-8">
              <FiStar className="w-8 h-8 text-rose-400/60 animate-bounce" />
            </div>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Tus productos favoritos esperándote en un lugar mágico ✨
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
              <FiHeart className="w-4 h-4 text-rose-500" />
              <span className="text-gray-700 font-medium">{products.length} productos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
              <FiTrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-gray-700 font-medium">Tendencias</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
              <FiGift className="w-4 h-4 text-purple-500" />
              <span className="text-gray-700 font-medium">Regalos</span>
            </div>
          </div>
        </motion.div>

        {/* Magical Search & Filter Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="backdrop-blur-3xl bg-gradient-to-br from-white/40 via-white/30 to-white/20 border border-white/50 rounded-3xl p-6 shadow-2xl shadow-rose-500/30 relative overflow-hidden">
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-400/15 to-rose-400/15 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar en tus deseos mágicos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'date')}
                className="px-4 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
              >
                <option value="date">Más recientes</option>
                <option value="name">Nombre A-Z</option>
                <option value="price">Precio menor</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <div className="flex gap-2 p-1 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                      : 'text-gray-600 hover:bg-white/30'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' 
                      : 'text-gray-600 hover:bg-white/30'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : sortedProducts.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          <ProductsGrid 
            products={sortedProducts} 
            viewMode={viewMode}
            onProductClick={setSelectedProduct}
            onRemoveFromWishlist={removeFromWishlist}
          />
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

function ProductsGrid({ products, viewMode, onProductClick, onRemoveFromWishlist }: {
  products: Product[];
  viewMode: 'grid' | 'list';
  onProductClick: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product._id}
          product={product}
          index={index}
          onClick={() => onProductClick(product)}
          onRemoveFromWishlist={() => onRemoveFromWishlist(product._id)}
        />
      ))}
    </motion.div>
  );
}

function ProductCard({ product, index, onClick, onRemoveFromWishlist }: {
  product: Product;
  index: number;
  onClick: () => void;
  onRemoveFromWishlist: () => void;
}) {
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'warning'; message: string }[]>([]);

  // Computed values (usando las mismas funciones que ProductCard)
  const stockBadge = {
    text: product.stockQty > 10 ? 'En Stock' : product.stockQty > 0 ? 'Poco Stock' : 'Agotado',
    variant: product.stockQty > 10 ? 'success' : product.stockQty > 0 ? 'warning' : 'danger'
  };
  const productImage = product.imageUrl || '/placeholder-image.jpg';
  const formattedPrice = `S/ ${product.price.toFixed(2)}`;
  const isInStock = product.stockQty > 0;
  const hasDiscount = false;

  // Función para mostrar toast
  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    const toast = { id, type, message };
    
    setToasts(prev => [...prev, toast]);
    
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
      await addToCart(product._id, 1); // Assuming quantity is 1
      showToast('success', '¡Producto agregado al carrito! 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('error', 'Error al agregar al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  // Manejar remover de wishlist
  const handleRemoveFromWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (togglingWishlist) return;
    
    try {
      setTogglingWishlist(true);
      onRemoveFromWishlist();
      showToast('success', 'Removido de favoritos');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('error', 'Error al remover de favoritos');
    } finally {
      setTogglingWishlist(false);
    }
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

      {/* Product Card - EXACTAMENTE IGUAL A ProductCard.tsx */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
        className="
          relative group overflow-hidden rounded-3xl backdrop-blur-3xl border border-white/30 
          bg-white/10 shadow-2xl shadow-rose-500/20 hover:shadow-rose-400/40 
          transition-all duration-500 cursor-pointer
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-pink-100/20 before:to-transparent before:rounded-3xl before:backdrop-blur-2xl before:pointer-events-none
          after:absolute after:inset-0 after:bg-gradient-to-t after:from-rose-200/20 after:to-transparent after:rounded-3xl after:pointer-events-none
        "
        onClick={onClick}
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

          {/* Wishlist Button - SIEMPRE ACTIVO porque estamos en wishlist */}
          <motion.button
            onClick={handleRemoveFromWishlist}
            disabled={togglingWishlist}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="
              p-2 rounded-full backdrop-blur-2xl border-2 shadow-xl transition-all duration-300
              bg-pink-100/90 border-pink-300/60 text-pink-600
            "
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.4 }}
            >
              <FiHeart className="w-4 h-4 fill-current" />
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
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-600 
                           hover:bg-white hover:text-rose-700 transition-all duration-200 pointer-events-auto"
              >
                <FiEye className="w-4 h-4" />
              </motion.button>

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
          {product.categories && product.categories.length > 0 && (
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
      </motion.div>
    </>
  );
}

function ProductModal({ product, onClose }: {
  product: Product | null;
  onClose: () => void;
}) {
  if (!product) return null;

  const formatPrice = (price: number) => `S/ ${price.toFixed(2)}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-3xl border border-white/60 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-rose-500/30 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full hover:bg-white/30 transition-all duration-300"
          >
            <FiX className="w-6 h-6 text-gray-600" />
          </button>

          {/* Product Image */}
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={product.imageUrl || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {product.name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {product.categories?.map(category => (
                <span
                  key={category._id}
                  className="px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full border border-rose-200 text-sm font-medium"
                >
                  {category.name}
                </span>
              )) || null}
            </div>

            <div className="flex items-center justify-between py-6 border-t border-gray-200">
              <div className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-rose-500/30"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/30"
                >
                  <FiShare className="w-5 h-5" />
                  Compartir
                </motion.button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl" />
          <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-purple-400/15 to-rose-400/15 rounded-full blur-2xl" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-6 animate-bounce">
          <FiZap className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -inset-4 bg-gradient-to-r from-rose-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
        Preparando la magia ✨
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        Estamos cargando tus productos favoritos con un toque de magia...
      </p>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center mb-6">
          <FiX className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -inset-4 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-red-600 mb-2">
        ¡Oops! Algo salió mal
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-4">
        {error}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-rose-500/30"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-6">
          <FiHeart className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -inset-4 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-full blur-xl animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-gray-600 mb-2">
        {searchQuery ? 'No se encontraron productos' : 'Tu lista está vacía'}
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        {searchQuery 
          ? `No encontramos productos que coincidan con "${searchQuery}"`
          : 'Empieza a agregar productos a tu lista de deseos para verlos aquí'
        }
      </p>
      {searchQuery && (
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-rose-500/30"
        >
          Ver todos los productos
        </button>
      )}
    </div>
  );
} 