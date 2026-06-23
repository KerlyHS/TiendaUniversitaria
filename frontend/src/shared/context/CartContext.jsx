import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Inicializamos el carrito en 0 (vacío)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('unl_cart');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Filtrar ítems obsoletos que requieren variación pero quedaron sin ella (por ejemplo, con precio $0.00)
      return parsed.filter(item => {
        const needsVariation = item.variaciones && item.variaciones.length > 0;
        if (needsVariation && !item.selectedVariation) {
          return false;
        }
        return true;
      });
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('unl_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1, selectedVariation = null) => {
    setCartItems(prev => {
      // Si estamos agregando con una variación, removemos del carrito cualquier versión huérfana de este producto
      let cleanedPrev = prev;
      if (selectedVariation) {
        cleanedPrev = prev.filter(item => !(item.id === product.id && !item.selectedVariation));
      }

      // Diferenciar por producto Y variación
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
  }, []);

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
