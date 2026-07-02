import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Download } from 'lucide-react';
import { Button } from '../../../shared/components/UI/Button';
import { useCart } from '../../../shared/context/CartContext';
import apiClient from '../../../core/api/apiClient';
import { useToast } from '../../../shared/context/ToastContext';

export const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { addToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  
  // The payment intent ID will be present in the URL if using Stripe Elements return_url
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    // Clear the cart on successful checkout
    clearCart();
  }, [clearCart]);

  const handleDownloadReceipt = async () => {
    if (!paymentIntent) return;
    try {
      setIsDownloading(true);
      const res = await apiClient.get(`/pagos/comprobante/?payment_intent=${paymentIntent}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_${paymentIntent}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      addToast({ title: 'Error', message: 'No se pudo descargar el comprobante.', type: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-level-1 text-center relative overflow-hidden">
        
        {/* Decorative Top Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>
        
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-headline-sm font-bold text-on-surface mb-2">¡Pago Exitoso!</h1>
        <p className="text-on-surface-variant mb-6">
          Tu transacción se ha procesado correctamente. Gracias por tu compra en la Tienda Universitaria UNL.
        </p>

        {paymentIntent && (
          <div className="bg-surface-container-low p-4 rounded-xl mb-8 text-sm text-on-surface-variant flex flex-col gap-3">
            <div>
              <span className="font-bold uppercase text-xs tracking-wider opacity-70 block mb-1">Referencia de Transacción</span>
              <span className="font-mono">{paymentIntent}</span>
            </div>
            <Button 
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary/5 mt-2"
            >
              <Download size={18} />
              {isDownloading ? 'Generando...' : 'Descargar Comprobante (PDF)'}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-full flex items-center justify-center gap-2 bg-primary text-white"
            size="lg"
          >
            <Package size={18} />
            Ver mis pedidos
          </Button>
          <Button 
            onClick={() => navigate('/catalogo')} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            Volver al catálogo
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
