import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const PromotionalBanner: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.primary }]}>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, { color: theme.onPrimary }]}>Orgullo UNL</Text>
                <Text style={[styles.subtitle, { color: theme.onPrimary }]}>
                    Lleva los colores{"\n"}que nos identifican
                </Text>
                <TouchableOpacity style={[styles.button, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.buttonText, { color: theme.primary }]}>Ver colección</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: 'https://via.placeholder.com/200x200/006837/ffffff?text=Hoodie+UNL' }} // Reemplazar con imagen real si disponible
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 10,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        zIndex: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
        opacity: 0.9,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    buttonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    imageContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '120%',
        height: '120%',
        transform: [{ scale: 1.2 }],
    },
});
