import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

export const PromotionalBanner: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.subtitle}>VUELTA A CLASES</Text>
                <Text style={styles.title}>HASTA -60% OFF</Text>
                <Text style={styles.footer}>Ahorros del Campus</Text>
            </View>
            <View style={styles.iconContainer}>
                <ShoppingBag color={Colors.onPrimary} size={80} strokeWidth={1.5} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.primaryContainer, // Fondo oscuro del banner
        borderRadius: 12,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    contentContainer: {
        flex: 1,
    },
    subtitle: {
        color: Colors.onPrimary,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        color: Colors.onPrimary, // Verde institucional resaltado
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    footer: {
        color: Colors.onPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    iconContainer: {
        opacity: 0.8,
    },
});