/**
 * Botones de filtro por categoría.
 * "Todas" resetea el filtro; cada categoría llama al endpoint por id.
 */
export default function SelectorCategorias({ categorias, activa, onSeleccionar }) {
  return (
    <div className="selector-categorias" id="tienda">
      <button
        className={`selector-categorias__boton ${
          activa === null ? 'selector-categorias__boton--activo' : ''
        }`}
        onClick={() => onSeleccionar(null)}
      >
        Todas
      </button>

      {categorias.map((cat) => (
        <button
          key={cat.id}
          className={`selector-categorias__boton ${
            activa === cat.id ? 'selector-categorias__boton--activo' : ''
          }`}
          onClick={() => onSeleccionar(cat.id)}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
}
