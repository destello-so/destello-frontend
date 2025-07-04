import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import PageTitle from './components/PageTitle';

const HomePage = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProductosPage = lazy(() => import('./pages/Productos'));
const CartPage = lazy(() => import('./pages/Cart'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const MisOrdenesPage = lazy(() => import('./pages/MisOrdenes'));
const WishlistPage = lazy(() => import('./pages/Wishlist'));
const CreatePostPage = lazy(() => import('./pages/CreatePost'));
const DiscoverUsersPage = lazy(() => import('./pages/DiscoverUsers'));
const UserProfilePage = lazy(() => import('./pages/UserProfile'));
const MisSeguidoresPage = lazy(() => import('./pages/MisSeguidores'));
const SiguiendoPage = lazy(() => import('./pages/Siguiendo'));

// Componente wrapper para páginas protegidas con layout
function ProtectedPageWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔒 ProtectedPageWrapper - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

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
    console.log('🚫 ProtectedPageWrapper - Usuario no autenticado, redirigiendo a login');
    return <Navigate to="/iniciar-sesion" replace />;
  }

  console.log('✅ ProtectedPageWrapper - Usuario autenticado, mostrando contenido protegido');
  return (
    <HomePage>
      {children}
    </HomePage>
  );
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

  // Cargar usuario desde token al inicializar la app
  useEffect(() => {
    console.log('🚀 AppRouter montado - Ejecutando loadUserFromToken()');
    loadUserFromToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío - solo ejecutar una vez al montar

  return (
    <BrowserRouter>
      {/* Componente para manejar títulos automáticamente */}
      <PageTitle />
      
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-rose">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-primary font-medium">Cargando...</p>
          </div>
        </div>
      }>
        <Routes>
          {/* RUTAS PROTEGIDAS CON LAYOUT - Cada ruta es independiente */}
          
          {/* Dashboard - Ruta principal */}
          <Route 
            path="/" 
            element={
              <ProtectedPageWrapper>
                <DashboardPage />
              </ProtectedPageWrapper>
            }
          />
          
          {/* Sección E-commerce */}
          <Route 
            path="/productos" 
            element={
              <ProtectedPageWrapper>
                <ProductosPage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/carrito" 
            element={
              <ProtectedPageWrapper>
                <CartPage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/checkout" 
            element={
              <ProtectedPageWrapper>
                <CheckoutPage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/mis-ordenes" 
            element={
              <ProtectedPageWrapper>
                <MisOrdenesPage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/wishlist" 
            element={
              <ProtectedPageWrapper>
                <WishlistPage />
              </ProtectedPageWrapper>
            }
          />
          
          {/* Sección Social */}
          <Route 
            path="/feed" 
            element={
              <ProtectedPageWrapper>
                <div className="p-8"><h1 className="text-2xl font-bold">Feed Social - Próximamente</h1></div>
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/crear-post" 
            element={
              <ProtectedPageWrapper>
                <CreatePostPage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/mis-seguidores" 
            element={
              <ProtectedPageWrapper>
                <MisSeguidoresPage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/siguiendo" 
            element={
              <ProtectedPageWrapper>
                <SiguiendoPage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/descubrir" 
            element={
              <ProtectedPageWrapper>
                <DiscoverUsersPage />
              </ProtectedPageWrapper>
            }
          />
          
          {/* Sección Personal */}
          <Route 
            path="/mi-perfil" 
            element={
              <ProtectedPageWrapper>
                <UserProfilePage />
              </ProtectedPageWrapper>
            }
          />
          
          <Route 
            path="/perfil/:userId" 
            element={
              <ProtectedPageWrapper>
                <UserProfilePage />
              </ProtectedPageWrapper>
            }
          />

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
