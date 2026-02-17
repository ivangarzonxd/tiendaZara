<?php

namespace App\DataFixtures;

use App\Entity\Categoria;
use App\Entity\Existencia;
use App\Entity\Producto;
use App\Entity\Usuario;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Finder\Finder;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $hasher;

    public function __construct(UserPasswordHasherInterface $hasher)
    {
        $this->hasher = $hasher;
    }

    public function load(ObjectManager $gestor): void
    {
        // === USUARIOS ===
        $admin = new Usuario();
        $admin->setNombre('Administrador');
        $admin->setEmail('admin@tiendazara.com');
        $admin->setPassword($this->hasher->hashPassword($admin, 'admin1234'));
        $admin->setRol('ROLE_ADMIN');
        $gestor->persist($admin);

        $cliente = new Usuario();
        $cliente->setNombre('Cliente Demo');
        $cliente->setEmail('cliente@tiendazara.com');
        $cliente->setPassword($this->hasher->hashPassword($cliente, 'cliente1234'));
        $cliente->setRol('ROLE_USER');
        $gestor->persist($cliente);

        // === CATEGORÍA ===
        $categoriaCamisas = new Categoria();
        $categoriaCamisas->setNombre('Camisas');
        $gestor->persist($categoriaCamisas);

        // === PRODUCTOS: Escaneo automático de imágenes ===
        $rutaCamisas = __DIR__ . '/../../public/recursos/camisas';

        // Asegurar que la carpeta existe
        if (!is_dir($rutaCamisas)) {
            mkdir($rutaCamisas, 0755, true);
        }

        $buscador = new Finder();
        $buscador->files()
            ->in($rutaCamisas)
            ->name('*.jpg')
            ->notName('*H.jpg')  // Ignorar fotos hover
            ->sortByName();

        $tallas = ['XS', 'S', 'M', 'L', 'XL'];
        $contador = 0;

        foreach ($buscador as $archivo) {
            $contador++;
            $nombreArchivo = $archivo->getFilename();

            // Nombre legible: camisa1.jpg → Camisa 1
            $nombreSinExtension = pathinfo($nombreArchivo, PATHINFO_FILENAME);
            $nombreLegible = ucfirst(
                preg_replace('/(\d+)/', ' $1', $nombreSinExtension)
            );

            $producto = new Producto();
            $producto->setNombre(trim($nombreLegible));
            $producto->setDescripcion('Camisa de la colección Tienda Zara');
            $producto->setPrecio(number_format(rand(1990, 5990) / 100, 2, '.', ''));
            $producto->setCategoria($categoriaCamisas);
            $producto->setFotoPrincipal($nombreArchivo);
            $gestor->persist($producto);

            // Crear existencias para cada talla
            foreach ($tallas as $talla) {
                $existencia = new Existencia();
                $existencia->setProducto($producto);
                $existencia->setTalla($talla);
                $existencia->setCantidad(rand(5, 50));
                $gestor->persist($existencia);
            }
        }

        $gestor->flush();

        // Mensaje informativo en consola
        if ($contador === 0) {
            echo "\n  [INFO] No se encontraron archivos .jpg en public/recursos/camisas/\n";
            echo "  Copia tus imágenes (ej: camisa1.jpg, camisa1H.jpg) y ejecuta de nuevo:\n";
            echo "  php bin/console doctrine:fixtures:load\n\n";
        } else {
            echo "\n  [OK] Se crearon {$contador} productos desde las imágenes encontradas.\n\n";
        }
    }
}
