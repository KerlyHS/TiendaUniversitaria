import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Trash2 } from 'lucide-react-native';
import { QuantitySelector } from '../components/QuantitySelector';
import { useNavigation } from '@react-navigation/native';
import { AnimatedButton } from '../components/AnimatedButton';

export const CartScreen: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, subtotal, iva, total, totalItems } = useCart();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<any>();

    const renderItem = ({ item }: { item: any }) => {
        return (
            <View style={[styles.cartItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/400x400/1e293b/ffffff?text=Producto' }} style={[styles.itemImage, { backgroundColor: theme.surface }]} />
                <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: theme.onSurface }]} numberOfLines={2}>{item.name}</Text>
                    {item.selectedVariation && (
                        <Text style={[styles.itemVariation, { color: theme.secondaryText }]}>
                            {typeof item.selectedVariation === 'object' && item.selectedVariation !== null ? item.selectedVariation.nombre : String(item.selectedVariation)}
                        </Text>
                    )}
                    <View style={styles.priceRow}>
                        <Text style={[styles.itemPrice, { color: theme.onSurface }]}>${item.price.toFixed(2)}</Text>
                        <QuantitySelector 
                            quantity={item.cantidad} 
                            onIncrease={() => updateQuantity(item.id, item.selectedVariation?.id, 1)}
                            onDecrease={() => updateQuantity(item.id, item.selectedVariation?.id, -1)}
                        />
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => removeFromCart(item.id, item.selectedVariation?.id)}
                >
                    <Trash2 color={theme.error} size={20} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.primary} />
            <Header />

            <View style={[styles.headerTitle, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.onSurface }]}>Carrito de Compras</Text>
                <View style={[styles.badge, { backgroundColor: theme.border }]}>
                    <Text style={[styles.badgeText, { color: theme.secondaryText }]}>{totalItems} ítems</Text>
                </View>
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
                ListFooterComponent={
                    cartItems.length > 0 ? (
                        <View style={[styles.summaryContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.summaryTitle, { color: theme.onSurface }]}>Resumen de la Orden</Text>
                            
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Subtotal</Text>
                                <Text style={[styles.summaryValue, { color: theme.onSurface }]}>${subtotal.toFixed(2)}</Text>
                            </View>
                            
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Impuestos (12%)</Text>
                                <Text style={[styles.summaryValue, { color: theme.onSurface }]}>${iva.toFixed(2)}</Text>
                            </View>
                            
                            <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.border }]}>
                                <Text style={[styles.totalLabel, { color: theme.onSurface }]}>Total</Text>
                                <Text style={[styles.totalValue, { color: theme.primary }]}>${total.toFixed(2)}</Text>
                            </View>

                            <AnimatedButton
                                style={[styles.checkoutButton, { backgroundColor: theme.primary }]}
                                onPress={() => navigation.navigate('Checkout')}
                            >
                                <Text style={[styles.checkoutButtonText, { color: theme.onPrimary }]}>Continuar al Pago</Text>
                            </AnimatedButton>

                            <TouchableOpacity 
                                style={styles.continueShoppingButton}
                                onPress={() => navigation.navigate('Home')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.continueShoppingText, { color: theme.primary }]}>Seguir comprando</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
            />

            <BottomNavigation />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    cartItem: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemVariation: {
        fontSize: 12,
        marginTop: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 8,
    },
    summaryContainer: {
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        paddingTop: 16,
        marginTop: 4,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    checkoutButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueShoppingButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    continueShoppingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
    }
});

