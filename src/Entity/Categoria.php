<?php

namespace App\Entity;

use App\Repository\CategoriaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CategoriaRepository::class)]
#[ORM\Table(name: 'categorias')]
class Categoria
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nombre = null;

    /** @var Collection<int, Producto> */
    #[ORM\OneToMany(targetEntity: Producto::class, mappedBy: 'categoria')]
    private Collection $productos;

    public function __construct()
    {
        $this->productos = new ArrayCollection();
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

    /** @return Collection<int, Producto> */
    public function getProductos(): Collection
    {
        return $this->productos;
    }

    public function addProducto(Producto $producto): static
    {
        if (!$this->productos->contains($producto)) {
            $this->productos->add($producto);
            $producto->setCategoria($this);
        }
        return $this;
    }

    public function removeProducto(Producto $producto): static
    {
        if ($this->productos->removeElement($producto)) {
            if ($producto->getCategoria() === $this) {
                $producto->setCategoria(null);
            }
        }
        return $this;
    }
}
