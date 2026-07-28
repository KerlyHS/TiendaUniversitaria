import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { AnimatedButton } from './AnimatedButton';

interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onIncrease, onDecrease }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <AnimatedButton
                style={styles.button}
                onPress={onDecrease}
                disabled={quantity <= 1}
            >
                <Minus color={quantity <= 1 ? theme.muted : theme.onSurface} size={20} />
            </AnimatedButton>

            <Text style={[styles.quantity, { color: theme.onSurface }]}>{quantity}</Text>

            <AnimatedButton style={styles.button} onPress={onIncrease}>
                <Plus color={theme.onSurface} size={20} />
            </AnimatedButton>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
    },
    button: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '600',
        paddingHorizontal: 12,
        minWidth: 40,
        textAlign: 'center',
    },
});
