import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Home, Search, Settings } from 'lucide-react-native';

export const BottomNavigation: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: true }}>
                    <Home color="#10b981" size={24} />
                    <Text style={[styles.label, styles.labelActive]}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tab} accessibilityRole="tab">
                    <Search color="#64748b" size={24} strokeWidth={2.5} />
                    <Text style={styles.label}>Búsqueda</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tab} accessibilityRole="tab">
                    <Settings color="#64748b" size={24} />
                    <Text style={styles.label}>Ajustes</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    container: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#ffffff',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 4,
    },
    label: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
        fontWeight: '500',
    },
    labelActive: {
        color: '#10b981', // Verde institucional
        fontWeight: '700',
    },
});
