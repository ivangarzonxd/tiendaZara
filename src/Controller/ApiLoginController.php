<?php

namespace App\Controller;

use App\Entity\Usuario;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoint de login para la API (JSON)
 */
class ApiLoginController extends AbstractController
{
    /**
     * POST /api/login
     * Body: {"email": "...", "password": "..."}
     * El firewall 'api' con json_login intercepta esta ruta
     */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        /** @var Usuario|null $usuario */
        $usuario = $this->getUser();

        if (!$usuario) {
            return $this->json(['error' => 'Credenciales inválidas'], 401);
        }

        return $this->json([
            'mensaje' => 'Login correcto',
            'usuario' => [
                'id'     => $usuario->getId(),
                'nombre' => $usuario->getNombre(),
                'email'  => $usuario->getEmail(),
                'rol'    => $usuario->getRol(),
            ],
        ]);
    }
}
