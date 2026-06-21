import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/hooks/useAuth.js';
import { useState } from 'react';
import { User } from 'lucide-react';

/**
 * Header Component - TiendaUniversitaria
 * 
 * Features:
 * - Logo y navegación principal
 * - Links: Catálogo, Carrito, Dashboard
 * - Auth state: Login/Register o Menú de usuario
 * - Mobile responsive (menú hamburguesa)
 * 
 * Spec-Kit Metadata:
 * @spec Spec-001: Auth status display
 */

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="site-header" role="banner">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo" aria-label="Tienda Universitaria - Ir a inicio">
          <h1>🛍️ TiendaUniversitaria</h1>
        </Link>

        {/* Navegación Principal */}
        <nav className="main-nav" aria-label="Navegación principal">
          <ul className="nav-list">
            <li>
              <Link to="/catalogo" className="nav-link">
                📚 Catálogo
              </Link>
            </li>
            <li>
              <Link to="/carrito" className="nav-link">
                🛒 Carrito <span className="cart-badge">0</span>
              </Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/dashboard" className="nav-link">
                  📦 Mis Pedidos
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Auth Section */}
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="btn-user flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-label="Menú de usuario"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User size={18} />
                </div>
                <span className="font-title-sm hidden sm:block">{user?.nombre_completo || user?.email}</span>
                <span className="text-xs text-on-surface-variant">▼</span>
              </button>

              {menuOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/perfil" onClick={() => setMenuOpen(false)}>
                      👤 Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <hr />
                  </li>
                  <li>
                    <button onClick={handleLogout} className="btn-logout">
                      🚪 Cerrar Sesión
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
