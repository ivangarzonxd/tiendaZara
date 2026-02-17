import { useState, useEffect, useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';

/**
 * Modal de inicio de sesión.
 * Envía credenciales al endpoint /api/login (JSON).
 */
export default function LoginModal() {
  const { loginModalAbierto, cerrarLoginModal, iniciarSesion } =
    useContext(CarritoContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  /* Reset al abrir */
  useEffect(() => {
    if (loginModalAbierto) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [loginModalAbierto]);

  /* Cerrar con Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && loginModalAbierto) cerrarLoginModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loginModalAbierto, cerrarLoginModal]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await iniciarSesion(email, password);
      // El CarritoContext cierra el modal al iniciar sesión
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  if (!loginModalAbierto) return null;

  return (
    <div className="login-modal__overlay" onClick={cerrarLoginModal}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="login-modal__titulo">Iniciar sesión</h2>

        {error && <p className="login-modal__error">{error}</p>}

        <form onSubmit={manejarSubmit}>
          <div className="login-modal__campo">
            <label className="login-modal__etiqueta" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="login-modal__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="tu@email.com"
            />
          </div>

          <div className="login-modal__campo">
            <label className="login-modal__etiqueta" htmlFor="login-password">
              Contraseña
            </label>
            <input
              id="login-password"
              className="login-modal__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            className="login-modal__boton"
            type="submit"
            disabled={cargando}
          >
            {cargando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button className="login-modal__cerrar" onClick={cerrarLoginModal}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
