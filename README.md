# Tienda Zara - Symfony 7

## Requisitos
- Docker y Docker Compose
- (Opcional) PHP 8.2 local para desarrollo sin Docker

## Puesta en marcha

```bash
# 1. Levantar contenedores
docker-compose up -d --build

# 2. Instalar dependencias PHP
docker exec tienda_zara_php composer install

# 3. Crear esquema de base de datos
docker exec tienda_zara_php php bin/console doctrine:schema:create

# 4. Cargar datos iniciales (fixtures)
#    Antes de ejecutar, copia tus imágenes .jpg en public/recursos/camisas/
#    Ejemplo: camisa1.jpg y camisa1H.jpg (hover)
docker exec tienda_zara_php php bin/console doctrine:fixtures:load --no-interaction

# 5. Acceder a la aplicación
# http://localhost:8080
```

## Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@tiendazara.com | admin1234 | ROLE_ADMIN |
| cliente@tiendazara.com | cliente1234 | ROLE_USER |

## Estructura de imágenes

Coloca las fotos en `public/recursos/camisas/`:
- `camisa1.jpg` → Foto principal
- `camisa1H.jpg` → Foto hover (se genera automáticamente con `getFotoHover()`)

Los fixtures detectan automáticamente los `.jpg` (ignorando los `*H.jpg`) y crean los productos.
