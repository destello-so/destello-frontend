import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiCreditCard, FiCheckCircle, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import * as productService from '../api/productService';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../api/userService';
import { createOrder } from '../api/orderService';
import type { Address } from '../types/auth.types';

// ============================================================================
// 🎨 TIPOS
// ============================================================================

type ShippingData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type PaymentData = {
  cardNumber: string;
  expiry: string;
  cvc: string;
  name: string;
};

// ============================================================================
// 💎 COMPONENTE PRINCIPAL CHECKOUT
// ============================================================================

export default function Checkout() {
  /* -----------------------------------------------------------------------
   * State & hooks
   * ---------------------------------------------------------------------*/
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Prefill addresses
  const defaultAddress: Address | undefined = user?.addresses?.find((a) => (a as Address).isDefault) as Address | undefined;

  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [shipping, setShipping] = useState<ShippingData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: defaultAddress?.street || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    postalCode: defaultAddress?.zipCode || '',
    country: defaultAddress?.country || ''
  });
  const [saveAddress, setSaveAddress] = useState<boolean>(false);
  const [isDefaultAddr, setIsDefaultAddr] = useState<boolean>(false);
  const [payment, setPayment] = useState<PaymentData>({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Update shipping when user or addresses change
  useEffect(() => {
    if (user) {
      setShipping((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || ''
      }));

      if (user.addresses && user.addresses.length > 0) {
        const def = (user.addresses as Address[]).find((a) => a.isDefault) || (user.addresses as Address[])[0];
        setShipping((prev) => ({
          ...prev,
          address: def.street,
          city: def.city,
          state: def.state,
          postalCode: def.zipCode,
          country: def.country
        }));
      }
    }
  }, [user]);

  /* -----------------------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------------------*/
  const goNext = () => setCurrentStep((prev) => Math.min(2, (prev + 1) as 0 | 1 | 2) as 0 | 1 | 2);
  const goBack = () => setCurrentStep((prev) => Math.max(0, (prev - 1) as 0 | 1 | 2) as 0 | 1 | 2);

  async function handleCreateOrder() {
    try {
      setIsCreatingOrder(true);

      // Guardar dirección si es necesario
      if (saveAddress && (!user || !(user.addresses ?? []).some(addr => addr.street === shipping.address))) {
        const newAddress: Address = {
          street: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.postalCode,
          country: shipping.country,
          isDefault: isDefaultAddr
        };
        try {
          await userService.addAddress(newAddress);
        } catch (err) {
          console.error('Error guardando dirección', err);
        }
      }

      // Crear la orden
      const orderData = {
        address: {
          street: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zipCode: shipping.postalCode,
          country: shipping.country
        },
        paymentMethod: 'tarjeta'
      };

      const response = await createOrder(orderData);
      
      if (response.success) {
        // Limpiar el carrito después de crear la orden exitosamente
        clearCart();
        
        // Mostrar modal de éxito
        setShowSuccess(true);
        
        // Después de 2 segundos, navegar a mis-ordenes
        setTimeout(() => {
          navigate('/mis-ordenes');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creando orden:', err);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsCreatingOrder(false);
    }
  }

  /* -----------------------------------------------------------------------
   * Render
   * ---------------------------------------------------------------------*/
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden py-12 px-4 lg:px-8">
      {/* Enhanced Decorative Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-rose-300/40 via-pink-300/30 to-purple-300/20 blur-3xl rounded-full animate-pulse" />
      <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-pink-400/30 via-rose-300/25 to-purple-300/15 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-300/25 via-pink-300/20 to-rose-300/15 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-20 -right-32 w-96 h-96 bg-gradient-to-br from-rose-400/35 via-pink-400/25 to-purple-400/20 blur-3xl rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
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

      {/* Stepper */}
      <StepProgress currentStep={currentStep} />

      {/* Main Grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* Forms area */}
        <div className="lg:col-span-2">
          <div className="relative">
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="shipping" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
                  <ShippingFormStep data={shipping} onChange={setShipping} onNext={goNext} saveAddress={saveAddress} setSaveAddress={setSaveAddress} isDefault={isDefaultAddr} setIsDefault={setIsDefaultAddr} />
                </motion.div>
              )}
              {currentStep === 1 && (
                <motion.div key="payment" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
                  <PaymentFormStep data={payment} onChange={setPayment} onNext={goNext} onBack={goBack} />
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div key="confirm" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
                  <ConfirmationStep shipping={shipping} payment={payment} onBack={goBack} onCreateOrder={handleCreateOrder} isCreatingOrder={isCreatingOrder} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Order summary */}
        <OrderSummarySidebar cart={cart} />
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="max-w-md w-full mx-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 text-center shadow-2xl shadow-rose-500/40" initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-xl" />
                <FiCheckCircle className="relative w-20 h-20 text-emerald-400 mx-auto mb-6" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">¡Orden creada!</h2>
              <p className="text-gray-700 mb-8 text-lg">Gracias por tu compra. Pronto recibirás un correo con los detalles.</p>
              <button 
                onClick={() => setShowSuccess(false)} 
                className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-semibold shadow-2xl shadow-rose-500/40 hover:shadow-rose-500/60 hover:scale-105 transition-all duration-300"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 🚥 STEPPER COMPONENT
// ============================================================================

function StepProgress({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: 'Envío', icon: <FiUser className="w-6 h-6" /> },
    { label: 'Pago', icon: <FiCreditCard className="w-6 h-6" /> },
    { label: 'Revisar', icon: <FiCheckCircle className="w-6 h-6" /> }
  ];

  return (
    <div className="relative z-10 flex items-center justify-center gap-8 select-none mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-4">
          <motion.div 
            className="flex flex-col items-center gap-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-500 ${
              index <= currentStep 
                ? 'bg-gradient-to-br from-rose-400 via-pink-500 to-purple-500 text-white border-pink-300 shadow-2xl shadow-rose-500/50' 
                : 'bg-white/15 backdrop-blur-xl text-gray-500 border-white/30 shadow-lg shadow-white/20'
            }`}>
              {index <= currentStep && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-400/20 blur-md animate-pulse" />
              )}
              <div className="relative z-10">
                {step.icon}
              </div>
            </div>
            <span className={`text-sm font-semibold transition-colors duration-300 ${
              index <= currentStep ? 'text-gray-800' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </motion.div>
          {index < steps.length - 1 && (
            <div className="relative flex items-center">
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: index < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 📦 SHIPPING FORM STEP
// ============================================================================

function ShippingFormStep({ data, onChange, onNext, saveAddress, setSaveAddress, isDefault, setIsDefault }: { data: ShippingData; onChange: (d: ShippingData) => void; onNext: () => void; saveAddress: boolean; setSaveAddress: (v: boolean) => void; isDefault: boolean; setIsDefault: (v: boolean) => void; }) {
  const isValid = Object.values(data).every(Boolean);
  return (
    <motion.div 
      className="backdrop-blur-3xl bg-gradient-to-br from-white/25 via-white/15 to-white/10 border border-white/40 rounded-3xl p-10 shadow-2xl shadow-rose-500/30 relative overflow-hidden"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-400/15 to-purple-400/15 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <FiUser className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Datos de envío</h2>
            <p className="text-gray-600 mt-1">Completa tu información de entrega</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Nombre" value={data.firstName} onChange={(v) => onChange({ ...data, firstName: v })} />
          <Input label="Apellidos" value={data.lastName} onChange={(v) => onChange({ ...data, lastName: v })} />
          <Input label="Email" type="email" value={data.email} onChange={(v) => onChange({ ...data, email: v })} />
          <Input label="Teléfono" value={data.phone} onChange={(v) => onChange({ ...data, phone: v })} />
          <Input label="Dirección" className="md:col-span-2" value={data.address} onChange={(v) => onChange({ ...data, address: v })} />
          <Input label="Ciudad" value={data.city} onChange={(v) => onChange({ ...data, city: v })} />
          <Input label="Estado/Dep." value={data.state} onChange={(v) => onChange({ ...data, state: v })} />
          <Input label="Código Postal" value={data.postalCode} onChange={(v) => onChange({ ...data, postalCode: v })} />
          <Input label="País" value={data.country} onChange={(v) => onChange({ ...data, country: v })} />
        </div>
        
        <div className="flex items-center justify-between mt-10">
          <div className="flex flex-col gap-3">
            <motion.label 
              className="flex items-center gap-3 text-gray-700 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={saveAddress} 
                  onChange={(e) => setSaveAddress(e.target.checked)} 
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 ${
                  saveAddress 
                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 border-pink-400 shadow-lg shadow-rose-500/30' 
                    : 'bg-white/30 border-white/50'
                }`}>
                  {saveAddress && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <FiCheckCircle className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
              <span className="font-medium group-hover:text-gray-800 transition-colors">Guardar esta dirección</span>
            </motion.label>
            
            {saveAddress && (
              <motion.label 
                className="flex items-center gap-3 text-gray-600 cursor-pointer group ml-8"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={isDefault} 
                    onChange={(e) => setIsDefault(e.target.checked)} 
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-md border-2 transition-all duration-300 ${
                    isDefault 
                      ? 'bg-gradient-to-br from-rose-400 to-pink-500 border-pink-400 shadow-lg shadow-rose-500/30' 
                      : 'bg-white/30 border-white/50'
                  }`}>
                    {isDefault && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <FiCheckCircle className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                  </div>
                </div>
                <span className="text-sm group-hover:text-gray-700 transition-colors">Hacerla predeterminada</span>
              </motion.label>
            )}
          </div>
          
          <motion.button 
            disabled={!isValid} 
            onClick={onNext}
            whileHover={{ scale: isValid ? 1.05 : 1 }}
            whileTap={{ scale: isValid ? 0.95 : 1 }}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
              isValid 
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white shadow-2xl shadow-rose-500/40 hover:shadow-rose-500/60' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
            <FiChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// 💳 PAYMENT FORM STEP
// ============================================================================

function PaymentFormStep({ data, onChange, onNext, onBack }: { data: PaymentData; onChange: (d: PaymentData) => void; onNext: () => void; onBack: () => void; }) {
  const isValid = Object.values(data).every(Boolean);
  const [showBack, setShowBack] = useState(false);
  const cvcRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div 
      className="backdrop-blur-3xl bg-gradient-to-br from-white/25 via-white/15 to-white/10 border border-white/40 rounded-3xl p-10 shadow-2xl shadow-rose-500/30 relative overflow-hidden"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-rose-400/15 to-purple-400/15 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FiCreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Datos de pago</h2>
            <p className="text-gray-600 mt-1">Ingresa la información de tu tarjeta</p>
          </div>
        </div>
        
        {/* Enhanced Card preview */}
        <div className="mb-10 flex justify-center">
          <CreditCardPreview card={data} showBack={showBack} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Número de tarjeta" value={data.cardNumber} onChange={(v) => onChange({ ...data, cardNumber: v })} placeholder="1234 5678 9012 3456" />
          <Input label="Nombre en tarjeta" value={data.name} onChange={(v) => onChange({ ...data, name: v })} />
          <Input label="Expiración" value={data.expiry} onChange={(v) => onChange({ ...data, expiry: v })} placeholder="MM/AA" />
          <Input 
            label="CVC" 
            inputRef={cvcRef} 
            value={data.cvc} 
            onFocus={() => setShowBack(true)} 
            onBlur={() => setShowBack(false)} 
            onChange={(v) => onChange({ ...data, cvc: v })} 
            placeholder="123"
          />
        </div>

        <div className="flex justify-between items-center mt-10">
          <motion.button 
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-medium bg-white/20 backdrop-blur-xl text-gray-700 border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg shadow-white/20"
          >
            <FiChevronLeft className="w-5 h-5" /> 
            Atrás
          </motion.button>
          
          <motion.button 
            disabled={!isValid} 
            onClick={onNext}
            whileHover={{ scale: isValid ? 1.05 : 1 }}
            whileTap={{ scale: isValid ? 0.95 : 1 }}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
              isValid 
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Revisar
            <FiChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// 🪪 CREDIT CARD PREVIEW
// ============================================================================

function CreditCardPreview({ card, showBack }: { card: PaymentData; showBack: boolean }) {
  const formattedNumber = card.cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();
  const formattedExpiry = card.expiry || '••/••';

  return (
    <div className="relative w-full max-w-sm mx-auto h-56 perspective-1000">
      <motion.div 
        className="relative w-full h-full"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-8 text-white shadow-2xl shadow-rose-500/50 border border-white/20 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-12 h-8 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30" />
              <div className="text-right">
                <div className="text-xs opacity-75">VISA</div>
                <div className="text-lg font-bold">PREMIUM</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-2xl tracking-[0.2em] font-mono font-bold">
                {formattedNumber}
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-75 mb-1">TITULAR</div>
                  <div className="text-lg font-semibold uppercase tracking-wide">
                    {card.name || 'NOMBRE APELLIDO'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75 mb-1">VÁLIDA HASTA</div>
                  <div className="text-lg font-bold tracking-wider">
                    {formattedExpiry}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 p-8 text-white shadow-2xl shadow-purple-500/50 border border-white/20 overflow-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-full h-12 bg-black/40 -mx-8 mb-8" />
            
            <div className="flex justify-end">
              <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-xl font-bold tracking-widest shadow-lg">
                {card.cvc || '•••'}
              </div>
            </div>
            
            <div className="text-xs opacity-75 text-center">
              Para mayor seguridad, mantenga esta información confidencial
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// ✅ CONFIRMATION STEP
// ============================================================================

function ConfirmationStep({ shipping, payment, onBack, onCreateOrder, isCreatingOrder }: { shipping: ShippingData; payment: PaymentData; onBack: () => void; onCreateOrder: () => void; isCreatingOrder: boolean; }) {
  return (
    <motion.div 
      className="backdrop-blur-3xl bg-gradient-to-br from-white/25 via-white/15 to-white/10 border border-white/40 rounded-3xl p-10 shadow-2xl shadow-rose-500/30 relative overflow-hidden"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-rose-400/15 to-emerald-400/15 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <FiCheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Revisar y confirmar</h2>
            <p className="text-gray-600 mt-1">Verifica que toda la información sea correcta</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping summary */}
          <motion.div 
            className="p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl shadow-white/10 relative overflow-hidden"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute -top-5 -right-5 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Datos de envío</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{shipping.firstName} {shipping.lastName}</span>
                </div>
                <div className="text-sm opacity-80">{shipping.email}</div>
                <div className="text-sm opacity-80">{shipping.phone}</div>
                <div className="pt-2 border-t border-white/20">
                  <div className="font-medium">{shipping.address}</div>
                  <div className="text-sm opacity-80">{shipping.city}, {shipping.state} {shipping.postalCode}</div>
                  <div className="text-sm opacity-80">{shipping.country}</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Payment summary */}
          <motion.div 
            className="p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl shadow-white/10 relative overflow-hidden"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute -top-5 -right-5 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                  <FiCreditCard className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Método de pago</h3>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <span className="font-semibold">•••• •••• •••• {payment.cardNumber.slice(-4) || '••••'}</span>
                </div>
                <div className="text-sm opacity-80">
                  <span className="font-medium">Titular:</span> {payment.name || '—'}
                </div>
                <div className="text-sm opacity-80">
                  <span className="font-medium">Expira:</span> {payment.expiry || '—'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-between items-center mt-10">
          <motion.button 
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full font-medium bg-white/20 backdrop-blur-xl text-gray-700 border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg shadow-white/20"
          >
            <FiChevronLeft className="w-5 h-5" /> 
            Atrás
          </motion.button>
          
          <motion.button 
            onClick={onCreateOrder}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300"
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <FiCheckCircle className="w-6 h-6" />
            )}
            {isCreatingOrder ? 'Creando orden...' : 'Crear orden'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// 🧾 ORDER SUMMARY SIDEBAR
// ============================================================================

function OrderSummarySidebar({ cart }: { cart: ReturnType<typeof useCart>['cart'] }) {
  if (!cart) return null;

  return (
    <div className="sticky top-20 space-y-6">
      <motion.div 
        className="backdrop-blur-3xl bg-gradient-to-br from-white/25 via-white/15 to-white/10 border border-white/40 rounded-3xl p-8 shadow-2xl shadow-rose-500/30 relative overflow-hidden"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-rose-400/15 to-orange-400/15 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white text-lg font-bold">🛒</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Resumen de compra</h3>
          </div>
          
          <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {cart.items.map((item, index) => (
              <motion.div 
                key={item.id} 
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={productService.getProductImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white/30 shadow-lg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://www.allaboardeducators.com/images/productimages/1.jpg';
                      }}
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-800 truncate">{item.name}</span>
                    <span className="text-xs text-gray-600">S/ {item.price.toFixed(2)} c/u</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-800">S/ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/30">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold">S/ {cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">IGV (18%)</span>
                <span className="font-semibold">S/ {cart.taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Envío</span>
                <span className="font-semibold text-green-600">Gratis</span>
              </div>
              <div className="pt-3 border-t border-white/30">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    S/ {cart.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// 🧩 INPUT COMPONENT (reusable)
// ============================================================================

function Input({ label, value, onChange, type = 'text', className = '', placeholder, inputRef, onFocus, onBlur }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string; placeholder?: string; inputRef?: React.Ref<HTMLInputElement>; onFocus?: () => void; onBlur?: () => void; }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          placeholder={placeholder}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-5 py-4 rounded-2xl bg-white/30 backdrop-blur-xl border-2 transition-all duration-300 placeholder-gray-400 text-gray-800 shadow-lg shadow-white/10 ${
            isFocused 
              ? 'border-rose-400/60 bg-white/40 shadow-xl shadow-rose-500/20 ring-4 ring-rose-400/10' 
              : 'border-white/40 hover:border-white/60 hover:bg-white/35'
          } focus:outline-none`}
        />
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400/10 to-pink-400/10 pointer-events-none animate-pulse" />
        )}
      </div>
    </div>
  );
} 