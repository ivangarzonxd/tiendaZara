import { useState, useEffect, useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import {
  obtenerResumenAdmin,
  obtenerPedidosAdmin,
  obtenerProductosAdmin,
  crearProductoAdmin,
  actualizarProductoAdmin,
  eliminarProductoAdmin,
  obtenerCategoriasAdmin,
  crearCategoriaAdmin,
  actualizarCategoriaAdmin,
  eliminarCategoriaAdmin,
} from '../services/api';

/* ═══════════════════════════════════════════
   Panel de Administración – estilo ZARA
   ═══════════════════════════════════════════ */

const SECCIONES = ['resumen', 'productos', 'categorias', 'pedidos'];
const ETIQUETAS = { resumen: 'Resumen', productos: 'Productos', categorias: 'Categorías', pedidos: 'Pedidos' };

export default function PanelAdmin() {
  const { cerrarAdmin } = useContext(CarritoContext);
  const [seccion, setSeccion] = useState('resumen');

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        {/* Cabecera */}
        <header className="admin-panel__cabecera">
          <h1 className="admin-panel__titulo">PANEL ADMIN</h1>
          <button className="admin-panel__cerrar" onClick={cerrarAdmin}>✕</button>
        </header>

        {/* Navegación lateral */}
        <nav className="admin-panel__nav">
          {SECCIONES.map((s) => (
            <button
              key={s}
              className={`admin-panel__nav-btn ${seccion === s ? 'admin-panel__nav-btn--activo' : ''}`}
              onClick={() => setSeccion(s)}
            >
              {ETIQUETAS[s]}
            </button>
          ))}
        </nav>

        {/* Contenido */}
        <main className="admin-panel__contenido">
          {seccion === 'resumen' && <SeccionResumen />}
          {seccion === 'productos' && <SeccionProductos />}
          {seccion === 'categorias' && <SeccionCategorias />}
          {seccion === 'pedidos' && <SeccionPedidos />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   RESUMEN (Dashboard)
   ───────────────────────────── */
function SeccionResumen() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerResumenAdmin()
      .then(setDatos)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="admin-error">{error}</p>;
  if (!datos) return <p className="admin-cargando">Cargando...</p>;

  return (
    <div className="admin-resumen">
      <div className="admin-resumen__tarjeta">
        <span className="admin-resumen__numero">{datos.total_productos}</span>
        <span className="admin-resumen__etiqueta">Productos</span>
      </div>
      <div className="admin-resumen__tarjeta">
        <span className="admin-resumen__numero">{datos.total_categorias}</span>
        <span className="admin-resumen__etiqueta">Categorías</span>
      </div>
      <div className="admin-resumen__tarjeta">
        <span className="admin-resumen__numero">{datos.total_pedidos}</span>
        <span className="admin-resumen__etiqueta">Pedidos</span>
      </div>
      <div className="admin-resumen__tarjeta">
        <span className="admin-resumen__numero">{datos.total_usuarios}</span>
        <span className="admin-resumen__etiqueta">Usuarios</span>
      </div>
      <div className="admin-resumen__tarjeta admin-resumen__tarjeta--ancha">
        <span className="admin-resumen__numero">{parseFloat(datos.ingresos_totales).toFixed(2)} €</span>
        <span className="admin-resumen__etiqueta">Ingresos totales</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   PRODUCTOS CRUD
   ───────────────────────────── */
function SeccionProductos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editando, setEditando] = useState(null); // null = lista, 'nuevo' o id
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    Promise.all([obtenerProductosAdmin(), obtenerCategoriasAdmin()])
      .then(([prods, cats]) => { setProductos(prods); setCategorias(cats); })
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await eliminarProductoAdmin(id);
      cargar();
    } catch (e) { setError(e.message); }
  };

  if (cargando) return <p className="admin-cargando">Cargando productos...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  // Formulario de crear/editar
  if (editando !== null) {
    const productoEditar = editando === 'nuevo' ? null : productos.find((p) => p.id === editando);
    return (
      <FormularioProducto
        producto={productoEditar}
        categorias={categorias}
        onGuardado={() => { setEditando(null); cargar(); }}
        onCancelar={() => setEditando(null)}
      />
    );
  }

  return (
    <div className="admin-seccion">
      <div className="admin-seccion__cabecera">
        <h2 className="admin-seccion__titulo">Productos ({productos.length})</h2>
        <button className="admin-btn admin-btn--primario" onClick={() => setEditando('nuevo')}>
          + Nuevo producto
        </button>
      </div>
      <div className="admin-tabla-wrapper">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={p.foto_principal}
                    alt={p.nombre}
                    className="admin-tabla__miniatura"
                  />
                </td>
                <td>{p.nombre}</td>
                <td>{parseFloat(p.precio).toFixed(2)} €</td>
                <td>{p.categoria}</td>
                <td className="admin-tabla__acciones">
                  <button className="admin-btn admin-btn--secundario" onClick={() => setEditando(p.id)}>
                    Editar
                  </button>
                  <button className="admin-btn admin-btn--peligro" onClick={() => eliminar(p.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Formulario Producto ── */
function FormularioProducto({ producto, categorias, onGuardado, onCancelar }) {
  const esNuevo = !producto;
  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '');
  const [precio, setPrecio] = useState(producto?.precio || '');
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id || (categorias[0]?.id || ''));
  const [fotoPrincipal, setFotoPrincipal] = useState(null);
  const [fotoHover, setFotoHover] = useState(null);
  const [prevPrincipal, setPrevPrincipal] = useState(producto?.foto_principal || '');
  const [prevHover, setPrevHover] = useState(producto?.foto_hover || '');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  // Existencias (tallas)
  const tallasDisponibles = ['XS', 'S', 'M', 'L', 'XL'];
  const existenciasIniciales = {};
  tallasDisponibles.forEach((t) => {
    const ex = producto?.existencias?.find((e) => e.talla === t);
    existenciasIniciales[t] = ex ? ex.cantidad : 0;
  });
  const [existencias, setExistencias] = useState(existenciasIniciales);

  const handleFoto = (e, tipo) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (tipo === 'principal') {
      setFotoPrincipal(archivo);
      setPrevPrincipal(URL.createObjectURL(archivo));
    } else {
      setFotoHover(archivo);
      setPrevHover(URL.createObjectURL(archivo));
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('nombre', nombre);
      fd.append('descripcion', descripcion);
      fd.append('precio', precio);
      fd.append('categoria_id', categoriaId);
      if (fotoPrincipal) fd.append('foto_principal', fotoPrincipal);
      if (fotoHover) fd.append('foto_hover', fotoHover);

      // Existencias como JSON
      fd.append('existencias', JSON.stringify(
        tallasDisponibles.map((t) => ({ talla: t, cantidad: parseInt(existencias[t]) || 0 }))
      ));

      if (esNuevo) {
        await crearProductoAdmin(fd);
      } else {
        await actualizarProductoAdmin(producto.id, fd);
      }
      onGuardado();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="admin-formulario" onSubmit={enviar}>
      <div className="admin-formulario__cabecera">
        <h2>{esNuevo ? 'Nuevo producto' : 'Editar producto'}</h2>
        <button type="button" className="admin-btn" onClick={onCancelar}>← Volver</button>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-formulario__grid">
        {/* Columna izquierda: datos */}
        <div className="admin-formulario__campos">
          <label className="admin-campo">
            <span>Nombre</span>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>

          <label className="admin-campo">
            <span>Descripción</span>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
          </label>

          <label className="admin-campo">
            <span>Precio (€)</span>
            <input type="number" step="0.01" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
          </label>

          <label className="admin-campo">
            <span>Categoría</span>
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>

          {/* Existencias por talla */}
          <fieldset className="admin-campo admin-campo--existencias">
            <legend>Stock por talla</legend>
            <div className="admin-tallas">
              {tallasDisponibles.map((t) => (
                <label key={t} className="admin-tallas__item">
                  <span>{t}</span>
                  <input
                    type="number"
                    min="0"
                    value={existencias[t]}
                    onChange={(e) => setExistencias({ ...existencias, [t]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Columna derecha: fotos */}
        <div className="admin-formulario__fotos">
          <div className="admin-foto-upload">
            <span className="admin-foto-upload__label">Foto principal</span>
            {prevPrincipal && <img src={prevPrincipal} alt="Principal" className="admin-foto-upload__preview" />}
            <input type="file" accept="image/*" onChange={(e) => handleFoto(e, 'principal')} />
          </div>

          <div className="admin-foto-upload">
            <span className="admin-foto-upload__label">Foto hover</span>
            {prevHover && <img src={prevHover} alt="Hover" className="admin-foto-upload__preview" />}
            <input type="file" accept="image/*" onChange={(e) => handleFoto(e, 'hover')} />
          </div>
        </div>
      </div>

      <div className="admin-formulario__acciones">
        <button type="submit" className="admin-btn admin-btn--primario" disabled={enviando}>
          {enviando ? 'Guardando...' : (esNuevo ? 'Crear producto' : 'Guardar cambios')}
        </button>
        <button type="button" className="admin-btn" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

/* ─────────────────────────────
   CATEGORÍAS CRUD
   ───────────────────────────── */
function SeccionCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNombre, setEditandoNombre] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    setCargando(true);
    obtenerCategoriasAdmin()
      .then(setCategorias)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const crear = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    try {
      await crearCategoriaAdmin(nombre.trim());
      setNombre('');
      cargar();
    } catch (err) { setError(err.message); }
  };

  const guardarEdicion = async (id) => {
    if (!editandoNombre.trim()) return;
    try {
      await actualizarCategoriaAdmin(id, editandoNombre.trim());
      setEditandoId(null);
      cargar();
    } catch (err) { setError(err.message); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await eliminarCategoriaAdmin(id);
      cargar();
    } catch (err) { setError(err.message); }
  };

  if (cargando) return <p className="admin-cargando">Cargando categorías...</p>;

  return (
    <div className="admin-seccion">
      <h2 className="admin-seccion__titulo">Categorías ({categorias.length})</h2>

      {error && <p className="admin-error">{error}</p>}

      {/* Formulario nueva categoría */}
      <form className="admin-inline-form" onSubmit={crear}>
        <input
          type="text"
          placeholder="Nueva categoría..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="admin-inline-form__input"
        />
        <button type="submit" className="admin-btn admin-btn--primario">Crear</button>
      </form>

      <div className="admin-tabla-wrapper">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  {editandoId === c.id ? (
                    <input
                      type="text"
                      value={editandoNombre}
                      onChange={(e) => setEditandoNombre(e.target.value)}
                      className="admin-inline-form__input"
                      autoFocus
                    />
                  ) : (
                    c.nombre
                  )}
                </td>
                <td>{c.total_productos}</td>
                <td className="admin-tabla__acciones">
                  {editandoId === c.id ? (
                    <>
                      <button className="admin-btn admin-btn--primario" onClick={() => guardarEdicion(c.id)}>
                        Guardar
                      </button>
                      <button className="admin-btn" onClick={() => setEditandoId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="admin-btn admin-btn--secundario"
                        onClick={() => { setEditandoId(c.id); setEditandoNombre(c.nombre); }}
                      >
                        Editar
                      </button>
                      <button className="admin-btn admin-btn--peligro" onClick={() => eliminar(c.id)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────
   PEDIDOS (solo lectura)
   ───────────────────────────── */
function SeccionPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    obtenerPedidosAdmin()
      .then(setPedidos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <p className="admin-cargando">Cargando pedidos...</p>;
  if (error) return <p className="admin-error">{error}</p>;

  return (
    <div className="admin-seccion">
      <h2 className="admin-seccion__titulo">Pedidos ({pedidos.length})</h2>

      {pedidos.length === 0 ? (
        <p className="admin-vacio">No hay pedidos registrados.</p>
      ) : (
        <div className="admin-tabla-wrapper">
          <table className="admin-tabla">
            <thead>
              <tr>
                <th>Nº Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <>
                  <tr key={p.numero_pedido}>
                    <td className="admin-tabla__pedido-num">{p.numero_pedido}</td>
                    <td>{p.usuario}</td>
                    <td>{new Date(p.fecha).toLocaleDateString('es-ES')}</td>
                    <td>{parseFloat(p.total).toFixed(2)} €</td>
                    <td>
                      <button
                        className="admin-btn admin-btn--secundario"
                        onClick={() => setExpandido(expandido === p.numero_pedido ? null : p.numero_pedido)}
                      >
                        {expandido === p.numero_pedido ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                  {expandido === p.numero_pedido && (
                    <tr key={`${p.numero_pedido}-detalle`} className="admin-tabla__fila-detalle">
                      <td colSpan={5}>
                        <div className="admin-pedido-detalle">
                          {p.detalles.map((d, i) => (
                            <div key={i} className="admin-pedido-detalle__linea">
                              <span>{d.producto}</span>
                              <span>×{d.cantidad}</span>
                              <span>{parseFloat(d.precio_unitario).toFixed(2)} €</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
