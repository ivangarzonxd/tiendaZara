<?php

namespace App\Controller\Admin;

use App\Entity\Producto;
use App\Form\ProductoType;
use App\Repository\ProductoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\String\Slugger\SluggerInterface;

#[Route('/admin/productos', name: 'admin_productos_')]
class AdminProductoController extends AbstractController
{
    /**
     * Listado de productos
     */
    #[Route('/', name: 'listar', methods: ['GET'])]
    public function listar(ProductoRepository $repositorio): Response
    {
        $productos = $repositorio->findAll();

        return $this->render('admin/productos/listar.html.twig', [
            'productos' => $productos,
        ]);
    }

    /**
     * Crear nuevo producto
     */
    #[Route('/nuevo', name: 'nuevo', methods: ['GET', 'POST'])]
    public function nuevo(
        Request $peticion,
        EntityManagerInterface $gestor,
        SluggerInterface $slugger,
    ): Response {
        $producto = new Producto();
        $formulario = $this->createForm(ProductoType::class, $producto);
        $formulario->handleRequest($peticion);

        if ($formulario->isSubmitted() && $formulario->isValid()) {
            $this->procesarImagen($formulario, $producto, $slugger);
            $gestor->persist($producto);
            $gestor->flush();

            $this->addFlash('exito', 'Producto creado correctamente');
            return $this->redirectToRoute('admin_productos_listar');
        }

        return $this->render('admin/productos/formulario.html.twig', [
            'formulario' => $formulario,
            'producto'   => $producto,
            'titulo'     => 'Nuevo Producto',
        ]);
    }

    /**
     * Editar producto existente
     */
    #[Route('/{id}/editar', name: 'editar', methods: ['GET', 'POST'])]
    public function editar(
        Producto $producto,
        Request $peticion,
        EntityManagerInterface $gestor,
        SluggerInterface $slugger,
    ): Response {
        $formulario = $this->createForm(ProductoType::class, $producto);
        $formulario->handleRequest($peticion);

        if ($formulario->isSubmitted() && $formulario->isValid()) {
            $this->procesarImagen($formulario, $producto, $slugger);
            $gestor->flush();

            $this->addFlash('exito', 'Producto actualizado correctamente');
            return $this->redirectToRoute('admin_productos_listar');
        }

        return $this->render('admin/productos/formulario.html.twig', [
            'formulario' => $formulario,
            'producto'   => $producto,
            'titulo'     => 'Editar: ' . $producto->getNombre(),
        ]);
    }

    /**
     * Eliminar producto
     */
    #[Route('/{id}/eliminar', name: 'eliminar', methods: ['POST'])]
    public function eliminar(Producto $producto, Request $peticion, EntityManagerInterface $gestor): Response
    {
        if ($this->isCsrfTokenValid('eliminar_' . $producto->getId(), $peticion->request->get('_token'))) {
            $gestor->remove($producto);
            $gestor->flush();
            $this->addFlash('exito', 'Producto eliminado');
        }

        return $this->redirectToRoute('admin_productos_listar');
    }

    /**
     * Procesa la subida de imagen: sanitiza el nombre y guarda en public/recursos/camisas/
     */
    private function procesarImagen($formulario, Producto $producto, SluggerInterface $slugger): void
    {
        $archivoFoto = $formulario->get('archivoFoto')->getData();

        if (!$archivoFoto) {
            return;
        }

        // Sanitizar nombre original del archivo
        $nombreOriginal = pathinfo($archivoFoto->getClientOriginalName(), PATHINFO_FILENAME);
        $nombreSeguro   = $slugger->slug($nombreOriginal)->lower();
        $extension      = $archivoFoto->guessExtension() ?? 'jpg';
        $nombreFinal    = $nombreSeguro . '.' . $extension;

        // Mover a public/recursos/camisas/
        $directorioDestino = $this->getParameter('kernel.project_dir') . '/public/recursos/camisas';

        try {
            $archivoFoto->move($directorioDestino, $nombreFinal);
            $producto->setFotoPrincipal($nombreFinal);
        } catch (FileException $excepcion) {
            $this->addFlash('error', 'Error al subir la imagen: ' . $excepcion->getMessage());
        }
    }
}
