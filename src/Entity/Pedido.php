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

    /* ── Campos de envío ── */

    #[ORM\Column(length: 150)]
    private ?string $shippingNombre = null;

    #[ORM\Column(length: 255)]
    private ?string $shippingDireccion = null;

    #[ORM\Column(length: 100)]
    private ?string $shippingCiudad = null;

    #[ORM\Column(length: 10)]
    private ?string $shippingCp = null;

    #[ORM\Column(length: 100)]
    private ?string $shippingPais = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $shippingTelefono = null;

    /* ── Estado del pedido ── */

    #[ORM\Column(length: 30, options: ['default' => 'pending'])]
    private string $estado = 'pending';

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

    /* ── Getters/Setters de envío ── */

    public function getShippingNombre(): ?string
    {
        return $this->shippingNombre;
    }

    public function setShippingNombre(string $shippingNombre): static
    {
        $this->shippingNombre = $shippingNombre;
        return $this;
    }

    public function getShippingDireccion(): ?string
    {
        return $this->shippingDireccion;
    }

    public function setShippingDireccion(string $shippingDireccion): static
    {
        $this->shippingDireccion = $shippingDireccion;
        return $this;
    }

    public function getShippingCiudad(): ?string
    {
        return $this->shippingCiudad;
    }

    public function setShippingCiudad(string $shippingCiudad): static
    {
        $this->shippingCiudad = $shippingCiudad;
        return $this;
    }

    public function getShippingCp(): ?string
    {
        return $this->shippingCp;
    }

    public function setShippingCp(string $shippingCp): static
    {
        $this->shippingCp = $shippingCp;
        return $this;
    }

    public function getShippingPais(): ?string
    {
        return $this->shippingPais;
    }

    public function setShippingPais(string $shippingPais): static
    {
        $this->shippingPais = $shippingPais;
        return $this;
    }

    public function getShippingTelefono(): ?string
    {
        return $this->shippingTelefono;
    }

    public function setShippingTelefono(?string $shippingTelefono): static
    {
        $this->shippingTelefono = $shippingTelefono;
        return $this;
    }

    /* ── Getter/Setter de estado ── */

    public function getEstado(): string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): static
    {
        $this->estado = $estado;
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
