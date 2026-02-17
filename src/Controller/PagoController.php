<?php

namespace App\Controller;

use App\Entity\Usuario;
use App\Service\ServicioCarrito;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Controlador de pagos con Stripe.
 * Gestiona la creación de PaymentIntents y la finalización de compras.
 */
class PagoController extends AbstractController
{
    private string $stripeSecretKey;

    public function __construct(string $stripeSecretKey = '')
    {
        $this->stripeSecretKey = $stripeSecretKey;
    }

    /**
     * POST /api/crear-intento-pago
     * Crea un PaymentIntent en Stripe y devuelve el clientSecret.
     * Body JSON: { "total": 125.50 }
     */
    #[Route('/api/crear-intento-pago', name: 'api_crear_intento_pago', methods: ['POST'])]
    public function crearIntentoPago(Request $peticion): JsonResponse
    {
        /** @var Usuario|null $usuario */
        $usuario = $this->getUser();
        if (!$usuario) {
            return $this->json(['error' => 'Debes iniciar sesión'], 401);
        }

        $datos = json_decode($peticion->getContent(), true);
        $total = $datos['total'] ?? null;

        if (!$total || $total <= 0) {
            return $this->json(['error' => 'Total inválido'], 400);
        }

        try {
            Stripe::setApiKey($this->stripeSecretKey);

            // Stripe trabaja en céntimos (integer)
            $cantidadCentimos = (int) round($total * 100);

            $intentoPago = PaymentIntent::create([
                'amount'   => $cantidadCentimos,
                'currency' => 'eur',
                'metadata' => [
                    'usuario_id'    => $usuario->getUserIdentifier(),
                    'usuario_email' => $usuario->getEmail(),
                ],
            ]);

            return $this->json([
                'clientSecret' => $intentoPago->client_secret,
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al crear el pago: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/finalizar-compra
     * Registra el pedido en BBDD tras confirmar el pago en Stripe.
     * Body JSON: { "lineas": [...], "paymentIntentId": "pi_xxx" }
     */
    #[Route('/api/finalizar-compra', name: 'api_finalizar_compra', methods: ['POST'])]
    public function finalizarCompra(Request $peticion, ServicioCarrito $servicioCarrito): JsonResponse
    {
        /** @var \App\Entity\Usuario|null $usuario */
        $usuario = $this->getUser();

        if (!$usuario) {
            return $this->json(['error' => 'Debes iniciar sesión para realizar pedidos'], 401);
        }

        $datos = json_decode($peticion->getContent(), true);

        if (!$datos || !isset($datos['lineas'])) {
            return $this->json(['error' => 'Formato inválido. Se espera: {"lineas": [...]}'], 400);
        }

        $paymentIntentId = $datos['paymentIntentId'] ?? null;

        // Verificar el pago en Stripe si se proporciona paymentIntentId
        if ($paymentIntentId) {
            try {
                Stripe::setApiKey($this->stripeSecretKey);
                $intent = PaymentIntent::retrieve($paymentIntentId);

                if ($intent->status !== 'succeeded') {
                    return $this->json(['error' => 'El pago no ha sido confirmado'], 400);
                }
            } catch (\Exception $e) {
                return $this->json(['error' => 'Error al verificar el pago'], 400);
            }
        }

        try {
            $pedido = $servicioCarrito->finalizarCompra($datos['lineas'], $usuario, $paymentIntentId);

            // Construir respuesta con detalles del pedido
            $detallesRespuesta = [];
            foreach ($pedido->getDetalles() as $detalle) {
                $detallesRespuesta[] = [
                    'producto'        => $detalle->getProducto()->getNombre(),
                    'cantidad'        => $detalle->getCantidad(),
                    'precio_unitario' => $detalle->getPrecioUnitario(),
                ];
            }

            return $this->json([
                'mensaje'       => 'Pedido registrado correctamente',
                'numero_pedido' => $pedido->getNumeroPedido(),
                'id_pedido'     => $pedido->getId(),
                'fecha'         => $pedido->getFecha()->format('d/m/Y H:i'),
                'total'         => $pedido->getTotal(),
                'detalles'      => $detallesRespuesta,
            ], 201);

        } catch (\InvalidArgumentException $excepcion) {
            return $this->json(['error' => $excepcion->getMessage()], 400);
        }
    }
}
