import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, ViewStyle, StyleProp } from 'react-native';

interface AnimatedButtonProps {
    onPress?: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    activeScale?: number;
    disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    onPress,
    children,
    style,
    activeScale = 0.96,
    disabled = false
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        if (disabled) return;
        Animated.spring(scale, {
            toValue: activeScale,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4
        }).start();
    };

    const onPressOut = () => {
        if (disabled) return;
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4
        }).start();
    };

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={disabled}
        >
            <Animated.View style={[style, { transform: [{ scale }] }]}>
                {children}
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};
