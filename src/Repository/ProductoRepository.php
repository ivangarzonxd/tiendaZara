<?php

namespace App\Repository;

use App\Entity\Producto;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Producto>
 */
class ProductoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registro)
    {
        parent::__construct($registro, Producto::class);
    }

    /**
     * Trae todos los productos con categoría y existencias en UNA sola query (evita N+1)
     */
    public function findAllConRelaciones(): array
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.categoria', 'c')->addSelect('c')
            ->leftJoin('p.existencias', 'e')->addSelect('e')
            ->orderBy('p.nombre', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
