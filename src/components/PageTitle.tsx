import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Configuración de títulos para cada vista
const PAGE_TITLES: Record<string, string> = {
  // Dashboard
  '/': 'Destello Perú | Dashboard',
  
  // E-commerce
  '/productos': 'Destello Perú | Productos',
  '/carrito': 'Destello Perú | Mi Carrito',
  '/checkout': 'Destello Perú | Checkout',
  '/mis-ordenes': 'Destello Perú | Mis Órdenes',
  '/wishlist': 'Destello Perú | Lista de Deseos',
  
  // Social
  '/feed': 'Destello Perú | Feed Social',
  '/crear-post': 'Destello Perú | Crear Post',
  '/mis-seguidores': 'Destello Perú | Mis Seguidores',
  '/siguiendo': 'Destello Perú | Siguiendo',
  '/descubrir': 'Destello Perú | Descubrir Usuarios',
  
  // Personal
  '/mi-perfil': 'Destello Perú | Mi Perfil',
  
  // Auth
  '/iniciar-sesion': 'Destello Perú | Iniciar Sesión',
  '/crear-cuenta': 'Destello Perú | Crear Cuenta',
};

// Título por defecto
const DEFAULT_TITLE = 'Destello Perú | Plataforma Social de Compras';

/**
 * Componente que actualiza automáticamente el título de la página
 * basándose en la ruta actual
 */
const PageTitle: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const updateTitle = () => {
      const currentPath = location.pathname;
      
      // Buscar título exacto
      let title = PAGE_TITLES[currentPath];
      
      // Si no se encuentra título exacto, buscar por coincidencia parcial
      if (!title) {
        // Para rutas dinámicas como /perfil/:userId
        if (currentPath.startsWith('/perfil/')) {
          title = 'Destello Perú | Perfil de Usuario';
        }
        // Para categorías de productos
        else if (currentPath.startsWith('/productos/categoria/')) {
          title = 'Destello Perú | Categoría de Productos';
        }
        // Para producto específico
        else if (currentPath.startsWith('/producto/')) {
          title = 'Destello Perú | Detalle del Producto';
        }
        // Para órdenes específicas
        else if (currentPath.startsWith('/orden/')) {
          title = 'Destello Perú | Detalle de Orden';
        }
        // Para posts específicos
        else if (currentPath.startsWith('/post/')) {
          title = 'Destello Perú | Ver Post';
        }
        // Para configuraciones
        else if (currentPath.startsWith('/configuracion')) {
          title = 'Destello Perú | Configuración';
        }
        // Para admin
        else if (currentPath.startsWith('/admin')) {
          title = 'Destello Perú | Panel de Administración';
        }
        // Agregar más casos especiales aquí si es necesario
      }
      
      // Usar título por defecto si no se encuentra ninguno
      if (!title) {
        title = DEFAULT_TITLE;
      }
      
      // Actualizar el título del documento
      document.title = title;
      
      // Log para debugging (opcional)
      console.log(`📄 Título actualizado: ${title} (Ruta: ${currentPath})`);
    };

    updateTitle();
  }, [location.pathname]);

  // Este componente no renderiza nada visible
  return null;
};

export default PageTitle; 