import { useEffect } from 'react';

// Configuración de títulos para cada vista
const PAGE_TITLES = {
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
  '/perfil': 'Destello Perú | Perfil de Usuario',
  
  // Auth
  '/iniciar-sesion': 'Destello Perú | Iniciar Sesión',
  '/crear-cuenta': 'Destello Perú | Crear Cuenta',
  
  // Fallback
  'default': 'Destello Perú | Plataforma Social de Compras'
} as const;

/**
 * Hook personalizado para manejar títulos de documento
 * @param customTitle - Título personalizado opcional
 */
export const useDocumentTitle = (customTitle?: string) => {
  useEffect(() => {
    // Si se proporciona un título personalizado, usarlo
    if (customTitle) {
      document.title = customTitle;
      return;
    }

    // Obtener la ruta actual
    const currentPath = window.location.pathname;
    
    // Buscar título específico para la ruta
    let title = PAGE_TITLES[currentPath as keyof typeof PAGE_TITLES];
    
    // Si no se encuentra título específico, buscar por coincidencia parcial
    if (!title) {
      const matchingKey = Object.keys(PAGE_TITLES).find(key => 
        key !== 'default' && currentPath.startsWith(key)
      );
      
      if (matchingKey) {
        title = PAGE_TITLES[matchingKey as keyof typeof PAGE_TITLES];
        
        // Para rutas dinámicas como /perfil/:userId
        if (matchingKey === '/perfil' && currentPath !== '/mi-perfil') {
          title = 'Destello Perú | Perfil de Usuario';
        }
      }
    }
    
    // Usar título por defecto si no se encuentra ninguno
    if (!title) {
      title = PAGE_TITLES.default;
    }
    
    document.title = title;
    
    // Cleanup no es necesario para document.title
  }, [customTitle]);
};

/**
 * Hook específico para títulos basados en rutas
 * Detecta automáticamente la ruta actual
 */
export const useRouteTitle = () => {
  useDocumentTitle();
};

/**
 * Función utilitaria para obtener el título de una ruta específica
 * @param path - Ruta para la cual obtener el título
 * @returns Título correspondiente a la ruta
 */
export const getTitleForRoute = (path: string): string => {
  const title = PAGE_TITLES[path as keyof typeof PAGE_TITLES];
  return title || PAGE_TITLES.default;
};

/**
 * Función utilitaria para establecer un título personalizado
 * @param title - Título personalizado a establecer
 */
export const setCustomTitle = (title: string) => {
  document.title = title;
}; 