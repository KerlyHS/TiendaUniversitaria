import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmitEditing?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeText,
    onSubmitEditing,
    onFocus,
    onBlur
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.searchWrapper, { backgroundColor: theme.background }]}>
                <Search color={theme.muted} size={20} style={styles.icon} />
                <TextInput
                    style={[styles.input, { color: theme.onSurface }]}
                    placeholder="Buscar productos, categorías..."
                    placeholderTextColor={theme.muted}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmitEditing}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    returnKeyType="search"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 15,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
});