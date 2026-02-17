import { useState } from 'react';

/* Convierte una ruta .jpg en su equivalente .webp */
const aWebp = (ruta) => ruta?.replace(/\.jpg$/i, '.webp');

/**
 * Tarjeta individual de producto.
 * Usa <picture> para servir WebP con fallback JPG.
 * Implementa el efecto hover con transición suave.
 */
export default function TarjetaProducto({ producto, onClick }) {
  const [hoverError, setHoverError] = useState(false);

  const imgPrincipal = encodeURI(producto.fotoPrincipal);
  const imgHover = hoverError
    ? imgPrincipal
    : encodeURI(producto.fotoHover);

  const imgPrincipalWebp = encodeURI(aWebp(producto.fotoPrincipal));
  const imgHoverWebp = hoverError
    ? imgPrincipalWebp
    : encodeURI(aWebp(producto.fotoHover));

  return (
    <article className="producto-card" onClick={() => onClick(producto)}>
      <div className="producto-card__imagen-contenedor">
        <picture>
          <source srcSet={imgPrincipalWebp} type="image/webp" />
          <img
            className="producto-card__imagen producto-card__imagen--principal"
            src={imgPrincipal}
            alt={producto.nombre}
            loading="lazy"
            width="400"
            height="600"
          />
        </picture>
        <picture>
          <source srcSet={imgHoverWebp} type="image/webp" />
          <img
            className="producto-card__imagen producto-card__imagen--hover"
            src={imgHover}
            alt={`${producto.nombre} – vista alternativa`}
            loading="lazy"
            width="400"
            height="600"
            onError={() => setHoverError(true)}
          />
        </picture>
      </div>

      <div className="producto-card__info">
        <h3 className="producto-card__nombre">{producto.nombre}</h3>
        <p className="producto-card__precio">
          {parseFloat(producto.precio).toFixed(2)} €
        </p>
      </div>
    </article>
  );
}
