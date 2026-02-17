import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { loginUsuario, finalizarCompraAPI } from '../services/api';

export const CarritoContext = createContext();

/* ── Persistencia localStorage ── */
const CLAVE_CARRITO = 'carrito_zara';
const CLAVE_USUARIO = 'usuario_zara';
const EXPIRACION_MS = 24 * 60 * 60 * 1000; // 24 horas

function cargarCarrito() {
  try {
    const raw = localStorage.getItem(CLAVE_CARRITO);
    if (!raw) return [];
    const datos = JSON.parse(raw);
    if (Date.now() - datos.timestamp > EXPIRACION_MS) {
      localStorage.removeItem(CLAVE_CARRITO);
      return [];
    }
    return datos.items || [];
  } catch {
    return [];
  }
}

function guardarCarrito(items) {
  localStorage.setItem(
    CLAVE_CARRITO,
    JSON.stringify({ items, timestamp: Date.now() })
  );
}

function cargarUsuario() {
  try {
    const raw = localStorage.getItem(CLAVE_USUARIO);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ── Provider ── */
export function CarritoProvider({ children }) {
  const [items, setItems] = useState(cargarCarrito);
  const [usuario, setUsuario] = useState(cargarUsuario);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [loginModalAbierto, setLoginModalAbierto] = useState(false);

  // Persistir carrito en cada cambio
  useEffect(() => {
    guardarCarrito(items);
  }, [items]);

  // Persistir usuario
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(CLAVE_USUARIO);
    }
  }, [usuario]);

  /* ── Acciones del carrito ── */

  const agregarAlCarrito = useCallback((producto, talla, cantidad = 1) => {
    setItems((prev) => {
      // Si el mismo producto+talla ya existe, sumar cantidad
      const idx = prev.findIndex(
        (it) => it.producto.id === producto.id && it.talla === talla
      );
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], cantidad: copia[idx].cantidad + cantidad };
        return copia;
      }
      return [...prev, { producto, talla, cantidad }];
    });
  }, []);

  const eliminarDelCarrito = useCallback((indice) => {
    setItems((prev) => prev.filter((_, i) => i !== indice));
  }, []);

  const actualizarCantidad = useCallback((indice, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setItems((prev) => {
      const copia = [...prev];
      copia[indice] = { ...copia[indice], cantidad: nuevaCantidad };
      return copia;
    });
  }, []);

  const vaciarCarrito = useCallback(() => {
    setItems([]);
  }, []);

  /* ── Panel carrito ── */

  const abrirCarrito = useCallback(() => setCarritoAbierto(true), []);
  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), []);

  /* ── Login modal ── */

  const abrirLoginModal = useCallback(() => setLoginModalAbierto(true), []);
  const cerrarLoginModal = useCallback(() => setLoginModalAbierto(false), []);

  /* ── Autenticación ── */

  const iniciarSesion = useCallback(async (email, password) => {
    const datos = await loginUsuario(email, password);
    setUsuario(datos.usuario);
    setLoginModalAbierto(false);
    return datos.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    setUsuario(null);
  }, []);

  /* ── Checkout ── */

  const finalizarCompra = useCallback(async (paymentIntentId) => {
    if (!usuario) {
      setCarritoAbierto(false);
      setLoginModalAbierto(true);
      throw new Error('Inicia sesión para continuar');
    }

    const lineas = items.map((it) => ({
      id_producto: it.producto.id,
      cantidad: it.cantidad,
    }));

    const resultado = await finalizarCompraAPI(lineas, paymentIntentId);
    setItems([]);
    return resultado;
  }, [usuario, items]);

  /* ── Valores calculados ── */

  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + it.cantidad, 0),
    [items]
  );

  const totalPrecio = useMemo(
    () =>
      items
        .reduce(
          (sum, it) => sum + parseFloat(it.producto.precio) * it.cantidad,
          0
        )
        .toFixed(2),
    [items]
  );

  const valor = useMemo(
    () => ({
      items,
      usuario,
      carritoAbierto,
      loginModalAbierto,
      totalItems,
      totalPrecio,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      vaciarCarrito,
      abrirCarrito,
      cerrarCarrito,
      abrirLoginModal,
      cerrarLoginModal,
      iniciarSesion,
      cerrarSesion,
      finalizarCompra,
    }),
    [
      items, usuario, carritoAbierto, loginModalAbierto, totalItems, totalPrecio,
      agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito,
      abrirCarrito, cerrarCarrito, abrirLoginModal, cerrarLoginModal,
      iniciarSesion, cerrarSesion, finalizarCompra,
    ]
  );

  return (
    <CarritoContext.Provider value={valor}>
      {children}
    </CarritoContext.Provider>
  );
}
