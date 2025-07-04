import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, 
  FiCheckCircle, 
  FiClock, 
  FiTruck, 
  FiX, 
  FiEye, 
  FiCalendar,
  FiMapPin,
  FiShoppingBag,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';
import { getMyOrders, cancelOrder, type Order } from '../api/orderService';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    icon: FiClock,
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-amber-100/80',
    textColor: 'text-amber-800'
  },
  processing: {
    label: 'Procesando',
    icon: FiRefreshCw,
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-100/80',
    textColor: 'text-blue-800'
  },
  shipped: {
    label: 'Enviado',
    icon: FiTruck,
    color: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-purple-100/80',
    textColor: 'text-purple-800'
  },
  delivered: {
    label: 'Entregado',
    icon: FiCheckCircle,
    color: 'from-emerald-400 to-green-500',
    bgColor: 'bg-emerald-100/80',
    textColor: 'text-emerald-800'
  },
  cancelled: {
    label: 'Cancelado',
    icon: FiX,
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-red-100/80',
    textColor: 'text-red-800'
  }
};

export default function MisOrdenes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyOrders(page, 8);
      setOrders(response.data.orders);
      setCurrentPage(response.data.pagination.page);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setError('Error al cargar las órdenes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingOrder(orderId);
      await cancelOrder(orderId);
      
      // Actualizar la orden en el estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' as const }
            : order
        )
      );
      
      // Si la orden seleccionada es la que se canceló, actualizarla también
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
      }
    } catch (err) {
      console.error('Error cancelando orden:', err);
    } finally {
      setCancellingOrder(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden py-12 px-4 lg:px-8">
      {/* Enhanced Decorative Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-rose-300/40 via-pink-300/30 to-purple-300/20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-pink-400/30 via-rose-300/25 to-purple-300/15 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/25 via-pink-300/20 to-rose-300/15 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-20 -right-32 w-96 h-96 bg-gradient-to-br from-rose-400/35 via-pink-400/25 to-purple-400/20 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-br from-rose-400/40 to-pink-400/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/40">
            <FiPackage className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-4">
            Mis Órdenes
          </h1>
          <p className="text-gray-600 text-xl">
            Gestiona y rastrea todas tus compras
          </p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={() => loadOrders(currentPage)} />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Orders Grid */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {orders.map((order, index) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  index={index}
                  onViewDetails={() => setSelectedOrder(order)}
                  onCancel={() => handleCancelOrder(order._id)}
                  isCancelling={cancellingOrder === order._id}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={loadOrders}
              />
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCancel={handleCancelOrder}
        isCancelling={cancellingOrder === selectedOrder?._id}
      />
    </div>
  );
}

// ============================================================================
// 🃏 ORDER CARD COMPONENT
// ============================================================================

function OrderCard({ order, index, onViewDetails, onCancel, isCancelling }: {
  order: Order;
  index: number;
  onViewDetails: () => void;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const canCancel = order.status === 'pending' || order.status === 'processing';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group backdrop-blur-3xl bg-gradient-to-br from-white/25 via-white/15 to-white/10 border border-white/40 rounded-3xl p-6 shadow-2xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all duration-500 relative overflow-hidden cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Decorative elements */}
      <div className="absolute -top-5 -right-5 w-20 h-20 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
      <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-gradient-to-br from-purple-400/15 to-rose-400/15 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full ${status.bgColor} border border-white/30`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-4 h-4 ${status.textColor}`} />
              <span className={`text-sm font-semibold ${status.textColor}`}>
                {status.label}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            #{order._id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Items Preview */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FiShoppingBag className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600 font-medium">
              {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex -space-x-2 mb-2">
            {order.items.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg"
              >
                {item.quantity}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                +{order.items.length - 3}
              </div>
            )}
          </div>
        </div>

        {/* Total Amount */}
        <div className="mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {formatPrice(order.totalAmount)}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {formatDate(order.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="flex-1 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-gray-700 font-medium hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FiEye className="w-4 h-4" />
            Ver detalles
          </button>
          
          {canCancel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              disabled={isCancelling}
              className="px-4 py-2 rounded-xl bg-red-500/20 backdrop-blur-xl border border-red-300/30 text-red-700 font-medium hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiX className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// 📋 ORDER DETAILS MODAL
// ============================================================================

function OrderDetailsModal({ order, onClose, onCancel, isCancelling }: {
  order: Order | null;
  onClose: () => void;
  onCancel: (orderId: string) => void;
  isCancelling: boolean;
}) {
  if (!order) return null;

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;
  const canCancel = order.status === 'pending' || order.status === 'processing';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `S/ ${price.toFixed(2)}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-3xl bg-gradient-to-br from-white/50 via-white/40 to-white/30 border border-white/60 rounded-3xl shadow-2xl shadow-rose-500/40 relative custom-scrollbar"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-rose-400/15 rounded-full blur-2xl" />
          
          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                  Orden #{order._id.slice(-8).toUpperCase()}
                </h2>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-full ${status.bgColor} border border-white/30`}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${status.textColor}`} />
                      <span className={`font-semibold ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-600">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-gray-600 hover:bg-white/30 transition-all duration-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiShoppingBag className="w-5 h-5" />
                  Productos ({order.items.length})
                </h3>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {item.quantity}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {item.productName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            SKU: {item.productSku}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              {formatPrice(item.unitPrice)} × {item.quantity}
                            </span>
                            <span className="font-bold text-gray-800">
                              {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary & Address */}
              <div className="space-y-6">
                {/* Address */}
                <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    Dirección de envío
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium">{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state}</p>
                    <p>{order.address.zipCode}</p>
                    <p>{order.address.country}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="p-6 rounded-2xl bg-white/30 backdrop-blur-xl border border-white/50 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Resumen de pago
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.totalAmount / 1.18)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>IGV (18%)</span>
                      <span>{formatPrice(order.totalAmount - (order.totalAmount / 1.18))}</span>
                    </div>
                    <div className="pt-3 border-t border-white/30">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-800">Total</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canCancel && (
                  <button
                    onClick={() => onCancel(order._id)}
                    disabled={isCancelling}
                    className="w-full px-6 py-3 rounded-xl bg-red-500/20 backdrop-blur-xl border border-red-300/30 text-red-700 font-semibold hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? (
                      <>
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <FiX className="w-5 h-5" />
                        Cancelar orden
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// 🔄 LOADING STATE
// ============================================================================

function LoadingState() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/30">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando órdenes...</h2>
      <p className="text-gray-600">Obteniendo tus compras más recientes</p>
    </motion.div>
  );
}

// ============================================================================
// ❌ ERROR STATE
// ============================================================================

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/30">
        <FiAlertCircle className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops, algo salió mal</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300"
      >
        Intentar de nuevo
      </button>
    </motion.div>
  );
}

// ============================================================================
// 📭 EMPTY STATE
// ============================================================================

function EmptyState() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gray-500/30">
        <FiPackage className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes órdenes aún</h2>
      <p className="text-gray-600 mb-6">¡Explora nuestros productos y haz tu primera compra!</p>
      <button
        onClick={() => navigate('/productos')}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300"
      >
        Ver productos
      </button>
    </motion.div>
  );
}

// ============================================================================
// 📄 PAGINATION
// ============================================================================

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex justify-center items-center gap-2"
    >
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-12 h-12 rounded-full font-semibold transition-all duration-300 ${
            page === currentPage
              ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-white/20 backdrop-blur-xl border border-white/30 text-gray-700 hover:bg-white/30'
          }`}
        >
          {page}
        </button>
      ))}
    </motion.div>
  );
} 