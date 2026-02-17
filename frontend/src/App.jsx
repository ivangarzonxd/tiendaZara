import { CarritoProvider } from './context/CarritoContext';
import BarraNavegacion from './components/BarraNavegacion';
import ContenedorPrincipal from './components/ContenedorPrincipal';
import CarritoPanel from './components/CarritoPanel';
import AuthModal from './components/AuthModal';
import PieDePagina from './components/PieDePagina';

/**
 * Componente raíz de la aplicación.
 * Envuelve toda la UI en el CarritoProvider para estado global.
 */
export default function App() {
  return (
    <CarritoProvider>
      <BarraNavegacion />
      <ContenedorPrincipal />
      <PieDePagina />
      <CarritoPanel />
      <AuthModal />
    </CarritoProvider>
  );
}
