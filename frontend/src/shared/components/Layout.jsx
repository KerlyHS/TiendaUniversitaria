import { Outlet, useLocation } from 'react-router-dom';
import { GlobalHeader } from './Header/GlobalHeader';
import { CategoryRibbons } from './Header/CategoryRibbons';
import { Footer } from './Footer';
import { OffCanvasCart } from '../../features/cart/components/OffCanvasCart';

export const Layout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registro';
  const isDashboardPage = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/pedidos');

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* We only show Global Header and Ribbons on non-auth pages */}
      {!isAuthPage && (
        <>
          <GlobalHeader />
          {!isDashboardPage && <CategoryRibbons />}
        </>
      )}
      
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      {/* Basic Footer */}
      {!isAuthPage && <Footer />}

      {/* Cart Drawer Overlay */}
      <OffCanvasCart />
    </div>
  );
};
