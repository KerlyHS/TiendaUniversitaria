import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, TrendingUp, Wallet, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/catalogo');
  };

  const navItems = [
    { name: 'Panel Control', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'GERENTE'] },
    { name: 'Inventario', path: '/admin/inventario', icon: Package, roles: ['ADMIN', 'GERENTE', 'BODEGUERO'] },
    { name: 'Ventas', path: '/admin/ventas', icon: TrendingUp, roles: ['ADMIN', 'GERENTE'] },
    { name: 'Caja', path: '/admin/caja', icon: Wallet, roles: ['ADMIN', 'CAJERO', 'GERENTE'] },
    { name: 'Configuración', path: '/admin/configuracion', icon: Settings, roles: ['ADMIN', 'CAJERO', 'GERENTE', 'BODEGUERO'] },
  ].filter(item => item.roles.includes(user?.rol));

  return (
    <div className="flex flex-col h-screen bg-surface-container-lowest overflow-hidden">
      {/* Top Header */}
      <header className="bg-[#00263E] text-white flex items-center px-6 py-4 shadow-md z-10">
        <Link to="/admin/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="text-xl">🛍️</span>
          <h1 className="font-display-sm text-xl font-bold tracking-tight">TiendaUniversitaria</h1>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
      <aside className="w-[280px] bg-surface border-r border-outline-variant flex flex-col transition-all duration-300">
        <div className="p-6 border-b border-outline-variant flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <h2 className="font-display-sm text-lg font-bold text-on-surface leading-tight">Gestión UNL</h2>
            <p className="text-label-sm text-on-surface-variant capitalize">{user?.rol?.toLowerCase() || 'Administrador'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-title-sm transition-colors ${
                  isActive 
                    ? 'bg-[#006633] text-white shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-title-sm text-error hover:bg-error/10 transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest relative flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
