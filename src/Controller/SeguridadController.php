<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SeguridadController extends AbstractController
{
    #[Route('/login', name: 'app_login')]
    public function login(AuthenticationUtils $utilidadesAuth): Response
    {
        // Si ya está logueado, redirigir
        if ($this->getUser()) {
            if ($this->isGranted('ROLE_ADMIN')) {
                return $this->redirectToRoute('admin_panel');
            }
            return $this->redirectToRoute('app_inicio');
        }

        $error = $utilidadesAuth->getLastAuthenticationError();
        $ultimoEmail = $utilidadesAuth->getLastUsername();

        return $this->render('seguridad/login.html.twig', [
            'ultimo_email' => $ultimoEmail,
            'error'        => $error,
        ]);
    }

    #[Route('/logout', name: 'app_logout')]
    public function logout(): void
    {
        // Symfony intercepta esta ruta automáticamente
        throw new \LogicException('Este método nunca debería ejecutarse.');
    }
}
