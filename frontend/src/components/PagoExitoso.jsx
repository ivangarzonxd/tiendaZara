/**
 * Pantalla de pago exitoso.
 * Muestra el resumen del pedido con número, fecha, detalles y total.
 * Se renderiza dentro del CarritoPanel tras un pago confirmado.
 * Metodología BEM: bloque .pago-exito
 */
export default function PagoExitoso({ pedido, onCerrar }) {
  if (!pedido) return null;

  return (
    <div className="pago-exito">
      {/* Icono de confirmación */}
      <div className="pago-exito__icono">✓</div>

      <h3 className="pago-exito__titulo">¡Pedido confirmado!</h3>
      <p className="pago-exito__subtitulo">
        Gracias por tu compra. Recibirás un email de confirmación.
      </p>

      {/* Número de pedido */}
      <div className="pago-exito__numero">
        <span className="pago-exito__numero-label">Nº Pedido</span>
        <span className="pago-exito__numero-valor">{pedido.numero_pedido}</span>
      </div>

      {/* Fecha */}
      <p className="pago-exito__fecha">{pedido.fecha}</p>

      {/* Resumen de artículos */}
      <div className="pago-exito__resumen">
        {pedido.detalles?.map((det, i) => (
          <div className="pago-exito__linea" key={i}>
            <span className="pago-exito__linea-nombre">
              {det.producto} <span className="pago-exito__linea-cantidad">×{det.cantidad}</span>
            </span>
            <span className="pago-exito__linea-precio">
              {(parseFloat(det.precio_unitario) * det.cantidad).toFixed(2)} €
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pago-exito__total">
        <span>Total</span>
        <span>{parseFloat(pedido.total).toFixed(2)} €</span>
      </div>

      <button className="pago-exito__boton" onClick={onCerrar}>
        Seguir comprando
      </button>
    </div>
  );
}
