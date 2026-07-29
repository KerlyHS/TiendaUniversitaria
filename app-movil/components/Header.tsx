import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ShoppingCart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
    showGreeting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showGreeting = true }) => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { totalItems } = useCart();

    const firstName = user?.nombre_completo ? user.nombre_completo.split(' ')[0] : 'Invitado';

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surface }]}>
            <View style={[styles.container, { backgroundColor: theme.surface }]}>
                {showGreeting ? (
                    <View style={styles.greetingContainer}>
                        <Text style={[styles.greeting, { color: theme.onSurface }]}>¡Hola, {firstName}! 👋</Text>
                        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>¿Qué deseas comprar hoy?</Text>
                    </View>
                ) : (
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: theme.onSurface }]}>Tienda Universitaria</Text>
                    </View>
                )}

                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.background }]} onPress={() => {}}>
                        <Bell color={theme.onSurface} size={22} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.iconButton, { backgroundColor: theme.background }]}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <ShoppingCart color={theme.onSurface} size={22} />
                        {totalItems > 0 && (
                            <View style={[styles.badge, { backgroundColor: theme.secondary }]}>
                                <Text style={styles.badgeText}>{totalItems}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    greetingContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
