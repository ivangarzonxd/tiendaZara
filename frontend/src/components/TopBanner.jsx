/**
 * Banner superior con mensaje promocional.
 * Se muestra en todas las páginas excepto /admin.
 * Metodología BEM: bloque .top-banner
 */
export default function TopBanner() {
  return (
    <div className="top-banner">
      <p className="top-banner__texto">
        <strong>ENVÍO GRATIS</strong> en pedidos superiores a 50 €&nbsp;&nbsp;|&nbsp;&nbsp;
        Devoluciones gratuitas en 30 días
      </p>
    </div>
  );
}
