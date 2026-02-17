<?php

namespace App\Controller\Admin;

use App\Entity\Categoria;
use App\Form\CategoriaType;
use App\Repository\CategoriaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/admin/categorias', name: 'admin_categorias_')]
class AdminCategoriaController extends AbstractController
{
    /**
     * Listado de categorías
     */
    #[Route('/', name: 'listar', methods: ['GET'])]
    public function listar(CategoriaRepository $repositorio): Response
    {
        $categorias = $repositorio->findAll();

        return $this->render('admin/categorias/listar.html.twig', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Crear nueva categoría
     */
    #[Route('/nueva', name: 'nueva', methods: ['GET', 'POST'])]
    public function nueva(Request $peticion, EntityManagerInterface $gestor): Response
    {
        $categoria = new Categoria();
        $formulario = $this->createForm(CategoriaType::class, $categoria);
        $formulario->handleRequest($peticion);

        if ($formulario->isSubmitted() && $formulario->isValid()) {
            $gestor->persist($categoria);
            $gestor->flush();

            $this->addFlash('exito', 'Categoría creada correctamente');
            return $this->redirectToRoute('admin_categorias_listar');
        }

        return $this->render('admin/categorias/formulario.html.twig', [
            'formulario' => $formulario,
            'titulo'     => 'Nueva Categoría',
        ]);
    }

    /**
     * Editar categoría existente
     */
    #[Route('/{id}/editar', name: 'editar', methods: ['GET', 'POST'])]
    public function editar(Categoria $categoria, Request $peticion, EntityManagerInterface $gestor): Response
    {
        $formulario = $this->createForm(CategoriaType::class, $categoria);
        $formulario->handleRequest($peticion);

        if ($formulario->isSubmitted() && $formulario->isValid()) {
            $gestor->flush();

            $this->addFlash('exito', 'Categoría actualizada correctamente');
            return $this->redirectToRoute('admin_categorias_listar');
        }

        return $this->render('admin/categorias/formulario.html.twig', [
            'formulario' => $formulario,
            'titulo'     => 'Editar Categoría: ' . $categoria->getNombre(),
        ]);
    }

    /**
     * Eliminar categoría
     */
    #[Route('/{id}/eliminar', name: 'eliminar', methods: ['POST'])]
    public function eliminar(Categoria $categoria, Request $peticion, EntityManagerInterface $gestor): Response
    {
        if ($this->isCsrfTokenValid('eliminar_' . $categoria->getId(), $peticion->request->get('_token'))) {
            $gestor->remove($categoria);
            $gestor->flush();
            $this->addFlash('exito', 'Categoría eliminada');
        }

        return $this->redirectToRoute('admin_categorias_listar');
    }
}
