import { useState, useEffect, useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import { registrarUsuario } from '../services/api';

/**
 * Modal unificado de autenticación.
 * Alterna entre "Iniciar Sesión" y "Crear Cuenta" con transición suave.
 * Metodología BEM: bloque .auth-modal
 */
export default function AuthModal() {
  const { loginModalAbierto, cerrarLoginModal, iniciarSesion } =
    useContext(CarritoContext);

  /* ── Estado del formulario ── */
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  /* ── Reset al abrir/cerrar ── */
  useEffect(() => {
    if (loginModalAbierto) {
      setModo('login');
      setNombre('');
      setEmail('');
      setPassword('');
      setError('');
      setExito('');
    }
  }, [loginModalAbierto]);

  /* ── Cerrar con tecla Escape ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && loginModalAbierto) cerrarLoginModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loginModalAbierto, cerrarLoginModal]);

  /* ── Cambiar modo (login ↔ registro) ── */
  const alternarModo = () => {
    setModo((prev) => (prev === 'login' ? 'registro' : 'login'));
    setError('');
    setExito('');
    setNombre('');
    setEmail('');
    setPassword('');
  };

  /* ── Enviar formulario ── */
  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setCargando(true);

    try {
      if (modo === 'login') {
        await iniciarSesion(email, password);
        // El CarritoContext cierra el modal automáticamente
      } else {
        await registrarUsuario(nombre, email, password);
        setExito('¡Cuenta creada! Inicia sesión con tus credenciales.');
        // Cambiar al modo login tras un breve instante
        setTimeout(() => {
          setModo('login');
          setExito('');
          setPassword('');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setCargando(false);
    }
  };

  if (!loginModalAbierto) return null;

  const esLogin = modo === 'login';

  return (
    <div className="auth-modal__overlay" onClick={cerrarLoginModal}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        {/* Pestañas Login / Registro */}
        <div className="auth-modal__pestanas">
          <button
            className={`auth-modal__pestana ${esLogin ? 'auth-modal__pestana--activa' : ''}`}
            onClick={() => alternarModo()}
            type="button"
            disabled={esLogin}
          >
            Iniciar sesión
          </button>
          <button
            className={`auth-modal__pestana ${!esLogin ? 'auth-modal__pestana--activa' : ''}`}
            onClick={() => alternarModo()}
            type="button"
            disabled={!esLogin}
          >
            Crear cuenta
          </button>
        </div>

        {/* Mensajes */}
        {error && <p className="auth-modal__error">{error}</p>}
        {exito && <p className="auth-modal__exito">{exito}</p>}

        {/* Formulario */}
        <form onSubmit={manejarSubmit} className="auth-modal__formulario">
          {/* Campo nombre (solo en registro) */}
          {!esLogin && (
            <div className="auth-modal__campo">
              <label className="auth-modal__etiqueta" htmlFor="auth-nombre">
                Nombre
              </label>
              <input
                id="auth-nombre"
                className="auth-modal__input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required={!esLogin}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-modal__campo">
            <label className="auth-modal__etiqueta" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="auth-modal__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-modal__campo">
            <label className="auth-modal__etiqueta" htmlFor="auth-password">
              Contraseña
            </label>
            <input
              id="auth-password"
              className="auth-modal__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              autoComplete={esLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            className="auth-modal__boton"
            type="submit"
            disabled={cargando}
          >
            {cargando
              ? (esLogin ? 'Entrando...' : 'Creando cuenta...')
              : (esLogin ? 'Entrar' : 'Crear cuenta')}
          </button>
        </form>

        {/* Enlace inferior */}
        <p className="auth-modal__alternar">
          {esLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            className="auth-modal__alternar-enlace"
            onClick={alternarModo}
            type="button"
          >
            {esLogin ? 'Crear una' : 'Iniciar sesión'}
          </button>
        </p>

        <button className="auth-modal__cerrar" onClick={cerrarLoginModal}>
          ✕
        </button>
      </div>
    </div>
  );
}
