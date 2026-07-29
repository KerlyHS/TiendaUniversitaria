import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const [stage, setStage] = useState(1); // 1: White, 2: Green

    // Valores de animación
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const bgAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Stage 1: White Splash
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
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(1000),
            // Transition to Stage 2
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setStage(2);
            fadeAnim.setValue(0);
            scaleAnim.setValue(1.2);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start();
        });

        // Navegar al Home después de 4.5 segundos
        const timer = setTimeout(() => {
            navigation.replace('Home');
        }, 4500);

        return () => clearTimeout(timer);
    }, []);

    if (stage === 1) {
        return (
            <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.logoStage1}
                        resizeMode="contain"
                    />
                    <Text style={styles.titleStage1}>UNIVERSIDAD{"\n"}NACIONAL DE LOJA</Text>
                    <View style={styles.divider} />
                    <Text style={styles.brandStage1}>TIENDA{"\n"}UNIVERSITARIA{"\n"}UNL</Text>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.primary }]}>
            <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Image
                    source={require('../assets/icon.png')}
                    style={styles.logoStage2}
                    resizeMode="contain"
                />
                <Text style={styles.brandStage2}>TIENDA{"\n"}UNIVERSITARIA</Text>
                <View style={styles.badgeStage2}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>UNL</Text>
                </View>
                <View style={styles.footerStage2}>
                    <Text style={styles.footerText}>Calidad, innovación{"\n"}y servicio para la comunidad{"\n"}universitaria</Text>
                </View>
            </Animated.View>
            <View style={styles.loaderContainer}>
                <View style={styles.loaderTrack}>
                    <View style={[styles.loaderFill, { backgroundColor: theme.accent }]} />
                </View>
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    // Stage 1
    logoStage1: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    titleStage1: {
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
        color: '#1A1A1A',
        letterSpacing: 1,
    },
    divider: {
        width: 100,
        height: 2,
        backgroundColor: '#D4AF37',
        marginVertical: 20,
    },
    brandStage1: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#D4AF37',
    },
    // Stage 2
    logoStage2: {
        width: 150,
        height: 150,
        marginBottom: 30,
    },
    brandStage2: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    badgeStage2: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 10,
    },
    badgeText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    footerStage2: {
        marginTop: 40,
    },
    footerText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 20,
    },
    loaderContainer: {
        position: 'absolute',
        bottom: 80,
        alignItems: 'center',
        width: '100%',
    },
    loaderTrack: {
        width: 200,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 10,
    },
    loaderFill: {
        width: '40%',
        height: '100%',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.8,
    }
});
