/**
 * ProductCard Component - TiendaUniversitaria
 * 
 * Spec-002: Catálogo de Productos
 * Spec-004: Producto CRUD
 * 
 * Features:
 * - Mostrar producto con imagen
 * - Precio + IVA (si aplica_impuesto=true)
 * - Stock disponible
 * - Botón "Agregar al carrito" (Spec-007)
 * - Botón "Ver detalles"
 * 
 * Spec-Kit Metadata:
 * @spec Spec-002: Product listing card
 * @spec Spec-004: Impuesto display (12% IVA)
 * @spec Spec-007: Add to cart button (future)
 */

import { Link } from 'react-router-dom';

export const ProductCard = ({ product, onAddToCart }) => {
  // Calcular precio total con impuesto
  const basePrice = parseFloat(product.precio);
  const ivaAmount = product.aplica_impuesto ? basePrice * 0.12 : 0;
  const totalPrice = basePrice + ivaAmount;

  const isOutOfStock = product.stock === 0;

  return (
    <article className="product-card" aria-label={`Producto: ${product.nombre}`}>
      {/* Encabezado: Nombre y SKU */}
      <header className="product-header">
        <h3 className="product-title">
          <Link to={`/catalogo/${product.id}`} className="product-link">
            {product.nombre}
          </Link>
        </h3>
        <p className="product-sku">SKU: {product.codigo}</p>
      </header>

      {/* Imagen */}
      <figure className="product-image">
        <img
          src={product.imagen_url || '/placeholder.png'}
          alt={product.nombre}
          loading="lazy"
        />
        {product.aplica_impuesto && (
          <figcaption className="tax-label">Incluye IVA 12%</figcaption>
        )}
      </figure>

      {/* Detalles: Descripción, Precio, Stock */}
      <div className="product-details">
        <p className="product-description">{product.descripcion}</p>

        {/* Pricing (Spec-004: Mostrar impuesto) */}
        <div className="product-pricing">
          <span className="price" aria-label={`Precio: $${totalPrice.toFixed(2)}`}>
            ${totalPrice.toFixed(2)}
          </span>
          {product.aplica_impuesto && (
            <small className="price-breakdown">
              Base: ${basePrice.toFixed(2)} + IVA: ${ivaAmount.toFixed(2)}
            </small>
          )}
        </div>

        {/* Stock (Spec-002: Mostrar disponibilidad) */}
        <div className="product-stock">
          <span className="stock-label">Stock:</span>
          <span className="stock-count" aria-live="polite">
            {product.stock > 0
              ? `${product.stock} unidades disponibles`
              : 'Agotado'}
          </span>
        </div>

        {/* Acciones */}
        <div className="product-actions">
          <Link
            to={`/catalogo/${product.id}`}
            className="btn btn-secondary"
            aria-label={`Ver detalles de ${product.nombre}`}
          >
            Ver Detalles
          </Link>

          <button
            className="btn btn-primary"
            onClick={() => onAddToCart(product.id, product.nombre)}
            disabled={isOutOfStock}
            aria-label={`Agregar ${product.nombre} al carrito`}
          >
            {isOutOfStock ? '❌ Agotado' : '🛒 Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
};
