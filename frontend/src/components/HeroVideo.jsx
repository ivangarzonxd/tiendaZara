/**
 * Sección hero a pantalla completa.
 * Si existe /video/hero.mp4 se reproduce en bucle.
 * Si no, se muestra un fondo elegante con degradado oscuro.
 */
export default function HeroVideo() {
  const irATienda = (e) => {
    e.preventDefault();
    const tienda = document.getElementById('tienda');
    if (tienda) tienda.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-video">
      {/* Vídeo de fondo — coloca tu MP4 en frontend/public/video/hero.mp4 */}
      <video
        className="hero-video__video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/recursos/camisas/video/videoHero.mp4" type="video/mp4" />
      </video>

      <div className="hero-video__overlay" />

      <div className="hero-video__contenido">
        <h1 className="hero-video__titulo">Nueva Colección</h1>
        <p className="hero-video__subtitulo">Primavera / Verano 2026</p>
        <a href="#tienda" className="hero-video__boton-ver" onClick={irATienda}>
          Ver colección
        </a>
      </div>

      <div className="hero-video__scroll-indicador">
        <span>Scroll</span>
        <span className="hero-video__flecha">↓</span>
      </div>
    </section>
  );
}
