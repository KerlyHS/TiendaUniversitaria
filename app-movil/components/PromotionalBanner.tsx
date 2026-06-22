import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';

export const PromotionalBanner: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.subtitle}>VUELTA A CLASES</Text>
                <Text style={styles.title}>HASTA -60% OFF</Text>
                <Text style={styles.footer}>Ahorros del Campus</Text>
            </View>
            <View style={styles.iconContainer}>
                <ShoppingBag color="#34d399" size={80} strokeWidth={1.5} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1f2937', // Fondo oscuro del banner
        borderRadius: 12,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    contentContainer: {
        flex: 1,
    },
    subtitle: {
        color: '#e5e7eb',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        color: '#34d399', // Verde institucional resaltado
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    footer: {
        color: '#e5e7eb',
        fontSize: 14,
        fontWeight: '500',
    },
    iconContainer: {
        opacity: 0.8,
    },
});