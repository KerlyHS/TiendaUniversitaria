import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../core/hooks/useAuth';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart when user changes
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        const saved = localStorage.getItem(`unl_cart_${user.id}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const valid = parsed.filter(item => {
              const needsVariation = item.variaciones && item.variaciones.length > 0;
              if (needsVariation && !item.selectedVariation) {
                return false;
              }
              return true;
            });
            setCartItems(valid);
          } catch (e) {
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      } else {
        // Not authenticated -> empty cart
        setCartItems([]);
      }
      setIsInitialized(true);
    }
  }, [user, isAuthenticated, authLoading]);

  // Save cart when cartItems changes
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      localStorage.setItem(`unl_cart_${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized, isAuthenticated, user]);

  const addToCart = useCallback((product, quantity = 1, selectedVariation = null) => {
    if (!isAuthenticated) {
      addToast({
        title: 'Atención',
        message: 'Debes iniciar sesión para agregar productos al carrito.',
        type: 'warning'
      });
      return;
    }
    
    setCartItems(prev => {
      let cleanedPrev = prev;
      if (selectedVariation) {
        cleanedPrev = prev.filter(item => !(item.id === product.id && !item.selectedVariation));
      }

      const existing = cleanedPrev.find(item => 
        item.id === product.id && 
        (item.selectedVariation?.id === selectedVariation?.id)
      );

      if (existing) {
        return cleanedPrev.map(item => 
          item.id === product.id && (item.selectedVariation?.id === selectedVariation?.id)
            ? { ...item, cantidad: item.cantidad + quantity, precio: product.precio }
            : item
        );
      }
      return [...cleanedPrev, { ...product, cantidad: quantity, selectedVariation }];
    });
  }, [isAuthenticated, addToast]);

  const removeFromCart = useCallback((productId, variationId = null) => {
    setCartItems(prev => prev.filter(item => {
      const v1 = item.selectedVariation?.id || null;
      const v2 = variationId || null;
      return !(item.id === productId && v1 === v2);
    }));
  }, []);

  const updateQuantity = useCallback((productId, variationId, delta) => {
    setCartItems(prev => prev.map(item => {
      const v1 = item.selectedVariation?.id || null;
      const v2 = variationId || null;
      if (item.id === productId && v1 === v2) {
        const newQuantity = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQuantity };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      openCart,
      closeCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
