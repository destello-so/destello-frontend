// ============================================================================
// 📊 CART SUMMARY - Componente de resumen del carrito con liquid glass design
// ============================================================================

import { motion } from 'framer-motion';
import { 
  FiCreditCard, FiShield, FiArrowRight, FiCheck
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// 🎯 INTERFACES
// ============================================================================

interface CartSummaryProps {
  subtotal: number;
  taxes: number;
  total: number;
  itemCount: number;
}

// ============================================================================
// 💎 CART SUMMARY COMPONENT
// ============================================================================

export const CartSummary = ({ 
  subtotal, 
  taxes, 
  total, 
  itemCount 
}: CartSummaryProps) => {

  const navigate = useNavigate();

  return (
    <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl shadow-rose-500/20
                    relative overflow-hidden">
      
      {/* Efectos de fondo animados */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
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

      <div className="relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Resumen del pedido</h3>
          <div className="flex items-center space-x-1 text-gray-600">
            <span className="text-sm">{itemCount}</span>
            <span className="text-sm">{itemCount === 1 ? 'producto' : 'productos'}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4 mb-6">
          
          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Subtotal ({itemCount} productos)</span>
            <span className="font-semibold text-gray-900">S/ {subtotal.toFixed(2)}</span>
          </div>

          {/* Taxes */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">IGV (18%)</span>
            <span className="font-semibold text-gray-900">S/ {taxes.toFixed(2)}</span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-300/30 my-6" />

        {/* Total */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-rose-600">S/ {total.toFixed(2)}</span>
        </div>

        {/* Checkout Button */}
        <motion.button
          onClick={() => navigate('/checkout')}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold py-4 px-6 
                     rounded-2xl shadow-xl shadow-rose-500/30 hover:shadow-rose-400/40 
                     transition-all duration-300 flex items-center justify-center space-x-3"
        >
          <FiCreditCard className="w-5 h-5" />
          <span>Proceder al pago</span>
          <FiArrowRight className="w-5 h-5" />
        </motion.button>

        {/* Security Info */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
          <FiShield className="w-4 h-4 text-emerald-500" />
          <span>Pago 100% seguro y protegido</span>
        </div>

        {/* Additional Info */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <FiCheck className="w-3 h-3 text-emerald-500" />
            <span>Devoluciones gratuitas en 30 días</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <FiCheck className="w-3 h-3 text-emerald-500" />
            <span>Garantía de satisfacción 100%</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <FiCheck className="w-3 h-3 text-emerald-500" />
            <span>Soporte al cliente 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 