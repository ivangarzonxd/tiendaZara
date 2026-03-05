/**
 * Servicio de comunicación con la API de Symfony.
 * React y Symfony corren en el mismo servidor, así que todas las rutas son relativas.
 */

const API_BASE = '/api';

/**
 * Parsea la respuesta de forma segura.
 * Si el body no es JSON válido, lanza un error descriptivo.
 */
async function parsearRespuesta(resp) {
  const texto = await resp.text();
  try {
    return JSON.parse(texto);
  } catch {
    if (resp.status === 401) throw new Error('Tu sesión ha expirado. Inicia sesión de nuevo.');
    throw new Error('El servidor devolvió una respuesta inesperada.');
  }
}

/* ── Catálogo ── */

export async function obtenerProductos() {
  const resp = await fetch(`${API_BASE}/productos`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Error al obtener productos');
  return resp.json();
}

export async function obtenerCategorias() {
  const resp = await fetch(`${API_BASE}/categorias`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Error al obtener categorías');
  return resp.json();
}

export async function obtenerProductosPorCategoria(idCategoria) {
  const resp = await fetch(`${API_BASE}/categorias/${idCategoria}/productos`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Error al filtrar productos');
  return resp.json();
}

export async function obtenerProductoPorId(id) {
  const resp = await fetch(`${API_BASE}/productos/${id}`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Producto no encontrado');
  return resp.json();
}

/* ── Autenticación ── */

export async function loginUsuario(email, password) {
  const resp = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Credenciales inválidas');
  return datos;
}

export async function registrarUsuario(nombre, email, password) {
  const resp = await fetch(`${API_BASE}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre, email, password }),
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Error al crear la cuenta');
  return datos;
}

/* ── Pagos (Stripe) ── */

export async function crearIntentoPago(total) {
  const resp = await fetch(`${API_BASE}/crear-intento-pago`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ total }),
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Error al iniciar el pago');
  return datos;
}

/* ── Pedidos ── */

export async function finalizarCompraAPI(lineas, paymentIntentId, datosEnvio = {}) {
  const resp = await fetch(`${API_BASE}/finalizar-compra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ lineas, paymentIntentId, datosEnvio }),
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Error al procesar pedido');
  return datos;
}

/* ── Logout ── */

export async function logoutUsuario() {
  await fetch(`${API_BASE}/logout`, { credentials: 'include' });
}

/* ══════════════════════════════════════════════════
   ══  ADMIN API  ══
   ══════════════════════════════════════════════════ */

/* ── Dashboard ── */

export async function obtenerResumenAdmin() {
  const resp = await fetch(`${API_BASE}/admin/resumen`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Error al obtener resumen');
  return resp.json();
}

/* ── Pedidos (admin) ── */

export async function obtenerPedidosAdmin() {
  const resp = await fetch(`${API_BASE}/admin/pedidos`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Error al obtener pedidos');
  return resp.json();
}

/* ── Productos CRUD (admin) ── */

export async function obtenerProductosAdmin() {
  const resp = await fetch(`${API_BASE}/admin/productos`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Error al obtener productos');
  return resp.json();
}

export async function crearProductoAdmin(formData) {
  const resp = await fetch(`${API_BASE}/admin/productos`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // FormData (multipart) — NO Content-Type header
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Error al crear producto');
  return datos;
}

export async function actualizarProductoAdmin(id, formData) {
  const resp = await fetch(`${API_BASE}/admin/productos/${id}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Error al actualizar producto');
  return datos;
}

export async function eliminarProductoAdmin(id) {
  const resp = await fetch(`${API_BASE}/admin/productos/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!resp.ok) {
    const datos = await parsearRespuesta(resp);
    throw new Error(datos.error || 'Error al eliminar producto');
  }
}

/* ── Categorías CRUD (admin) ── */

export async function obtenerCategoriasAdmin() {
  const resp = await fetch(`${API_BASE}/admin/categorias`, { credentials: 'include' });
  if (!resp.ok) throw new Error('Error al obtener categorías');
  return resp.json();
}

export async function crearCategoriaAdmin(nombre) {
  const resp = await fetch(`${API_BASE}/admin/categorias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre }),
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Error al crear categoría');
  return datos;
}

export async function actualizarCategoriaAdmin(id, nombre) {
  const resp = await fetch(`${API_BASE}/admin/categorias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ nombre }),
  });
  const datos = await parsearRespuesta(resp);
  if (!resp.ok) throw new Error(datos.error || 'Error al actualizar categoría');
  return datos;
}

export async function eliminarCategoriaAdmin(id) {
  const resp = await fetch(`${API_BASE}/admin/categorias/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!resp.ok) {
    const datos = await parsearRespuesta(resp);
    throw new Error(datos.error || 'Error al eliminar categoría');
  }
}
