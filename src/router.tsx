import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

const HomePage = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProductosPage = lazy(() => import('./pages/Productos'));
const CartPage = lazy(() => import('./pages/Cart'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const MisOrdenesPage = lazy(() => import('./pages/MisOrdenes'));

// Componente para rutas protegidas (requieren autenticación)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-rose">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute - Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/iniciar-sesion" replace />;
  }

  console.log('✅ ProtectedRoute - Usuario autenticado, mostrando contenido protegido');
  return <>{children}</>;
}

// Componente para rutas públicas (solo accesibles sin autenticación)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🌍 PublicRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-rose">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('✅ PublicRoute - Usuario autenticado, redirigiendo a home');
    return <Navigate to="/" replace />;
  }

  console.log('🌍 PublicRoute - Usuario no autenticado, mostrando ruta pública');
  return <>{children}</>;
}

// Componente principal del router
function AppRouter() {
  const { loadUserFromToken } = useAuth();

  // ✅ ARREGLO: Array vacío para ejecutar solo al montar el componente
  // Cargar usuario desde token al inicializar la app
  useEffect(() => {
    console.log('🚀 AppRouter montado - Ejecutando loadUserFromToken()');
    loadUserFromToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Array vacío - solo ejecutar una vez al montar

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-rose">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-primary font-medium">Cargando...</p>
          </div>
        </div>
      }>
        <Routes>
          {/* RUTAS PROTEGIDAS - Solo si está autenticado */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          >
            {/* RUTAS ANIDADAS DENTRO DEL HOME */}
            
            {/* Ruta por defecto - Dashboard */}
            <Route index element={<DashboardPage />} />
            
            {/* Sección E-commerce */}
            <Route path="productos" element={<ProductosPage />} />
            <Route path="categorias" element={<div className="p-8"><h1 className="text-2xl font-bold">Categorías - Próximamente</h1></div>} />
            <Route path="carrito" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="mis-ordenes" element={<MisOrdenesPage />} />
            <Route path="wishlist" element={<div className="p-8"><h1 className="text-2xl font-bold">Lista de Deseos - Próximamente</h1></div>} />
            
            {/* Sección Social */}
            <Route path="feed" element={<div className="p-8"><h1 className="text-2xl font-bold">Feed Social - Próximamente</h1></div>} />
            <Route path="crear-post" element={<div className="p-8"><h1 className="text-2xl font-bold">Crear Post - Próximamente</h1></div>} />
            <Route path="mis-seguidores" element={<div className="p-8"><h1 className="text-2xl font-bold">Mis Seguidores - Próximamente</h1></div>} />
            <Route path="siguiendo" element={<div className="p-8"><h1 className="text-2xl font-bold">Siguiendo - Próximamente</h1></div>} />
            <Route path="descubrir" element={<div className="p-8"><h1 className="text-2xl font-bold">Descubrir - Próximamente</h1></div>} />
            
            {/* Sección Personal */}
            <Route path="mi-perfil" element={<div className="p-8"><h1 className="text-2xl font-bold">Mi Perfil - Próximamente</h1></div>} />
            <Route path="mis-direcciones" element={<div className="p-8"><h1 className="text-2xl font-bold">Mis Direcciones - Próximamente</h1></div>} />
            <Route path="mis-reseñas" element={<div className="p-8"><h1 className="text-2xl font-bold">Mis Reseñas - Próximamente</h1></div>} />
            <Route path="configuracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración - Próximamente</h1></div>} />
            
            {/* Sección Admin */}
            <Route path="admin/analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Analytics - Próximamente</h1></div>} />
            <Route path="admin/usuarios" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Usuarios - Próximamente</h1></div>} />
            <Route path="admin/productos" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Productos - Próximamente</h1></div>} />
            <Route path="admin/ordenes" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Órdenes - Próximamente</h1></div>} />
            <Route path="admin/moderacion" element={<div className="p-8"><h1 className="text-2xl font-bold">Admin Moderación - Próximamente</h1></div>} />
            
            {/* Sección Soporte */}
            <Route path="notificaciones" element={<div className="p-8"><h1 className="text-2xl font-bold">Notificaciones - Próximamente</h1></div>} />
            <Route path="ayuda" element={<div className="p-8"><h1 className="text-2xl font-bold">Ayuda - Próximamente</h1></div>} />
            <Route path="contacto" element={<div className="p-8"><h1 className="text-2xl font-bold">Contacto - Próximamente</h1></div>} />
          </Route>

          {/* RUTAS PÚBLICAS - Solo si NO está autenticado */}
          <Route path="/iniciar-sesion" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          
          <Route path="/crear-cuenta" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Ruta catch-all - redirige según estado de auth */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRouter;
