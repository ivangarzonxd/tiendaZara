<?php

namespace App\Repository;

use App\Entity\DetallePedido;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DetallePedido>
 */
class DetallePedidoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registro)
    {
        parent::__construct($registro, DetallePedido::class);
    }
}
