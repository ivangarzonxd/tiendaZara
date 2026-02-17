<?php

namespace App\Entity;

use App\Repository\ExistenciaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ExistenciaRepository::class)]
#[ORM\Table(name: 'existencias')]
class Existencia
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Producto::class, inversedBy: 'existencias')]
    #[ORM\JoinColumn(name: 'id_producto', referencedColumnName: 'id', nullable: false)]
    private ?Producto $producto = null;

    #[ORM\Column(length: 10)]
    private ?string $talla = null;

    #[ORM\Column]
    private ?int $cantidad = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getTalla(): ?string
    {
        return $this->talla;
    }

    public function setTalla(string $talla): static
    {
        $this->talla = $talla;
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
}
