import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Product } from '../types/product';
import { useTheme } from '../context/ThemeContext';
import { AnimatedButton } from './AnimatedButton';

interface ProductCardProps {
    product: Product;
    onPress: (product: Product) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - 32 - CARD_MARGIN * 2) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const { theme } = useTheme();

    return (
        <AnimatedButton
            style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.black, borderColor: theme.border }]}
            onPress={() => onPress(product)}
        >
            <View style={[styles.imageContainer, { backgroundColor: theme.background }]}>
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.infoContainer}>
                <Text style={[styles.code, { color: theme.muted }]}>{product.code}</Text>
                <Text style={[styles.name, { color: theme.onSurface }]} numberOfLines={2}>{product.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: theme.primary }]}>${product.price.toFixed(2)}</Text>
                    {product.hasIva && <Text style={[styles.iva, { color: theme.primary }]}> + IVA</Text>}
                </View>
            </View>
        </AnimatedButton>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        borderRadius: 12, // More rounded like web
        margin: CARD_MARGIN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 12,
    },
    code: {
        fontSize: 10,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 8,
        height: 40,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
    },
    iva: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 2,
    },
});
