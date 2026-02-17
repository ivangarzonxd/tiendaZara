<?php

namespace App\Controller\Admin;

use App\Repository\CategoriaRepository;
use App\Repository\PedidoRepository;
use App\Repository\ProductoRepository;
use App\Repository\UsuarioRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminPanelController extends AbstractController
{
    /**
     * Panel principal del administrador
     */
    #[Route('/admin', name: 'admin_panel')]
    public function panel(
        ProductoRepository $repoProductos,
        CategoriaRepository $repoCategorias,
        PedidoRepository $repoPedidos,
        UsuarioRepository $repoUsuarios,
    ): Response {
        return $this->render('admin/panel.html.twig', [
            'totalProductos'  => count($repoProductos->findAll()),
            'totalCategorias' => count($repoCategorias->findAll()),
            'totalPedidos'    => count($repoPedidos->findAll()),
            'totalUsuarios'   => count($repoUsuarios->findAll()),
        ]);
    }
}
