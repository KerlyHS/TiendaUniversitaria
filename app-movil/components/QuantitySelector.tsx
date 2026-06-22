import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onIncrease, onDecrease }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={onDecrease}
                disabled={quantity <= 1}
            >
                <Minus color={quantity <= 1 ? Colors.border : Colors.onSurface} size={20} />
            </TouchableOpacity>

            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity style={styles.button} onPress={onIncrease}>
                <Plus color={Colors.onSurface} size={20} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.background,
    },
    button: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.onSurface,
        paddingHorizontal: 16,
        minWidth: 48,
        textAlign: 'center',
    },
});
