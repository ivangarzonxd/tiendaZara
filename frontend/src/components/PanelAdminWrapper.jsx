import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { CarritoContext } from '../context/CarritoContext';
import PanelAdmin from './PanelAdmin';

/**
 * Guard de ruta para el panel de administración.
 * Si el usuario no es admin, redirige al inicio con Navigate.
 */
export default function PanelAdminWrapper() {
  const { usuario } = useContext(CarritoContext);

  if (!usuario || usuario.rol !== 'ROLE_ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <PanelAdmin />;
}
