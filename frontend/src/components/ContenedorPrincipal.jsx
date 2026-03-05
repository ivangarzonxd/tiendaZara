import { useState, useEffect, useMemo } from 'react';
import {
  obtenerProductos,
  obtenerCategorias,
  obtenerProductosPorCategoria,
} from '../services/api';
import HeroVideo from './HeroVideo';
import SelectorCategorias from './SelectorCategorias';
import CuadriculaProductos from './CuadriculaProductos';

/** Número de productos por página (cuadrícula 3×3) */
const PRODUCTOS_POR_PAGINA = 9;

/**
 * Página de inicio.
 * Hero → Categorías → Búsqueda → Cuadrícula paginada (3×3).
 * Incluye filtrado por categoría, búsqueda por texto y paginación.
 */
export default function ContenedorPrincipal() {
  const [todosProductos, setTodosProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [claveAnimacion, setClaveAnimacion] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  /* ── Carga inicial ── */
  useEffect(() => {
    Promise.all([obtenerProductos(), obtenerCategorias()])
      .then(([prods, cats]) => {
        setTodosProductos(prods);
        setCategorias(cats);
      })
      .catch((err) => console.error('Error cargando catálogo:', err))
      .finally(() => setCargando(false));
  }, []);

  /* ── Cambio de categoría con transición suave ── */
  const seleccionarCategoria = async (id) => {
    setCargando(true);
    setCategoriaActiva(id);
    setPaginaActual(1);
    setBusqueda('');

    try {
      const prods = id
        ? await obtenerProductosPorCategoria(id)
        : await obtenerProductos();
      setTodosProductos(prods);
      setClaveAnimacion((prev) => prev + 1);
    } catch (err) {
      console.error('Error filtrando productos:', err);
    } finally {
      setCargando(false);
    }
  };

  /* ── Filtrado por búsqueda ── */
  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return todosProductos;
    const termino = busqueda.toLowerCase().trim();
    return todosProductos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(termino) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino))
    );
  }, [todosProductos, busqueda]);

  /* ── Paginación ── */
  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);

  const productosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    return productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
  }, [productosFiltrados, paginaActual]);

  const cambiarPagina = (nueva) => {
    setPaginaActual(nueva);
    const tienda = document.getElementById('tienda');
    if (tienda) tienda.scrollIntoView({ behavior: 'smooth' });
  };

  const manejarBusqueda = (valor) => {
    setBusqueda(valor);
    setPaginaActual(1);
  };

  return (
    <>
      <HeroVideo />

      <SelectorCategorias
        categorias={categorias}
        activa={categoriaActiva}
        onSeleccionar={seleccionarCategoria}
      />

      {/* ── Barra de búsqueda ── */}
      <div className="barra-busqueda">
        <div className="barra-busqueda__contenedor">
          <span className="barra-busqueda__icono">⌕</span>
          <input
            type="text"
            className="barra-busqueda__input"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => manejarBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              className="barra-busqueda__limpiar"
              onClick={() => manejarBusqueda('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <CuadriculaProductos
        productos={productosPagina}
        cargando={cargando}
        claveAnimacion={claveAnimacion}
      />

      {/* ── Paginación ── */}
      {!cargando && totalPaginas > 1 && (
        <nav className="paginacion" aria-label="Paginación de productos">
          <button
            className="paginacion__boton"
            disabled={paginaActual === 1}
            onClick={() => cambiarPagina(paginaActual - 1)}
          >
            ← Anterior
          </button>

          <div className="paginacion__numeros">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`paginacion__numero ${
                  num === paginaActual ? 'paginacion__numero--activo' : ''
                }`}
                onClick={() => cambiarPagina(num)}
                aria-current={num === paginaActual ? 'page' : undefined}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            className="paginacion__boton"
            disabled={paginaActual === totalPaginas}
            onClick={() => cambiarPagina(paginaActual + 1)}
          >
            Siguiente →
          </button>
        </nav>
      )}

      {/* ── Info de resultados ── */}
      {!cargando && productosFiltrados.length > 0 && (
        <p className="paginacion__info">
          Mostrando{' '}
          {(paginaActual - 1) * PRODUCTOS_POR_PAGINA + 1}–
          {Math.min(paginaActual * PRODUCTOS_POR_PAGINA, productosFiltrados.length)}{' '}
          de {productosFiltrados.length} productos
        </p>
      )}
    </>
  );
}
