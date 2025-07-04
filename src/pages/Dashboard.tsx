/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiHeart, FiShoppingBag, FiUsers, FiTrendingUp, FiStar,
  FiMessageCircle, FiShoppingCart, FiClock, FiZap,
  FiGift, FiActivity, FiPlus, FiArrowRight, FiRefreshCw,
  FiFeather, FiUserPlus
} from 'react-icons/fi';
import { homeService } from '../services/homeService';
import { followService } from '../services/followService';
import type { HomeData } from '../types/home.types';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useRouteTitle } from '../hooks/useDocumentTitle';

const Dashboard: React.FC = () => {
  // Hook para título de página
  useRouteTitle();
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const { cart, addToCart: addToCartFn, itemCount: cartItemCount } = useCart();

  const particles = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 25 + 15,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.7 + 0.2
  }));

  const loadHomeData = async (refresh: boolean = false) => {
    if (!user?._id) return;
    
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await homeService.getHomeData(user._id);
      setHomeData(response.data.home);
      
      // Verificar el estado de seguimiento de las sugerencias
      if (response.data.home.social.suggestions.length > 0) {
        const suggestionIds = response.data.home.social.suggestions.map((s: any) => s._id);
        const followStatus = await followService.checkMultipleFollowStatus(suggestionIds);
        setFollowingStatus(followStatus);
      }
      
      if (refresh) {
        toast.success('¡Dashboard actualizado! ✨', {
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 192, 203, 0.3)',
            borderRadius: '16px',
            color: '#1f2937',
            fontWeight: '500'
          }
        });
      }
    } catch (error) {
      console.error('Error loading home data:', error);
      toast.error('Error al cargar el dashboard', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          color: '#1f2937',
          fontWeight: '500'
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleFollow = async (userId: string) => {
    const isCurrentlyFollowing = followingStatus[userId];
    const countDiff = isCurrentlyFollowing ? -1 : 1;

    setFollowingStatus(prev => ({ ...prev, [userId]: !isCurrentlyFollowing }));
    setFollowingIds(prev => new Set(prev).add(userId));
    setHomeData(prev => prev ? {
      ...prev,
      stats: {
        ...prev.stats,
        personal: {
          ...prev.stats.personal,
          followingCount: Math.max(0, prev.stats.personal.followingCount + countDiff)
        }
      }
    } : prev);

    try {
      if (isCurrentlyFollowing) {
        await followService.unfollowUser(userId);
        toast.success('Has dejado de seguir a este usuario', {
          icon: '👋',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 192, 203, 0.3)',
            borderRadius: '16px',
            color: '#1f2937',
            fontWeight: '500'
          }
        });
      } else {
        await followService.followUser(userId);
        toast.success('¡Ahora sigues a este usuario! 💫', {
          icon: '👥',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 192, 203, 0.3)',
            borderRadius: '16px',
            color: '#1f2937',
            fontWeight: '500'
          }
        });
      }
    } catch {
      setFollowingStatus(prev => ({ ...prev, [userId]: isCurrentlyFollowing }));
      setHomeData(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          personal: {
            ...prev.stats.personal,
            followingCount: Math.max(0, prev.stats.personal.followingCount - countDiff)
          }
        }
      } : prev);

      toast.error('Error al actualizar el seguimiento', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          color: '#1f2937',
          fontWeight: '500'
        }
      });
    } finally {
      setFollowingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    setAddingToCart(prev => new Set(prev).add(productId));
    
    try {
      await addToCartFn(productId, 1);
      toast.success(`¡${productName} agregado al carrito! 🛒`, {
        icon: '🛍️',
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '16px',
          color: '#1f2937',
          fontWeight: '500'
        }
      });
    } catch {
      toast.error('Error al agregar al carrito', {
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          color: '#1f2937',
          fontWeight: '500'
        }
      });
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  useEffect(() => {
    loadHomeData();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
        {/* Partículas de carga */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute bg-gradient-to-r from-pink-300 to-rose-300 rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
              }}
              animate={{
                y: [0, -50, 0],
                x: [0, 25, 0],
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-2xl"
            >
              <FiZap className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Cargando tu mundo Destello...</h2>
            <p className="text-gray-600 text-lg">Preparando una experiencia mágica ✨</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <FiHeart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay datos disponibles</h2>
          <p className="text-gray-600">Intenta refrescar la página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Partículas flotantes súper intensas */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-r from-pink-300 to-rose-300 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, 30, 0],
              scale: [1, 1.8, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header espectacular */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 bg-clip-text text-transparent mb-2"
              >
                ¡Hola, {homeData.user.firstName}! ✨
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-600"
              >
                Bienvenido de vuelta a tu mundo Destello
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadHomeData(true)}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-3xl rounded-2xl px-6 py-3 border border-pink-200/50 text-gray-700 hover:bg-white/80 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <FiRefreshCw className="w-5 h-5" />
              </motion.div>
              <span className="font-medium">Actualizar</span>
            </motion.button>
          </div>

          {/* Estadísticas personales hermosas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <StatsCard
              icon={<FiMessageCircle />}
              label="Posts"
              value={homeData.stats.personal.postsCount}
              color="from-blue-500 to-cyan-500"
              delay={0}
            />
            <StatsCard
              icon={<FiUsers />}
              label="Seguidores"
              value={homeData.stats.personal.followersCount}
              color="from-pink-500 to-rose-500"
              delay={0.1}
            />
            <StatsCard
              icon={<FiHeart />}
              label="Siguiendo"
              value={homeData.stats.personal.followingCount}
              color="from-purple-500 to-indigo-500"
              delay={0.2}
            />
            <StatsCard
              icon={<FiStar />}
              label="Reseñas"
              value={homeData.stats.personal.totalReviews}
              color="from-yellow-500 to-orange-500"
              delay={0.3}
            />
            <StatsCard
              icon={<FiShoppingBag />}
              label="Órdenes"
              value={homeData.stats.personal.totalOrders}
              color="from-green-500 to-emerald-500"
              delay={0.4}
            />
          </motion.div>
        </motion.div>

        {/* Grid principal de secciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Feed y Social */}
          <div className="lg:col-span-2 space-y-8">
            {/* Feed personalizado */}
            <FeedSection 
              feed={homeData.feed} 
              formatDate={formatDate}
              getInitials={getInitials}
              navigate={navigate}
            />

            {/* Actividad social */}
            <SocialSection 
              social={homeData.social}
              onToggleFollow={handleToggleFollow}
              followingIds={followingIds}
              followingStatus={followingStatus}
              getInitials={getInitials}
              formatDate={formatDate}
            />

            {/* Trending y insights */}
            <TrendingSection 
              trending={homeData.trending}
              insights={homeData.insights}
            />
          </div>

          {/* Columna derecha - Comercio y highlights */}
          <div className="space-y-8">
            {/* Resumen de comercio */}
            <CommerceSection 
              commerce={homeData.commerce}
              formatPrice={formatPrice}
              navigate={navigate}
              cartSummary={{ total: cart?.total || 0, itemCount: cartItemCount }}
            />

            {/* Productos recomendados */}
            <ProductsSection 
              products={homeData.commerce.recommendedProducts.slice(0, 4)}
              title="Productos para ti"
              formatPrice={formatPrice}
              navigate={navigate}
              onAddToCart={handleAddToCart}
              addingToCart={addingToCart}
            />

            {/* Actividad reciente */}
            <RecentActivitySection 
              activity={homeData.highlights.myRecentActivity}
              formatDate={formatDate}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de tarjeta de estadística
const StatsCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  delay: number;
}> = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// Componente de sección de feed
const FeedSection: React.FC<{
  feed: any;
  formatDate: (date: string) => string;
  getInitials: (firstName: string, lastName: string) => string;
  navigate: (path: string) => void;
}> = ({ feed, formatDate, getInitials, navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-white/70 backdrop-blur-3xl rounded-2xl p-8 border border-pink-200/50 shadow-lg"
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <FiFeather className="w-6 h-6 text-pink-500 mr-3" />
        Tu Feed Personalizado
      </h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/feed')}
        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg"
      >
        Ver todos
        <FiArrowRight className="w-4 h-4 inline ml-1" />
      </motion.button>
    </div>

    <div className="space-y-4">
      {feed.personalizedPosts.slice(0, 3).map((post: any, index: number) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          whileHover={{ x: 5 }}
          className="bg-white/50 backdrop-blur-2xl rounded-xl p-4 border border-pink-100/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {getInitials(post.userId.firstName, post.userId.lastName)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-800">
                  {post.userId.firstName} {post.userId.lastName}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
              </div>
              <p className="text-gray-700 mb-2">{post.text}</p>
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Componente de sección social
const SocialSection: React.FC<{
  social: any;
  onToggleFollow: (userId: string) => void;
  followingIds: Set<string>;
  followingStatus: Record<string, boolean>;
  getInitials: (firstName: string, lastName: string) => string;
  formatDate: (date: string) => string;
}> = ({ social, onToggleFollow, followingIds, followingStatus, getInitials, formatDate }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white/70 backdrop-blur-3xl rounded-2xl p-8 border border-pink-200/50 shadow-lg"
  >
    <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
      <FiUsers className="w-6 h-6 text-purple-500 mr-3" />
      Actividad Social
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nuevos seguidores */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FiHeart className="w-5 h-5 text-rose-500 mr-2" />
          Nuevos Seguidores ({social.newFollowers.length})
        </h3>
        <div className="space-y-3">
          {social.newFollowers.slice(0, 3).map((follower: any, index: number) => (
            <motion.div
              key={follower._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center space-x-3 bg-white/50 backdrop-blur-2xl rounded-lg p-3"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {getInitials(follower.userId.firstName, follower.userId.lastName)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">
                  {follower.userId.firstName} {follower.userId.lastName}
                </p>
                <p className="text-xs text-gray-500">{formatDate(follower.createdAt)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sugerencias */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <FiUserPlus className="w-5 h-5 text-blue-500 mr-2" />
          Personas que podrías conocer
        </h3>
        <div className="space-y-3">
          {social.suggestions.slice(0, 3).map((suggestion: any, index: number) => (
            <motion.div
              key={suggestion._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between bg-white/50 backdrop-blur-2xl rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {getInitials(suggestion.firstName, suggestion.lastName)}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {suggestion.firstName} {suggestion.lastName}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleFollow(suggestion._id)}
                disabled={followingIds.has(suggestion._id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 disabled:opacity-50 ${
                  followingStatus[suggestion._id] 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                }`}
              >
                {followingIds.has(suggestion._id) 
                  ? 'Procesando...' 
                  : followingStatus[suggestion._id] 
                    ? 'Siguiendo' 
                    : 'Seguir'
                }
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// Componente de sección trending
const TrendingSection: React.FC<{
  trending: any;
  insights: any;
}> = ({ trending, insights }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="bg-white/70 backdrop-blur-3xl rounded-2xl p-8 border border-pink-200/50 shadow-lg"
  >
    <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
      <FiTrendingUp className="w-6 h-6 text-green-500 mr-3" />
      Tendencias e Insights
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tags trending */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🔥 Tags Populares</h3>
        <div className="space-y-2">
          {trending.tags.slice(0, 5).map((tag: any, index: number) => (
            <motion.div
              key={tag._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between bg-white/50 backdrop-blur-2xl rounded-lg p-2"
            >
              <span className="text-sm font-medium text-gray-700">#{tag._id}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {tag.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Usuarios activos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">⚡ Usuarios Activos</h3>
        <div className="space-y-2">
          {trending.activeUsers.slice(0, 5).map((user: any, index: number) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between bg-white/50 backdrop-blur-2xl rounded-lg p-2"
            >
              <span className="text-sm font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {user.postCount} posts
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mis insights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">💡 Tus Insights</h3>
        <div className="space-y-2">
          {insights.myTopTags.slice(0, 5).map((tag: any, index: number) => (
            <motion.div
              key={tag._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between bg-white/50 backdrop-blur-2xl rounded-lg p-2"
            >
              <span className="text-sm font-medium text-gray-700">#{tag._id}</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {tag.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// Componente de sección de comercio
const CommerceSection: React.FC<{
  commerce: any;
  formatPrice: (price: number) => string;
  navigate: (path: string) => void;
  cartSummary: { total: number; itemCount: number };
}> = ({ commerce, formatPrice, navigate, cartSummary }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="bg-white/70 backdrop-blur-3xl rounded-2xl p-8 border border-pink-200/50 shadow-lg"
  >
    <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
      <FiShoppingBag className="w-6 h-6 text-emerald-500 mr-3" />
      Tu Tienda
    </h2>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl p-4 text-white cursor-pointer"
        onClick={() => navigate('/carrito')}
      >
        <FiShoppingCart className="w-6 h-6 mb-2" />
        <p className="text-sm opacity-90">Carrito</p>
        <p className="text-lg font-bold">{formatPrice(cartSummary.total)}</p>
        <p className="text-xs opacity-75">{cartSummary.itemCount} items</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl p-4 text-white"
      >
        <FiHeart className="w-6 h-6 mb-2" />
        <p className="text-sm opacity-90">Wishlist</p>
        <p className="text-lg font-bold">{formatPrice(commerce.wishlistSummary.totalValue)}</p>
        <p className="text-xs opacity-75">{commerce.wishlistSummary.totalItems} items</p>
      </motion.div>
    </div>

    {commerce.pendingOrders.length > 0 && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
          <FiClock className="w-4 h-4 mr-2" />
          Órdenes Pendientes
        </h3>
        {commerce.pendingOrders.map((order: any) => (
          <div key={order._id} className="flex items-center justify-between text-sm">
            <span className="text-yellow-700">Orden #{order._id.slice(-6)}</span>
            <span className="font-medium text-yellow-800">{formatPrice(order.totalAmount)}</span>
          </div>
        ))}
      </div>
    )}
  </motion.div>
);

// Componente de sección de productos
const ProductsSection: React.FC<{
  products: any[];
  title: string;
  formatPrice: (price: number) => string;
  navigate: (path: string) => void;
  onAddToCart: (productId: string, productName: string) => void;
  addingToCart: Set<string>;
}> = ({ products, title, formatPrice, navigate, onAddToCart, addingToCart }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
    className="bg-white/70 backdrop-blur-3xl rounded-2xl p-8 border border-pink-200/50 shadow-lg"
  >
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-800 flex items-center">
        <FiGift className="w-5 h-5 text-purple-500 mr-3" />
        {title}
      </h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/productos')}
        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
      >
        Ver todos
        <FiArrowRight className="w-4 h-4 inline ml-1" />
      </motion.button>
    </div>

    <div className="space-y-4">
      {products.slice(0, 4).map((product: any, index: number) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          whileHover={{ x: 5 }}
          className="flex items-center space-x-4 bg-white/50 backdrop-blur-2xl rounded-xl p-4 border border-pink-100/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
            <FiGift className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{product.description.slice(0, 50)}...</p>
            <p className="text-lg font-bold text-purple-600">{formatPrice(product.price)}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(product._id, product.name)}
            disabled={addingToCart.has(product._id)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
          >
            <FiPlus className="w-4 h-4" />
          </motion.button>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Componente de actividad reciente
const RecentActivitySection: React.FC<{
  activity: any;
  formatDate: (date: string) => string;
  formatPrice: (price: number) => string;
}> = ({ activity, formatDate, formatPrice }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8 }}
    className="bg-white/70 backdrop-blur-3xl rounded-2xl p-8 border border-pink-200/50 shadow-lg"
  >
    <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
      <FiActivity className="w-5 h-5 text-cyan-500 mr-3" />
      Actividad Reciente
    </h2>

    <div className="space-y-4">
      {activity.lastPost && (
        <motion.div
          whileHover={{ x: 5 }}
          className="bg-white/50 backdrop-blur-2xl rounded-xl p-4 border border-pink-100/50"
        >
          <div className="flex items-center space-x-3 mb-2">
            <FiMessageCircle className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-800">Último Post</span>
            <span className="text-sm text-gray-500">{formatDate(activity.lastPost.createdAt)}</span>
          </div>
          <p className="text-gray-700 text-sm">{activity.lastPost.text}</p>
        </motion.div>
      )}

      {activity.lastOrder && (
        <motion.div
          whileHover={{ x: 5 }}
          className="bg-white/50 backdrop-blur-2xl rounded-xl p-4 border border-pink-100/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiShoppingBag className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-800">Última Orden</span>
            </div>
            <span className="font-bold text-green-600">{formatPrice(activity.lastOrder.totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">{formatDate(activity.lastOrder.createdAt)}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              activity.lastOrder.status === 'completed' ? 'bg-green-100 text-green-700' :
              activity.lastOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {activity.lastOrder.status}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default Dashboard; 