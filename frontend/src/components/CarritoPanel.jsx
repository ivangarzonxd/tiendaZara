import { useContext, useState } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import PagoStripe from './PagoStripe';
import PagoExitoso from './PagoExitoso';

/**
 * Panel lateral del carrito (slide-in).
 * Flujo: Carrito -> Pago Stripe -> Pedido confirmado.
 * Metodologia BEM: bloque .carrito-panel
 */
export default function CarritoPanel() {
  const {
    items, carritoAbierto, cerrarCarrito, eliminarDelCarrito,
    actualizarCantidad, totalPrecio, usuario, abrirLoginModal, finalizarCompra,
  } = useContext(CarritoContext);

  // 'carrito' | 'pago' | 'exito'
  const [vista, setVista] = useState('carrito');
  const [mensajeError, setMensajeError] = useState('');
  const [pedidoInfo, setPedidoInfo] = useState(null);

  /* -- Iniciar flujo de pago -- */
  const irAPago = () => {
    if (!usuario) {
      cerrarCarrito();
      abrirLoginModal();
      return;
    }
    setMensajeError('');
    setVista('pago');
  };

  /* -- Stripe confirma pago -> registrar pedido en backend -- */
  const manejarPagoExitoso = async (paymentIntentId) => {
    try {
      const resultado = await finalizarCompra(paymentIntentId);
      setPedidoInfo(resultado);
      setVista('exito');
    } catch (err) {
      setMensajeError(err.message);
      setVista('carrito');
    }
  };

  /* -- Cerrar el panel -- */
  const cerrar = () => {
    cerrarCarrito();
    setTimeout(() => {
      setVista('carrito');
      setPedidoInfo(null);
      setMensajeError('');
    }, 400);
  };

  return (
    <>
      <div
        className={`carrito-panel__overlay ${carritoAbierto ? 'carrito-panel__overlay--visible' : ''}`}
        onClick={cerrar}
      />
      <aside className={`carrito-panel ${carritoAbierto ? 'carrito-panel--abierto' : ''}`}>
        {/* Cabecera */}
        <div className="carrito-panel__cabecera">
          <h2 className="carrito-panel__titulo">
            {vista === 'pago' ? 'Pago seguro' : vista === 'exito' ? 'Pedido confirmado' : 'Tu cesta'}
          </h2>
          <button className="carrito-panel__cerrar" onClick={cerrar}>&#10005;</button>
        </div>

        {/* Contenido dinamico */}
        <div className="carrito-panel__lista">

          {/* VISTA: Pago exitoso */}
          {vista === 'exito' && (
            <PagoExitoso pedido={pedidoInfo} onCerrar={cerrar} />
          )}

          {/* VISTA: Formulario de pago Stripe */}
          {vista === 'pago' && (
            <PagoStripe
              total={totalPrecio}
              onPagoExitoso={manejarPagoExitoso}
              onCancelar={() => setVista('carrito')}
            />
          )}

          {/* VISTA: Lista del carrito */}
          {vista === 'carrito' && (
            items.length === 0 ? (
              <p className="carrito-panel__vacio">Tu cesta esta vacia</p>
            ) : (
              items.map((item, idx) => (
                <div className="carrito-panel__item" key={`${item.producto.id}-${item.talla}-${idx}`}>
                  <img
                    className="carrito-panel__item-imagen"
                    src={encodeURI(item.producto.fotoPrincipal)}
                    alt={item.producto.nombre}
                  />
                  <div className="carrito-panel__item-info">
                    <p className="carrito-panel__item-nombre">{item.producto.nombre}</p>
                    <p className="carrito-panel__item-detalle">Talla: {item.talla}</p>
                    <div className="carrito-panel__item-cantidad">
                      <button onClick={() => actualizarCantidad(idx, item.cantidad - 1)}>&#8722;</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(idx, item.cantidad + 1)}>+</button>
                    </div>
                    <div className="carrito-panel__item-fila-inferior">
                      <span className="carrito-panel__item-precio">
                        {(parseFloat(item.producto.precio) * item.cantidad).toFixed(2)} EUR
                      </span>
                      <button className="carrito-panel__item-eliminar" onClick={() => eliminarDelCarrito(idx)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Pie del carrito */}
        {vista === 'carrito' && items.length > 0 && (
          <div className="carrito-panel__pie">
            {mensajeError && <p className="carrito-panel__mensaje-error">{mensajeError}</p>}
            <div className="carrito-panel__total">
              <span>Total</span>
              <span>{totalPrecio} EUR</span>
            </div>
            <button className="carrito-panel__boton-comprar" onClick={irAPago}>
              {usuario ? 'Proceder al pago' : 'Iniciar sesion para comprar'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
