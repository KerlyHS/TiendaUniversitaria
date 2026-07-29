// --- searchStorage.ts ---
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@tienda_search_history';
const MAX_HISTORY_ITEMS = 5;

// Obtener el historial guardado
export const getSearchHistory = async (): Promise<string[]> => {
    try {
        const historyJSON = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (historyJSON) {
            return JSON.parse(historyJSON);
        }
        return [];
    } catch (error) {
        console.error('Error loading search history', error);
        return [];
    }
};

// Guardar una nueva búsqueda
export const saveSearchQuery = async (query: string): Promise<string[]> => {
    if (!query.trim()) return [];

    try {
        const currentHistory = await getSearchHistory();
        const queryLower = query.trim().toLowerCase();

        // Eliminamos si ya existe para ponerlo al principio (no duplicados)
        const filteredHistory = currentHistory.filter(item => item.toLowerCase() !== queryLower);

        // Agregamos al inicio y limitamos a MAX_HISTORY_ITEMS
        const newHistory = [query.trim(), ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);

        await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        return newHistory;
    } catch (error) {
        console.error('Error saving search query', error);
        return [];
    }
};

// Limpiar el historial (opcional, buena práctica)
export const clearSearchHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
        console.error('Error clearing search history', error);
    }
};
