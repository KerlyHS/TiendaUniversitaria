import { Card } from '../../../shared/components/UI/Card';
import { Button } from '../../../shared/components/UI/Button';
import { ShoppingCart } from 'lucide-react';

// Product Card Item Component
const ProductCard = ({ product }) => {
  return (
    <div className="group relative flex flex-col bg-white rounded-lg border border-gray-200 shadow-level-1 hover:border-primary hover:shadow-level-2 transition-all duration-300 overflow-hidden h-full">
      {/* Image Container (60% approx visual weight) */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img 
          src={product.imagen || 'https://via.placeholder.com/400x400?text=Producto'} 
          alt={product.nombre}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Quick Add Overlay Button (Desktop Hover) */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hidden md:block">
          <Button className="w-full shadow-md" size="sm">
            <ShoppingCart size={16} className="mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category Label */}
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          {product.categoria?.nombre || 'Categoría'}
        </span>
        
        {/* Title (Max 2 lines) */}
        <h3 className="text-base font-semibold text-secondary leading-tight mb-2 line-clamp-2">
          {product.nombre}
        </h3>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${Number(product.precio).toFixed(2)}
          </span>
          {/* Mobile Add Button */}
          <button className="md:hidden p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCardGrid = ({ products = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col gap-2">
            <div className="bg-gray-200 aspect-square rounded-lg w-full"></div>
            <div className="bg-gray-200 h-4 w-1/3 rounded mt-2"></div>
            <div className="bg-gray-200 h-5 w-full rounded"></div>
            <div className="bg-gray-200 h-6 w-1/4 rounded mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
        <ShoppingCart size={48} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-secondary">No se encontraron productos</h3>
        <p className="text-gray-500 max-w-sm mt-2">Intenta ajustar tus filtros de búsqueda para encontrar lo que buscas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
