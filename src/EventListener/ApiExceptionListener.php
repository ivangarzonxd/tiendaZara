<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Captura TODAS las excepciones en rutas /api/* y devuelve JSON.
 * En producción, Symfony devuelve HTML por defecto para los errores 500.
 * Este listener garantiza que la API siempre responda con JSON limpio.
 */
#[AsEventListener(event: KernelEvents::EXCEPTION, priority: 200)]
class ApiExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $request = $event->getRequest();

        // Solo interceptar peticiones a la API
        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        $exception = $event->getThrowable();
        $statusCode = $exception instanceof HttpExceptionInterface
            ? $exception->getStatusCode()
            : 500;

        $response = new JsonResponse(
            ['error' => $exception->getMessage() ?: 'Error interno del servidor'],
            $statusCode
        );

        $event->setResponse($response);
    }
}
