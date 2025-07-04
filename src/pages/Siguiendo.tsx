import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiUsers, FiSearch, FiGrid, FiList, FiArrowLeft, FiRefreshCw,
  FiUser, FiMapPin, FiCalendar, FiHeart, FiMessageCircle,
  FiStar, FiZap, FiAward, FiClock, FiEye, FiUserMinus,
  FiChevronLeft, FiChevronRight, FiMoreHorizontal,
  FiFilter, FiTrendingUp, FiActivity, FiGift
} from 'react-icons/fi';
import { followingService } from '../services/followingService';
import { followService } from '../services/followService';
import type { ExtendedFollowing, Pagination } from '../types/following.types';
import { useAuth } from '../hooks/useAuth';

const Siguiendo: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState<ExtendedFollowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'active'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'activity'>('recent');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Datos mock para enriquecer la experiencia
  const generateMockData = (followingUser: any): ExtendedFollowing => {
    const bios = [
      "Amante del café y los atardeceres 🌅",
      "Explorando el mundo una foto a la vez 📸",
      "Desarrolladora apasionada por la tecnología 💻",
      "Artista digital y soñadora ✨",
      "Viajera empedernida y foodie 🍕",
      "Lectora compulsiva y escritora ocasional 📚",
      "Fitness enthusiast y vida saludable 🏃‍♀️",
      "Música, arte y buenas vibras 🎵"
    ];

    const locations = [
      "Lima, Perú", "Buenos Aires, Argentina", "Ciudad de México, México",
      "Bogotá, Colombia", "Santiago, Chile", "Madrid, España", "Barcelona, España",
      "Miami, USA", "São Paulo, Brasil", "Montevideo, Uruguay"
    ];

    const interests = [
      "Fotografía", "Viajes", "Tecnología", "Arte", "Música", "Deportes",
      "Cocina", "Lectura", "Cine", "Naturaleza", "Fitness", "Diseño",
      "Gaming", "Yoga", "Baile", "Moda"
    ];

    const getRandomInterests = () => {
      const shuffled = interests.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.floor(Math.random() * 4) + 2);
    };

    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 365));

    const lastActiveHours = Math.floor(Math.random() * 72);
    const lastActive = new Date();
    lastActive.setHours(lastActive.getHours() - lastActiveHours);

    return {
      ...followingUser,
      bio: bios[Math.floor(Math.random() * bios.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      joinedDate: joinDate.toISOString(),
      followersCount: Math.floor(Math.random() * 1000) + 50,
      followingCount: Math.floor(Math.random() * 500) + 20,
      postsCount: Math.floor(Math.random() * 200) + 10,
      isVerified: Math.random() > 0.7,
      isFollowingBack: Math.random() > 0.3,
      lastActive: lastActive.toISOString(),
      interests: getRandomInterests()
    };
  };

  const loadFollowing = useCallback(async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await followingService.getFollowing(currentUser?._id!, page, pagination.limit);
      
      // Enriquecer datos con información mock
      const enrichedFollowing = response.data.map(generateMockData);
      
      setFollowing(enrichedFollowing);
      setPagination(response.pagination);
      
      if (refresh) {
        toast.success('Siguiendo actualizados');
      }
    } catch (error) {
      console.error('Error al cargar siguiendo:', error);
      toast.error('Error al cargar siguiendo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?._id, pagination.limit]);

  const handleUnfollow = async (followingId: string) => {
    try {
      const followingUser = following.find(f => f._id === followingId);
      if (!followingUser) return;

      // Actualización optimista
      setFollowing(prev => prev.filter(f => f._id !== followingId));

      await followService.unfollowUser(followingId);
      toast.success(`Dejaste de seguir a ${followingUser.firstName}`);
    } catch (error) {
      console.error('Error al dejar de seguir:', error);
      toast.error('Error al dejar de seguir');
      
      // Revertir cambios
      loadFollowing(pagination.page);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/perfil/${userId}`);
  };

  const handlePageChange = (newPage: number) => {
    loadFollowing(newPage);
  };

  const filteredFollowing = following.filter(followingUser => {
    const matchesSearch = followingUser.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         followingUser.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         followingUser.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'verified' && followingUser.isVerified) ||
                         (filterBy === 'active' && new Date(followingUser.lastActive).getTime() > Date.now() - 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesFilter;
  });

  const sortedFollowing = [...filteredFollowing].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.firstName.localeCompare(b.firstName);
      case 'activity':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      case 'recent':
      default:
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastActive = (dateString: string) => {
    const now = new Date();
    const lastActive = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Activo ahora';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStats = () => {
    const total = pagination.total;
    const verified = following.filter(f => f.isVerified).length;
    const active = following.filter(f => new Date(f.lastActive).getTime() > Date.now() - 24 * 60 * 60 * 1000).length;
    const mutual = following.filter(f => f.isFollowingBack).length;
    
    return { total, verified, active, mutual };
  };

  const stats = getStats();

  // Partículas flotantes para el fondo
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  useEffect(() => {
    if (currentUser?._id) {
      loadFollowing();
    }
  }, [loadFollowing, currentUser?._id]);

  if (loading && following.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
        {/* Partículas de fondo */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full opacity-30"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.2, 1],
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
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center"
            >
              <FiUsers className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando siguiendo...</h2>
            <p className="text-gray-600">Preparando tu lista de usuarios seguidos</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Partículas flotantes de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-r from-pink-300 to-rose-300 rounded-full opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              scale: [1, 1.3, 1],
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="w-12 h-12 bg-white/70 backdrop-blur-3xl rounded-2xl border border-pink-200/50 flex items-center justify-center text-gray-700 hover:bg-white/80 transition-all duration-300 shadow-lg"
              >
                <FiArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Siguiendo
                </h1>
                <p className="text-gray-600 mt-1">Usuarios que sigues</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => loadFollowing(pagination.page, true)}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-white/70 backdrop-blur-3xl rounded-2xl px-4 py-2 border border-pink-200/50 text-gray-700 hover:bg-white/80 transition-all duration-300 shadow-lg disabled:opacity-50"
            >
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <FiRefreshCw className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-medium">Actualizar</span>
            </motion.button>
          </div>

          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-pink-600">{stats.total}</p>
                </div>
                <FiUsers className="w-8 h-8 text-pink-500" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verificados</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
                </div>
                <FiAward className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos hoy</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <FiActivity className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mutuos</p>
                  <p className="text-2xl font-bold text-rose-600">{stats.mutual}</p>
                </div>
                <FiHeart className="w-8 h-8 text-rose-500" />
              </div>
            </div>
          </motion.div>

          {/* Controles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Búsqueda */}
              <div className="relative flex-1 lg:max-w-md">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-2xl border border-pink-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Filtros y controles */}
              <div className="flex items-center space-x-3">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-4 py-2 bg-white/50 backdrop-blur-2xl border border-pink-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="verified">Verificados</option>
                  <option value="active">Activos</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-white/50 backdrop-blur-2xl border border-pink-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                >
                  <option value="recent">Recientes</option>
                  <option value="name">Nombre</option>
                  <option value="activity">Actividad</option>
                </select>

                <div className="flex bg-white/50 backdrop-blur-2xl border border-pink-200/50 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-pink-500 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-pink-100'
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-pink-500 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-pink-100'
                    }`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Lista de usuarios seguidos */}
        <AnimatePresence mode="wait">
          {sortedFollowing.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="bg-white/70 backdrop-blur-3xl rounded-2xl p-12 border border-pink-200/50 shadow-lg max-w-md mx-auto">
                <FiUsers className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchQuery ? 'Sin resultados' : 'No sigues a nadie aún'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda' 
                    : 'Explora usuarios y comienza a seguir personas interesantes'
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedFollowing.map((followingUser, index) => (
                    <FollowingCard
                      key={followingUser._id}
                      following={followingUser}
                      index={index}
                      onUnfollow={() => handleUnfollow(followingUser._id)}
                      onViewProfile={() => handleViewProfile(followingUser._id)}
                      formatDate={formatDate}
                      formatLastActive={formatLastActive}
                      formatNumber={formatNumber}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedFollowing.map((followingUser, index) => (
                    <FollowingListItem
                      key={followingUser._id}
                      following={followingUser}
                      index={index}
                      onUnfollow={() => handleUnfollow(followingUser._id)}
                      onViewProfile={() => handleViewProfile(followingUser._id)}
                      formatDate={formatDate}
                      formatLastActive={formatLastActive}
                      formatNumber={formatNumber}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-12"
          >
            <div className="bg-white/70 backdrop-blur-3xl rounded-2xl p-4 border border-pink-200/50 shadow-lg">
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </motion.button>
                
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-all duration-300 ${
                      page === pagination.page
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                        : 'bg-white/50 text-gray-700 hover:bg-pink-100'
                    }`}
                  >
                    {page}
                  </motion.button>
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <FiChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Componente de tarjeta para vista de cuadrícula
function FollowingCard({ 
  following, 
  index, 
  onUnfollow, 
  onViewProfile, 
  formatDate, 
  formatLastActive, 
  formatNumber, 
  getInitials 
}: {
  following: ExtendedFollowing;
  index: number;
  onUnfollow: () => void;
  onViewProfile: () => void;
  formatDate: (date: string) => string;
  formatLastActive: (date: string) => string;
  formatNumber: (num: number) => string;
  getInitials: (firstName: string, lastName: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <div className="text-center">
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300"
               onClick={onViewProfile}>
            {getInitials(following.firstName, following.lastName)}
          </div>
          {following.isVerified && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FiAward className="w-3 h-3 text-white" />
            </div>
          )}
          {following.isActive && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        <h3 
          className="font-semibold text-gray-800 mb-1 cursor-pointer hover:text-pink-600 transition-colors"
          onClick={onViewProfile}
        >
          {following.firstName} {following.lastName}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{following.email}</p>
        {following.bio && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{following.bio}</p>
        )}

        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <FiUsers className="w-3 h-3" />
            <span>{formatNumber(following.followersCount || 0)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiMessageCircle className="w-3 h-3" />
            <span>{following.postsCount}</span>
          </div>
        </div>

        {following.isFollowingBack && (
          <div className="flex items-center justify-center space-x-1 text-xs text-pink-600 mb-3">
            <FiHeart className="w-3 h-3" />
            <span>Te sigue también</span>
          </div>
        )}

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewProfile}
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 px-4 rounded-xl text-sm font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg"
          >
            <FiEye className="w-4 h-4 inline mr-1" />
            Ver perfil
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUnfollow}
            className="bg-gray-100 text-gray-600 py-2 px-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-300"
          >
            <FiUserMinus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Componente de elemento de lista
function FollowingListItem({ 
  following, 
  index, 
  onUnfollow, 
  onViewProfile, 
  formatDate, 
  formatLastActive, 
  formatNumber, 
  getInitials 
}: {
  following: ExtendedFollowing;
  index: number;
  onUnfollow: () => void;
  onViewProfile: () => void;
  formatDate: (date: string) => string;
  formatLastActive: (date: string) => string;
  formatNumber: (num: number) => string;
  getInitials: (firstName: string, lastName: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ x: 5 }}
      className="bg-white/70 backdrop-blur-3xl rounded-2xl p-6 border border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300"
                 onClick={onViewProfile}>
              {getInitials(following.firstName, following.lastName)}
            </div>
            {following.isVerified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FiAward className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            {following.isActive && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 
                className="font-semibold text-gray-800 cursor-pointer hover:text-pink-600 transition-colors"
                onClick={onViewProfile}
              >
                {following.firstName} {following.lastName}
              </h3>
              {following.isFollowingBack && (
                <div className="flex items-center space-x-1 text-xs text-pink-600">
                  <FiHeart className="w-3 h-3" />
                  <span>Mutuo</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{following.email}</p>
            {following.bio && (
              <p className="text-sm text-gray-500 mb-2 line-clamp-1">{following.bio}</p>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FiUsers className="w-3 h-3" />
                <span>{formatNumber(following.followersCount || 0)} seguidores</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiMessageCircle className="w-3 h-3" />
                <span>{following.postsCount} posts</span>
              </div>
              {following.location && (
                <div className="flex items-center space-x-1">
                  <FiMapPin className="w-3 h-3" />
                  <span>{following.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewProfile}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 px-4 rounded-xl text-sm font-medium hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg"
          >
            <FiEye className="w-4 h-4 inline mr-1" />
            Ver perfil
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUnfollow}
            className="bg-gray-100 text-gray-600 py-2 px-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-300"
          >
            <FiUserMinus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default Siguiendo; 