<?php

namespace App\Entity;

use App\Repository\PedidoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PedidoRepository::class)]
#[ORM\Table(name: 'pedidos')]
class Pedido
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Usuario::class, inversedBy: 'pedidos')]
    #[ORM\JoinColumn(name: 'id_usuario', referencedColumnName: 'id', nullable: false)]
    private ?Usuario $usuario = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $fecha = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private ?string $total = null;

    #[ORM\Column(length: 10, unique: true)]
    private ?string $numeroPedido = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripePaymentId = null;

    /** @var Collection<int, DetallePedido> */
    #[ORM\OneToMany(targetEntity: DetallePedido::class, mappedBy: 'pedido')]
    private Collection $detalles;

    public function __construct()
    {
        $this->detalles = new ArrayCollection();
        $this->numeroPedido = '#' . str_pad((string) random_int(10000, 99999), 5, '0', STR_PAD_LEFT);
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuario(): ?Usuario
    {
        return $this->usuario;
    }

    public function setUsuario(?Usuario $usuario): static
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getFecha(): ?\DateTimeInterface
    {
        return $this->fecha;
    }

    public function setFecha(\DateTimeInterface $fecha): static
    {
        $this->fecha = $fecha;
        return $this;
    }

    public function getTotal(): ?string
    {
        return $this->total;
    }

    public function setTotal(string $total): static
    {
        $this->total = $total;
        return $this;
    }

    public function getNumeroPedido(): ?string
    {
        return $this->numeroPedido;
    }

    public function setNumeroPedido(string $numeroPedido): static
    {
        $this->numeroPedido = $numeroPedido;
        return $this;
    }

    public function getStripePaymentId(): ?string
    {
        return $this->stripePaymentId;
    }

    public function setStripePaymentId(?string $stripePaymentId): static
    {
        $this->stripePaymentId = $stripePaymentId;
        return $this;
    }

    /** @return Collection<int, DetallePedido> */
    public function getDetalles(): Collection
    {
        return $this->detalles;
    }

    public function addDetalle(DetallePedido $detalle): static
    {
        if (!$this->detalles->contains($detalle)) {
            $this->detalles->add($detalle);
            $detalle->setPedido($this);
        }
        return $this;
    }

    public function removeDetalle(DetallePedido $detalle): static
    {
        if ($this->detalles->removeElement($detalle)) {
            if ($detalle->getPedido() === $this) {
                $detalle->setPedido(null);
            }
        }
        return $this;
    }
}
