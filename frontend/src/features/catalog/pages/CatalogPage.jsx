import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../../shared/context/CartContext';
import { useToast } from '../../../shared/context/ToastContext';
import { catalogService } from '../../../core/api/services';
import { getProductDisplayPrice } from '../../../shared/utils/priceHelper';

const FOOD_CATEGORIES = ['AGRICOLA', 'HORTALIZAS', 'FRUTAS', 'CARNES', 'LACTEOS', 'BEBIDAS'];

export const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const categoriaParam = searchParams.get('categoria')?.toUpperCase();
  const searchParam = searchParams.get('q')?.toLowerCase();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await catalogService.listProducts();
        setProducts(res.results || res);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Redirigir al detalle si es textil o de categoría de alimentos (para elegir variaciones obligatorias)
    if (product.categoria === 'TEXTIL' || FOOD_CATEGORIES.includes(product.categoria)) {
      navigate(`/producto/${product.id}`);
      return;
    }

    addToCart(product, 1);
    addToast({
      title: '¡Añadido al carrito!',
      message: `El producto "${product.nombre}" se agregó correctamente.`,
      actionText: 'Ver Carrito',
      onAction: () => openCart()
    });
  };

  const filteredProducts = products.filter(product => {
    let matchCategoria = true;
    let matchSearch = true;

    if (categoriaParam) {
      if (categoriaParam === 'TEXTIL') matchCategoria = product.categoria === 'TEXTIL';
      else if (categoriaParam === 'ACCESORIOS') matchCategoria = product.categoria === 'SOUVENIR' || product.categoria === 'ACADEMICO';
      else if (categoriaParam === 'ALIMENTOS') matchCategoria = FOOD_CATEGORIES.includes(product.categoria);
      else if (categoriaParam === 'LIBROS') matchCategoria = product.categoria === 'LIBRERIA';
      else matchCategoria = product.categoria === categoriaParam;
    }

    if (searchParam) {
      matchSearch = product.nombre.toLowerCase().includes(searchParam) || 
                    (product.descripcion && product.descripcion.toLowerCase().includes(searchParam));
    }

    return matchCategoria && matchSearch;
  });

  return (
    <div className="flex-grow w-full flex flex-col pb-12">
      
      {/* Hero Banner */}
      <section className="relative w-full h-[400px] md:h-[500px] bg-on-background overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            alt="UNL Identity Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoC38f4GLK2xsU0j_j4EkqTHjtMZkBOkyR8A014FcuCZuVFwV3u4Nc2j610dEBiJ5VpsP6gHiGuJPH5dN7872LwrQPmVF69Ukd8So4Bo94FoC1uwt2qbTQ3XtcD5SbGL2epYB9Q4faY96g28bzIGWTXtJh_zFSjRyDRDEtItAfpN6ufZUFAXjOnp2k86Ul8hTnPEaJnoISYjtYhGHOkdTlhsTydLOAqJuV2WM9_gEa5QzSXwLmzroeYPVvxBv_8xR6NFhH2PQsdTUQ" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-on-background via-on-background/80 to-transparent"></div>
        </div>
        
        <div className="relative w-full max-w-max-width px-margin-mobile md:px-margin-desktop mx-auto flex flex-col md:flex-row items-center justify-between gap-8 z-10">
          {/* Hero Text */}
          <div className="max-w-xl text-left flex flex-col gap-4">
            <span className="font-label-caps text-label-caps text-primary-fixed tracking-widest uppercase">Orgullo • Identidad • Excelencia</span>
            <h1 className="font-display-lg text-display-lg text-on-primary font-bold leading-tight">
              Lleva tu identidad <span className="text-primary-fixed">UNL</span>
            </h1>
            <p className="font-body-lg text-body-lg text-surface-dim opacity-90 max-w-md">
              Productos oficiales de la Universidad Nacional de Loja para estudiantes, docentes y toda la comunidad universitaria.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button className="bg-primary-fixed text-on-primary-fixed font-title-md text-title-md px-6 py-3 rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-sm">
                Explorar productos
              </button>
              <button className="bg-transparent border border-outline-variant text-on-primary font-title-md text-title-md px-6 py-3 rounded-lg hover:bg-white/5 transition-colors">
                Ver categorías
              </button>
            </div>
          </div>
          
          {/* Hero Image/Product Feature */}
          <div className="hidden md:block w-full max-w-md relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <img 
              alt="UNL Featured Merchandise" 
              className="relative z-10 w-full h-auto rounded-xl shadow-2xl border border-white/10" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAkMRp6BT-Z0ExWEqoYD4EeHDUILC1EvS8R_T6rsXK4NnoODJxEBK2W7Wc-R6c_ZnUDkZy95TjYZWzXx3zkMllqhnX0lknrEFlzAMCzGWcRGQ-Eo_QrsKgscvzN_IZnc5zV2w7b90EhjAtepUi7xeKlMhdppsIONo7KSVb-XKASTKXv24wM9XywCErxyrj-m6C-x7Nufek0TxjeSEMW6JkD28UrtuXMk4Jfk7LRx3t3cVzozIlqecg5hS7AdcfyHTDr4HublDGTmx4" 
            />
          </div>
        </div>
      </section>

      <div className="w-full px-margin-mobile md:px-margin-desktop py-8 max-w-max-width mx-auto flex flex-col gap-12 -mt-16 relative z-20">
        
        {/* Category Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          
          {/* Category Card 1 */}
          <div className="bg-surface border border-outline-variant rounded-DEFAULT p-4 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-primary transition-all group h-full">
            <h2 className="font-title-md text-title-md text-on-surface font-bold">Línea Textil Oficial</h2>
            <div className="flex-grow rounded-sm overflow-hidden bg-surface-container-low h-48 relative">
              <img 
                alt="Textil Category" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXXA6gjfyAEqHQxNwy_h3XjmEse9A8jGAvMe76VNak_JMGxYCgDxnyv92Y9DCQHmo_YGXcam78zDpgunIoyjglF4itEuCOL4_bjgLyqb06IbnxbneIqciAauK-FMQbgXHtEJ2L5O5Mw6DzhTKI-A2MTt60pOfzh58wc8_ouWUIeqM3a3-VfLsVXWl0__sIOJ7UJDiWP9l2m7NkvMIDZK3vw_cwIWQSHQzdHPHrY0Y4T8I_3pwuIvPGWneQTDmPN-kl9bvjsNE2eUC7" 
              />
            </div>
            <Link to="/catalogo?categoria=textil" className="font-body-sm text-body-sm text-primary hover:underline mt-auto">Comprar indumentaria</Link>
          </div>
          
          {/* Category Card 2 (4-grid style) */}
          <div className="bg-surface border border-outline-variant rounded-DEFAULT p-4 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-primary transition-all group h-full">
            <h2 className="font-title-md text-title-md text-on-surface font-bold">Accesorios de Estudio</h2>
            <div className="grid grid-cols-2 gap-2 flex-grow h-48">
              <div className="flex flex-col gap-1">
                <div className="bg-surface-container-low rounded-sm overflow-hidden h-20">
                  <img alt="Cuadernos" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA11uXpthhnztBplwZgdAkpTjdxKFY7YMn1_fjubiA2fJzrtTXc3EvhupvcdZD2iQMRhPdeIzj62gkX7JUx7J9CWwHP2zfOKLlFrgZEq9hu_vGUxp_reJaz1ABSUl8j4Kw98EPr4w8N47ZcRn1JmUNLvGx1MRAxwsPTIWHNLf-_Bw7xUDaLbw1IemCnDRKhNNmQG6YYwYgxEuo7EYjKSX7L9zOncF56VBiEr6WPi1v1Gs7iOhJO0TwA6XEnuc1XIIVI2MKqHFj0UCkW" />
                </div>
                <span className="font-body-sm text-[12px] text-on-surface-variant truncate">Cuadernos</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="bg-surface-container-low rounded-sm overflow-hidden h-20">
                  <img alt="Tazas" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR9aX5BepoTDiNd10j4qHXPxa2d0K8ORAJM4WqYz5hiwh8x8SwcDWHNa550Do4k5XUCAiHbXinnLV0VD5jMstCEALW0WA9NZUyYUnzAtrzx8vIrL_Z4ADylx_AcCVmn-QALSD2TW478cGwXdzj-XUO7kWo4LHKYy7MvPQ-CmQP68_FR0fM-NYf8c2bhwidiPn8_UfPh0ernEbWm-y4l36-Nq5AFtZ2R0b9Zq2qMcpIzhxW_xlosMyUKbjCPjsF4ZIn7xO8-wnXDnN0" />
                </div>
                <span className="font-body-sm text-[12px] text-on-surface-variant truncate">Tazas</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="bg-surface-container-low rounded-sm overflow-hidden h-20">
                  <img alt="Mochilas" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdadbANagg12yUJK3OJeK1cj500h-jJwSnvnEV6lcN9HRRihB0bBt_b9mxhZNmguC3I2y6mw3EdONEfWCIHBqrr0YQQPS4MbceIhN7gYzSeHy739KLU6Y83qQNWHCdRRY3fnv3rWl5vOhK7HbAR9E3FoT2Z_v3UxpHA1IpNpWkOe6v4FcmIdEZnEeutA3R2G5tBTpf7EuRPhNkybs4cR-bR1u-cTg7DWoPBjdm-qDorU_zqMuSwUpvboS5DuRscDuXf5400e1clqWk" />
                </div>
                <span className="font-body-sm text-[12px] text-on-surface-variant truncate">Mochilas</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="bg-surface-container-low rounded-sm overflow-hidden h-20">
                  <img alt="Pines y Lanyards" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkGvOtDzi-h6YUKLXFz2N1AjVUMPoXK1ohv2N20nLGrz2DrVkeNCaqu4l2Git8mO25qB9rDFtGW6KZ3Sr573eqzXlAVjD3sGxahOmtp_IisHwZph0sJ3UeRAX3KnZaEkaB44h3XSwhtuh11CSSKkDlDetlVG7-gLpnOdcdQUoFwzBwpY5xH6b4Qj8bxCoq4Gaof7jMlz29UCukIhSDQ4iUfhpTKgsnnsuFg00uk05pDmFguN8Z2-n0H4jX0-OkXqNa4FVKbU6nBduH" />
                </div>
                <span className="font-body-sm text-[12px] text-on-surface-variant truncate">Pines & Más</span>
              </div>
            </div>
            <Link to="/catalogo?categoria=accesorios" className="font-body-sm text-body-sm text-primary hover:underline mt-auto">Ver todos los accesorios</Link>
          </div>
          
          {/* Category Card 3 */}
          <div className="bg-surface border border-outline-variant rounded-DEFAULT p-4 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-primary transition-all group h-full">
            <h2 className="font-title-md text-title-md text-on-surface font-bold">Ediciones UNL</h2>
            <div className="flex-grow rounded-sm overflow-hidden bg-surface-container-low h-48 relative">
              <img 
                alt="Libros Category" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5GcFw--T9GslnPfSygbnglURhrwNA411zYhAVFdV8yXouTfYFn9fZF2EaVoxCvRcIK054oosZaSbzPzE7NMraVMSI905eK7KcWYVRy9CqdmFf_asWYq3Twp4iUpvweQwhiuOC3Qrd_gTpcAj-4DL_x1CV4oCw3ZBoY-qls8B70duu4ZfoCvWj0U_B-nG3oHc5O5qG_wo2ZAl0vnXwtGg8LLuG0AAIEt7B0pCEIlqNZ7YeMY7kEZWrUdqlqMmHqqhq66Ose9hQnzYU" 
              />
            </div>
            <Link to="/catalogo?categoria=libros" className="font-body-sm text-body-sm text-primary hover:underline mt-auto">Explorar catálogo editorial</Link>
          </div>
          
          {/* Promo Card */}
          <div className="bg-surface-container-low border border-outline-variant rounded-DEFAULT p-4 flex flex-col items-center justify-center gap-4 text-center shadow-sm h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent pointer-events-none"></div>
            <h2 className="font-title-md text-title-md text-on-surface font-bold relative z-10">Descuento Estudiantes</h2>
            <span className="font-display-lg text-[40px] text-primary font-bold leading-none relative z-10">-15%</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant relative z-10">En todas tus compras presentando tu credencial universitaria en caja o vinculando tu cuenta.</p>
            <Link to="/registro" className="mt-2 text-center bg-transparent border border-primary text-primary hover:bg-primary/5 font-title-md text-title-md px-4 py-2 rounded-DEFAULT transition-colors w-full relative z-10">
              Vincular cuenta
            </Link>
          </div>
        </section>

        {/* Novedades (Product Grid) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between border-b border-outline-variant pb-2">
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Novedades Destacadas</h2>
            <a className="font-body-sm text-body-sm text-primary hover:underline hidden sm:block" href="#">Ver todas las novedades</a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-gutter">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredProducts.length > 0 ? filteredProducts.map((product, index) => {
              const displayInfo = getProductDisplayPrice(product);
              return (
              <div 
                key={product.id} 
                onClick={() => navigate(`/producto/${product.id}`)}
                className={`flex flex-col gap-3 group relative cursor-pointer ${index > 2 ? 'hidden md:flex' : ''} ${index > 3 ? 'hidden lg:flex' : ''}`}
              >
                <div className="w-full aspect-[4/5] bg-surface-container-low rounded-DEFAULT border border-outline-variant overflow-hidden relative">
                  {product.promocion_activa && (
                    <span className="absolute top-2 left-2 bg-error text-on-error font-label-caps text-[10px] px-2 py-1 rounded-sm z-10">-20%</span>
                  )}
                  <img alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.imagen || 'https://via.placeholder.com/400x500?text=Sin+Imagen'} />
                  
                  {/* Quick Add Hover Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform hidden md:flex justify-center">
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-2 rounded-sm hover:bg-primary-container shadow-sm transition-colors"
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-body-lg text-body-lg text-on-surface line-clamp-2 leading-tight">{product.nombre}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-headline-lg text-[20px] text-primary font-bold">
                      ${displayInfo.precio.toFixed(2)}
                      {displayInfo.unidad && <span className="text-body-sm text-on-surface-variant font-normal ml-1">/ {displayInfo.unidad}</span>}
                    </span>
                    {product.promocion_activa && (
                      <span className="font-body-sm text-[12px] text-outline line-through">
                        ${(displayInfo.precio * 1.2).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">
                      {product.stock > 0 ? 'check_circle' : 'inventory_2'}
                    </span> 
                    {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                  </span>
                </div>
              </div>
            );
            }) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">search_off</span>
                <p className="text-on-surface-variant">No se encontraron productos para los filtros seleccionados.</p>
                <Link to="/catalogo" className="text-primary hover:underline mt-2">Ver todos los productos</Link>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
