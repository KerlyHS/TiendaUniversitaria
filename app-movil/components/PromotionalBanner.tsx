import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export const PromotionalBanner: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.primaryContainer, shadowColor: theme.black }]}>
            <View style={styles.contentContainer}>
                <Text style={[styles.subtitle, { color: theme.onPrimary }]}>VUELTA A CLASES</Text>
                <Text style={[styles.title, { color: theme.onPrimary }]}>HASTA -60% OFF</Text>
                <Text style={[styles.footer, { color: theme.onPrimary }]}>Ahorros del Campus</Text>
            </View>
            <View style={styles.iconContainer}>
                <ShoppingBag color={theme.onPrimary} size={80} strokeWidth={1.5} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    contentContainer: {
        flex: 1,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    footer: {
        fontSize: 14,
        fontWeight: '500',
    },
    iconContainer: {
        opacity: 0.8,
    },
});
