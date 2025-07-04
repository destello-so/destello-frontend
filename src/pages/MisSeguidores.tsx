import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiUsers, FiSearch, FiGrid, FiList, FiArrowLeft, FiRefreshCw,
  FiMapPin, FiCalendar, FiHeart, FiMessageCircle,
  FiStar, FiZap, FiAward, FiClock, FiEye, FiUserPlus,
  FiChevronLeft, FiChevronRight, FiMoreHorizontal,
  FiFilter, FiTrendingUp, FiActivity, FiGift
} from 'react-icons/fi';
import { getFollowers } from '../services/followersService';
import { followService } from '../services/followService';
import type { ExtendedFollower, Pagination } from '../types/followers.types';
import { useAuth } from '../hooks/useAuth';

const MisSeguidores: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [followers, setFollowers] = useState<ExtendedFollower[]>([]);
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
  const generateMockData = (follower: any): ExtendedFollower => {
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
      ...follower,
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

  const loadFollowers = useCallback(async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getFollowers(currentUser?._id!, page, pagination.limit);
      
      // Enriquecer datos con información mock
      const enrichedFollowers = response.data.map(generateMockData);
      
      setFollowers(enrichedFollowers);
      setPagination(response.pagination);
      
      if (refresh) {
        toast.success('Seguidores actualizados');
      }
    } catch (error) {
      console.error('Error al cargar seguidores:', error);
      toast.error('Error al cargar seguidores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser?._id, pagination.limit]);

  const handleFollowBack = async (followerId: string) => {
    try {
      const follower = followers.find(f => f._id === followerId);
      if (!follower) return;

      const wasFollowing = follower.isFollowingBack;

      // Actualización optimista
      setFollowers(prev => prev.map(f => 
        f._id === followerId 
          ? { ...f, isFollowingBack: !wasFollowing }
          : f
      ));

      if (wasFollowing) {
        await followService.unfollowUser(followerId);
        toast.success(`Dejaste de seguir a ${follower.firstName}`);
      } else {
        await followService.followUser(followerId);
        toast.success(`Ahora sigues a ${follower.firstName}`);
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      toast.error('Error al actualizar seguimiento');
      
      // Revertir cambios
      setFollowers(prev => prev.map(f => 
        f._id === followerId 
          ? { ...f, isFollowingBack: !f.isFollowingBack }
          : f
      ));
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/perfil/${userId}`);
  };

  const handlePageChange = (newPage: number) => {
    loadFollowers(newPage);
  };

  const filteredFollowers = followers.filter(follower => {
    const matchesSearch = follower.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         follower.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         follower.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'verified' && follower.isVerified) ||
                         (filterBy === 'active' && new Date(follower.lastActive).getTime() > Date.now() - 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesFilter;
  });

  const sortedFollowers = [...filteredFollowers].sort((a, b) => {
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  useEffect(() => {
    if (currentUser?._id) {
      loadFollowers();
    }
  }, [currentUser?._id, loadFollowers]);

  // Partículas flotantes mágicas
  const particles = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-3 h-3 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-20"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 30 - 15, 0],
        scale: [1, 1.5, 1],
        opacity: [0.2, 0.8, 0.2],
        rotate: [0, 360],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: "easeInOut",
      }}
    />
  ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        {particles}
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-24 h-24 border-6 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-24 h-24 border-6 border-transparent border-r-purple-300 rounded-full animate-spin animate-reverse"></div>
            <div className="absolute inset-2 w-20 h-20 border-4 border-transparent border-b-rose-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
          </div>
          <p className="text-center mt-6 text-pink-600 font-semibold text-lg">Cargando seguidores mágicos...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Partículas flotantes */}
      {particles}

      {/* Header con navegación */}
      <div className="relative z-10 bg-white/20 backdrop-blur-3xl border-b border-white/30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span className="font-medium">Volver</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40">
                  <FiUsers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Mis Seguidores
                  </h1>
                  <p className="text-sm text-gray-600">{pagination.total} seguidores</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => loadFollowers(pagination.page, true)}
                disabled={refreshing}
                className="p-2 bg-white/30 backdrop-blur-xl rounded-full border border-white/40 hover:bg-white/40 transition-all duration-200"
              >
                <FiRefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <div className="flex items-center gap-2 bg-white/30 backdrop-blur-xl rounded-full px-4 py-2 border border-white/40">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas y controles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{pagination.total}</div>
                  <div className="text-sm text-gray-600">Total Seguidores</div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <FiAward className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {followers.filter(f => f.isVerified).length}
                  </div>
                  <div className="text-sm text-gray-600">Verificados</div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <FiActivity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {followers.filter(f => new Date(f.lastActive).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}
                  </div>
                  <div className="text-sm text-gray-600">Activos Hoy</div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <FiHeart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {followers.filter(f => f.isFollowingBack).length}
                  </div>
                  <div className="text-sm text-gray-600">Te Siguen</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de búsqueda y filtros */}
          <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar seguidores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-500 text-gray-800"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-3">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800"
                >
                  <option value="all">Todos</option>
                  <option value="verified">Verificados</option>
                  <option value="active">Activos</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white/30 backdrop-blur-xl border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-800"
                >
                  <option value="recent">Más Recientes</option>
                  <option value="name">Por Nombre</option>
                  <option value="activity">Más Activos</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de seguidores */}
        <AnimatePresence mode="wait">
          {sortedFollowers.length > 0 ? (
            <motion.div
              key="followers-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}
            >
              {sortedFollowers.map((follower, index) => (
                viewMode === 'grid' ? (
                  <FollowerCard
                    key={follower._id}
                    follower={follower}
                    index={index}
                    onFollowBack={() => handleFollowBack(follower._id)}
                    onViewProfile={() => handleViewProfile(follower._id)}
                    formatDate={formatDate}
                    formatLastActive={formatLastActive}
                    formatNumber={formatNumber}
                    getInitials={getInitials}
                  />
                ) : (
                  <FollowerListItem
                    key={follower._id}
                    follower={follower}
                    index={index}
                    onFollowBack={() => handleFollowBack(follower._id)}
                    onViewProfile={() => handleViewProfile(follower._id)}
                    formatDate={formatDate}
                    formatLastActive={formatLastActive}
                    formatNumber={formatNumber}
                    getInitials={getInitials}
                  />
                )
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-followers"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-12 h-12 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchQuery ? 'No se encontraron seguidores' : 'Aún no tienes seguidores'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Comparte contenido increíble para atraer seguidores'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-300"
                >
                  Limpiar búsqueda
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex justify-center"
          >
            <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    pagination.hasPrev
                      ? 'bg-white/30 hover:bg-white/40 text-gray-700'
                      : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-12 h-12 rounded-xl font-medium transition-all duration-200 ${
                          pagination.page === page
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : 'bg-white/30 hover:bg-white/40 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    pagination.hasNext
                      ? 'bg-white/30 hover:bg-white/40 text-gray-700'
                      : 'bg-gray-200/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Componente de tarjeta de seguidor
function FollowerCard({ 
  follower, 
  index, 
  onFollowBack, 
  onViewProfile, 
  formatDate, 
  formatLastActive, 
  formatNumber, 
  getInitials 
}: {
  follower: ExtendedFollower;
  index: number;
  onFollowBack: () => void;
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
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/20 backdrop-blur-3xl rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      {/* Header con avatar y estado */}
      <div className="relative mb-4">
        <button
          onClick={onViewProfile}
          className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-pink-500/40 hover:scale-105 transition-transform duration-200"
        >
          <span className="text-2xl font-bold text-white">
            {getInitials(follower.firstName, follower.lastName)}
          </span>
        </button>
        
        {follower.isVerified && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <FiAward className="w-3 h-3 text-white" />
          </div>
        )}

        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            new Date(follower.lastActive).getTime() > Date.now() - 60 * 60 * 1000
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-400 text-white'
          }`}>
            {formatLastActive(follower.lastActive)}
          </span>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="text-center mb-4">
        <button
          onClick={onViewProfile}
          className="text-xl font-bold text-gray-800 mb-1 hover:text-pink-600 transition-colors duration-200"
        >
          {follower.firstName} {follower.lastName}
        </button>
        <p className="text-sm text-gray-500 mb-2">{follower.email}</p>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
          {follower.bio}
        </p>
        
        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-3">
          <FiMapPin className="w-3 h-3" />
          <span>{follower.location}</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{formatNumber(follower.followersCount)}</div>
          <div className="text-xs text-gray-500">Seguidores</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{formatNumber(follower.followingCount)}</div>
          <div className="text-xs text-gray-500">Siguiendo</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{formatNumber(follower.postsCount)}</div>
          <div className="text-xs text-gray-500">Posts</div>
        </div>
      </div>

      {/* Intereses */}
      {follower.interests.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {follower.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-1 text-xs font-medium rounded-full bg-pink-100/80 text-pink-700 border border-pink-200/60"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fecha de seguimiento */}
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <FiCalendar className="w-3 h-3" />
          Te sigue desde {formatDate(follower.joinedDate)}
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <motion.button
          onClick={onViewProfile}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/30 text-sm font-medium"
        >
          <FiEye className="w-4 h-4 mx-auto" />
        </motion.button>
        
        <motion.button
          onClick={onFollowBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 shadow-lg text-sm font-medium ${
            follower.isFollowingBack
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-pink-500/30'
          }`}
        >
          {follower.isFollowingBack ? (
            <FiHeart className="w-4 h-4 mx-auto" />
          ) : (
            <FiUserPlus className="w-4 h-4 mx-auto" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// Componente de elemento de lista
function FollowerListItem({ 
  follower, 
  index, 
  onFollowBack, 
  onViewProfile, 
  formatDate, 
  formatLastActive, 
  formatNumber, 
  getInitials 
}: {
  follower: ExtendedFollower;
  index: number;
  onFollowBack: () => void;
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
      transition={{ duration: 0.6, delay: index * 0.03 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      <div className="flex items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <button
            onClick={onViewProfile}
            className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 hover:scale-105 transition-transform duration-200"
          >
            <span className="text-lg font-bold text-white">
              {getInitials(follower.firstName, follower.lastName)}
            </span>
          </button>
          
          {follower.isVerified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <FiAward className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onViewProfile}
              className="text-lg font-bold text-gray-800 hover:text-pink-600 transition-colors duration-200"
            >
              {follower.firstName} {follower.lastName}
            </button>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              new Date(follower.lastActive).getTime() > Date.now() - 60 * 60 * 1000
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-400 text-white'
            }`}>
              {formatLastActive(follower.lastActive)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{follower.bio}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <FiMapPin className="w-3 h-3" />
              <span>{follower.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              <span>Desde {formatDate(follower.joinedDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{formatNumber(follower.followersCount)} seguidores</span>
            <span>{formatNumber(follower.postsCount)} posts</span>
            {follower.interests.length > 0 && (
              <div className="flex gap-1">
                {follower.interests.slice(0, 2).map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-pink-100/80 text-pink-700 border border-pink-200/60"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <motion.button
            onClick={onViewProfile}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/30 text-sm font-medium"
          >
            <FiEye className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={onFollowBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl transition-all duration-300 shadow-lg text-sm font-medium ${
              follower.isFollowingBack
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-pink-500/30'
            }`}
          >
            {follower.isFollowingBack ? (
              <FiHeart className="w-4 h-4" />
            ) : (
              <FiUserPlus className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default MisSeguidores; 