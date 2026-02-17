<?php

namespace App\Controller;

use App\Repository\CategoriaRepository;
use App\Repository\ProductoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * API pública para lectura de catálogo
 */
#[Route('/api', name: 'api_')]
class ApiController extends AbstractController
{
    /**
     * Devuelve todos los productos con su categoría, precio y rutas de imagen
     */
    #[Route('/productos', name: 'productos', methods: ['GET'])]
    public function listarProductos(ProductoRepository $repositorioProductos): JsonResponse
    {
        $productos = $repositorioProductos->findAllConRelaciones();
        $datos = [];

        foreach ($productos as $producto) {
            $datos[] = [
                'id'             => $producto->getId(),
                'nombre'         => $producto->getNombre(),
                'descripcion'    => $producto->getDescripcion(),
                'precio'         => $producto->getPrecio(),
                'categoria'      => [
                    'id'     => $producto->getCategoria()?->getId(),
                    'nombre' => $producto->getCategoria()?->getNombre(),
                ],
                'fotoPrincipal'  => '/recursos/camisas/' . $producto->getFotoPrincipal(),
                'fotoHover'      => '/recursos/camisas/' . $producto->getFotoHover(),
                'existencias'    => array_map(
                    fn($e) => ['talla' => $e->getTalla(), 'cantidad' => $e->getCantidad()],
                    $producto->getExistencias()->toArray()
                ),
            ];
        }

        return $this->json($datos);
    }

    /**
     * Devuelve la lista de categorías para el menú
     */
    #[Route('/categorias', name: 'categorias', methods: ['GET'])]
    public function listarCategorias(CategoriaRepository $repositorioCategorias): JsonResponse
    {
        $categorias = $repositorioCategorias->findAll();
        $datos = [];

        foreach ($categorias as $categoria) {
            $datos[] = [
                'id'              => $categoria->getId(),
                'nombre'          => $categoria->getNombre(),
                'totalProductos'  => $categoria->getProductos()->count(),
            ];
        }

        return $this->json($datos);
    }

    /**
     * Productos filtrados por categoría
     */
    #[Route('/categorias/{id}/productos', name: 'productos_por_categoria', methods: ['GET'])]
    public function productosPorCategoria(int $id, ProductoRepository $repositorioProductos): JsonResponse
    {
        $productos = $repositorioProductos->findBy(['categoria' => $id]);
        $datos = [];

        foreach ($productos as $producto) {
            $datos[] = [
                'id'             => $producto->getId(),
                'nombre'         => $producto->getNombre(),
                'descripcion'    => $producto->getDescripcion(),
                'precio'         => $producto->getPrecio(),
                'fotoPrincipal'  => '/recursos/camisas/' . $producto->getFotoPrincipal(),
                'fotoHover'      => '/recursos/camisas/' . $producto->getFotoHover(),
            ];
        }

        return $this->json($datos);
    }

    /**
     * Detalle de un producto individual
     */
    #[Route('/productos/{id}', name: 'producto_detalle', methods: ['GET'])]
    public function detalleProducto(int $id, ProductoRepository $repositorioProductos): JsonResponse
    {
        $producto = $repositorioProductos->find($id);

        if (!$producto) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        return $this->json([
            'id'             => $producto->getId(),
            'nombre'         => $producto->getNombre(),
            'descripcion'    => $producto->getDescripcion(),
            'precio'         => $producto->getPrecio(),
            'categoria'      => [
                'id'     => $producto->getCategoria()?->getId(),
                'nombre' => $producto->getCategoria()?->getNombre(),
            ],
            'fotoPrincipal'  => '/recursos/camisas/' . $producto->getFotoPrincipal(),
            'fotoHover'      => '/recursos/camisas/' . $producto->getFotoHover(),
            'existencias'    => array_map(
                fn($e) => ['talla' => $e->getTalla(), 'cantidad' => $e->getCantidad()],
                $producto->getExistencias()->toArray()
            ),
        ]);
    }
}
