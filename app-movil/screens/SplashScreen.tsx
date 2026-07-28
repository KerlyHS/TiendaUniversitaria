import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, StatusBar, Dimensions, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // Valores de animación
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Ejecutar animaciones
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Navegar al Home después de 3 segundos
        const timer = setTimeout(() => {
            navigation.replace('Home');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#34a853" />

            <SafeAreaView style={styles.content}>
                <Animated.View
                    style={[
                        styles.logoSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* Círculo de fondo con borde blanco para alinear con el icono */}
                    <View style={styles.circularContainer}>
                        <Image
                            source={require('../assets/icon.png')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.textSection, { opacity: textFadeAnim }]}>
                    <Text style={styles.title}>TIENDA UNIVERSITARIA</Text>

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>UNL</Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.footer, { opacity: textFadeAnim }]}>
                    <Text style={styles.footerText}>Loja - Ecuador</Text>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#34a853',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    circularContainer: {
        width: width * 0.55,
        height: width * 0.55,
        borderRadius: (width * 0.55) / 2,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 3, // Borde blanco para el Splash
        borderColor: '#ffffff',
    },
    logo: {
        // Aplicamos un zoom del 18% para que el círculo verde coincida casi perfectamente con el borde blanco
        width: '118%',
        height: '118%',
    },
    textSection: {
        alignItems: 'center',
    },
    title: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 0.5,
        marginBottom: 10,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 24,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    badgeText: {
        color: '#34a853',
        fontWeight: 'bold',
        fontSize: 18,
    },
    footer: {
        position: 'absolute',
        bottom: 60,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: '500',
    },
});
