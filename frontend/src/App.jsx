import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import TopBanner from './components/TopBanner';
import BarraNavegacion from './components/BarraNavegacion';
import ContenedorPrincipal from './components/ContenedorPrincipal';
import PaginaProducto from './components/PaginaProducto';
import PaginaCheckout from './components/PaginaCheckout';
import PanelAdminWrapper from './components/PanelAdminWrapper';
import CarritoPanel from './components/CarritoPanel';
import AuthModal from './components/AuthModal';
import PieDePagina from './components/PieDePagina';

/**
 * Componente raíz de la aplicación.
 * Define las rutas principales y envuelve todo en el CarritoProvider.
 *
 * Rutas:
 *   /              → Página de inicio (hero + catálogo paginado)
 *   /producto/:id  → Detalle de producto
 *   /checkout      → Página de checkout (envío + pago)
 *   /admin         → Panel de administración (solo ROLE_ADMIN)
 */
function AppContenido() {
  const location = useLocation();
  const esAdmin = location.pathname === '/admin';

  return (
    <>
      {!esAdmin && <TopBanner />}
      <BarraNavegacion />

      <Routes>
        <Route path="/" element={<ContenedorPrincipal />} />
        <Route path="/producto/:id" element={<PaginaProducto />} />
        <Route path="/checkout" element={<PaginaCheckout />} />
        <Route path="/admin" element={<PanelAdminWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!esAdmin && <PieDePagina />}

      {/* Overlays globales (visibles en cualquier ruta) */}
      <CarritoPanel />
      <AuthModal />
    </>
  );
}

export default function App() {
  return (
    <CarritoProvider>
      <AppContenido />
    </CarritoProvider>
  );
}
