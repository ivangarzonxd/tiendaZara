import TarjetaProducto from './TarjetaProducto';

/**
 * Cuadrícula de 3 columnas (desktop) que renderiza las TarjetaProducto.
 * Se desvanece mientras se cargan nuevos datos.
 */
export default function CuadriculaProductos({ productos, cargando, onProductoClick, claveAnimacion }) {
  return (
    <section className="cuadricula-productos">
      <div
        key={claveAnimacion}
        className={`cuadricula-productos__contenedor ${
          cargando ? 'cuadricula-productos__contenedor--cargando' : ''
        }`}
      >
        {!cargando && productos.length === 0 ? (
          <p className="cuadricula-productos__vacio">
            No se encontraron productos
          </p>
        ) : (
          productos.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              onClick={onProductoClick}
            />
          ))
        )}
      </div>
    </section>
  );
}
