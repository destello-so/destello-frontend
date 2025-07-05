import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiShoppingBag, FiShoppingCart, FiClipboard, 
  FiHeart, FiRss, FiEdit3, FiUsers, FiSearch, FiUser, 
  FiChevronRight, FiLogOut, FiUserCheck
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

// Interfaces para la estructura del sidebar
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  color?: string;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['home', 'tienda', 'social']));
  const { itemCount } = useCart();

  // Datos del sidebar organizados por secciones
  const sidebarSections: SidebarSection[] = [
    {
      id: 'home',
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Inicio', icon: <FiHome />, path: '/', color: 'text-blue-500' }
      ]
    },
    {
      id: 'tienda',
      title: 'Tienda',
      items: [
        { id: 'productos', label: 'Productos', icon: <FiShoppingBag />, path: '/productos', color: 'text-emerald-500' },
        { id: 'carrito', label: 'Mi Carrito', icon: <FiShoppingCart />, path: '/carrito', badge: itemCount, color: 'text-orange-500' },
        { id: 'ordenes', label: 'Mis Órdenes', icon: <FiClipboard />, path: '/mis-ordenes', color: 'text-cyan-500' },
        { id: 'wishlist', label: 'Lista de Deseos', icon: <FiHeart />, path: '/wishlist', badge: 7, color: 'text-rose-500' }
      ]
    },
    {
      id: 'social',
      title: 'Social',
      items: [
        { id: 'feed', label: 'Feed', icon: <FiRss />, path: '/feed', color: 'text-blue-500' },
        { id: 'crear-post', label: 'Crear Post', icon: <FiEdit3 />, path: '/crear-post', color: 'text-green-500' },
        { id: 'seguidores', label: 'Mis Seguidores', icon: <FiUsers />, path: '/mis-seguidores', badge: 24, color: 'text-indigo-500' },
        { id: 'siguiendo', label: 'Siguiendo', icon: <FiUserCheck />, path: '/siguiendo', color: 'text-teal-500' },
        { id: 'descubrir', label: 'Descubrir', icon: <FiSearch />, path: '/descubrir', color: 'text-pink-500' }
      ]
    },
    {
      id: 'cuenta',
      title: 'Mi Cuenta',
      items: [
        { id: 'perfil', label: 'Mi Perfil', icon: <FiUser />, path: '/mi-perfil', color: 'text-amber-500' }
      ]
    }
  ];

  // Función para alternar secciones expandidas
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Función para verificar si un item está activo
  const isActiveItem = (path: string) => {
    return location.pathname === path;
  };

  // Función para manejar logout
  const handleLogout = () => {
    logout();
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-80 h-screen bg-gradient-to-br from-rose-100/40 via-pink-50/30 to-rose-200/50 
                 backdrop-blur-3xl border-r border-white/30 flex flex-col relative overflow-hidden
                 shadow-2xl shadow-rose-500/20 before:absolute before:inset-0 before:bg-gradient-to-br 
                 before:from-white/20 before:via-transparent before:to-pink-200/20 before:backdrop-blur-2xl before:pointer-events-none
                 after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:via-rose-100/10 after:to-white/10 after:pointer-events-none"
    >
      {/* Efectos de fondo animados liquid glass */}
      <div className="absolute inset-0 opacity-40">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-rose-300/30 to-pink-400/30 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-5 w-24 h-24 bg-gradient-to-r from-rose-400/40 to-pink-300/40 rounded-full blur-xl"
          animate={{
            y: [0, -25, 0],
            scale: [1, 0.7, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-5 w-20 h-20 bg-gradient-to-r from-pink-300/25 to-rose-300/25 rounded-full blur-lg"
          animate={{
            x: [0, 15, 0],
            y: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header del sidebar */}
      <div className="relative z-10 p-6 border-b border-white/20 backdrop-blur-2xl
                      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-pink-100/20 before:backdrop-blur-xl before:pointer-events-none
                      after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-rose-50/10 after:pointer-events-none">
        {/* Logo y título */}
        <motion.div
          className="flex items-center space-x-3 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl 
                       flex items-center justify-center shadow-lg shadow-rose-300/50"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FiHeart className="text-white text-xl" />
          </motion.div>
          <div className="relative z-10">
            <h1 className="text-rose-800 font-bold text-lg">Destello</h1>
            <p className="text-rose-500 text-xs">Perú</p>
          </div>
        </motion.div>

        {/* Info del usuario */}
        <motion.div
          className="relative flex items-center space-x-3 p-3 rounded-2xl bg-white/20 backdrop-blur-3xl border border-white/40
                     shadow-2xl shadow-rose-300/30 before:absolute before:inset-0 before:bg-gradient-to-br 
                     before:from-white/30 before:via-pink-100/20 before:to-transparent before:rounded-2xl before:backdrop-blur-xl before:pointer-events-none
                     after:absolute after:inset-0 after:bg-gradient-to-t after:from-rose-200/20 after:to-transparent after:rounded-2xl after:pointer-events-none
                     overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 25px 50px -12px rgba(244, 114, 182, 0.5)",
          }}
        >
          <div className="relative z-10 w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full 
                          flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="relative z-10 flex-1 min-w-0">
            <p className="text-rose-800 font-medium text-sm truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-rose-500 text-xs truncate">{user?.email}</p>
          </div>
        </motion.div>
      </div>

      {/* Navegación */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rose-400/60 scrollbar-track-rose-100/30 
                      hover:scrollbar-thumb-rose-500/80 scrollbar-thumb-rounded-full scrollbar-track-rounded-full
                      scrollbar-w-2 pr-2">
        <div className="p-4 space-y-2">
          {sidebarSections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * sectionIndex }}
            >
              {/* Header de sección */}
              <motion.button
                onClick={() => toggleSection(section.id)}
                className="relative w-full flex items-center justify-between p-2 rounded-xl transition-all duration-300 group overflow-hidden
                           backdrop-blur-2xl border border-transparent pointer-events-auto
                           hover:bg-white/20 hover:backdrop-blur-3xl hover:shadow-2xl hover:shadow-rose-300/60
                           hover:border-white/40 
                           before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-pink-100/30 before:to-white/10 
                           before:opacity-0 before:backdrop-blur-xl before:rounded-xl before:transition-all before:duration-300 before:pointer-events-none
                           hover:before:opacity-100
                           after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-rose-200/20 after:to-pink-200/30
                           after:opacity-0 after:rounded-xl after:transition-all after:duration-300 after:pointer-events-none
                           hover:after:opacity-100"
                whileHover={{ 
                  x: 6, 
                  scale: 1.03,
                  boxShadow: "0 20px 40px -12px rgba(244, 114, 182, 0.4)",
                }}
              >
                <span className="relative z-10 text-rose-600 text-xs font-semibold uppercase tracking-wider group-hover:text-rose-900 transition-colors">
                  {section.title}
                </span>
                <motion.div
                  className="relative z-10"
                  animate={{ rotate: expandedSections.has(section.id) ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronRight className="text-rose-400 text-sm group-hover:text-rose-900 transition-colors" />
                </motion.div>
              </motion.button>

              {/* Items de la sección */}
              <AnimatePresence>
                {expandedSections.has(section.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 mt-2 ml-2">
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * itemIndex }}
                        >
                          <Link
                            to={item.path}
                            className={`flex items-center space-x-3 p-3 rounded-2xl transition-all duration-400 group relative overflow-hidden pointer-events-auto
                                      ${isActiveItem(item.path)
                                        ? `bg-white/10 backdrop-blur-3xl border border-white/50 text-white shadow-2xl shadow-rose-400/60
                                           before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-pink-300/40 before:to-rose-400/30 before:rounded-2xl before:backdrop-blur-2xl before:pointer-events-none
                                           after:absolute after:inset-0 after:bg-gradient-to-t after:from-rose-500/30 after:via-pink-400/20 after:to-transparent after:rounded-2xl after:pointer-events-none`
                                        : `hover:bg-white/15 hover:backdrop-blur-3xl hover:text-rose-900 hover:shadow-2xl hover:shadow-rose-300/70 hover:border-white/50 text-rose-700 backdrop-blur-xl border border-transparent
                                           hover:before:opacity-100 hover:after:opacity-100`
                                      }`}
                          >
                            {/* Efecto hover liquid glass SUPER INTENSO */}
                            {!isActiveItem(item.path) && (
                              <>
                                {/* Primera capa de glass */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-white/40 via-pink-200/50 to-rose-300/40 opacity-0 group-hover:opacity-100 backdrop-blur-2xl rounded-2xl shadow-xl pointer-events-none"
                                  initial={false}
                                  transition={{ duration: 0.4 }}
                                />
                                {/* Segunda capa de glass */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-t from-rose-400/30 via-pink-300/20 to-transparent opacity-0 group-hover:opacity-100 backdrop-blur-xl rounded-2xl pointer-events-none"
                                  initial={false}
                                  transition={{ duration: 0.4, delay: 0.1 }}
                                />
                                {/* Tercera capa de brillo */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none"
                                  initial={false}
                                  transition={{ duration: 0.6, delay: 0.2 }}
                                />
                                {/* Borde interno glass */}
                                <motion.div
                                  className="absolute inset-0 border-2 border-white/40 opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none"
                                  initial={false}
                                  transition={{ duration: 0.3 }}
                                />
                              </>
                            )}
                            
                            {/* Efecto active liquid glass ULTRA INTENSO */}
                            {isActiveItem(item.path) && (
                              <>
                                {/* Capa base activa */}
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/80 via-pink-500/70 to-rose-600/60 rounded-2xl backdrop-blur-xl pointer-events-none" />
                                {/* Capa de brillo activa */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-2xl pointer-events-none"
                                  animate={{
                                    x: ["-100%", "100%"],
                                  }}
                                  transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                  }}
                                />
                                {/* Bordes glass activos */}
                                <div className="absolute inset-0 border-2 border-white/60 rounded-2xl pointer-events-none" />
                                <div className="absolute inset-1 border border-pink-200/40 rounded-xl pointer-events-none" />
                              </>
                            )}

                            {/* Ícono */}
                            <motion.div
                              className={`relative z-20 ${isActiveItem(item.path) ? 'text-white drop-shadow-lg' : item.color || 'text-rose-500'} transition-all duration-300 group-hover:scale-125 group-hover:text-rose-900 group-hover:drop-shadow-md`}
                              whileHover={{ rotate: 15, scale: 1.4 }}
                              transition={{ type: "spring", stiffness: 500, damping: 12 }}
                            >
                              {item.icon}
                            </motion.div>

                            {/* Label */}
                            <span className={`relative z-20 font-medium text-sm flex-1 transition-all duration-300 ${isActiveItem(item.path) ? 'drop-shadow-sm' : ''} group-hover:drop-shadow-sm`}>
                              {item.label}
                            </span>

                            {/* Badge */}
                            {item.badge && (
                              <motion.div
                                className="relative z-20 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-2 py-1 rounded-full font-bold 
                                          shadow-lg shadow-pink-500/50 backdrop-blur-sm border border-white/30 drop-shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                whileHover={{ 
                                  scale: 1.15,
                                  boxShadow: "0 10px 25px -5px rgba(244, 114, 182, 0.8)",
                                }}
                              >
                                {item.badge}
                              </motion.div>
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer con logout */}
      <div className="relative z-10 p-4 border-t border-white/20 backdrop-blur-2xl
                      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-pink-100/20 before:backdrop-blur-xl before:pointer-events-none
                      after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:to-rose-50/10 after:pointer-events-none">
        <motion.button
          onClick={handleLogout}
          className="relative w-full flex items-center space-x-3 p-3 rounded-2xl bg-white/15 border border-white/30 overflow-hidden
                     text-rose-600 transition-all duration-400 group backdrop-blur-3xl shadow-xl shadow-rose-200/40
                     hover:bg-white/20 hover:text-rose-900 hover:shadow-2xl hover:shadow-rose-300/70 hover:border-white/50 pointer-events-auto"
          whileHover={{ 
            scale: 1.04, 
            x: 8,
            boxShadow: "0 25px 50px -12px rgba(244, 114, 182, 0.6)",
          }}
          whileTap={{ scale: 0.96 }}
        >
          {/* Efecto liquid glass en logout */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/40 via-pink-200/50 to-rose-300/40 opacity-0 group-hover:opacity-100 backdrop-blur-2xl rounded-2xl pointer-events-none"
            initial={false}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-rose-400/30 via-pink-300/20 to-transparent opacity-0 group-hover:opacity-100 backdrop-blur-xl rounded-2xl pointer-events-none"
            initial={false}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
          <motion.div
            className="absolute inset-0 border-2 border-white/40 opacity-0 group-hover:opacity-100 rounded-2xl pointer-events-none"
            initial={false}
            transition={{ duration: 0.3 }}
          />
          
          <FiLogOut className="relative z-20 group-hover:rotate-12 transition-transform duration-300 group-hover:scale-125 pointer-events-none" />
          <span className="relative z-20 font-medium text-sm transition-all duration-300 pointer-events-none">Cerrar Sesión</span>
        </motion.button>
      </div>
    </motion.aside>
  );
} 