import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ShoppingCart, Info, Package, Tag, Layers } from 'lucide-react-native';
import { Product, ProductVariation } from '../types/product';
import { QuantitySelector } from './QuantitySelector';
import { useTheme } from '../context/ThemeContext';
import { AnimatedButton } from './AnimatedButton';

interface ProductDetailModalProps {
    product: Product | null;
    visible: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number, variation?: ProductVariation) => void;
}

const { width } = Dimensions.get('window');

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    product,
    visible,
    onClose,
    onAddToCart
}) => {
    const { theme, isDark } = useTheme();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);

    useEffect(() => {
        if (visible && product) {
            setQuantity(1);
            setSelectedVariation(undefined); // Fuerza la selección

            let variations = product.variaciones || [];

            if (variations.length === 0 && product.category === 'food') {
                const isBeverage = product.name.toLowerCase().includes('cola') ||
                                 product.name.toLowerCase().includes('jugo') ||
                                 product.name.toLowerCase().includes('agua') ||
                                 product.name.toLowerCase().includes('bebida') ||
                                 product.name.toLowerCase().includes('té');

                if (isBeverage) {
                    variations = [
                        { id: 'v1', nombre: '500 ml', stock: product.stock, precio_adicional: 0 },
                        { id: 'v2', nombre: '1 litro', stock: Math.floor(product.stock/2), precio_adicional: 0.50 },
                        { id: 'v3', nombre: '2 litros', stock: Math.floor(product.stock/4), precio_adicional: 1.20 }
                    ];
                } else {
                    variations = [
                        { id: 'w1', nombre: 'Libras', stock: product.stock, precio_adicional: 0 },
                        { id: 'w2', nombre: 'Kilogramos', stock: Math.floor(product.stock/2), precio_adicional: 0.80 }
                    ];
                }
            } else if (variations.length === 0 && product.category === 'clothing') {
                variations = [
                    { id: 's', nombre: 'S', stock: 10 },
                    { id: 'm', nombre: 'M', stock: 15 },
                    { id: 'l', nombre: 'L', stock: 8 },
                    { id: 'xl', nombre: 'XL', stock: 5 }
                ];
            }

            if (variations.length > 0) {
                product.variaciones = variations;
            }
        }
    }, [visible, product]);

    if (!product) return null;

    const handleAddToCart = () => {
        if (product.variaciones && product.variaciones.length > 0 && !selectedVariation) {
            alert('Por favor selecciona una opción antes de añadir al carrito.');
            return;
        }
        onAddToCart(product, quantity, selectedVariation);
        onClose();
    };

    const currentPrice = Number(selectedVariation?.precio_fijo
        ? selectedVariation.precio_fijo
        : (Number(product.price) + (Number(selectedVariation?.precio_adicional) || 0)));

    const totalPrice = currentPrice * quantity;
    const currentStock = selectedVariation ? selectedVariation.stock : product.stock;

    const renderVariationSelector = () => {
        if (!product.variaciones || product.variaciones.length === 0) return null;

        let title = "Selecciona una opción";
        if (product.category === 'clothing') title = "Selecciona la Talla";
        if (product.category === 'food') title = "Selecciona la Presentación";

        return (
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>{title}</Text>
                <View style={styles.variationContainer}>
                    {product.variaciones.map((variation) => (
                        <TouchableOpacity
                            key={variation.id}
                            style={[
                                styles.variationButton,
                                { borderColor: theme.border, backgroundColor: theme.surface },
                                selectedVariation?.id === variation.id && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }
                            ]}
                            onPress={() => setSelectedVariation(variation)}
                        >
                            <Text style={[
                                styles.variationText,
                                { color: theme.secondaryText },
                                selectedVariation?.id === variation.id && { color: theme.primary, fontWeight: '700' }
                            ]}>
                                {variation.nombre}
                            </Text>
                            {variation.precio_adicional ? (
                                <Text style={[styles.variationPrice, { color: theme.primary }]}>
                                    +${Number(variation.precio_adicional).toFixed(2)}
                                </Text>
                            ) : variation.precio_fijo ? (
                                <Text style={[styles.variationPrice, { color: theme.primary }]}>
                                    ${Number(variation.precio_fijo).toFixed(2)}
                                </Text>
                            ) : null}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
                <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.headerTitle, { color: theme.onSurface }]} numberOfLines={1}>Detalles del Producto</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X color={theme.secondaryText} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[styles.imageContainer, { backgroundColor: theme.background }]}>
                            <Image
                                source={{ uri: product.imageUrl }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.content}>
                            <View style={styles.mainInfo}>
                                <Text style={[styles.category, { color: theme.primary }]}>
                                    {product.category.toUpperCase()}
                                </Text>
                                <Text style={[styles.productName, { color: theme.onSurface }]}>{product.name}</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={[styles.price, { color: theme.primary }]}>
                                        ${Number(currentPrice).toFixed(2)}
                                    </Text>
                                    {product.hasIva && <Text style={[styles.iva, { color: theme.primary }]}> + IVA</Text>}
                                </View>
                            </View>

                            <View style={[styles.infoRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                                <View style={styles.infoItem}>
                                    <Package size={18} color={theme.muted} />
                                    <Text style={[styles.infoLabel, { color: theme.muted }]}>Stock</Text>
                                    <Text style={[styles.infoValue, { color: theme.onSurface }]}>{currentStock} unidades</Text>
                                </View>
                                <View style={[styles.infoItem, { borderLeftWidth: 1, borderLeftColor: theme.border }]}>
                                    <Tag size={18} color={theme.muted} />
                                    <Text style={[styles.infoLabel, { color: theme.muted }]}>Código</Text>
                                    <Text style={[styles.infoValue, { color: theme.onSurface }]}>{product.code}</Text>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Info size={18} color={theme.secondaryText} />
                                    <Text style={[styles.sectionTitle, { color: theme.secondaryText, marginLeft: 6, marginBottom: 0 }]}>
                                        Descripción
                                    </Text>
                                </View>
                                <Text style={[styles.description, { color: theme.onSurfaceVariant }]}>
                                    {product.description}
                                </Text>
                            </View>

                            {renderVariationSelector()}

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Cantidad</Text>
                                <QuantitySelector
                                    quantity={quantity}
                                    onIncrease={() => setQuantity(q => q + 1)}
                                    onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <SafeAreaView style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.card }]}>
                        <View style={styles.footerRow}>
                            <View>
                                <Text style={[styles.totalLabel, { color: theme.muted }]}>Total a pagar</Text>
                                <Text style={[styles.totalPrice, { color: theme.onSurface }]}>${Number(totalPrice).toFixed(2)}</Text>
                            </View>
                            <AnimatedButton
                                style={[styles.addToCartButton, { backgroundColor: theme.primary }]}
                                onPress={handleAddToCart}
                            >
                                <ShoppingCart color={theme.onPrimary} size={20} style={{ marginRight: 8 }} />
                                <Text style={[styles.addToCartText, { color: theme.onPrimary }]}>Añadir</Text>
                            </AnimatedButton>
                        </View>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '92%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    imageContainer: {
        width: '100%',
        height: width * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '90%',
        height: '90%',
    },
    content: {
        padding: 24,
    },
    mainInfo: {
        marginBottom: 20,
    },
    category: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    productName: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
        lineHeight: 30,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 28,
        fontWeight: '900',
    },
    iva: {
        fontSize: 14,
        fontWeight: '700',
    },
    infoRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: 16,
        marginBottom: 24,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 2,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
    },
    variationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    variationButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    variationText: {
        fontSize: 14,
    },
    variationPrice: {
        fontSize: 12,
        marginTop: 2,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: '900',
    },
    addToCartButton: {
        flexDirection: 'row',
        paddingHorizontal: 32,
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 150,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
