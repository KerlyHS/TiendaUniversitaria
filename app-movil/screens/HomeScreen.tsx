import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Header } from '../components/Header';
import { PromotionalBanner } from '../components/PromotionalBanner';
import { Colors } from '../constants/Colors';
import { ProductCard } from '../components/ProductCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { ClothingProductModal } from '../components/ClothingProductModal';
import { FoodProductModal } from '../components/FoodProductModal';
// Import removed mockProducts
import { Product } from '../types/product';

export const HomeScreen: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [clothingModalVisible, setClothingModalVisible] = useState(false);
    const [foodModalVisible, setFoodModalVisible] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/productos/`);
            
            const apiProducts = (response.data.results || response.data).map((p: any) => ({
                id: p.id.toString(),
                code: p.codigo || `SKU-${p.id}`,
                name: p.nombre,
                price: parseFloat(p.precio),
                category: p.is_food ? 'food' : (p.is_ropa ? 'clothing' : 'accessory'),
                imageUrl: p.imagen || 'https://via.placeholder.com/400x400/1e293b/ffffff?text=Producto',
                hasIva: p.tiene_iva,
            }));
            
            setProducts(apiProducts);
        } catch (err: any) {
            setError(err.message || 'Error al conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        if (product.category === 'clothing') {
            setClothingModalVisible(true);
        } else if (product.category === 'food') {
            setFoodModalVisible(true);
        } else {
            // Para productos genéricos como libros, tazas, libretas
            handleAddToCart(product, 1, 'unit');
        }
    };

    const handleAddToCart = (product: Product, quantity: number, option?: string) => {
        // Aquí es donde en el futuro integrarás Zustand (ej: useCartStore.getState().addItem(...))
        Alert.alert(
            'Añadido al carrito',
            `${quantity}x ${product.name} ${option ? `(${option})` : ''} añadido exitosamente.`,
            [{ text: 'OK' }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <Header />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
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

            <ClothingProductModal
                product={selectedProduct?.category === 'clothing' ? selectedProduct : null}
                visible={clothingModalVisible}
                onClose={() => setClothingModalVisible(false)}
                onAddToCart={handleAddToCart}
            />

            <FoodProductModal
                product={selectedProduct?.category === 'food' ? selectedProduct : null}
                visible={foodModalVisible}
                onClose={() => setFoodModalVisible(false)}
                onAddToCart={handleAddToCart}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface, // Fondo web
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
        color: Colors.error,
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
