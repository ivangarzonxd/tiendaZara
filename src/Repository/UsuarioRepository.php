<?php

namespace App\Repository;

use App\Entity\Usuario;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

/**
 * @extends ServiceEntityRepository<Usuario>
 */
class UsuarioRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registro)
    {
        parent::__construct($registro, Usuario::class);
    }

    public function upgradePassword(PasswordAuthenticatedUserInterface $usuario, string $nuevoPasswordHasheado): void
    {
        if (!$usuario instanceof Usuario) {
            throw new UnsupportedUserException(sprintf('Instancias de "%s" no están soportadas.', $usuario::class));
        }

        $usuario->setPassword($nuevoPasswordHasheado);
        $this->getEntityManager()->persist($usuario);
        $this->getEntityManager()->flush();
    }
}
