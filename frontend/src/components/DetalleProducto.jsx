import { useState, useEffect, useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { obtenerProductoPorId } from '../services/api';

const aWebp = (ruta) => ruta?.replace(/\.jpg$/i, '.webp');

/**
 * Modal de detalle de producto.
 * Carga las existencias completas y permite seleccionar talla
 * antes de añadir al carrito.
 */
export default function DetalleProducto({ producto, onCerrar }) {
  const { agregarAlCarrito, abrirCarrito } = useContext(CarritoContext);

  const [productoCompleto, setProductoCompleto] = useState(null);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);

  /* Cargar detalle completo (con existencias) */
  useEffect(() => {
    setCargando(true);
    setTallaSeleccionada(null);

    obtenerProductoPorId(producto.id)
      .then((datos) => setProductoCompleto(datos))
      .catch(() => setProductoCompleto(producto))
      .finally(() => setCargando(false));
  }, [producto]);

  /* Cerrar con Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCerrar]);

  const manejarAgregar = () => {
    if (!tallaSeleccionada) return;
    agregarAlCarrito(productoCompleto || producto, tallaSeleccionada, 1);
    onCerrar();
    abrirCarrito();
  };

  const existencias = productoCompleto?.existencias || [];

  return (
    <div className="detalle-producto__overlay" onClick={onCerrar}>
      <div className="detalle-producto" onClick={(e) => e.stopPropagation()}>
        <button className="detalle-producto__cerrar" onClick={onCerrar}>
          ✕
        </button>

        {cargando ? (
          <div className="detalle-producto__cargando">Cargando...</div>
        ) : (
          <>
            {/* Imagen */}
            <div className="detalle-producto__imagen-contenedor">
              <picture>
                <source srcSet={encodeURI(aWebp(producto.fotoPrincipal))} type="image/webp" />
                <img
                  className="detalle-producto__imagen"
                  src={encodeURI(producto.fotoPrincipal)}
                  alt={producto.nombre}
                />
              </picture>
            </div>

            {/* Info */}
            <div className="detalle-producto__info">
              <h2 className="detalle-producto__nombre">{producto.nombre}</h2>
              {productoCompleto?.descripcion && (
                <p className="detalle-producto__descripcion">
                  {productoCompleto.descripcion}
                </p>
              )}
              <p className="detalle-producto__precio">
                {parseFloat(producto.precio).toFixed(2)} €
              </p>

              {/* Selector de tallas */}
              {existencias.length > 0 && (
                <>
                  <p className="detalle-producto__tallas-titulo">
                    Selecciona tu talla
                  </p>
                  <div className="detalle-producto__tallas">
                    {existencias.map((ex) => {
                      const agotada = ex.cantidad === 0;
                      const activa = tallaSeleccionada === ex.talla;

                      return (
                        <button
                          key={ex.talla}
                          className={`detalle-producto__talla ${
                            activa ? 'detalle-producto__talla--activa' : ''
                          } ${agotada ? 'detalle-producto__talla--agotada' : ''}`}
                          disabled={agotada}
                          onClick={() => setTallaSeleccionada(ex.talla)}
                        >
                          {ex.talla}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <button
                className="detalle-producto__boton-carrito"
                disabled={!tallaSeleccionada}
                onClick={manejarAgregar}
              >
                {tallaSeleccionada ? 'Añadir a la cesta' : 'Selecciona una talla'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
