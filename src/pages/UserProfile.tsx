import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiUser, FiHeart, FiMessageCircle, FiStar, FiShoppingCart, 
  FiCalendar, FiMapPin, FiMail, FiPhone, FiArrowLeft,
  FiTrendingUp, FiPackage, FiClock, FiTag, FiActivity, FiGrid,
  FiList, FiZap, FiGift, FiAward, FiBookmark
} from 'react-icons/fi';
import { getUserProfile, getMyProfile } from '../services/userService';
import { followService } from '../services/followService';
import type { UserProfileData } from '../types/user.types';
import { useAuth } from '../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reviews' | 'activity'>('posts');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = isOwnProfile 
        ? await getMyProfile(currentUser?._id!)
        : await getUserProfile(userId!);
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || isOwnProfile) return;

    try {
      setFollowLoading(true);
      const wasFollowing = profile.social.isFollowing;
      
      // Actualización optimista
      setProfile(prev => prev ? {
        ...prev,
        social: {
          ...prev.social,
          isFollowing: !wasFollowing,
          followers: wasFollowing ? prev.social.followers - 1 : prev.social.followers + 1
        }
      } : null);

      if (wasFollowing) {
        await followService.unfollowUser(profile.user._id);
        toast.success('Dejaste de seguir al usuario');
      } else {
        await followService.followUser(profile.user._id);
        toast.success('Ahora sigues a este usuario');
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      // Revertir cambios en caso de error
      setProfile(prev => prev ? {
        ...prev,
        social: {
          ...prev.social,
          isFollowing: !prev.social.isFollowing,
          followers: prev.social.isFollowing ? prev.social.followers - 1 : prev.social.followers + 1
        }
      } : null);
      toast.error('Error al actualizar seguimiento');
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'very_active': return 'text-emerald-600';
      case 'active': return 'text-blue-600';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getActivityLevelText = (level: string) => {
    switch (level) {
      case 'very_active': return 'Muy Activo';
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      default: return 'Desconocido';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  // Partículas flotantes
  const particles = Array.from({ length: 40 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-30"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, Math.random() * 20 - 10, 0],
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2,
      }}
    />
  ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-300 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil no encontrado</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-300"
          >
            Volver
          </button>
        </div>
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
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors duration-200"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </button>

            <div className="flex items-center gap-4">
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
        {/* Hero Section - Información del usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur-3xl rounded-3xl p-8 mb-8 border border-white/30 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                <FiUser className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <FiZap className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Información básica */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {profile.user.firstName} {profile.user.lastName}
              </h1>
              
              {profile.user.email && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 mb-2">
                  <FiMail className="w-4 h-4" />
                  <span>{profile.user.email}</span>
                </div>
              )}

              {profile.user.phone && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 mb-4">
                  <FiPhone className="w-4 h-4" />
                  <span>{profile.user.phone}</span>
                </div>
              )}

              <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-500 mb-6">
                <FiCalendar className="w-4 h-4" />
                <span>Miembro desde {formatDate(profile.user.createdAt)}</span>
              </div>

              {/* Estadísticas sociales */}
              <div className="flex items-center justify-center lg:justify-start gap-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{profile.social.followers}</div>
                  <div className="text-sm text-gray-600">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{profile.social.following}</div>
                  <div className="text-sm text-gray-600">Siguiendo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{profile.posts.stats.totalPosts}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>

              {/* Botón de seguir */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 ${
                    profile.social.isFollowing
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                  }`}
                >
                  {followLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    profile.social.isFollowing ? 'Siguiendo' : 'Seguir'
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pestañas de navegación */}
        <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-2 mb-8 border border-white/30">
          <div className="flex gap-2">
            {[
              { id: 'posts', label: 'Posts', icon: FiMessageCircle },
              { id: 'reviews', label: 'Reseñas', icon: FiStar },
              { id: 'activity', label: 'Actividad', icon: FiActivity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'posts' | 'reviews' | 'activity')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/30'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Estadísticas de posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                      <FiMessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.posts.stats.totalPosts}</div>
                      <div className="text-sm text-gray-600">Posts Totales</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.posts.stats.recentPosts}</div>
                      <div className="text-sm text-gray-600">Posts Recientes</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <FiTrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.posts.stats.averagePostsPerWeek.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Posts/Semana</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <FiActivity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getActivityLevelColor(profile.posts.stats.activityLevel)}`}>
                        {getActivityLevelText(profile.posts.stats.activityLevel)}
                      </div>
                      <div className="text-sm text-gray-600">Nivel de Actividad</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts recientes */}
              <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiMessageCircle className="w-5 h-5 text-pink-500" />
                  Posts Recientes
                </h3>

                {profile.posts.recent.length > 0 ? (
                  <div className="space-y-4">
                    {profile.posts.recent.map((post, index) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/40 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiUser className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-800">
                                {post.userId.firstName} {post.userId.lastName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(post.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{post.text}</p>
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 rounded-full text-sm"
                                >
                                  <FiTag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiMessageCircle className="w-8 h-8 text-pink-500" />
                    </div>
                    <p className="text-gray-600">No hay posts recientes</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Estadísticas de reseñas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FiStar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.reviews.total}</div>
                      <div className="text-sm text-gray-600">Reseñas Totales</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <FiAward className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.reviews.averageRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Calificación Promedio</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <FiMessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.comments.total}</div>
                      <div className="text-sm text-gray-600">Comentarios</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reseñas recientes */}
              <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-500" />
                  Reseñas Recientes
                </h3>

                {profile.reviews.recent.length > 0 ? (
                  <div className="space-y-4">
                    {profile.reviews.recent.map((review, index) => (
                      <motion.div
                        key={review._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/40"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiStar className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-gray-600">No hay reseñas disponibles</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && isOwnProfile && profile.commerce && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Estadísticas de comercio */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <FiShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.commerce.cart.itemCount}</div>
                      <div className="text-sm text-gray-600">Items en Carrito</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                      <FiHeart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.commerce.wishlist.totalItems}</div>
                      <div className="text-sm text-gray-600">Lista de Deseos</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <FiPackage className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{profile.commerce.orders.total}</div>
                      <div className="text-sm text-gray-600">Órdenes Totales</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <FiGift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">S/ {profile.commerce.orders.totalSpent.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Total Gastado</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Órdenes recientes */}
              <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-blue-500" />
                  Órdenes Recientes
                </h3>

                {profile.commerce.orders.recent.length > 0 ? (
                  <div className="space-y-4">
                    {profile.commerce.orders.recent.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/40"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">Orden #{order._id.slice(-8)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {getOrderStatusText(order.status)}
                            </span>
                          </div>
                          <span className="font-bold text-gray-800">S/ {order.totalAmount.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiPackage className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-600">No hay órdenes recientes</p>
                  </div>
                )}
              </div>

              {/* Detalles de wishlist */}
              <div className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FiBookmark className="w-5 h-5 text-pink-500" />
                  Lista de Deseos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                        <FiGift className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-800">S/ {profile.commerce.wishlist.totalValue.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Valor Total</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/30 backdrop-blur-xl rounded-xl p-4 border border-white/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-800">{profile.commerce.wishlist.availableItems}</div>
                        <div className="text-sm text-gray-600">Items Disponibles</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Direcciones (solo perfil propio) */}
        {isOwnProfile && profile.user.addresses && profile.user.addresses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/20 backdrop-blur-3xl rounded-2xl p-6 border border-white/30 mt-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiMapPin className="w-5 h-5 text-red-500" />
              Direcciones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.user.addresses.map((address, index) => (
                <motion.div
                  key={address._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/30 backdrop-blur-xl rounded-xl p-4 border ${
                    address.isDefault ? 'border-pink-300 bg-pink-50/30' : 'border-white/40'
                  }`}
                >
                  {address.isDefault && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-pink-500 text-white rounded-full text-xs font-medium mb-2">
                      <FiStar className="w-3 h-3" />
                      Por defecto
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-medium text-gray-800">{address.street}</p>
                    <p className="text-gray-600">{address.city}, {address.state}</p>
                    <p className="text-gray-600">{address.zipCode}, {address.country}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 