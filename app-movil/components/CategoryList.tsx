import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Shirt, Watch, BookOpen, Laptop, Coffee } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export const CategoryList: React.FC = () => {
    const { theme } = useTheme();

    const categories = [
        { id: '1', name: 'Ropa', icon: Shirt },
        { id: '2', name: 'Accesorios', icon: Watch },
        { id: '3', name: 'Papelería', icon: BookOpen },
        { id: '4', name: 'Tecnología', icon: Laptop },
        { id: '5', name: 'Otros', icon: Coffee },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.onSurface }]}>Categorías</Text>
                <TouchableOpacity>
                    <Text style={[styles.viewAll, { color: theme.primary }]}>Ver todas</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                                <Icon color={theme.onSurface} size={24} />
                            </View>
                            <Text style={[styles.categoryName, { color: theme.onSurfaceVariant }]}>{cat.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 12,
    },
    categoryItem: {
        alignItems: 'center',
        marginHorizontal: 8,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 12,
        fontWeight: '500',
    },
});
