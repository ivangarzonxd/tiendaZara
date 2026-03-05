import { useState, useContext, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { crearIntentoPago } from '../services/api';

/**
 * Clave publicable de Stripe (test mode).
 */
const stripePromise = loadStripe(
  'pk_test_51T15BiCSr8bl8x5TkM10OEmdiqUHHIKUv6P7oeRq74OPwGoGjSzt1T8hbGarJBepbe2XLAlx9V2qaMbykgKaDPBW00C60wmsED'
);

/**
 * Estilos del CardElement de Stripe.
 */
const opcionesCard = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#1a1a1a',
      letterSpacing: '0.03em',
      '::placeholder': { color: '#aaaaaa' },
    },
    invalid: { color: '#c62828' },
  },
  hidePostalCode: true,
};

/* ═══════════════════════════════════════════
   Formulario de pago embebido en checkout
   ═══════════════════════════════════════════ */
function FormularioCheckout({ datosEnvio, onDatosChange, items, totalPrecio, finalizarCompra, onPedidoExitoso, pedidoExitoso }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const envioGratis = useMemo(() => parseFloat(totalPrecio) >= 50, [totalPrecio]);
  const costoEnvio = envioGratis ? 0 : 4.95;
  const totalFinal = (parseFloat(totalPrecio) + costoEnvio).toFixed(2);

  /* Validar formulario antes de enviar */
  const formularioValido = () => {
    const { nombre, direccion, ciudad, cp, pais } = datosEnvio;
    return nombre.trim() && direccion.trim() && ciudad.trim() && cp.trim() && pais.trim();
  };

  /* Manejar pago + pedido */
  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !formularioValido()) return;

    setProcesando(true);
    setErrorPago('');

    try {
      // 1. Crear PaymentIntent en backend
      const { clientSecret } = await crearIntentoPago(totalFinal);

      // 2. Confirmar con la tarjeta
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: datosEnvio.nombre,
            email: datosEnvio.email || undefined,
          },
        },
      });

      if (error) {
        setErrorPago(error.message);
        setProcesando(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // 3. Finalizar compra en backend (registra pedido + envía email)
        const resultado = await finalizarCompra(paymentIntent.id, datosEnvio);
        onPedidoExitoso(resultado);
      }
    } catch (err) {
      setErrorPago(err.message || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  /* ── Formulario de checkout ── */
  return (
    <form className="checkout__form" onSubmit={manejarSubmit}>
      <div className="checkout__columnas">

        {/* ── Columna izquierda: Datos de envío ── */}
        <div className="checkout__envio">
          <h2 className="checkout__seccion-titulo">Dirección de envío</h2>

          <div className="checkout__campo">
            <label htmlFor="nombre">Nombre completo *</label>
            <input
              id="nombre" type="text" required
              value={datosEnvio.nombre}
              onChange={(e) => onDatosChange({ ...datosEnvio, nombre: e.target.value })}
              placeholder="Tu nombre y apellidos"
            />
          </div>

          <div className="checkout__campo">
            <label htmlFor="direccion">Dirección *</label>
            <input
              id="direccion" type="text" required
              value={datosEnvio.direccion}
              onChange={(e) => onDatosChange({ ...datosEnvio, direccion: e.target.value })}
              placeholder="Calle, número, piso..."
            />
          </div>

          <div className="checkout__campo-fila">
            <div className="checkout__campo">
              <label htmlFor="ciudad">Ciudad *</label>
              <input
                id="ciudad" type="text" required
                value={datosEnvio.ciudad}
                onChange={(e) => onDatosChange({ ...datosEnvio, ciudad: e.target.value })}
                placeholder="Ciudad"
              />
            </div>
            <div className="checkout__campo">
              <label htmlFor="cp">Código postal *</label>
              <input
                id="cp" type="text" required maxLength={10}
                value={datosEnvio.cp}
                onChange={(e) => onDatosChange({ ...datosEnvio, cp: e.target.value })}
                placeholder="33001"
              />
            </div>
          </div>

          <div className="checkout__campo-fila">
            <div className="checkout__campo">
              <label htmlFor="pais">País *</label>
              <input
                id="pais" type="text" required
                value={datosEnvio.pais}
                onChange={(e) => onDatosChange({ ...datosEnvio, pais: e.target.value })}
                placeholder="España"
              />
            </div>
            <div className="checkout__campo">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono" type="tel"
                value={datosEnvio.telefono}
                onChange={(e) => onDatosChange({ ...datosEnvio, telefono: e.target.value })}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>

          {/* ── Pago con Stripe ── */}
          <h2 className="checkout__seccion-titulo checkout__seccion-titulo--pago">
            Datos de pago
          </h2>

          <div className="checkout__stripe-card">
            <CardElement options={opcionesCard} />
          </div>

          <p className="checkout__test-info">
            🔒 Modo test — Usa <strong>4242 4242 4242 4242</strong>, fecha futura y CVC cualquiera.
          </p>

          {errorPago && <p className="checkout__error">{errorPago}</p>}
        </div>

        {/* ── Columna derecha: Resumen del pedido ── */}
        <div className="checkout__resumen">
          <h2 className="checkout__seccion-titulo">Tu pedido</h2>

          <div className="checkout__resumen-items">
            {items.map((item, idx) => (
              <div className="checkout__resumen-item" key={`${item.producto.id}-${item.talla}-${idx}`}>
                <img
                  className="checkout__resumen-img"
                  src={encodeURI(item.producto.fotoPrincipal)}
                  alt={item.producto.nombre}
                />
                <div className="checkout__resumen-item-info">
                  <p className="checkout__resumen-item-nombre">{item.producto.nombre}</p>
                  <p className="checkout__resumen-item-detalle">Talla: {item.talla} — ×{item.cantidad}</p>
                  <p className="checkout__resumen-item-precio">
                    {(parseFloat(item.producto.precio) * item.cantidad).toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout__resumen-lineas">
            <div className="checkout__resumen-linea">
              <span>Subtotal</span>
              <span>{totalPrecio} €</span>
            </div>
            <div className="checkout__resumen-linea">
              <span>Envío</span>
              <span className={envioGratis ? 'checkout__envio-gratis' : ''}>
                {envioGratis ? 'GRATIS' : `${costoEnvio.toFixed(2)} €`}
              </span>
            </div>
            {envioGratis && (
              <div className="checkout__resumen-badge">
                ✓ Envío gratuito en pedidos +50 €
              </div>
            )}
            <div className="checkout__resumen-total">
              <span>Total</span>
              <span>{totalFinal} €</span>
            </div>
          </div>

          <button
            className="checkout__boton-pagar"
            type="submit"
            disabled={!stripe || procesando || !formularioValido()}
          >
            {procesando ? 'Procesando pago...' : `Pagar ${totalFinal} €`}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════
   Página de checkout — envuelta en Elements
   ═══════════════════════════════════════════ */
export default function PaginaCheckout() {
  const { items, totalPrecio, usuario, abrirLoginModal, finalizarCompra } = useContext(CarritoContext);
  const navigate = useNavigate();

  const [datosEnvio, setDatosEnvio] = useState({
    nombre: usuario?.nombre || '',
    direccion: '',
    ciudad: '',
    cp: '',
    pais: 'España',
    telefono: '',
  });

  // Estado elevado: evita que el vaciado del carrito oculte la vista de éxito
  const [pedidoExitoso, setPedidoExitoso] = useState(null);

  /* Si ya hay pedido exitoso, mostrar confirmación (prioridad máxima) */
  if (pedidoExitoso) {
    return (
      <div className="checkout">
        <div className="checkout__exito">
          <div className="checkout__exito-icono">✓</div>
          <h2 className="checkout__exito-titulo">¡Pedido confirmado!</h2>
          <p className="checkout__exito-numero">Nº {pedidoExitoso.numero_pedido}</p>
          <p className="checkout__exito-mensaje">
            Hemos enviado un email de confirmación con los detalles de tu pedido.
          </p>
          <div className="checkout__exito-resumen">
            <span>Total pagado</span>
            <strong>{pedidoExitoso.total} €</strong>
          </div>
          <button className="checkout__exito-boton" onClick={() => navigate('/')}>
            Seguir comprando
          </button>
        </div>
      </div>
    );
  }

  /* Si no hay items, mostrar cesta vacía */
  if (items.length === 0) {
    return (
      <div className="checkout__vacio">
        <h2>Tu cesta está vacía</h2>
        <p>Añade productos antes de proceder al pago.</p>
        <button className="checkout__exito-boton" onClick={() => navigate('/')}>
          Ir a la tienda
        </button>
      </div>
    );
  }

  /* Si no hay usuario logueado */
  if (!usuario) {
    return (
      <div className="checkout__vacio">
        <h2>Inicia sesión</h2>
        <p>Necesitas iniciar sesión para completar tu compra.</p>
        <button className="checkout__exito-boton" onClick={abrirLoginModal}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout__breadcrumb">
        <Link to="/">Inicio</Link>
        <span> / </span>
        <span>Checkout</span>
      </div>

      <h1 className="checkout__titulo">Finalizar compra</h1>

      <Elements stripe={stripePromise}>
        <FormularioCheckout
          datosEnvio={datosEnvio}
          onDatosChange={setDatosEnvio}
          items={items}
          totalPrecio={totalPrecio}
          finalizarCompra={finalizarCompra}
          onPedidoExitoso={setPedidoExitoso}
          pedidoExitoso={pedidoExitoso}
        />
      </Elements>
    </div>
  );
}
