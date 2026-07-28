import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AnimatedButton } from './AnimatedButton';

export const Header: React.FC = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();

    const getInitials = () => {
        if (!user || !user.nombre_completo) return 'U';
        return user.nombre_completo.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.primary }]}>
            <View style={[styles.container, { backgroundColor: theme.primary }]}>
                <AnimatedButton
                    style={[styles.avatarContainer, { borderColor: theme.onPrimary }]}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={styles.avatarPlaceholder}>
                        <Text style={[styles.avatarText, { color: theme.onPrimary }]}>{getInitials()}</Text>
                    </View>
                </AnimatedButton>

                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.onPrimary }]}>Tienda Universitaria</Text>
                </View>

                <AnimatedButton style={styles.iconContainer} onPress={() => {}}>
                    <Bell color={theme.onPrimary} size={24} />
                </AnimatedButton>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    iconContainer: {
        padding: 8,
    },
});
