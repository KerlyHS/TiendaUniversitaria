import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

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
                <Minus color={quantity <= 1 ? '#cbd5e1' : '#1e293b'} size={20} />
            </TouchableOpacity>

            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity style={styles.button} onPress={onIncrease}>
                <Plus color="#1e293b" size={20} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        backgroundColor: '#f8fafc',
    },
    button: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        paddingHorizontal: 16,
        minWidth: 48,
        textAlign: 'center',
    },
});
