<?php

namespace App\Controller;

use App\Entity\Categoria;
use App\Entity\Existencia;
use App\Entity\Producto;
use App\Repository\CategoriaRepository;
use App\Repository\PedidoRepository;
use App\Repository\ProductoRepository;
use App\Repository\UsuarioRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * API JSON para el panel de administración.
 * Todas las rutas requieren ROLE_ADMIN (configurado en security.yaml).
 */
#[Route('/api/admin', name: 'api_admin_')]
class AdminApiController extends AbstractController
{
    /* ══════════════════════════════════════
       DASHBOARD — Resumen general
       ══════════════════════════════════════ */

    #[Route('/resumen', name: 'resumen', methods: ['GET'])]
    public function resumen(
        ProductoRepository $repoProductos,
        CategoriaRepository $repoCategorias,
        PedidoRepository $repoPedidos,
        UsuarioRepository $repoUsuarios,
    ): JsonResponse {
        $pedidos = $repoPedidos->findAll();
        $ingresos = array_reduce($pedidos, fn($sum, $p) => $sum + (float) $p->getTotal(), 0);

        return $this->json([
            'total_productos'  => count($repoProductos->findAll()),
            'total_categorias' => count($repoCategorias->findAll()),
            'total_pedidos'    => count($pedidos),
            'total_usuarios'   => count($repoUsuarios->findAll()),
            'ingresos_totales' => $ingresos,
        ]);
    }

    /* ══════════════════════════════════════
       PEDIDOS — Solo lectura
       ══════════════════════════════════════ */

    #[Route('/pedidos', name: 'pedidos', methods: ['GET'])]
    public function listarPedidos(PedidoRepository $repoPedidos): JsonResponse
    {
        $pedidos = $repoPedidos->findBy([], ['fecha' => 'DESC']);
        $datos = [];

        foreach ($pedidos as $pedido) {
            $detalles = [];
            foreach ($pedido->getDetalles() as $detalle) {
                $detalles[] = [
                    'producto'        => $detalle->getProducto()?->getNombre(),
                    'cantidad'        => $detalle->getCantidad(),
                    'precio_unitario' => $detalle->getPrecioUnitario(),
                ];
            }

            $datos[] = [
                'id'             => $pedido->getId(),
                'numero_pedido'  => $pedido->getNumeroPedido(),
                'fecha'          => $pedido->getFecha()?->format('c'),
                'total'          => $pedido->getTotal(),
                'usuario'        => $pedido->getUsuario()?->getNombre(),
                'email'          => $pedido->getUsuario()?->getEmail(),
                'detalles'       => $detalles,
            ];
        }

        return $this->json($datos);
    }

    /* ══════════════════════════════════════
       PRODUCTOS — CRUD completo
       ══════════════════════════════════════ */

    #[Route('/productos', name: 'productos', methods: ['GET'])]
    public function listarProductos(ProductoRepository $repo): JsonResponse
    {
        $productos = $repo->findAllConRelaciones();
        $datos = [];

        foreach ($productos as $p) {
            $datos[] = $this->serializarProducto($p);
        }

        return $this->json($datos);
    }

