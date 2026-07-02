import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Trash2, Lock } from 'lucide-react';
import { Button } from '../../../shared/components/UI/Button';
import { useCart } from '../../../shared/context/CartContext';

export const OffCanvasCart = () => {
  const navigate = useNavigate();
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, totalItems, subtotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-on-background/50 backdrop-blur-sm z-[100] transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-surface-container-lowest shadow-lg z-[101] flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-2 text-on-surface font-bold text-lg">
            <ShoppingCart size={24} className="text-primary" />
            Tu Carrito ({totalItems})
          </div>
          <button 
            onClick={closeCart}
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-70">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p>Tu carrito está vacío.</p>
            </div>
          ) : (
            cartItems.map(item => {
              const uniqueKey = `${item.id}-${item.selectedVariation?.id || 'base'}`;
              return (
                <div key={uniqueKey} className="flex gap-4">
                  <div className="w-20 h-20 bg-surface-container-low rounded-soft flex-shrink-0 border border-outline-variant/50 overflow-hidden">
                    {item.imagen && <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="text-sm font-semibold text-on-surface leading-tight">
                      {item.nombre} 
                      {item.selectedVariation && <span className="block text-xs text-on-surface-variant font-normal mt-0.5 opacity-80">{item.selectedVariation.nombre}</span>}
                    </h4>
                    <div className="text-primary font-bold mt-1">${Number(item.precio).toFixed(2)}</div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center border border-outline-variant rounded">
                        <button onClick={() => updateQuantity(item.id, item.selectedVariation?.id, -1)} className="px-2 py-1 text-on-surface hover:bg-surface-container">-</button>
                        <span className="px-2 text-sm font-medium">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, item.selectedVariation?.id, 1)} className="px-2 py-1 text-on-surface hover:bg-surface-container">+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedVariation?.id)}
                        className="text-on-surface-variant hover:text-error p-1 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-outline-variant/30 bg-surface-container-low">
            <div className="flex justify-between text-sm text-on-surface-variant mb-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant mb-4">
              <span>Impuestos (Calculado en Checkout)</span>
              <span>--</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-on-surface mb-6 pt-4 border-t border-outline-variant/30">
              <span>Total Estimado</span>
              <span className="text-primary">${subtotal.toFixed(2)}</span>
            </div>
            
            <Button 
              className="w-full bg-primary text-on-primary hover:bg-primary-container" 
              size="lg"
              onClick={() => {
                closeCart();
                navigate('/checkout');
              }}
            >
              Ir a Pagar
            </Button>
            <p className="text-center text-xs text-on-surface-variant mt-4 flex items-center justify-center gap-1">
              <Lock size={12} />
              Pago seguro garantizado por la UNL.
            </p>
          </div>
        )}

      </div>
    </>
  );
};
