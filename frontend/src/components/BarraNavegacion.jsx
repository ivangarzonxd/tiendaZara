import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';

/**
 * Barra de navegación fija.
 * Sobre el hero (solo en /) → transparente con texto blanco.
 * En el resto de páginas o tras scroll → fondo blanco con texto negro.
 * Usa Link de React Router para la navegación entre vistas.
 */
export default function BarraNavegacion() {
  const { totalItems, abrirCarrito, usuario, abrirLoginModal, cerrarSesion } =
    useContext(CarritoContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [enHero, setEnHero] = useState(false);

  const esInicio = location.pathname === '/';

  useEffect(() => {
    if (!esInicio) {
      setEnHero(false);
      return;
    }

    const hero = document.querySelector('.hero-video');
    if (!hero) { setEnHero(false); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setEnHero(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [esInicio]);

  const modificador = enHero
    ? 'barra-navegacion--hero-visible'
    : 'barra-navegacion--scrolled';

  return (
    <header className={`barra-navegacion ${modificador}`}>
      <Link to="/" className="barra-navegacion__logo">
        ZARA
      </Link>

      <nav className="barra-navegacion__zona-derecha">
        {usuario ? (
          <>
            <span className="barra-navegacion__usuario-nombre">
              {usuario.nombre}
            </span>
            {usuario.rol === 'ROLE_ADMIN' && (
              <button
                className="barra-navegacion__enlace barra-navegacion__enlace--admin"
                onClick={() => navigate('/admin')}
              >
                Panel Admin
              </button>
            )}
            <button className="barra-navegacion__enlace" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <button className="barra-navegacion__enlace" onClick={abrirLoginModal}>
            Iniciar sesión
          </button>
        )}

        <button className="barra-navegacion__enlace" onClick={abrirCarrito}>
          Cesta{totalItems > 0 ? ` (${totalItems})` : ''}
        </button>
      </nav>
    </header>
  );
}
