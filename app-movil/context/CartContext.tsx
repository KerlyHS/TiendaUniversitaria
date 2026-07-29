import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, CartItem, ProductVariation } from '../types/product';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number, selectedVariation?: ProductVariation | null) => void;
    removeFromCart: (productId: string, variationId?: string | number | null) => void;
    updateQuantity: (productId: string, variationId: string | number | null | undefined, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
    iva: number;
    total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // IVA institucional (12% según backend settings.py)
    const IVA_RATE = 0.12;

    useEffect(() => {
        const loadCart = async () => {
            try {
                const saved = await AsyncStorage.getItem('unl_cart');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Aseguramos que los precios sean números al cargar
                    const validItems = parsed.map((item: any) => ({
                        ...item,
                        price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
                        cantidad: parseInt(item.cantidad || '1', 10)
                    })).filter((item: any) => {
                        const needsVariation = item.variaciones && item.variaciones.length > 0;
                        if (needsVariation && !item.selectedVariation) {
                            return false;
                        }
                        return true;
                    });
                    setCartItems(validItems);
                }
            } catch (e) {
                console.error("Error loading cart from storage", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadCart();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            AsyncStorage.setItem('unl_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded]);

    const addToCart = useCallback((product: Product, quantity: number = 1, selectedVariation: ProductVariation | null = null) => {
        setCartItems(prev => {
            // Calcular precio final basado en variaciones (Lógica idéntica al backend)
            let finalPrice = product.price;
            if (selectedVariation) {
                if (selectedVariation.precio_fijo !== undefined && selectedVariation.precio_fijo !== null) {
                    finalPrice = typeof selectedVariation.precio_fijo === 'number'
                        ? selectedVariation.precio_fijo
                        : parseFloat(selectedVariation.precio_fijo as any);
                } else if (selectedVariation.precio_adicional) {
                    const adicional = typeof selectedVariation.precio_adicional === 'number'
                        ? selectedVariation.precio_adicional
                        : parseFloat(selectedVariation.precio_adicional as any);
                    finalPrice += adicional;
                }
            }

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
                        ? { ...item, cantidad: item.cantidad + quantity, price: finalPrice }
                        : item
                );
            }
            return [...cleanedPrev, { ...product, price: finalPrice, cantidad: quantity, selectedVariation }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string, variationId: string | number | null = null) => {
        setCartItems(prev => prev.filter(item => {
            const v1 = item.selectedVariation?.id || null;
            const v2 = variationId || null;
            return !(item.id === productId && v1 === v2);
        }));
    }, []);

    const updateQuantity = useCallback((productId: string, variationId: string | number | null | undefined, delta: number) => {
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

    const totalItems = cartItems.reduce((acc, item) => acc + item.cantidad, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.cantidad), 0);
    const iva = subtotal * IVA_RATE;
    const total = subtotal + iva;

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            subtotal,
            iva,
            total
        }}>
            {children}
        </CartContext.Provider>
    );
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
