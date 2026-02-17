<?php

namespace App\Controller;

use App\Entity\Usuario;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoint de registro de usuarios vía API (JSON).
 */
class RegistroController extends AbstractController
{
    /**
     * POST /api/registro
     * Body JSON: { "nombre": "...", "email": "...", "password": "..." }
     * Crea un nuevo usuario con ROLE_USER y password hasheado.
     */
    #[Route('/api/registro', name: 'api_registro', methods: ['POST'])]
    public function registrar(
        Request $peticion,
        EntityManagerInterface $gestor,
        UserPasswordHasherInterface $hasher,
    ): JsonResponse {
        $datos = json_decode($peticion->getContent(), true);

        $nombre   = trim($datos['nombre'] ?? '');
        $email    = trim($datos['email'] ?? '');
        $password = $datos['password'] ?? '';

        // Validaciones
        if (!$nombre || !$email || !$password) {
            return $this->json([
                'error' => 'Todos los campos son obligatorios (nombre, email, password)',
            ], 400);
        }

        if (strlen($password) < 6) {
            return $this->json([
                'error' => 'La contraseña debe tener al menos 6 caracteres',
            ], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json([
                'error' => 'El formato del email no es válido',
            ], 400);
        }

        // Verificar email único
        $existente = $gestor->getRepository(Usuario::class)->findOneBy(['email' => $email]);
        if ($existente) {
            return $this->json([
                'error' => 'Ya existe una cuenta con este email',
            ], 409);
        }

        // Crear usuario
        $usuario = new Usuario();
        $usuario->setNombre($nombre);
        $usuario->setEmail($email);
        $usuario->setRol('ROLE_USER');
        $usuario->setPassword($hasher->hashPassword($usuario, $password));

        $gestor->persist($usuario);
        $gestor->flush();

        return $this->json([
            'mensaje' => 'Cuenta creada correctamente',
            'usuario' => [
                'id'     => $usuario->getId(),
                'nombre' => $usuario->getNombre(),
                'email'  => $usuario->getEmail(),
            ],
        ], 201);
    }
}
