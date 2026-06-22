import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { X } from 'lucide-react-native';
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
                            <X color="#64748b" size={24} />
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: '#ffffff',
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
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
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
        color: '#1e293b',
        marginBottom: 8,
    },
    price: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0ea5e9',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
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
        borderColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    sizeButtonActive: {
        borderColor: '#34d399',
        backgroundColor: '#ecfdf5',
    },
    sizeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    sizeTextActive: {
        color: '#059669',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#ffffff',
    },
    addToCartButton: {
        backgroundColor: '#10b981', // Verde Institucional
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addToCartText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
