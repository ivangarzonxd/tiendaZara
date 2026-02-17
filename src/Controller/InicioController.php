<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Este controlador ya no maneja la ruta raíz '/'.
 * La tienda React se sirve directamente desde public/index.html por Apache.
 * Se mantiene por si se necesitan rutas adicionales en el futuro.
 */
class InicioController extends AbstractController
{
}
