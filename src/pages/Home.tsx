import Sidebar from '../components/Sidebar';

interface HomeProps {
  children: React.ReactNode;
}

export default function Home({ children }: HomeProps) {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* SIDEBAR - 30% del ancho, altura completa */}
      <Sidebar />
      
      {/* ÁREA PRINCIPAL - 70% del ancho, altura completa con scroll */}
      <main className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 relative">
        {/* Efectos de fondo sutiles para el área principal */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full blur-3xl" />
        </div>
        
        {/* Contenido dinámico basado en children */}
        <div className="relative z-10 p-8 h-full">
          {/* Aquí se renderizarán las diferentes vistas según la ruta */}
          {children}
        </div>
      </main>
    </div>
  );
} 