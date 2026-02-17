import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { crearIntentoPago } from '../services/api';

/**
 * Clave publicable de Stripe (test mode).
 * Carga la instancia de Stripe una sola vez.
 */
const stripePromise = loadStripe(
  'pk_test_51T15BiCSr8bl8x5TkM10OEmdiqUHHIKUv6P7oeRq74OPwGoGjSzt1T8hbGarJBepbe2XLAlx9V2qaMbykgKaDPBW00C60wmsED'
);

/**
 * Opciones de estilo del CardElement para que encaje con la estética ZARA.
 */
const opcionesCard = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#1a1a1a',
      letterSpacing: '0.03em',
      '::placeholder': {
        color: '#aaaaaa',
      },
    },
    invalid: {
      color: '#c62828',
    },
  },
  hidePostalCode: true,
};

/**
 * Formulario interno de pago con Stripe.
 * Usa el hook useStripe y useElements para confirmar el pago.
 *
 * @param {number} total - Importe total en euros
 * @param {Function} onPagoExitoso - Callback con el paymentIntentId
 * @param {Function} onCancelar - Volver al carrito
 */
function FormularioPago({ total, onPagoExitoso, onCancelar }) {
  const stripe = useStripe();
  const elements = useElements();
  const [procesando, setProcesando] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const manejarPago = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcesando(true);
    setErrorPago('');

    try {
      // 1. Pedir a Symfony que cree un PaymentIntent
      const { clientSecret } = await crearIntentoPago(total);

      // 2. Confirmar el pago con la tarjeta capturada
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        setErrorPago(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onPagoExitoso(paymentIntent.id);
      }
    } catch (err) {
      setErrorPago(err.message || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <form className="pago-stripe__formulario" onSubmit={manejarPago}>
      <h3 className="pago-stripe__titulo">Datos de pago</h3>
      <p className="pago-stripe__total-label">
        Total a pagar: <strong>{total} €</strong>
      </p>

      <div className="pago-stripe__card-contenedor">
        <CardElement options={opcionesCard} />
      </div>

      {errorPago && <p className="pago-stripe__error">{errorPago}</p>}

      <p className="pago-stripe__test-info">
        🔒 Modo test — Usa la tarjeta <strong>4242 4242 4242 4242</strong>, 
        fecha futura y CVC cualquiera.
      </p>

      <button
        className="pago-stripe__boton-pagar"
        type="submit"
        disabled={!stripe || procesando}
      >
        {procesando ? 'Procesando pago...' : `Pagar ${total} €`}
      </button>

      <button
        className="pago-stripe__boton-cancelar"
        type="button"
        onClick={onCancelar}
        disabled={procesando}
      >
        Volver a la cesta
      </button>
    </form>
  );
}

/**
 * Envoltorio con Elements de Stripe.
 * Se renderiza dentro del CarritoPanel cuando el usuario procede al pago.
 */
export default function PagoStripe({ total, onPagoExitoso, onCancelar }) {
  return (
    <Elements stripe={stripePromise}>
      <FormularioPago
        total={total}
        onPagoExitoso={onPagoExitoso}
        onCancelar={onCancelar}
      />
    </Elements>
  );
}
