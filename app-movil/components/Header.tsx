import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Bell } from 'lucide-react-native';

export const Header: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.avatarContainer} accessibilityRole="button" accessibilityLabel="Perfil de usuario">
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/100?img=11' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Tienda Universitaria</Text>
                </View>

                <TouchableOpacity style={styles.iconContainer} accessibilityRole="button" accessibilityLabel="Notificaciones">
                    <Bell color="#ffffff" size={24} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#111827', // Fondo azul marino muy oscuro
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#111827',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    iconContainer: {
        padding: 8,
    },
});
