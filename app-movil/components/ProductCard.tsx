import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Product } from '../types/product';

interface ProductCardProps {
    product: Product;
    onPress: (product: Product) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
// Calculamos el ancho para 2 columnas considerando márgenes (16px lateral, 8px entre tarjetas)
const CARD_WIDTH = (width - 32 - CARD_MARGIN * 2) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(product)}
            activeOpacity={0.8}
            accessibilityRole="button"
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.code}>{product.code}</Text>
                <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                    {product.hasIva && <Text style={styles.iva}> + IVA</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        margin: CARD_MARGIN,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH, // Aspect ratio 1:1
        backgroundColor: '#f1f5f9',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 12,
    },
    code: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        height: 40, // Fija la altura para 2 líneas
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0ea5e9', // Azul cian para el precio según diseño
    },
    iva: {
        fontSize: 12,
        color: '#0ea5e9',
        fontWeight: '600',
    },
});
