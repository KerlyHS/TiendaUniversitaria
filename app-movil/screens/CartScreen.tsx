import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Trash2, ChevronRight } from 'lucide-react-native';
import { QuantitySelector } from '../components/QuantitySelector';
import { useNavigation } from '@react-navigation/native';

export const CartScreen: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, subtotal, iva, total, totalItems } = useCart();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<any>();

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={[styles.cartItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.imageContainer, { backgroundColor: theme.background }]}>
                    <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x400/1e293b/ffffff?text=Producto' }} style={styles.itemImage} resizeMode="contain" />
                </View>
                <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                        <Text style={[styles.itemName, { color: theme.onSurface }]} numberOfLines={1}>{item.name}</Text>
                        <TouchableOpacity onPress={() => removeFromCart(item.id, item.selectedVariation?.id)}>
                            <Trash2 color={theme.muted} size={18} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.itemVariation, { color: theme.secondaryText }]}>
                        {item.selectedVariation ? `Talla: ${item.selectedVariation.nombre}` : 'Producto base'}
                    </Text>

                    <View style={styles.priceRow}>
                        <Text style={[styles.itemPrice, { color: theme.onSurface }]}>${item.price.toFixed(2)}</Text>
                        <QuantitySelector 
                            quantity={item.cantidad} 
                            onIncrease={() => updateQuantity(item.id, item.selectedVariation?.id, 1)}
                            onDecrease={() => updateQuantity(item.id, item.selectedVariation?.id, -1)}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.surface} />
            <Header showGreeting={false} />

            <View style={styles.headerTitle}>
                <Text style={[styles.title, { color: theme.onSurface }]}>Mi carrito</Text>
                <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{totalItems} productos</Text>
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={(item) => `${item.id}-${item.selectedVariation?.id || 'base'}`}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>Tu carrito está vacío</Text>
                    </View>
                }
            />

            {cartItems.length > 0 && (
                <View style={[styles.footer, { borderTopColor: theme.border }]}>
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Subtotal</Text>
                            <Text style={[styles.summaryValue, { color: theme.onSurface }]}>${subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Descuento (5%)</Text>
                            <Text style={[styles.summaryValue, { color: theme.onSurface }]}>-$3.75</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: theme.onSurface }]}>Total</Text>
                            <Text style={[styles.totalValue, { color: theme.primary }]}>${total.toFixed(2)}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.checkoutButton, { backgroundColor: theme.primary }]}
                        onPress={() => navigation.navigate('Checkout')}
                    >
                        <Text style={styles.checkoutButtonText}>Continuar al pago</Text>
                        <ChevronRight color="#fff" size={20} />
                    </TouchableOpacity>
                </View>
            )}

            <BottomNavigation />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerTitle: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 20,
    },
    cartItem: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 1,
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: 60,
        height: 60,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 15,
        fontWeight: 'bold',
        flex: 1,
    },
    itemVariation: {
        fontSize: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    summary: {
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    checkoutButton: {
        height: 56,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    }
});

