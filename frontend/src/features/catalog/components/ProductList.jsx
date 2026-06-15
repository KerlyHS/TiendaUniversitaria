import { useState, useCallback } from 'react';
import { useProducts } from '../../../core/hooks/useAPI';
import { ProductCard } from './ProductCard';

/**
 * ProductList Component - TiendaUniversitaria
 * 
 * Spec-002: Catálogo de Productos
 * Spec-004: Filtrado y ordenamiento
 * 
 * Features:
 * - GET /api/v1/productos/ con filtros
 * - Búsqueda por nombre
 * - Filtro por categoría
 * - Ordenamiento (nombre, precio, stock)
 * - Paginación
 * - Estados de carga y error
 * 
 * Spec-Kit Metadata:
 * @spec Spec-002: Product list with filtering
 * @spec Spec-004: Search, filter, sorting, pagination
 */

export const ProductList = () => {
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    ordering: 'nombre',
    limit: 12,
    offset: 0,
  });

  const { products, loading, error, pagination, refetch } = useProducts(filters);

  // Manejar búsqueda
  const handleSearch = useCallback((e) => {
    const search = e.target.value;
    setFilters((prev) => ({
      ...prev,
      search,
      offset: 0,
    }));
  }, []);

  // Manejar filtro de categoría
  const handleCategoryFilter = useCallback((e) => {
    const categoria = e.target.value;
    setFilters((prev) => ({
      ...prev,
      categoria,
      offset: 0,
    }));
  }, []);

  // Manejar ordenamiento
  const handleSort = useCallback((e) => {
    const ordering = e.target.value;
    setFilters((prev) => ({
      ...prev,
      ordering,
    }));
  }, []);

  // Manejar agregar al carrito
  const handleAddToCart = (productId, productName) => {
    // Spec-007: Integración con carrito (futuro)
    alert(`${productName} agregado al carrito`);
  };

  // Limpiar filtros
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      categoria: '',
      ordering: 'nombre',
      limit: 12,
      offset: 0,
    });
  }, []);

  return (
    <section className="products-section" aria-labelledby="products-title">
      <h2 id="products-title" className="sr-only">
        Lista de Productos Disponibles
      </h2>

      {/* SEARCH & FILTERS */}
      <div className="search-section">
        <div className="search-container">
          {/* Búsqueda (Spec-002) */}
          <input
            type="search"
            className="search-input"
            placeholder="Buscar productos..."
            value={filters.search}
            onChange={handleSearch}
            aria-label="Buscar productos por nombre o descripción"
          />

          {/* Ordenamiento (Spec-002) */}
          <div className="sort-controls">
            <label htmlFor="sort-select" className="sr-only">
              Ordenar por:
            </label>
            <select
              id="sort-select"
              className="sort-select"
              value={filters.ordering}
              onChange={handleSort}
              aria-label="Ordenar productos"
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="precio">Precio (Menor)</option>
              <option value="-precio">Precio (Mayor)</option>
              <option value="-stock">Stock Disponible</option>
            </select>
          </div>
        </div>

        {/* Sidebar: Filtros por Categoría (Spec-002) */}
        <aside className="sidebar-filters" role="complementary">
          <h3>Filtrar por Categoría</h3>

          <div className="filter-group">
            <label className="filter-checkbox">
              <input
                type="radio"
                name="categoria"
                value=""
                checked={filters.categoria === ''}
                onChange={handleCategoryFilter}
                aria-label="Mostrar todas las categorías"
              />
              <span>Todas</span>
            </label>

            {['TEXTIL', 'ACCESORIOS', 'ALIMENTOS', 'LIBROS'].map((cat) => (
              <label key={cat} className="filter-checkbox">
                <input
                  type="radio"
                  name="categoria"
                  value={cat}
                  checked={filters.categoria === cat}
                  onChange={handleCategoryFilter}
                  aria-label={`Filtrar por ${cat}`}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <button
            className="btn btn-secondary btn-block"
            onClick={handleClearFilters}
            aria-label="Limpiar todos los filtros"
          >
            Limpiar Filtros
          </button>
        </aside>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="loading-spinner" aria-live="polite">
          <p>Cargando productos...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="alert alert-error" role="alert">
          Error al cargar productos: {error}
          <button onClick={refetch} className="btn btn-small">
            Reintentar
          </button>
        </div>
      )}

      {/* PRODUCTS GRID (Spec-002: Grilla de productos) */}
      {!loading && !error && (
        <>
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
          )}

          {/* PAGINATION (Spec-002: Paginación) */}
          {pagination.count > 0 && (
            <nav className="pagination" aria-label="Paginación de productos">
              <button
                className="btn btn-outline"
                disabled={!pagination.previous}
                aria-label="Página anterior"
              >
                ← Anterior
              </button>
              <span className="page-info">
                {Math.floor(filters.offset / filters.limit) + 1} de{' '}
                {Math.ceil(pagination.count / filters.limit)}
              </span>
              <button
                className="btn btn-outline"
                disabled={!pagination.next}
                aria-label="Página siguiente"
              >
                Siguiente →
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};
