import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // Inicializamos el carrito en 0 (vacío)
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('unl_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('unl_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }
      return [...prev, { ...product, cantidad: quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
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
