import { useContext } from 'react';
import { CarritoContext } from '../context/CarritoContext';
import PanelAdmin from './PanelAdmin';

/**
 * Renderiza el PanelAdmin solo si el usuario es admin y el panel está abierto.
 * Separado del App.jsx para que el import de PanelAdmin no sea condicional.
 */
export default function PanelAdminWrapper() {
  const { usuario, adminAbierto } = useContext(CarritoContext);

  if (!adminAbierto || !usuario || usuario.rol !== 'ROLE_ADMIN') return null;

  return <PanelAdmin />;
}
