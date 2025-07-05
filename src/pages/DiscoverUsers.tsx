import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiUsers, 
  FiUserPlus, 
  FiUserCheck,
  FiStar,
  FiZap,
  FiMapPin,
  FiEye,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiAward,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { followService, type UserSuggestion } from '../services/followService';

interface ExtendedUser extends UserSuggestion {
  bio: string;
  location: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing: boolean;
  isVerified: boolean;
  interests: string[];
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function DiscoverUsers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'verified'>('all');
  const [suggestedUsers, setSuggestedUsers] = useState<ExtendedUser[]>([]);
  const [exploreUsers, setExploreUsers] = useState<ExtendedUser[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingExplore, setIsLoadingExplore] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const loadSuggestedUsers = async () => {
    try {
      setIsLoading(true);
      const suggestions = await followService.getSuggestions(3); // Límite de 3 usuarios
      
      if (suggestions.length === 0) {
        setSuggestedUsers([]);
        return;
      }

      const userIds = suggestions.map(user => user._id);
      const [statsMap, followStatusMap] = await Promise.all([
        followService.getMultipleUsersStats(userIds),
        followService.checkMultipleFollowStatus(userIds)
      ]);

      const extendedUsers: ExtendedUser[] = suggestions.map((user) => ({
        ...user,
        bio: generateRandomBio(),
        location: generateRandomLocation(),
        followers: statsMap[user._id]?.followers || 0,
        following: statsMap[user._id]?.following || 0,
        posts: Math.floor(Math.random() * 200) + 10,
        isFollowing: followStatusMap[user._id] || false,
        isVerified: Math.random() > 0.7,
        interests: generateRandomInterests()
      }));

      setSuggestedUsers(extendedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      showToast('error', 'Error al cargar usuarios sugeridos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExploreUsers = async () => {
    try {
      setIsLoadingExplore(true);
      const allUsers = await followService.getSuggestions(50); // Sin límite (50 como máximo razonable)
      
      if (allUsers.length === 0) {
        setExploreUsers([]);
        return;
      }

      const userIds = allUsers.map(user => user._id);
      const [statsMap, followStatusMap] = await Promise.all([
        followService.getMultipleUsersStats(userIds),
        followService.checkMultipleFollowStatus(userIds)
      ]);

      const extendedUsers: ExtendedUser[] = allUsers.map((user) => ({
        ...user,
        bio: generateRandomBio(),
        location: generateRandomLocation(),
        followers: statsMap[user._id]?.followers || 0,
        following: statsMap[user._id]?.following || 0,
        posts: Math.floor(Math.random() * 200) + 10,
        isFollowing: followStatusMap[user._id] || false,
        isVerified: Math.random() > 0.7,
        interests: generateRandomInterests()
      }));

      setExploreUsers(extendedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios para explorar:', error);
      showToast('error', 'Error al cargar usuarios para explorar');
    } finally {
      setIsLoadingExplore(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const user = suggestedUsers.find(u => u._id === userId) || exploreUsers.find(u => u._id === userId);
      if (!user) return;

      const wasFollowing = user.isFollowing;

      // Actualizar UI optimísticamente en ambas listas
      setSuggestedUsers(prev => 
        prev.map(u => 
          u._id === userId 
            ? { ...u, isFollowing: !wasFollowing, followers: wasFollowing ? u.followers - 1 : u.followers + 1 }
            : u
        )
      );
      
      setExploreUsers(prev => 
        prev.map(u => 
          u._id === userId 
            ? { ...u, isFollowing: !wasFollowing, followers: wasFollowing ? u.followers - 1 : u.followers + 1 }
            : u
        )
      );

      // Llamada a la API
      if (wasFollowing) {
        await followService.unfollowUser(userId);
        showToast('success', `Dejaste de seguir a ${user.firstName}`);
      } else {
        await followService.followUser(userId);
        showToast('success', `Ahora sigues a ${user.firstName}`);
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      showToast('error', 'Error al actualizar el seguimiento');
      
      // Revertir cambios en caso de error en ambas listas
      setSuggestedUsers(prev => 
        prev.map(u => 
          u._id === userId 
            ? { ...u, isFollowing: !u.isFollowing, followers: u.isFollowing ? u.followers - 1 : u.followers + 1 }
            : u
        )
      );
      
      setExploreUsers(prev => 
        prev.map(u => 
          u._id === userId 
            ? { ...u, isFollowing: !u.isFollowing, followers: u.isFollowing ? u.followers - 1 : u.followers + 1 }
            : u
        )
      );
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadSuggestedUsers(), loadExploreUsers()]);
      showToast('success', 'Usuarios actualizados');
    } catch {
      showToast('error', 'Error al actualizar usuarios');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/perfil/${userId}`);
  };

  const filteredUsers = exploreUsers.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || (filterBy === 'verified' && user.isVerified);
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    loadSuggestedUsers();
    loadExploreUsers();
  }, []);

  // Funciones auxiliares
  const generateRandomBio = () => {
    const bios = [
      'Amante de la moda y el arte ✨ Creando contenido inspirador cada día 💖',
      'Fotógrafa profesional 📸 Capturando momentos mágicos',
      'Chef & Food Blogger 🍽️ Compartiendo recetas deliciosas',
      'Diseñadora UX/UI 🎨 Creando experiencias digitales increíbles',
      'Bailarina profesional 💃 Enseñando el arte del movimiento',
      'Emprendedora digital 🚀 Construyendo el futuro'
    ];
    return bios[Math.floor(Math.random() * bios.length)];
  };

  const generateRandomLocation = () => {
    const locations = ['Lima, Perú', 'Cusco, Perú', 'Arequipa, Perú', 'Trujillo, Perú'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const generateRandomInterests = () => {
    const allInterests = ['moda', 'arte', 'viajes', 'fotografia', 'tecnologia', 'cocina', 'diseño'];
    return allInterests.sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading || isLoadingExplore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-2xl font-medium text-rose-600">Cargando usuarios mágicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-rose-300/70 via-pink-300/60 to-purple-300/50 blur-3xl rounded-full animate-pulse" />
        <div className="absolute top-20 -right-32 w-80 h-80 bg-gradient-to-br from-pink-400/60 via-rose-300/55 to-purple-300/45 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-32 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/55 via-pink-300/50 to-rose-300/45 blur-3xl rounded-full animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="relative inline-block mb-8">
            <motion.div 
              className="w-36 h-36 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/70"
              animate={{ 
                boxShadow: [
                  "0 25px 50px -12px rgba(244, 114, 182, 0.7)",
                  "0 25px 50px -12px rgba(236, 72, 153, 0.9)",
                  "0 25px 50px -12px rgba(244, 114, 182, 0.7)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                <FiUsers className="w-20 h-20 text-white" />
              </motion.div>
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl">
                <FiZap className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-8xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Descubrir Usuarios
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Conecta con personas increíbles y descubre nuevas historias ✨
          </motion.p>
        </motion.div>

        {/* Sección Usuarios Sugeridos */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-16"
        >
          <div className="backdrop-blur-3xl bg-gradient-to-br from-white/60 via-white/50 to-white/40 border-2 border-white/70 rounded-3xl p-8 shadow-2xl shadow-rose-500/40">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/40">
                  <FiStar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Usuarios Sugeridos
                  </h2>
                  <p className="text-gray-600">Personas que podrían interesarte</p>
                </div>
              </div>
              
              <motion.button
                onClick={handleRefresh}
                disabled={isRefreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
              >
                <motion.div
                  animate={{ rotate: isRefreshing ? 360 : 0 }}
                  transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                  <FiRefreshCw className="w-5 h-5" />
                </motion.div>
                <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedUsers.map((user, index) => (
                <SuggestedUserCard 
                  key={user._id} 
                  user={user} 
                  index={index}
                  onFollow={() => handleFollow(user._id)}
                  onViewProfile={() => handleViewProfile(user._id)}
                  formatNumber={formatNumber}
                  getInitials={getInitials}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sección Explorar Usuarios */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="backdrop-blur-3xl bg-gradient-to-br from-white/60 via-white/50 to-white/40 border-2 border-white/70 rounded-3xl p-8 shadow-2xl shadow-rose-500/40">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40">
                  <FiSearch className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Explorar Usuarios
                  </h2>
                  <p className="text-gray-600">Busca y conecta con cualquier usuario</p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="w-6 h-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o bio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/40 backdrop-blur-2xl border-2 border-white/60 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400/70 transition-all duration-500 text-lg"
                  />
                </div>

                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as 'all' | 'verified')}
                  className="px-6 py-4 bg-white/40 backdrop-blur-2xl border-2 border-white/60 rounded-2xl text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400/70 transition-all duration-500"
                >
                  <option value="all">Todos los usuarios</option>
                  <option value="verified">Solo verificados</option>
                </select>

                <div className="flex gap-2 p-1 bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-600 hover:bg-white/40'
                    }`}
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-600 hover:bg-white/40'
                    }`}
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 text-center">
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                {searchQuery && ` para "${searchQuery}"`}
              </div>
            </div>

            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {filteredUsers.map((user, index) => (
                viewMode === 'grid' ? (
                  <UserCard 
                    key={user._id} 
                    user={user} 
                    index={index}
                    onFollow={() => handleFollow(user._id)}
                    onViewProfile={() => handleViewProfile(user._id)}
                    formatNumber={formatNumber}
                    getInitials={getInitials}
                  />
                ) : (
                  <UserListItem 
                    key={user._id} 
                    user={user} 
                    index={index}
                    onFollow={() => handleFollow(user._id)}
                    onViewProfile={() => handleViewProfile(user._id)}
                    formatNumber={formatNumber}
                    getInitials={getInitials}
                  />
                )
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiUsers className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-500 max-w-md mx-auto">Intenta con otros términos de búsqueda</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`p-4 rounded-lg shadow-lg flex items-center gap-3 ${
                toast.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {toast.type === 'success' ? <FiCheck className="w-6 h-6" /> : <FiX className="w-6 h-6" />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Componentes de tarjetas
function SuggestedUserCard({ user, index, onFollow, onViewProfile, formatNumber, getInitials }: {
  user: ExtendedUser;
  index: number;
  onFollow: () => void;
  onViewProfile: () => void;
  formatNumber: (num: number) => string;
  getInitials: (firstName: string, lastName: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="backdrop-blur-2xl bg-gradient-to-br from-white/70 via-white/60 to-white/50 border-2 border-white/80 rounded-3xl p-6 shadow-xl shadow-rose-500/30 hover:shadow-rose-400/50 transition-all duration-500"
    >
      <div className="relative mb-4">
        <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/40">
          <span className="text-2xl font-bold text-white">
            {getInitials(user.firstName, user.lastName)}
          </span>
          {user.isVerified && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <FiAward className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={onViewProfile}
          className="text-xl font-bold text-gray-800 mb-1 hover:text-pink-600 transition-colors duration-200"
        >
          {user.firstName} {user.lastName}
        </button>
        <p className="text-sm text-gray-500 mb-2">{user.email}</p>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {user.bio}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{formatNumber(user.posts)}</div>
          <div className="text-xs text-gray-500">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{formatNumber(user.followers)}</div>
          <div className="text-xs text-gray-500">Seguidores</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">{formatNumber(user.following)}</div>
          <div className="text-xs text-gray-500">Siguiendo</div>
        </div>
      </div>

      {user.interests.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1 justify-center">
            {user.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-1 text-xs font-medium rounded-full bg-rose-100/80 text-rose-700 border border-rose-200/60"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

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
          onClick={onFollow}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 shadow-lg text-sm font-medium ${
            user.isFollowing
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-rose-500/30'
          }`}
        >
          {user.isFollowing ? (
            <FiUserCheck className="w-4 h-4 mx-auto" />
          ) : (
            <FiUserPlus className="w-4 h-4 mx-auto" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

function UserCard({ user, index, onFollow, onViewProfile, formatNumber, getInitials }: {
  user: ExtendedUser;
  index: number;
  onFollow: () => void;
  onViewProfile: () => void;
  formatNumber: (num: number) => string;
  getInitials: (firstName: string, lastName: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="backdrop-blur-2xl bg-gradient-to-br from-white/60 via-white/50 to-white/40 border-2 border-white/70 rounded-2xl p-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/40 transition-all duration-500"
    >
      <div className="relative mb-3">
        <button
          onClick={onViewProfile}
          className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform duration-200"
        >
          <span className="text-lg font-bold text-white">
            {getInitials(user.firstName, user.lastName)}
          </span>
          {user.isVerified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
              <FiAward className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </button>
      </div>

      <div className="text-center mb-3">
        <button
          onClick={onViewProfile}
          className="font-bold text-gray-800 text-sm mb-1 hover:text-blue-600 transition-colors duration-200"
        >
          {user.firstName} {user.lastName}
        </button>
        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {user.bio}
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-3 text-xs">
        <div className="text-center">
          <div className="font-bold text-gray-800">{formatNumber(user.followers)}</div>
          <div className="text-gray-500">Seguidores</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-800">{formatNumber(user.posts)}</div>
          <div className="text-gray-500">Posts</div>
        </div>
      </div>

      <motion.button
        onClick={onFollow}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full py-2 px-3 rounded-xl transition-all duration-300 shadow-lg text-xs font-medium ${
          user.isFollowing
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-blue-500/30'
        }`}
      >
        {user.isFollowing ? 'Siguiendo' : 'Seguir'}
      </motion.button>
    </motion.div>
  );
}

function UserListItem({ user, index, onFollow, onViewProfile, formatNumber, getInitials }: {
  user: ExtendedUser;
  index: number;
  onFollow: () => void;
  onViewProfile: () => void;
  formatNumber: (num: number) => string;
  getInitials: (firstName: string, lastName: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="backdrop-blur-2xl bg-gradient-to-r from-white/60 via-white/50 to-white/40 border-2 border-white/70 rounded-2xl p-6 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/40 transition-all duration-500"
    >
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={onViewProfile}
            className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-105 transition-transform duration-200"
          >
            <span className="text-lg font-bold text-white">
              {getInitials(user.firstName, user.lastName)}
            </span>
            {user.isVerified && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <FiAward className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onViewProfile}
              className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors duration-200"
            >
              {user.firstName} {user.lastName}
            </button>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FiMapPin className="w-3 h-3" />
              <span>{user.location}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {user.bio}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{formatNumber(user.followers)} seguidores</span>
            <span>{formatNumber(user.posts)} posts</span>
            {user.interests.length > 0 && (
              <div className="flex gap-1">
                {user.interests.slice(0, 2).map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/60"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

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
            onClick={onFollow}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-xl transition-all duration-300 shadow-lg text-sm font-medium ${
              user.isFollowing
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-rose-500/30'
            }`}
          >
            {user.isFollowing ? (
              <FiUserCheck className="w-4 h-4" />
            ) : (
              <FiUserPlus className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 