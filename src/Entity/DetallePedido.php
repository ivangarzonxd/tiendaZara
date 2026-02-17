<?php

namespace App\Entity;

use App\Repository\DetallePedidoRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: DetallePedidoRepository::class)]
#[ORM\Table(name: 'detalle_pedido')]
class DetallePedido
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Pedido::class, inversedBy: 'detalles')]
    #[ORM\JoinColumn(name: 'id_pedido', referencedColumnName: 'id', nullable: false)]
    private ?Pedido $pedido = null;

    #[ORM\ManyToOne(targetEntity: Producto::class, inversedBy: 'detallesPedido')]
    #[ORM\JoinColumn(name: 'id_producto', referencedColumnName: 'id', nullable: false)]
    private ?Producto $producto = null;

    #[ORM\Column]
    private ?int $cantidad = null;

    #[ORM\Column(name: 'precio_unitario', type: 'decimal', precision: 10, scale: 2)]
    private ?string $precioUnitario = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPedido(): ?Pedido
    {
        return $this->pedido;
    }

    public function setPedido(?Pedido $pedido): static
    {
        $this->pedido = $pedido;
        return $this;
    }

    public function getProducto(): ?Producto
    {
        return $this->producto;
    }

    public function setProducto(?Producto $producto): static
    {
        $this->producto = $producto;
        return $this;
    }

    public function getCantidad(): ?int
    {
        return $this->cantidad;
    }

    public function setCantidad(int $cantidad): static
    {
        $this->cantidad = $cantidad;
        return $this;
    }

    public function getPrecioUnitario(): ?string
    {
        return $this->precioUnitario;
    }

    public function setPrecioUnitario(string $precioUnitario): static
    {
        $this->precioUnitario = $precioUnitario;
        return $this;
    }
}
