import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { PromotionalBanner } from '../components/PromotionalBanner';
import { ProductCard } from '../components/ProductCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { ProductSkeleton } from '../components/SkeletonLoader';
import { AnimatedButton } from '../components/AnimatedButton';
import { Product, ProductVariation } from '../types/product';
import { API_URL, useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const HomeScreen: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();
    const { apiFetch } = useAuth();
    const { theme, isDark } = useTheme();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await apiFetch('/productos/');

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();

            const apiProducts = (data.results || data).map((p: any) => ({
                id: p.id.toString(),
                code: p.codigo || `SKU-${p.id}`,
                name: p.nombre,
                description: p.descripcion || 'Sin descripción disponible.',
                price: typeof p.precio === 'number' ? p.precio : parseFloat(p.precio),
                stock: p.stock || 0,
                category: p.is_food ? 'food' : (p.is_ropa ? 'clothing' : 'accessory'),
                imageUrl: p.imagen || 'https://via.placeholder.com/400x400/1e293b/ffffff?text=Producto',
                hasIva: p.tiene_iva || p.aplica_impuesto,
                variaciones: p.variaciones || [],
            }));
            
            setProducts(apiProducts);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message === 'Network request failed' ? 'Error de conexión con el servidor.' : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setDetailModalVisible(true);
    };

    const handleAddToCart = (product: Product, quantity: number, variation?: ProductVariation) => {
        addToCart(product, quantity, variation);

        Alert.alert(
            'Añadido al carrito',
            `${quantity}x ${product.name} ${variation ? `(${variation.nombre})` : ''} añadido exitosamente.`,
            [{ text: 'OK' }]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.primary} />

            <Header />

            {isLoading ? (
                <View style={styles.listContent}>
                    <PromotionalBanner />
                    <View style={styles.columnWrapperStyle}>
                        <ProductSkeleton />
                        <ProductSkeleton />
                        <ProductSkeleton />
                        <ProductSkeleton />
                    </View>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                    <AnimatedButton
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={fetchProducts}
                    >
                        <Text style={styles.retryText}>Reintentar</Text>
                    </AnimatedButton>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    ListHeaderComponent={<PromotionalBanner />}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapperStyle}
                    renderItem={({ item }) => (
                        <ProductCard product={item} onPress={handleProductPress} />
                    )}
                />
            )}

            <BottomNavigation />

            <ProductDetailModal
                product={selectedProduct}
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                onAddToCart={handleAddToCart}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 24,
    },
    columnWrapperStyle: {
        paddingHorizontal: 8,
        marginTop: 16,
        justifyContent: 'flex-start',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginBottom: 16,
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
