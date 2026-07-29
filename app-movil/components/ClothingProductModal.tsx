import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Product } from '../types/product';
import { QuantitySelector } from './QuantitySelector';
import { useTheme } from '../context/ThemeContext';

interface ClothingProductModalProps {
    product: Product | null;
    visible: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number, size: string) => void;
}

const SIZES = ['S', 'M', 'L', 'XL'];

export const ClothingProductModal: React.FC<ClothingProductModalProps> = ({ product, visible, onClose, onAddToCart }) => {
    const { theme } = useTheme();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>('M');

    if (!product) return null;

    const handleAddToCart = () => {
        onAddToCart(product, quantity, selectedSize);
        onClose();
        setQuantity(1);
        setSelectedSize('M');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
                <View style={[styles.bottomSheet, { backgroundColor: theme.card }]}>
                    <View style={[styles.header, { borderBottomColor: theme.background }]}>
                        <Text style={[styles.title, { color: theme.onSurface }]}>Opciones de Prenda</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X color={theme.secondaryText} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={[styles.productName, { color: theme.onSurface }]}>{product.name}</Text>
                        <Text style={[styles.price, { color: theme.primary }]}>${product.price.toFixed(2)}{product.hasIva ? ' + IVA' : ''}</Text>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Selecciona la Talla</Text>
                            <View style={styles.sizesContainer}>
                                {SIZES.map(size => (
                                    <TouchableOpacity
                                        key={size}
                                        style={[
                                            styles.sizeButton,
                                            { borderColor: theme.border, backgroundColor: theme.background },
                                            selectedSize === size && { borderColor: theme.primary, backgroundColor: theme.primary + '20' }
                                        ]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text style={[
                                            styles.sizeText,
                                            { color: theme.secondaryText },
                                            selectedSize === size && { color: theme.primary }
                                        ]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Cantidad</Text>
                            <QuantitySelector
                                quantity={quantity}
                                onIncrease={() => setQuantity(q => q + 1)}
                                onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
                            />
                        </View>
                    </ScrollView>

                    <SafeAreaView style={[styles.footer, { borderTopColor: theme.background, backgroundColor: theme.card }]}>
                        <TouchableOpacity
                            style={[styles.addToCartButton, { backgroundColor: theme.primaryContainer }]}
                            onPress={handleAddToCart}
                        >
                            <Text style={[styles.addToCartText, { color: theme.onPrimary }]}>
                                Añadir al carrito - ${(product.price * quantity).toFixed(2)}
                            </Text>
                        </TouchableOpacity>
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
    bottomSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    sizesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    sizeButton: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    addToCartButton: {
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
