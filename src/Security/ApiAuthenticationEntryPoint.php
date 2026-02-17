<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\EntryPoint\AuthenticationEntryPointInterface;

/**
 * Punto de entrada de autenticación para la API.
 * Devuelve siempre JSON 401 en vez de redirigir a un formulario de login.
 * Evita el error "<!-- Attempting to redirect..." cuando la sesión expira.
 */
class ApiAuthenticationEntryPoint implements AuthenticationEntryPointInterface
{
    public function start(Request $request, ?AuthenticationException $authException = null): Response
    {
        return new JsonResponse(
            ['error' => 'Debes iniciar sesión para acceder a este recurso'],
            Response::HTTP_UNAUTHORIZED
        );
    }
}
