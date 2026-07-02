import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';

export const Header: React.FC = () => {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity 
                    style={styles.avatarContainer} 
                    accessibilityRole="button" 
                    accessibilityLabel="Perfil de usuario"
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/100?img=11' }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Tienda Universitaria</Text>
                </View>

                <TouchableOpacity style={styles.iconContainer} accessibilityRole="button" accessibilityLabel="Notificaciones">
                    <Bell color={Colors.onPrimary} size={24} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Colors.primary,
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: Colors.primary,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Colors.onPrimary,
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
        color: Colors.onPrimary,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    iconContainer: {
        padding: 8,
    },
});
