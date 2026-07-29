import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, ShoppingCart, Clock, User } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export const BottomNavigation: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { totalItems } = useCart();
    const { theme } = useTheme();

    const isActive = (routeName: string) => route.name === routeName;

    const navItems = [
        { name: 'Home', label: 'Inicio', icon: Home },
        { name: 'Cart', label: 'Carrito', icon: ShoppingCart, badge: totalItems },
        { name: 'History', label: 'Historial', icon: Clock },
        { name: 'Profile', label: 'Perfil', icon: User },
    ];

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={[styles.container, { backgroundColor: theme.card }]}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.name);
                    return (
                        <TouchableOpacity
                            key={item.name}
                            style={styles.tab}
                            onPress={() => navigation.navigate(item.name)}
                            activeOpacity={0.7}
                        >
                            <View>
                                <Icon color={active ? theme.primary : theme.muted} size={24} />
<<<<<<< HEAD
                                {!!item.badge && item.badge > 0 && (
=======
                                {item.badge ? (
>>>>>>> 9b183314 (Implementada busqueda avanzada con TF-IDF, Fuzzy Search e historial en HomeScreen)
                                    <View style={[styles.badge, { backgroundColor: theme.secondary, borderColor: theme.card }]}>
                                        <Text style={styles.badgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
                                    </View>
                                ) : null}
                            </View>
                            <Text style={[
                                styles.label,
                                { color: theme.muted },
                                active && { color: theme.primary, fontWeight: '700' }
                            ]}>{item.label}</Text>
                            {active && <View style={[styles.indicator, { backgroundColor: theme.primary }]} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        borderTopWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            }
        })
    },
    container: {
        flexDirection: 'row',
        height: 65,
        paddingBottom: 5,
        justifyContent: 'space-around',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 12,
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
        fontSize: 9,
        fontWeight: 'bold',
    },
    indicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    }
});
