# Tienda Zara — Symfony 7.2 + React 18 + Docker

Tienda online de camisas estilo ZARA. Backend API REST con Symfony 7.2, frontend SPA con React 18 + Vite, base de datos MySQL 8, todo dockerizado.

## Arquitectura

```
Navegador → Apache (.htaccess)
               ├── /api/*  → Symfony (index.php) → Doctrine → MySQL
               └── /*      → React SPA (index.html)
```

- **3 contenedores Docker**: php-apache (8080), mysql (3307), phpmyadmin (8081)
- **Autenticación**: sesiones con cookies vía `json_login`
- **Pagos**: Stripe (modo test)
- **Panel Admin**: integrado en la SPA (ROLE_ADMIN)

## Requisitos

- Docker Desktop instalado y abierto

## Puesta en marcha

```bash
# 1. Levantar contenedores (primera vez tarda ~2 min por el build)
docker compose up -d --build

# 2. Instalar dependencias PHP
docker exec tienda_zara_php composer install --no-dev --optimize-autoloader

# 3. Calentar caché de Symfony
docker exec tienda_zara_php php bin/console cache:warmup --env=prod

# 4. Crear/actualizar esquema de base de datos
docker exec tienda_zara_php php bin/console doctrine:schema:update --force

# 5. (Opcional) Cargar datos iniciales
docker exec tienda_zara_php php bin/console doctrine:fixtures:load --no-interaction
```

## Accesos

| URL | Servicio |
|---|---|
| http://localhost:8080 | Tienda (React SPA) |
| http://localhost:8080/api/productos | API pública |
| http://localhost:8081 | phpMyAdmin |

## Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@tiendazara.com | admin1234 | ROLE_ADMIN |
| cliente@tiendazara.com | cliente1234 | ROLE_USER |

## Endpoints API

| Método | Ruta | Acceso |
|---|---|---|
| GET | /api/productos | Público |
| GET | /api/categorias | Público |
| GET | /api/categorias/{id}/productos | Público |
| GET | /api/productos/{id} | Público |
| POST | /api/registro | Público |
| POST | /api/login | Público |
| POST | /api/logout | Autenticado |
| POST | /api/crear-intento-pago | ROLE_USER |
| POST | /api/finalizar-compra | ROLE_USER |
| GET | /api/admin/resumen | ROLE_ADMIN |
| GET/POST | /api/admin/productos | ROLE_ADMIN |
| POST/DELETE | /api/admin/productos/{id} | ROLE_ADMIN |
| GET/POST | /api/admin/categorias | ROLE_ADMIN |
| PUT/DELETE | /api/admin/categorias/{id} | ROLE_ADMIN |
| GET | /api/admin/pedidos | ROLE_ADMIN |

## Estructura de imágenes

Coloca las fotos en `public/recursos/camisas/`:
- `CAMISA.jpg` → Foto principal
- `CAMISA H.jpg` → Foto hover (si no existe, `getFotoHover()` la calcula automáticamente)

## Parar la aplicación

```bash
docker compose down        # Para contenedores (datos persisten)
docker compose down -v     # Para contenedores y borra datos de MySQL
```

## Tecnologías

- **Backend**: PHP 8.2, Symfony 7.2, Doctrine ORM 3.0
- **Frontend**: React 18.3, Vite 6, Stripe.js
- **BBDD**: MySQL 8.0
- **Infraestructura**: Docker, Docker Compose, Apache 2.4
