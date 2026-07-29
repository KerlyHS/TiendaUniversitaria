import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, StatusBar, Alert, Text, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { PromotionalBanner } from '../components/PromotionalBanner';
import { CategoryList } from '../components/CategoryList';
import { ProductCard } from '../components/ProductCard';
import { BottomNavigation } from '../components/BottomNavigation';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { ProductSkeleton } from '../components/SkeletonLoader';
import { AnimatedButton } from '../components/AnimatedButton';
import { Product, ProductVariation } from '../types/product';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Clock } from 'lucide-react-native';

import { searchProducts } from '../services/searchAlgorithms';
import { getSearchHistory, saveSearchQuery } from '../services/searchStorage';

export const HomeScreen: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const { addToCart } = useCart();
    const { apiFetch } = useAuth();
    const { theme, isDark } = useTheme();

    useEffect(() => {
        fetchProducts();
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const history = await getSearchHistory();
        setSearchHistory(history);
    };

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
                category: p.is_food ? 'Alimentos' : (p.is_ropa ? 'Ropa' : 'Accesorios'),
                imageUrl: p.imagen || 'https://via.placeholder.com/400x400/1e293b/ffffff?text=Producto',
                hasIva: !!(p.tiene_iva || p.aplica_impuesto),
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

    const searchResults = useMemo(() => {
        return searchProducts(searchQuery, products, activeCategory);
    }, [searchQuery, products, activeCategory]);

    const handleSearchSubmit = async () => {
        Keyboard.dismiss();
        if (searchQuery.trim()) {
            const newHistory = await saveSearchQuery(searchQuery);
            setSearchHistory(newHistory);
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
            `${quantity}x ${product.name} añadido exitosamente.`,
            [{ text: 'OK' }]
        );
    };

    const renderHeader = () => (
        <View>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
            />

            {(!isSearchFocused && searchQuery === '') ? <PromotionalBanner /> : null}

            <CategoryList
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            {(isSearchFocused && searchQuery === '' && searchHistory.length > 0) ? (
                <View style={styles.historyContainer}>
                    <Text style={[styles.historyTitle, { color: theme.onSurfaceVariant }]}>Búsquedas Recientes</Text>
                    {searchHistory.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.historyItem}
                            onPress={() => {
                                setSearchQuery(item);
                                handleSearchSubmit();
                            }}
                        >
                            <Clock color={theme.muted} size={16} />
                            <Text style={[styles.historyText, { color: theme.onSurface }]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}

            <View style={styles.featuredHeader}>
                <Text style={[styles.featuredTitle, { color: theme.onSurface }]}>
                    {searchQuery || activeCategory !== 'Todos' ? 'Resultados de Búsqueda' : 'Productos destacados'}
                </Text>
                {(!searchQuery && activeCategory === 'Todos') ? (
                    <TouchableOpacity>
                        <Text style={[styles.viewAll, { color: theme.primary }]}>Ver todos</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.surface} />

            <Header />

            {isLoading ? (
                <View style={styles.listContent}>
                    {renderHeader()}
                    <View style={styles.columnWrapperStyle}>
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
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    // Llamamos a la función para pasar el elemento renderizado y evitar desmontajes
                    ListHeaderComponent={renderHeader()}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapperStyle}
                    renderItem={({ item }) => (
                        <ProductCard product={item} onPress={handleProductPress} />
                    )}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: theme.onSurfaceVariant, marginTop: 40 }}>
                                No se encontraron productos.
                            </Text>
                        </View>
                    }
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
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 24,
        marginBottom: 16,
    },
    featuredTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    columnWrapperStyle: {
        paddingHorizontal: 20,
        justifyContent: 'space-between',
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
    historyContainer: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    historyTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    historyText: {
        marginLeft: 12,
        fontSize: 16,
    },
});