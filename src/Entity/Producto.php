<?php

namespace App\Entity;

use App\Repository\ProductoRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductoRepository::class)]
#[ORM\Table(name: 'productos')]
class Producto
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    private ?string $nombre = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $descripcion = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private ?string $precio = null;

    #[ORM\ManyToOne(targetEntity: Categoria::class, inversedBy: 'productos')]
    #[ORM\JoinColumn(name: 'id_categoria', referencedColumnName: 'id', nullable: false)]
    private ?Categoria $categoria = null;

    #[ORM\Column(length: 255)]
    private ?string $fotoPrincipal = null;

    /** @var Collection<int, Existencia> */
    #[ORM\OneToMany(targetEntity: Existencia::class, mappedBy: 'producto')]
    private Collection $existencias;

    /** @var Collection<int, DetallePedido> */
    #[ORM\OneToMany(targetEntity: DetallePedido::class, mappedBy: 'producto')]
    private Collection $detallesPedido;

    public function __construct()
    {
        $this->existencias = new ArrayCollection();
        $this->detallesPedido = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    public function setNombre(string $nombre): static
    {
        $this->nombre = $nombre;
        return $this;
    }

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(?string $descripcion): static
    {
        $this->descripcion = $descripcion;
        return $this;
    }

    public function getPrecio(): ?string
    {
        return $this->precio;
    }

    public function setPrecio(string $precio): static
    {
        $this->precio = $precio;
        return $this;
    }

    public function getCategoria(): ?Categoria
    {
        return $this->categoria;
    }

    public function setCategoria(?Categoria $categoria): static
    {
        $this->categoria = $categoria;
        return $this;
    }

    public function getFotoPrincipal(): ?string
    {
        return $this->fotoPrincipal;
    }

    public function setFotoPrincipal(string $fotoPrincipal): static
    {
        $this->fotoPrincipal = $fotoPrincipal;
        return $this;
    }

    /**
     * Transforma foto_principal.jpg en foto_principal H.jpg
     * Ejemplo: CAMISA BORDADO.jpg → CAMISA BORDADO H.jpg
     */
    public function getFotoHover(): ?string
    {
        if ($this->fotoPrincipal === null) {
            return null;
        }

        $posicionPunto = strrpos($this->fotoPrincipal, '.');
        if ($posicionPunto === false) {
            return $this->fotoPrincipal . ' H';
        }

        $nombreBase = substr($this->fotoPrincipal, 0, $posicionPunto);
        $extension = substr($this->fotoPrincipal, $posicionPunto);

        return $nombreBase . ' H' . $extension;
    }

    /** @return Collection<int, Existencia> */
    public function getExistencias(): Collection
    {
        return $this->existencias;
    }

    public function addExistencia(Existencia $existencia): static
    {
        if (!$this->existencias->contains($existencia)) {
            $this->existencias->add($existencia);
            $existencia->setProducto($this);
        }
        return $this;
    }

    public function removeExistencia(Existencia $existencia): static
    {
        if ($this->existencias->removeElement($existencia)) {
            if ($existencia->getProducto() === $this) {
                $existencia->setProducto(null);
            }
        }
        return $this;
    }

    /** @return Collection<int, DetallePedido> */
    public function getDetallesPedido(): Collection
    {
        return $this->detallesPedido;
    }

    public function addDetallePedido(DetallePedido $detallePedido): static
    {
        if (!$this->detallesPedido->contains($detallePedido)) {
            $this->detallesPedido->add($detallePedido);
            $detallePedido->setProducto($this);
        }
        return $this;
    }

    public function removeDetallePedido(DetallePedido $detallePedido): static
    {
        if ($this->detallesPedido->removeElement($detallePedido)) {
            if ($detallePedido->getProducto() === $this) {
                $detallePedido->setProducto(null);
            }
        }
        return $this;
    }
}
