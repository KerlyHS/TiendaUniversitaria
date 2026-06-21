import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '../../../shared/components/UI/Button';

export const CheckoutCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-level-1 text-center relative overflow-hidden">
        
        {/* Decorative Top Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-error"></div>
        
        <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} />
        </div>
        
        <h1 className="text-headline-sm font-bold text-on-surface mb-2">Pago Cancelado</h1>
        <p className="text-on-surface-variant mb-8">
          El proceso de pago ha sido cancelado o no pudo completarse. No se ha realizado ningún cargo a tu cuenta. Tus productos siguen guardados en el carrito.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => navigate('/checkout')} 
            className="w-full flex items-center justify-center gap-2 bg-primary text-white"
            size="lg"
          >
            <ShoppingCart size={18} />
            Intentar pagar nuevamente
          </Button>
          <Button 
            onClick={() => navigate('/catalogo')} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Seguir comprando
          </Button>
        </div>
      </div>
    </div>
  );
};
