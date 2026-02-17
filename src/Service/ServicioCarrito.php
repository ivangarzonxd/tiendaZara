<?php

namespace App\Service;

use App\Entity\DetallePedido;
use App\Entity\Pedido;
use App\Entity\Usuario;
use App\Repository\ProductoRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Servicio para gestionar el carrito y finalizar compras
 */
class ServicioCarrito
{
    public function __construct(
        private EntityManagerInterface $gestor,
        private ProductoRepository $repositorioProductos,
    ) {}

    /**
     * Procesa un pedido a partir del JSON del carrito
     *
     * @param array $lineas Array de ['id_producto' => int, 'cantidad' => int]
     * @param Usuario $usuario Usuario autenticado
     * @param string|null $stripePaymentId ID del PaymentIntent de Stripe
     * @return Pedido El pedido creado
     * @throws \InvalidArgumentException Si hay datos inválidos
     */
    public function finalizarCompra(array $lineas, Usuario $usuario, ?string $stripePaymentId = null): Pedido
    {
        if (empty($lineas)) {
            throw new \InvalidArgumentException('El carrito está vacío');
        }

        $pedido = new Pedido();
        $pedido->setUsuario($usuario);
        $pedido->setFecha(new \DateTime());

        if ($stripePaymentId) {
            $pedido->setStripePaymentId($stripePaymentId);
        }

        $totalPedido = '0.00';

        foreach ($lineas as $linea) {
            $idProducto = $linea['id_producto'] ?? null;
            $cantidad   = $linea['cantidad'] ?? 0;

            if (!$idProducto || $cantidad <= 0) {
                throw new \InvalidArgumentException(
                    "Línea inválida: id_producto y cantidad son obligatorios"
                );
            }

            $producto = $this->repositorioProductos->find($idProducto);
            if (!$producto) {
                throw new \InvalidArgumentException(
                    "Producto con ID {$idProducto} no encontrado"
                );
            }

            $precioUnitario = $producto->getPrecio();
            $subtotal = bcmul($precioUnitario, (string) $cantidad, 2);

            $detalle = new DetallePedido();
            $detalle->setPedido($pedido);
            $detalle->setProducto($producto);
            $detalle->setCantidad($cantidad);
            $detalle->setPrecioUnitario($precioUnitario);

            $this->gestor->persist($detalle);
            $pedido->addDetalle($detalle);

            $totalPedido = bcadd($totalPedido, $subtotal, 2);
        }

        $pedido->setTotal($totalPedido);
        $this->gestor->persist($pedido);
        $this->gestor->flush();

        return $pedido;
    }
}
