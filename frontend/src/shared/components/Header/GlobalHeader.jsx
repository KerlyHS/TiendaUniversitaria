import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../shared/context/CartContext';
import { CustomSearchEngine } from '../../../shared/utils/searchEngine';
import { catalogService } from '../../../core/api/services';
import { useAuth } from '../../../core/hooks/useAuth';

export const GlobalHeader = () => {
  const { totalItems, openCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  const [allProducts, setAllProducts] = useState([]);

  // Inicializar motor de búsqueda (en un app real vendría de un endpoint o store)
  const searchEngine = useMemo(() => new CustomSearchEngine(allProducts), [allProducts]);
  
  useEffect(() => {
    const fetchProds = async () => {
      try {
        const res = await catalogService.listProducts();
        setAllProducts(res.results || res);
      } catch (e) {
        console.error("Error al cargar productos para buscador", e);
      }
    };
    fetchProds();
  }, []);

  // Realizar búsqueda
  const searchResults = useMemo(() => {
    return searchEngine.search(searchQuery);
  }, [searchQuery, searchEngine]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || searchCategory) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (searchCategory) params.append('categoria', searchCategory);
      setShowResults(false);
      navigate(`/catalogo?${params.toString()}`);
    }
  };

  return (
    <header className="bg-on-background border-b border-outline shadow-none sticky top-0 z-50 w-full transition-colors duration-300">
      <div className="flex flex-col w-full px-margin-mobile md:px-margin-desktop py-unit max-w-max-width mx-auto">
        
        {/* Top Row: Brand, Location, Search, Actions */}
        <div className="flex items-center justify-between gap-4 py-2">
          
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-title-md font-title-md font-bold text-on-primary flex items-center gap-2">
              <span className="material-symbols-outlined filled text-primary-fixed-dim">school</span>
              <span className="hidden sm:block">Tienda Universitaria UNL</span>
              <span className="sm:hidden">UNL</span>
            </Link>
          </div>
          
          {/* Ubícanos */}
          <a href="https://maps.app.goo.gl/X1et5xkBGnCPL29u5" target="_blank" rel="noopener noreferrer" className="hidden lg:flex items-center gap-1 cursor-pointer hover:bg-white/10 transition-colors p-2 rounded-DEFAULT group">
            <span className="material-symbols-outlined text-primary-fixed-dim group-hover:text-primary-fixed">location_on</span>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-on-primary/70">Ubícanos en</span>
              <span className="font-title-md text-[14px] leading-tight text-on-primary font-bold group-hover:text-primary-fixed">Campus Central</span>
            </div>
          </a>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-grow max-w-3xl flex relative" ref={searchContainerRef}>
            <div className="relative w-full flex">
              <select 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="hidden md:block bg-surface-container-low border-none text-body-sm font-body-sm text-on-surface rounded-l-DEFAULT focus:ring-0 cursor-pointer px-3 py-2 outline-none"
              >
                <option value="">Todos</option>
                <option value="textil">Textil</option>
                <option value="accesorios">Accesorios</option>
                <option value="alimentos">Alimentos</option>
                <option value="libros">Libros</option>
              </select>
              <input 
                className="w-full bg-surface text-on-surface border-none px-4 py-2 text-body-sm font-body-sm focus:ring-2 focus:ring-primary outline-none md:rounded-none rounded-l-DEFAULT" 
                placeholder="Buscar productos, categorías..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              <button type="submit" className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-r-DEFAULT transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant shadow-lg rounded-DEFAULT max-h-96 overflow-y-auto z-[100]">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <Link 
                      key={result.id} 
                      to={`/catalogo/${result.id}`}
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-3 p-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/30 last:border-b-0"
                    >
                      <div className="w-12 h-12 bg-surface flex-shrink-0 rounded-sm overflow-hidden">
                        {result.imagen && <img src={result.imagen} alt={result.nombre} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex flex-col flex-grow">
                        <span className="font-body-sm font-bold text-on-surface">{result.nombre}</span>
                        <span className="text-xs text-on-surface-variant">{result.categoria?.nombre}</span>
                      </div>
                      <div className="font-bold text-primary">${Number(result.precio).toFixed(2)}</div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-on-surface-variant font-body-sm">
                    No se encontraron resultados para "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </form>
          
          {/* Trailing Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 text-on-primary">
            {isAuthenticated ? (
              <Link to={user?.rol === 'ADMIN' ? '/admin' : '/dashboard'} className="hidden md:flex items-center gap-2 p-2 hover:bg-white/10 rounded-DEFAULT transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-fixed-dim flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-label-caps text-[10px] text-on-primary">Hola,</span>
                  <span className="font-title-md text-[14px] leading-tight font-bold truncate max-w-[130px]">
                    {user?.nombre_completo || user?.email?.split('@')[0]}
                  </span>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="hidden md:flex flex-col items-start p-2 hover:bg-white/10 rounded-DEFAULT transition-colors">
                <span className="font-label-caps text-label-caps text-on-primary">Hola, Identifícate</span>
                <span className="font-title-md text-[14px] leading-tight font-bold">Cuenta y Listas</span>
              </Link>
            )}
            
            {isAuthenticated ? (
              <Link to={user?.rol === 'ADMIN' ? '/admin' : '/dashboard'} className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-fixed-dim flex items-center justify-center">
                  <span className="material-symbols-outlined">person</span>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">person</span>
              </Link>
            )}
            
            <button 
              onClick={openCart}
              className="p-2 hover:bg-white/10 rounded-DEFAULT transition-colors flex items-center gap-1 relative"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute top-0 right-0 md:static bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {totalItems}
              </span>
              <span className="hidden md:block font-title-md text-[14px] font-bold mt-3">Carrito</span>
            </button>
          </div>
        </div>
        
        {/* Bottom Row: Navigation Links */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2 mt-1">
          <Link to="/catalogo" className="flex items-center gap-1 text-primary-fixed-dim font-bold border-b-2 border-primary-fixed-dim pb-1 whitespace-nowrap text-body-sm hover:text-primary-fixed transition-colors opacity-80 scale-95">
            <span className="material-symbols-outlined text-[18px]">menu</span>
            Todo
          </Link>
          <Link to="/catalogo?categoria=textil" className="text-on-primary/90 font-body-sm text-body-sm whitespace-nowrap hover:text-primary-fixed hover:bg-white/10 transition-colors px-2 py-1 rounded-DEFAULT">Textil</Link>
          <Link to="/catalogo?categoria=accesorios" className="text-on-primary/90 font-body-sm text-body-sm whitespace-nowrap hover:text-primary-fixed hover:bg-white/10 transition-colors px-2 py-1 rounded-DEFAULT">Accesorios</Link>
          <Link to="/catalogo?categoria=alimentos" className="text-on-primary/90 font-body-sm text-body-sm whitespace-nowrap hover:text-primary-fixed hover:bg-white/10 transition-colors px-2 py-1 rounded-DEFAULT">Alimentos</Link>
          <Link to="/catalogo?categoria=libros" className="text-on-primary/90 font-body-sm text-body-sm whitespace-nowrap hover:text-primary-fixed hover:bg-white/10 transition-colors px-2 py-1 rounded-DEFAULT">Libros</Link>
        </div>
        
      </div>
    </header>
  );
};
