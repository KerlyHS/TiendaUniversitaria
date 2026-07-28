import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SkeletonProps {
    width?: any;
    height?: any;
    borderRadius?: number;
    style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 4, style }) => {
    const { theme } = useTheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.muted + '40',
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const ProductSkeleton: React.FC = () => {
    const { width } = Dimensions.get('window');
    const CARD_WIDTH = (width - 32 - 16) / 2;

    return (
        <View style={styles.cardSkeleton}>
            <Skeleton width="100%" height={CARD_WIDTH} borderRadius={12} />
            <View style={{ padding: 12 }}>
                <Skeleton width="40%" height={10} style={{ marginBottom: 8 }} />
                <Skeleton width="90%" height={15} style={{ marginBottom: 4 }} />
                <Skeleton width="80%" height={15} style={{ marginBottom: 12 }} />
                <Skeleton width="50%" height={20} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardSkeleton: {
        width: (Dimensions.get('window').width - 32 - 16) / 2,
        margin: 8,
        borderRadius: 12,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    }
});
