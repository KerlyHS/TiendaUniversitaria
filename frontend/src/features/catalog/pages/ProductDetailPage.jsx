import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Truck } from 'lucide-react';
import { useCart } from '../../../shared/context/CartContext';
import { useToast } from '../../../shared/context/ToastContext';
import { catalogService } from '../../../core/api/services';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();
  
  const getCategoryName = (cat) => typeof cat === 'object' && cat !== null ? cat.nombre : cat;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchProductAndRecommendations = async () => {
      setIsLoading(true);
      try {
        const prod = await catalogService.getProduct(id);
        setProduct(prod);
        
        // Cargar recomendaciones reales de la misma categoría o al azar
        const allProds = await catalogService.listProducts();
        const prodsArray = allProds.results || allProds;
        const recs = prodsArray.filter(p => p.id !== parseInt(id)).slice(0, 4);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndRecommendations();
  }, [id]);

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast({
      title: '¡Añadido al carrito!',
      message: `${quantity}x "${product.nombre}" se agregó correctamente.`,
      actionText: 'Ver Carrito',
      onAction: () => openCart()
    });
  };

  if (isLoading) {
    return (
      <div className="flex-grow w-full flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) return null;

  // Split description into paragraphs and bullets if it contains newline characters
  const descriptionParts = (product.descripcion || '').split('\\n').filter(p => p.trim() !== '');
  const mainDesc = descriptionParts.filter(p => !p.startsWith('•'));
  const bulletPoints = descriptionParts.filter(p => p.startsWith('•'));

  return (
    <div className="flex-grow w-full pb-12 bg-surface">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-6">
        
        {/* Breadcrumbs */}
        <div className="text-body-sm text-on-surface-variant flex gap-2 mb-8">
          <Link to="/" className="hover:text-primary">Inicio</Link>
          <span>&gt;</span>
          <Link to={`/catalogo?categoria=${getCategoryName(product.categoria)}`} className="hover:text-primary capitalize">{getCategoryName(product.categoria)?.toLowerCase()}</Link>
          <span>&gt;</span>
          <span className="text-on-surface truncate">{product.nombre}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left Column: Images */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex items-center justify-center p-4">
              {product.imagen ? (
                <img src={product.imagen} alt={product.nombre} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-surface-container-low flex items-center justify-center text-on-surface-variant font-label-lg">
                  Sin Imagen
                </div>
              )}
            </div>
            {/* Thumbnail Gallery (Mock) */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div className="w-20 h-20 border-2 border-primary rounded-lg overflow-hidden cursor-pointer flex-shrink-0">
                {product.imagen && <img src={product.imagen} alt="Thumb 1" className="w-full h-full object-cover" />}
              </div>
              <div className="w-20 h-20 border border-outline-variant rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 flex-shrink-0 bg-surface-container-low"></div>
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">
                {getCategoryName(product.categoria) || 'PRODUCTO UNL'}
              </span>
              <span className="text-body-sm text-outline">SKU: {product.codigo || `UNL-${product.id}`}</span>
            </div>
            
            <h1 className="font-display-md text-[32px] md:text-[40px] leading-tight text-on-surface font-bold mb-4">
              {product.nombre}
            </h1>
            
            <div className="mb-6">
              <span className="font-display-md text-[32px] text-primary font-bold">
                $ {parseFloat(product.precio).toFixed(2).replace('.', ',')}
              </span>
              <p className="text-body-sm text-on-surface-variant mt-1">Precio oficial para toda la comunidad.</p>
            </div>

            <hr className="border-outline-variant mb-6" />

            {/* Description */}
            <div className="prose prose-sm max-w-none text-on-surface-variant mb-8">
              {mainDesc.map((p, i) => (
                <p key={i} className="mb-2 font-body-lg leading-relaxed">{p}</p>
              ))}
              
              {bulletPoints.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {bulletPoints.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="font-body-md">{b.replace('•', '').trim()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6">
              {/* Quantity Selector */}
              <div className="flex items-center border border-outline rounded-DEFAULT bg-surface-container-lowest h-12 w-full sm:w-32">
                <button 
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <div className="flex-grow flex items-center justify-center font-title-md text-on-surface">
                  {quantity}
                </div>
                <button 
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  className="w-10 h-full flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                disabled={product.stock < 1}
                className="flex-grow bg-[#006633] text-white hover:bg-[#005522] h-12 rounded-DEFAULT flex items-center justify-center gap-2 font-title-md text-title-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                Agregar al carrito
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center sm:justify-end gap-2 text-on-surface-variant text-body-sm">
              <Truck size={16} />
              <span>Retiro gratis en Campus Central</span>
            </div>
            
          </div>
        </div>

        {/* Separator */}
        <hr className="border-outline-variant my-16" />

        {/* Recommendations */}
        <section className="flex flex-col gap-8">
          <h2 className="font-display-sm text-[28px] text-on-surface font-bold">Recomendados para ti</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <Link to={`/producto/${rec.id}`} key={rec.id} className="group flex flex-col gap-3 bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-md hover:border-primary transition-all pb-4 h-full">
                <div className="w-full aspect-[4/3] bg-surface-container-lowest relative overflow-hidden">
                  <img src={rec.imagen || 'https://via.placeholder.com/400x300?text=Sin+Imagen'} alt={rec.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="px-4 flex flex-col flex-grow">
                  <span className="text-label-sm text-on-surface-variant mb-1 uppercase">{getCategoryName(rec.categoria) || 'Tienda'}</span>
                  <h3 className="font-body-lg text-on-surface line-clamp-2 leading-tight mb-3 flex-grow">{rec.nombre}</h3>
                  <span className="font-title-lg text-primary font-bold">$ {parseFloat(rec.precio).toFixed(2).replace('.', ',')}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
