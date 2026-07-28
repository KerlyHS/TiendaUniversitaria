import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Home, Search, ShoppingCart, User } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedButton } from './AnimatedButton';

export const BottomNavigation: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { totalItems } = useCart();
    const { theme } = useTheme();

    const isActive = (routeName: string) => route.name === routeName;

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={[styles.container, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate('Home')}
                    activeOpacity={0.7}
                >
                    <Home color={isActive('Home') ? theme.primary : theme.muted} size={24} />
                    <Text style={[styles.label, { color: theme.muted }, isActive('Home') && { color: theme.primary, fontWeight: '700' }]}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => {/* Búsqueda no implementada aún */}}
                    activeOpacity={0.7}
                >
                    <Search color={isActive('Search') ? theme.primary : theme.muted} size={24} />
                    <Text style={[styles.label, { color: theme.muted }, isActive('Search') && { color: theme.primary, fontWeight: '700' }]}>Buscar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate('Cart')}
                    activeOpacity={0.7}
                >
                    <View>
                        <ShoppingCart color={isActive('Cart') ? theme.primary : theme.muted} size={24} />
                        {totalItems > 0 && (
                            <View style={[styles.badge, { backgroundColor: theme.error, borderColor: theme.card }]}>
                                <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.label, { color: theme.muted }, isActive('Cart') && { color: theme.primary, fontWeight: '700' }]}>Carrito</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => navigation.navigate('Profile')}
                    activeOpacity={0.7}
                >
                    <User color={isActive('Profile') ? theme.primary : theme.muted} size={24} />
                    <Text style={[styles.label, { color: theme.muted }, isActive('Profile') && { color: theme.primary, fontWeight: '700' }]}>Perfil</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        borderTopWidth: 1,
    },
    container: {
        flexDirection: 'row',
        height: 65,
        paddingBottom: 5,
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
    },
    label: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        right: -10,
        top: -5,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

