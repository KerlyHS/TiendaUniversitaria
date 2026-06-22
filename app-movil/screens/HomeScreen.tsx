import React, { useState } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Alert } from 'react-native';
import { Header } from '../components/Header';
import { PromotionalBanner } from '../components/PromotionalBanner';
import { ProductCard } from '../components/ProductCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { ClothingProductModal } from '../components/ClothingProductModal';
import { FoodProductModal } from '../components/FoodProductModal';
import { mockProducts } from '../mock/mockProducts';
import { Product } from '../types/product';

export const HomeScreen: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [clothingModalVisible, setClothingModalVisible] = useState(false);
    const [foodModalVisible, setFoodModalVisible] = useState(false);

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
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            <Header />

            <FlatList
                data={mockProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                ListHeaderComponent={<PromotionalBanner />}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
                    <ProductCard product={item} onPress={handleProductPress} />
                )}
            />

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
        backgroundColor: '#f8fafc', // Fondo gris muy suave (Slate 50)
    },
    listContent: {
        paddingBottom: 24,
    },
    columnWrapper: {
        paddingHorizontal: 8,
        marginTop: 16,
        justifyContent: 'flex-start', // Evita huecos cuando hay número impar de items
    },
});
