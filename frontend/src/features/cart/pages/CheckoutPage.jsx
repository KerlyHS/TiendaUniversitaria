import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../../shared/context/CartContext';
import { ordersService, paymentService } from '../../../core/api/services';
import { Button } from '../../../shared/components/UI/Button';
import { Lock, AlertCircle, ShoppingBag } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object on every render.
// The user will need to configure this in their .env file later.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pagos/exito`,
      },
    });

    if (error) {
      // This point will only be reached if there is an immediate error when confirming the payment.
      // Otherwise, your customer will be redirected to your `return_url`.
      setErrorMessage(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-error/10 text-error p-4 rounded-soft flex items-start gap-2 text-sm font-medium">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50"
        size="lg"
      >
        {isProcessing ? 'Procesando pago...' : `Pagar $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/catalogo');
      return;
    }
    
    if (initialized.current) return;
    initialized.current = true;

    const initCheckout = async () => {
      try {
        // 1. Crear el Pedido
        const detalles = cartItems.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad
        }));

        const pedidoResponse = await ordersService.createOrder({
          tipo_entrega: 'TIENDA',
          detalles
        });

        // 2. Crear PaymentIntent en Stripe
        const paymentResponse = await paymentService.createPaymentIntent(pedidoResponse.id);
        
        setClientSecret(paymentResponse.client_secret);
      } catch (err) {
        console.error('Error al iniciar checkout:', err);
        setError('Ocurrió un error al preparar el pago. Por favor, intenta nuevamente.');
      } finally {
        setIsInitializing(false);
      }
    };

    initCheckout();
  }, [cartItems, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-on-surface">Preparando tu pago seguro...</h2>
          <p className="text-on-surface-variant mt-2">Por favor, espera un momento.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-xl border border-outline-variant/30 shadow-level-1 text-center">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Error</h2>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <Button onClick={() => navigate('/catalogo')} className="bg-primary text-white">
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Lock size={24} />
          </div>
          <div>
            <h1 className="text-headline-sm font-bold text-secondary">Pago Seguro</h1>
            <p className="text-gray-500">Completa tu compra con tarjeta de crédito o débito.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formulario de Pago */}
          <div className="flex-1 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
            {clientSecret && (
              <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                <CheckoutForm amount={subtotal} />
              </Elements>
            )}
          </div>

          {/* Resumen de Compra */}
          <div className="w-full lg:w-96 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-sm h-fit">
            <h2 className="text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" />
              Resumen del Pedido
            </h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-on-surface-variant flex-1 truncate pr-2">{item.cantidad}x {item.nombre}</span>
                  <span className="text-on-surface font-medium">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/30 pt-4 space-y-2">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Retiro en Campus</span>
                <span className="text-primary font-medium">Gratis</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-on-surface pt-2 mt-2 border-t border-outline-variant/30">
                <span>Total a Pagar</span>
                <span className="text-primary">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
