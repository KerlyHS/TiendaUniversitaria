import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Product } from '../types/product';
import { QuantitySelector } from './QuantitySelector';

interface ClothingProductModalProps {
    product: Product | null;
    visible: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number, size: string) => void;
}

const SIZES = ['S', 'M', 'L', 'XL'];

export const ClothingProductModal: React.FC<ClothingProductModalProps> = ({ product, visible, onClose, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>('M');

    if (!product) return null;

    const handleAddToCart = () => {
        onAddToCart(product, quantity, selectedSize);
        onClose();
        // Reset state for next open
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
            <View style={styles.overlay}>
                <View style={styles.bottomSheet}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Opciones de Prenda</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X color={Colors.secondaryText} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.price}>${product.price.toFixed(2)} {product.hasIva && '+ IVA'}</Text>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Selecciona la Talla</Text>
                            <View style={styles.sizesContainer}>
                                {SIZES.map(size => (
                                    <TouchableOpacity
                                        key={size}
                                        style={[styles.sizeButton, selectedSize === size && styles.sizeButtonActive]}
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cantidad</Text>
                            <QuantitySelector
                                quantity={quantity}
                                onIncrease={() => setQuantity(q => q + 1)}
                                onDecrease={() => setQuantity(q => Math.max(1, q - 1))}
                            />
                        </View>
                    </ScrollView>

                    <SafeAreaView style={styles.footer}>
                        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                            <Text style={styles.addToCartText}>Añadir al carrito - ${(product.price * quantity).toFixed(2)}</Text>
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
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: Colors.white,
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
        borderBottomColor: Colors.background,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.onSurface,
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
        color: Colors.onSurface,
        marginBottom: 8,
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.secondaryText,
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
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    sizeButtonActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryContainer + '20',
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.secondaryText,
    },
    sizeTextActive: {
        color: Colors.primary,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: Colors.background,
        backgroundColor: Colors.white,
    },
    addToCartButton: {
        backgroundColor: Colors.primaryContainer, // Verde Institucional
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartText: {
        color: Colors.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
