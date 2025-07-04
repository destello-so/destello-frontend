import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHeart, FiUser, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { RegisterForm } from '../types/auth.types';
import styles from '../styles/Register.module.scss';

// Schema de validación con Zod
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  phone: z
    .string()
    .regex(/^\d{9}$/, 'El teléfono debe tener 9 dígitos')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    mode: 'onChange',
  });

  // Validar con Zod manualmente
  const validateForm = (data: RegisterForm) => {
    try {
      registerSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  };

  // Manejar envío del formulario
  const onSubmit = async (data: RegisterForm) => {
    if (!validateForm(data)) return;
    
    try {
      clearError(); // Limpiar errores previos
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined, // Solo enviar si tiene valor
      });
      
      // Navegación automática se maneja por el router con rutas protegidas
      // El usuario será redirigido automáticamente a Home
    } catch {
      // Los errores se manejan automáticamente en el store
    }
  };
  
  return (
    <div className={`${styles.container} min-h-screen bg-gradient-rose relative overflow-hidden`}>
      {/* Blobs animados por toda la pantalla */}
      <div className={styles.backgroundContainer}>
        {/* Blob grande arriba izquierda */}
        <motion.div
          className="absolute top-10 left-10 w-64 h-64 bg-gradient-sunset rounded-full opacity-30 blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob mediano arriba centro */}
        <motion.div
          className="absolute top-20 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-rose-400/40 rounded-full blur-2xl"
          animate={{
            y: [0, 25, 0],
            x: [0, -15, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob grande arriba derecha */}
        <motion.div
          className="absolute top-5 right-5 w-56 h-56 bg-gradient-glow rounded-full opacity-25 blur-2xl"
          animate={{
            y: [0, 15, 0],
            x: [0, -25, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob mediano centro izquierda */}
        <motion.div
          className="absolute top-1/2 left-0 transform -translate-y-1/2 w-40 h-40 bg-rose-300/50 rounded-full blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob mediano centro derecha */}
        <motion.div
          className="absolute top-1/2 right-0 transform -translate-y-1/2 w-52 h-52 bg-gradient-sunset rounded-full opacity-20 blur-2xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob grande abajo izquierda */}
        <motion.div
          className="absolute bottom-10 left-10 w-72 h-72 bg-rose-400/30 rounded-full blur-3xl"
          animate={{
            y: [0, -20, 0],
            x: [0, 35, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob mediano abajo centro */}
        <motion.div
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-44 h-44 bg-gradient-glow rounded-full opacity-35 blur-xl"
          animate={{
            y: [0, -25, 0],
            x: [0, 20, 0],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob grande abajo derecha */}
        <motion.div
          className="absolute bottom-5 right-5 w-60 h-60 bg-rose-500/25 rounded-full blur-2xl"
          animate={{
            y: [0, -30, 0],
            x: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blobs pequeños flotantes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-24 h-24 bg-rose-300/60 rounded-full blur-lg"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-sunset rounded-full opacity-40 blur-lg"
          animate={{
            y: [0, 20, 0],
            x: [0, -15, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-1/3 right-1/3 w-20 h-20 bg-rose-400/50 rounded-full blur-md"
          animate={{
            y: [0, -12, 0],
            x: [0, 18, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Blob móvil que cruza la pantalla */}
        <motion.div
          className="absolute top-2/3 w-36 h-36 bg-gradient-glow rounded-full opacity-30 blur-xl"
          animate={{
            x: [-100, window.innerWidth + 100],
            y: [0, -50, 0, 30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        <motion.div
          className={styles.cardWrapper}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Card principal con glassmorphism */}
          <div className={`${styles.mainCard} backdrop-blur-xl bg-white/10 border border-white/20 rounded-bubble shadow-glow`}>
            {/* Gradiente interno sutil */}
            <div className={`${styles.innerGradient} bg-gradient-to-br from-white/5 to-rose-100/5 rounded-bubble`} />
            
            <div className={styles.cardContent}>
              {/* Header con logo y título */}
              <div className={styles.header}>
                <motion.div
                  className={`${styles.iconContainer} bg-gradient-sunset shadow-rose`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <FiHeart className="text-white text-2xl" />
                </motion.div>
                
                <motion.h1
                  className="text-3xl font-bold text-gradient-sunset mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Crea tu cuenta
                </motion.h1>
                
                <motion.p
                  className="text-warm-600 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Destello Perú
                </motion.p>
              </div>

              {/* Mostrar error global si existe */}
              {error && (
                <motion.div
                  className="mb-4 p-3 bg-red-100/20 border border-red-300/30 rounded-gentle flex items-center space-x-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiAlertCircle className="text-red-400 text-sm" />
                  <span className="text-red-600 text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {/* Formulario */}
              <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                {/* FILA 1: Nombre + Apellido */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Campo Nombre */}
                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      Nombre
                    </label>
                    <div className={styles.inputContainer}>
                      <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 text-lg" />
                      <input
                        type="text"
                        {...register('firstName', {
                          required: 'El nombre es requerido',
                          minLength: {
                            value: 2,
                            message: 'El nombre debe tener al menos 2 caracteres'
                          }
                        })}
                        className={`w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-gentle 
                                  focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none
                                  transition-all duration-300 placeholder-warm-400 text-warm-800 font-medium
                                  hover:bg-white/30 hover:shadow-soft
                                  ${errors.firstName ? 'border-red-400/70 hover:border-red-500/70' : 'border-rose-300/60 hover:border-rose-400/70'}`}
                        placeholder="Tu nombre"
                      />
                    </div>
                    {errors.firstName && (
                      <motion.p
                        className="mt-1 text-red-500 text-xs font-medium flex items-center space-x-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <FiAlertCircle className="text-xs" />
                        <span>{errors.firstName.message}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Campo Apellido */}
                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      Apellido
                    </label>
                    <div className={styles.inputContainer}>
                      <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 text-lg" />
                      <input
                        type="text"
                        {...register('lastName', {
                          required: 'El apellido es requerido',
                          minLength: {
                            value: 2,
                            message: 'El apellido debe tener al menos 2 caracteres'
                          }
                        })}
                        className={`w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-gentle 
                                  focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none
                                  transition-all duration-300 placeholder-warm-400 text-warm-800 font-medium
                                  hover:bg-white/30 hover:shadow-soft
                                  ${errors.lastName ? 'border-red-400/70 hover:border-red-500/70' : 'border-rose-300/60 hover:border-rose-400/70'}`}
                        placeholder="Tu apellido"
                      />
                    </div>
                    {errors.lastName && (
                      <motion.p
                        className="mt-1 text-red-500 text-xs font-medium flex items-center space-x-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <FiAlertCircle className="text-xs" />
                        <span>{errors.lastName.message}</span>
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* FILA 2: Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-warm-700 mb-2">
                    Email
                  </label>
                  <div className={styles.inputContainer}>
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 text-lg" />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'El email es requerido',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Ingresa un email válido'
                        }
                      })}
                      className={`w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-gentle 
                                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none
                                transition-all duration-300 placeholder-warm-400 text-warm-800 font-medium
                                hover:bg-white/30 hover:shadow-soft
                                ${errors.email ? 'border-red-400/70 hover:border-red-500/70' : 'border-rose-300/60 hover:border-rose-400/70'}`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      className="mt-1 text-red-500 text-xs font-medium flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <FiAlertCircle className="text-xs" />
                      <span>{errors.email.message}</span>
                    </motion.p>
                  )}
                </motion.div>

                {/* FILA 3: Contraseña + Confirmar Contraseña */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {/* Campo Password */}
                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      Contraseña
                    </label>
                    <div className={styles.inputContainer}>
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 text-lg" />
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register('password', {
                          required: 'La contraseña es requerida',
                          minLength: {
                            value: 6,
                            message: 'La contraseña debe tener al menos 6 caracteres'
                          }
                        })}
                        className={`w-full pl-12 pr-12 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-gentle 
                                  focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none
                                  transition-all duration-300 placeholder-warm-400 text-warm-800 font-medium
                                  hover:bg-white/30 hover:shadow-soft
                                  ${errors.password ? 'border-red-400/70 hover:border-red-500/70' : 'border-rose-300/60 hover:border-rose-400/70'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-primary transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        className="mt-1 text-red-500 text-xs font-medium flex items-center space-x-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <FiAlertCircle className="text-xs" />
                        <span>{errors.password.message}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Campo Confirmar Contraseña */}
                  <div>
                    <label className="block text-sm font-semibold text-warm-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className={styles.inputContainer}>
                      <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 text-lg" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register('confirmPassword', {
                          required: 'Confirma tu contraseña',
                          validate: (value) => {
                            const password = watch('password');
                            return password === value || 'Las contraseñas no coinciden';
                          }
                        })}
                        className={`w-full pl-12 pr-12 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-gentle 
                                  focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none
                                  transition-all duration-300 placeholder-warm-400 text-warm-800 font-medium
                                  hover:bg-white/30 hover:shadow-soft
                                  ${errors.confirmPassword ? 'border-red-400/70 hover:border-red-500/70' : 'border-rose-300/60 hover:border-rose-400/70'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        className="mt-1 text-red-500 text-xs font-medium flex items-center space-x-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <FiAlertCircle className="text-xs" />
                        <span>{errors.confirmPassword.message}</span>
                      </motion.p>
                    )}
                  </div>
                </motion.div>

                {/* FILA 4: Teléfono */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-warm-700 mb-2">
                    Teléfono <span className="text-warm-500 font-normal">(opcional)</span>
                  </label>
                  <div className={styles.inputContainer}>
                    <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400 text-lg" />
                    <input
                      type="tel"
                      {...register('phone')}
                      className={`w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border-2 rounded-gentle 
                                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none
                                transition-all duration-300 placeholder-warm-400 text-warm-800 font-medium
                                hover:bg-white/30 hover:shadow-soft
                                ${errors.phone ? 'border-red-400/70 hover:border-red-500/70' : 'border-rose-300/60 hover:border-rose-400/70'}`}
                      placeholder="999888777"
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      className="mt-1 text-red-500 text-xs font-medium flex items-center space-x-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <FiAlertCircle className="text-xs" />
                      <span>{errors.phone.message}</span>
                    </motion.p>
                  )}
                </motion.div>

                {/* Botón de Registro */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`${styles.submitButton} w-full bg-gradient-sunset text-white font-bold py-4 rounded-gentle
                            transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30
                            group relative overflow-hidden
                            ${isLoading 
                              ? 'opacity-75 cursor-not-allowed' 
                              : 'hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}</span>
                  </span>
                  {!isLoading && <div className={`${styles.buttonShimmer} group-hover:translate-x-[100%]`} />}
                </motion.button>
              </form>

              {/* Link a Login */}
              <motion.div
                className={styles.registerSection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <span className="text-warm-600 text-sm">
                  ¿Ya tienes cuenta?{' '}
                  <Link 
                    to="/iniciar-sesion" 
                    className="text-primary hover:text-primary-600 font-semibold transition-colors"
                  >
                    Inicia sesión aquí
                  </Link>
                </span>
              </motion.div>
            </div>
          </div>

          {/* Elementos decorativos adicionales cerca del formulario */}
          <motion.div
            className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-sunset rounded-xl opacity-60 blur-sm"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-8 h-8 bg-rose-400 rounded-lg opacity-40"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}