    #[Route('/productos', name: 'crear_producto', methods: ['POST'])]
    public function crearProducto(Request $peticion, EntityManagerInterface $em, CategoriaRepository $repoCat): JsonResponse
    {
        $nombre      = $peticion->request->get('nombre', '');
        $descripcion = $peticion->request->get('descripcion', '');
        $precio      = $peticion->request->get('precio', '0');
        $categoriaId = $peticion->request->get('categoria_id');

        if (!$nombre || !$precio || !$categoriaId) {
            return $this->json(['error' => 'Nombre, precio y categoría son obligatorios'], 400);
        }

        $categoria = $repoCat->find($categoriaId);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 404);
        }

        $producto = new Producto();
        $producto->setNombre($nombre);
        $producto->setDescripcion($descripcion);
        $producto->setPrecio($precio);
        $producto->setCategoria($categoria);

        // Procesar imagen principal
        $fotoPrincipal = $peticion->files->get('foto_principal');
        if ($fotoPrincipal) {
            $nombreArchivo = $this->guardarImagen($fotoPrincipal);
            if ($nombreArchivo) {
                $producto->setFotoPrincipal($nombreArchivo);
            }
        }

        // Procesar imagen hover
        $fotoHover = $peticion->files->get('foto_hover');
        if ($fotoHover) {
            $nombreHover = $this->guardarImagen($fotoHover);
            if ($nombreHover) {
                $producto->setFotoHover($nombreHover);
            }
        }

        $em->persist($producto);
        $em->flush();

        // Procesar existencias (tallas y stock)
        $existenciasJson = $peticion->request->get('existencias');
        if ($existenciasJson) {
            $existenciasData = json_decode($existenciasJson, true);
            if (is_array($existenciasData)) {
                foreach ($existenciasData as $ex) {
                    $cantidad = (int) ($ex['cantidad'] ?? 0);
                    if ($cantidad > 0) {
                        $existencia = new Existencia();
                        $existencia->setProducto($producto);
                        $existencia->setTalla($ex['talla']);
                        $existencia->setCantidad($cantidad);
                        $em->persist($existencia);
                    }
                }
                $em->flush();
            }
        }

        return $this->json($this->serializarProducto($producto), 201);
    }

    #[Route('/productos/{id}', name: 'actualizar_producto', methods: ['POST'])]
    public function actualizarProducto(int $id, Request $peticion, EntityManagerInterface $em, ProductoRepository $repo, CategoriaRepository $repoCat): JsonResponse
    {
        $producto = $repo->find($id);
        if (!$producto) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $nombre      = $peticion->request->get('nombre');
        $descripcion = $peticion->request->get('descripcion');
        $precio      = $peticion->request->get('precio');
        $categoriaId = $peticion->request->get('categoria_id');

        if ($nombre) $producto->setNombre($nombre);
        if ($descripcion !== null) $producto->setDescripcion($descripcion);
        if ($precio) $producto->setPrecio($precio);

        if ($categoriaId) {
            $categoria = $repoCat->find($categoriaId);
            if ($categoria) $producto->setCategoria($categoria);
        }

        $fotoPrincipal = $peticion->files->get('foto_principal');
        if ($fotoPrincipal) {
            $nombreArchivo = $this->guardarImagen($fotoPrincipal);
            if ($nombreArchivo) $producto->setFotoPrincipal($nombreArchivo);
        }

        $fotoHover = $peticion->files->get('foto_hover');
        if ($fotoHover) {
            $nombreHover = $this->guardarImagen($fotoHover);
            if ($nombreHover) $producto->setFotoHover($nombreHover);
        }

        // Procesar existencias (actualizar o crear por talla)
        $existenciasJson = $peticion->request->get('existencias');
        if ($existenciasJson) {
            $existenciasData = json_decode($existenciasJson, true);
            if (is_array($existenciasData)) {
                foreach ($existenciasData as $ex) {
                    $talla = $ex['talla'] ?? '';
                    $cantidad = (int) ($ex['cantidad'] ?? 0);

                    // Buscar existencia existente para esta talla
                    $existente = null;
                    foreach ($producto->getExistencias() as $e) {
                        if ($e->getTalla() === $talla) {
                            $existente = $e;
                            break;
                        }
                    }

                    if ($existente) {
                        $existente->setCantidad($cantidad);
                    } elseif ($cantidad > 0) {
                        $nueva = new Existencia();
                        $nueva->setProducto($producto);
                        $nueva->setTalla($talla);
                        $nueva->setCantidad($cantidad);
                        $em->persist($nueva);
                    }
                }
            }
        }

        $em->flush();

        return $this->json($this->serializarProducto($producto));
    }

    #[Route('/productos/{id}', name: 'eliminar_producto', methods: ['DELETE'])]
    public function eliminarProducto(int $id, EntityManagerInterface $em, ProductoRepository $repo): JsonResponse
    {
        $producto = $repo->find($id);
        if (!$producto) {
            return $this->json(['error' => 'Producto no encontrado'], 404);
        }

        $em->remove($producto);
        $em->flush();

        return $this->json(['mensaje' => 'Producto eliminado']);
    }

    /* ══════════════════════════════════════
       CATEGORÍAS — CRUD completo
       ══════════════════════════════════════ */

    #[Route('/categorias', name: 'categorias', methods: ['GET'])]
    public function listarCategorias(CategoriaRepository $repo): JsonResponse
    {
        $categorias = $repo->findAll();
        $datos = [];

        foreach ($categorias as $c) {
            $datos[] = [
                'id'              => $c->getId(),
                'nombre'          => $c->getNombre(),
                'total_productos' => $c->getProductos()->count(),
            ];
        }

        return $this->json($datos);
    }

    #[Route('/categorias', name: 'crear_categoria', methods: ['POST'])]
    public function crearCategoria(Request $peticion, EntityManagerInterface $em): JsonResponse
    {
        $datos = json_decode($peticion->getContent(), true);
        $nombre = trim($datos['nombre'] ?? '');

        if (!$nombre) {
            return $this->json(['error' => 'El nombre es obligatorio'], 400);
        }

        $categoria = new Categoria();
        $categoria->setNombre($nombre);
        $em->persist($categoria);
        $em->flush();

        return $this->json([
            'id'     => $categoria->getId(),
            'nombre' => $categoria->getNombre(),
            'total_productos' => 0,
        ], 201);
    }

    #[Route('/categorias/{id}', name: 'actualizar_categoria', methods: ['PUT'])]
    public function actualizarCategoria(int $id, Request $peticion, EntityManagerInterface $em, CategoriaRepository $repo): JsonResponse
    {
        $categoria = $repo->find($id);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 404);
        }

        $datos = json_decode($peticion->getContent(), true);
        $nombre = trim($datos['nombre'] ?? '');

        if (!$nombre) {
            return $this->json(['error' => 'El nombre es obligatorio'], 400);
        }

        $categoria->setNombre($nombre);
        $em->flush();

        return $this->json([
            'id'     => $categoria->getId(),
            'nombre' => $categoria->getNombre(),
            'total_productos' => $categoria->getProductos()->count(),
        ]);
    }

    #[Route('/categorias/{id}', name: 'eliminar_categoria', methods: ['DELETE'])]
    public function eliminarCategoria(int $id, EntityManagerInterface $em, CategoriaRepository $repo): JsonResponse
    {
        $categoria = $repo->find($id);
        if (!$categoria) {
            return $this->json(['error' => 'Categoría no encontrada'], 404);
        }

        if ($categoria->getProductos()->count() > 0) {
            return $this->json(['error' => 'No se puede eliminar: tiene productos asociados'], 400);
        }

        $em->remove($categoria);
        $em->flush();

        return $this->json(['mensaje' => 'Categoría eliminada']);
    }

    /* ══════════════════════════════════════
       HELPERS PRIVADOS
       ══════════════════════════════════════ */

    private function serializarProducto(Producto $p): array
    {
        return [
            'id'              => $p->getId(),
            'nombre'          => $p->getNombre(),
            'descripcion'     => $p->getDescripcion(),
            'precio'          => $p->getPrecio(),
            'categoria'       => $p->getCategoria()?->getNombre(),
            'categoria_id'    => $p->getCategoria()?->getId(),
            'foto_principal'  => '/recursos/camisas/' . $p->getFotoPrincipal(),
            'foto_hover'      => '/recursos/camisas/' . $p->getFotoHover(),
            'existencias'     => array_map(
                fn($e) => ['talla' => $e->getTalla(), 'cantidad' => $e->getCantidad()],
                $p->getExistencias()->toArray()
            ),
        ];
    }

    private function guardarImagen($archivo): ?string
    {
        if (!$archivo) return null;

        $directorio = $this->getParameter('kernel.project_dir') . '/public/recursos/camisas';
        $nombreOriginal = pathinfo($archivo->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $archivo->guessExtension() ?? 'jpg';
        $nombreFinal = $nombreOriginal . '.' . $extension;

        try {
            $archivo->move($directorio, $nombreFinal);
            return $nombreFinal;
        } catch (FileException $e) {
            return null;
        }
    }
}
