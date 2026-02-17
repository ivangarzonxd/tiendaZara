import { useState, useEffect, useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';

/**
 * Barra de navegación fija.
 * Sobre el hero → transparente con texto blanco.
 * Tras scroll → fondo blanco con texto negro.
 */
export default function BarraNavegacion() {
  const { totalItems, abrirCarrito, usuario, abrirLoginModal, cerrarSesion } =
    useContext(CarritoContext);
  const [enHero, setEnHero] = useState(true);

  useEffect(() => {
    const hero = document.querySelector('.hero-video');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEnHero(entry.isIntersecting),
      { threshold: 0.05 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const modificador = enHero
    ? 'barra-navegacion--hero-visible'
    : 'barra-navegacion--scrolled';

  const irArriba = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`barra-navegacion ${modificador}`}>
      <a href="#" className="barra-navegacion__logo" onClick={irArriba}>
        ZARA
      </a>

      <nav className="barra-navegacion__zona-derecha">
        {usuario ? (
          <>
            <span className="barra-navegacion__usuario-nombre">
              {usuario.nombre}
            </span>
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
