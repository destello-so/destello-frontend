import React from 'react';

/**
 * Componente de demostración para mostrar los títulos implementados
 * Solo para propósitos de desarrollo/testing
 */
const TitleDemo: React.FC = () => {
  const routes = [
    { path: '/', title: 'Destello Perú | Dashboard' },
    { path: '/productos', title: 'Destello Perú | Productos' },
    { path: '/carrito', title: 'Destello Perú | Mi Carrito' },
    { path: '/checkout', title: 'Destello Perú | Checkout' },
    { path: '/mis-ordenes', title: 'Destello Perú | Mis Órdenes' },
    { path: '/wishlist', title: 'Destello Perú | Lista de Deseos' },
    { path: '/feed', title: 'Destello Perú | Feed Social' },
    { path: '/crear-post', title: 'Destello Perú | Crear Post' },
    { path: '/mis-seguidores', title: 'Destello Perú | Mis Seguidores' },
    { path: '/siguiendo', title: 'Destello Perú | Siguiendo' },
    { path: '/descubrir', title: 'Destello Perú | Descubrir Usuarios' },
    { path: '/mi-perfil', title: 'Destello Perú | Mi Perfil' },
    { path: '/perfil/123', title: 'Destello Perú | Perfil de Usuario' },
    { path: '/iniciar-sesion', title: 'Destello Perú | Iniciar Sesión' },
    { path: '/crear-cuenta', title: 'Destello Perú | Crear Cuenta' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🏷️ Sistema de Títulos Implementado
      </h2>
      <p className="text-gray-600 mb-6">
        Cada vista tiene ahora un título personalizado que se actualiza automáticamente:
      </p>
      
      <div className="grid gap-3">
        {routes.map((route, index) => (
          <div 
            key={index}
            className="flex justify-between items-center p-3 bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg border border-rose-200"
          >
            <code className="text-sm font-mono text-purple-700 bg-white px-2 py-1 rounded">
              {route.path}
            </code>
            <span className="text-sm font-medium text-gray-700">
              {route.title}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">✅ Características:</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Títulos automáticos basados en la ruta actual</li>
          <li>• Soporte para rutas dinámicas (/perfil/:userId)</li>
          <li>• Actualización en tiempo real al navegar</li>
          <li>• Título por defecto para rutas no definidas</li>
          <li>• SEO mejorado para cada página</li>
        </ul>
      </div>
    </div>
  );
};

export default TitleDemo; 