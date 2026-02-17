import { useState, useEffect } from 'react';
import {
  obtenerProductos,
  obtenerCategorias,
  obtenerProductosPorCategoria,
} from '../services/api';
import HeroVideo from './HeroVideo';
import SelectorCategorias from './SelectorCategorias';
import CuadriculaProductos from './CuadriculaProductos';
import DetalleProducto from './DetalleProducto';

/**
 * Componente contenedor principal.
 * Maneja el estado global de productos y la categoría seleccionada.
 * Al cambiar de categoría, solo se actualiza la cuadrícula (sin recarga).
 */
export default function ContenedorPrincipal() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [claveAnimacion, setClaveAnimacion] = useState(0);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  /* ── Carga inicial ── */
  useEffect(() => {
    Promise.all([obtenerProductos(), obtenerCategorias()])
      .then(([prods, cats]) => {
        setProductos(prods);
        setCategorias(cats);
      })
      .catch((err) => console.error('Error cargando catálogo:', err))
      .finally(() => setCargando(false));
  }, []);

  /* ── Cambio de categoría con transición suave ── */
  const seleccionarCategoria = async (id) => {
    setCargando(true);
    setCategoriaActiva(id);

    try {
      const prods = id
        ? await obtenerProductosPorCategoria(id)
        : await obtenerProductos();
      setProductos(prods);
      setClaveAnimacion((prev) => prev + 1);
    } catch (err) {
      console.error('Error filtrando productos:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <HeroVideo />

      <SelectorCategorias
        categorias={categorias}
        activa={categoriaActiva}
        onSeleccionar={seleccionarCategoria}
      />

      <CuadriculaProductos
        productos={productos}
        cargando={cargando}
        claveAnimacion={claveAnimacion}
        onProductoClick={setProductoSeleccionado}
      />

      {productoSeleccionado && (
        <DetalleProducto
          producto={productoSeleccionado}
          onCerrar={() => setProductoSeleccionado(null)}
        />
      )}
    </>
  );
}
