import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Product } from '../types/product';
import { useTheme } from '../context/ThemeContext';

interface ProductCardProps {
    product: Product;
    onPress: (product: Product) => void;
}

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - 60) / 2; // Basado en padding 20 y gap 20

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => onPress(product)}
            activeOpacity={0.9}
        >
            <View style={[styles.imageContainer, { backgroundColor: theme.background }]}>
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.infoContainer}>
                <Text style={[styles.name, { color: theme.onSurface }]} numberOfLines={1}>{product.name}</Text>
                <Text style={[styles.code, { color: theme.secondaryText }]}>{product.code}</Text>
                <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: theme.onSurface }]}>${product.price.toFixed(2)}</Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                        onPress={(e) => {
                            e.stopPropagation();
                            onPress(product);
                        }}
                    >
                        <Plus color={theme.onPrimary} size={16} strokeWidth={3} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH * 1.1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    infoContainer: {
        padding: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    code: {
        fontSize: 12,
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 16,
        fontWeight: '900',
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
