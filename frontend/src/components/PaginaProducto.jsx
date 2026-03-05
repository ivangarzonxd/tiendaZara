import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { obtenerProductoPorId } from '../services/api';

const aWebp = (ruta) => ruta?.replace(/\.jpg$/i, '.webp');

/**
 * Página de detalle de producto (ruta /producto/:id).
 * Usa useParams de React Router para obtener el ID del producto.
 * Carga los datos completos (con existencias) y permite añadir al carrito.
 */
export default function PaginaProducto() {
  const { id } = useParams();
  const { agregarAlCarrito, abrirCarrito } = useContext(CarritoContext);

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [anadido, setAnadido] = useState(false);

  /* ── Cargar producto al montar o cambiar de ID ── */
  useEffect(() => {
    setCargando(true);
    setError('');
    setTallaSeleccionada(null);
    setAnadido(false);
    window.scrollTo({ top: 0 });

    obtenerProductoPorId(id)
      .then(setProducto)
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setCargando(false));
  }, [id]);

  /* ── Añadir al carrito ── */
  const manejarAgregar = () => {
    if (!tallaSeleccionada) return;
    agregarAlCarrito(producto, tallaSeleccionada, 1);
    setAnadido(true);
    setTimeout(() => abrirCarrito(), 400);
  };

  /* ── Estado de carga ── */
  if (cargando) {
    return (
      <div className="pagina-producto__cargando">
        <p>Cargando producto...</p>
      </div>
    );
  }

  /* ── Error o producto no encontrado ── */
  if (error || !producto) {
    return (
      <div className="pagina-producto__error">
        <p>{error || 'Producto no encontrado'}</p>
        <Link to="/" className="pagina-producto__volver">
          ← Volver a la tienda
        </Link>
      </div>
    );
  }

  const existencias = producto.existencias || [];

  return (
    <section className="pagina-producto">
      {/* Breadcrumb de navegación */}
      <nav className="pagina-producto__breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <span>{producto.nombre}</span>
      </nav>

      <div className="pagina-producto__contenido">
        {/* ── Galería de imágenes ── */}
        <div className="pagina-producto__galeria">
          <picture>
            <source srcSet={encodeURI(aWebp(producto.fotoPrincipal))} type="image/webp" />
            <img
              className="pagina-producto__imagen"
              src={encodeURI(producto.fotoPrincipal)}
              alt={producto.nombre}
            />
          </picture>
          {producto.fotoHover && (
            <picture>
              <source srcSet={encodeURI(aWebp(producto.fotoHover))} type="image/webp" />
              <img
                className="pagina-producto__imagen pagina-producto__imagen--secundaria"
                src={encodeURI(producto.fotoHover)}
                alt={`${producto.nombre} – vista alternativa`}
              />
            </picture>
          )}
        </div>

        {/* ── Información del producto ── */}
        <div className="pagina-producto__info">
          <h1 className="pagina-producto__nombre">{producto.nombre}</h1>
          <p className="pagina-producto__precio">
            {parseFloat(producto.precio).toFixed(2)} €
          </p>

          {producto.descripcion && (
            <p className="pagina-producto__descripcion">{producto.descripcion}</p>
          )}

          {/* Selector de tallas */}
          {existencias.length > 0 && (
            <div className="pagina-producto__tallas-bloque">
              <p className="pagina-producto__tallas-titulo">Selecciona tu talla</p>
              <div className="pagina-producto__tallas">
                {existencias.map((ex) => {
                  const agotada = ex.cantidad === 0;
                  const activa = tallaSeleccionada === ex.talla;

                  return (
                    <button
                      key={ex.talla}
                      className={`pagina-producto__talla ${
                        activa ? 'pagina-producto__talla--activa' : ''
                      } ${agotada ? 'pagina-producto__talla--agotada' : ''}`}
                      disabled={agotada}
                      onClick={() => {
                        setTallaSeleccionada(ex.talla);
                        setAnadido(false);
                      }}
                    >
                      {ex.talla}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            className="pagina-producto__boton-carrito"
            disabled={!tallaSeleccionada}
            onClick={manejarAgregar}
          >
            {anadido
              ? '✓ Añadido a la cesta'
              : tallaSeleccionada
                ? 'Añadir a la cesta'
                : 'Selecciona una talla'}
          </button>

          <Link to="/" className="pagina-producto__seguir-comprando">
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </section>
  );
}
