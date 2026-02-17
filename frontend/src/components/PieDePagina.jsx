/**
 * Pie de página minimalista estilo ZARA.
 * 4 columnas: Marca, Enlaces, Legal, Newsletter/Social.
 * Metodología BEM: bloque .pie-pagina
 */
export default function PieDePagina() {
  return (
    <footer className="pie-pagina">
      <div className="pie-pagina__contenido">

        {/* Columna 1: Marca */}
        <div className="pie-pagina__columna">
          <h4 className="pie-pagina__titulo-col">ZARA</h4>
          <p className="pie-pagina__texto">
            Moda actual con diseño atemporal. Proyecto académico desarrollado
            con Symfony y React.
          </p>
        </div>

        {/* Columna 2: Enlaces */}
        <div className="pie-pagina__columna">
          <h4 className="pie-pagina__titulo-col">Ayuda</h4>
          <ul className="pie-pagina__lista">
            <li><a href="#" className="pie-pagina__enlace">Envíos</a></li>
            <li><a href="#" className="pie-pagina__enlace">Devoluciones</a></li>
            <li><a href="#" className="pie-pagina__enlace">Guía de tallas</a></li>
            <li><a href="#" className="pie-pagina__enlace">Contacto</a></li>
          </ul>
        </div>

        {/* Columna 3: Legal */}
        <div className="pie-pagina__columna">
          <h4 className="pie-pagina__titulo-col">Legal</h4>
          <ul className="pie-pagina__lista">
            <li><a href="#" className="pie-pagina__enlace">Aviso legal</a></li>
            <li><a href="#" className="pie-pagina__enlace">Privacidad</a></li>
            <li><a href="#" className="pie-pagina__enlace">Cookies</a></li>
            <li><a href="#" className="pie-pagina__enlace">Condiciones</a></li>
          </ul>
        </div>

        {/* Columna 4: Newsletter + Social */}
        <div className="pie-pagina__columna">
          <h4 className="pie-pagina__titulo-col">Newsletter</h4>
          <p className="pie-pagina__texto">
            Suscríbete para recibir novedades y acceso anticipado.
          </p>
          <form className="pie-pagina__newsletter" onSubmit={(e) => e.preventDefault()}>
            <input
              className="pie-pagina__newsletter-input"
              type="email"
              placeholder="tu@email.com"
              aria-label="Email para newsletter"
            />
            <button className="pie-pagina__newsletter-boton" type="submit">
              →
            </button>
          </form>
          <div className="pie-pagina__social">
            <a href="#" className="pie-pagina__social-enlace" aria-label="Instagram">IG</a>
            <a href="#" className="pie-pagina__social-enlace" aria-label="Twitter">TW</a>
            <a href="#" className="pie-pagina__social-enlace" aria-label="Pinterest">PI</a>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="pie-pagina__barra-inferior">
        <p>© 2026 ZARA — Proyecto académico. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
