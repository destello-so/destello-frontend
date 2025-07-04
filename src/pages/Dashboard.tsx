import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign,
  FiCalendar, FiBell, FiStar, FiHeart 
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  // Datos temporales para mostrar
  const stats = [
    { label: 'Ventas Totales', value: 'S/ 15,420', icon: <FiDollarSign />, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Productos Vendidos', value: '245', icon: <FiShoppingBag />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Usuarios Activos', value: '1,432', icon: <FiUsers />, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Reviews Positivas', value: '98%', icon: <FiStar />, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ];

  const recentActivity = [
    { action: 'Nueva orden recibida', time: 'Hace 2 min', type: 'order' },
    { action: 'Usuario se registró', time: 'Hace 15 min', type: 'user' },
    { action: 'Producto favorito añadido', time: 'Hace 1 hora', type: 'wishlist' },
    { action: 'Review 5 estrellas recibida', time: 'Hace 2 horas', type: 'review' },
  ];

  return (
    <div className="space-y-8">
      {/* Header de bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              className="text-3xl font-bold text-slate-800 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ¡Bienvenido de vuelta, {user?.firstName}! 👋
            </motion.h1>
            <motion.p 
              className="text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Aquí tienes un resumen de tu actividad en Destello Perú
            </motion.p>
          </div>
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FiHeart className="text-white text-2xl" />
          </motion.div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <span className={`${stat.color} text-xl`}>{stat.icon}</span>
              </div>
              <FiTrendingUp className="text-green-500 text-sm" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</h3>
            <p className="text-slate-600 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Grid con dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Actividad Reciente</h2>
            <FiBell className="text-slate-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + 0.1 * index }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-slate-800 text-sm font-medium">{activity.action}</p>
                  <p className="text-slate-500 text-xs">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gráfico temporal */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Ventas del Mes</h2>
            <FiCalendar className="text-slate-400" />
          </div>
          
          {/* Simulación de gráfico con barras */}
          <div className="space-y-3">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => (
              <div key={day} className="flex items-center space-x-3">
                <span className="text-slate-600 text-sm w-8">{day}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 100}%` }}
                    transition={{ delay: 0.6 + 0.1 * index, duration: 0.8 }}
                  />
                </div>
                <span className="text-slate-600 text-sm">S/ {Math.floor(Math.random() * 1000 + 500)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">¿Listo para vender más?</h3>
            <p className="text-blue-100 mb-4">
              Agrega nuevos productos a tu tienda y llega a más clientes
            </p>
            <motion.button
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Agregar Producto
            </motion.button>
          </div>
          <motion.div
            className="hidden md:block w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <FiShoppingBag className="text-4xl" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 