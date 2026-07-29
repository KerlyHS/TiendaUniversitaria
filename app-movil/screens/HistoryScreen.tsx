import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Package } from 'lucide-react-native';

export const HistoryScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Todos');
    const { theme, isDark } = useTheme();

    const { apiFetch } = useAuth();

    const filters = ['Todos', 'Completados', 'Pendientes'];

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await apiFetch('/pedidos/');
                if (!response.ok) throw new Error("Error fetching orders");
                const data = await response.json();
                setOrders(data.results || data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ENTREGADO':
            case 'PAGADO':
                return theme.primary;
            case 'PENDIENTE':
                return theme.error;
            default:
                return theme.secondaryText;
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.fecha || item.fecha_creacion).toLocaleDateString();
        const orderTotal = Number(item.total) || 0;

        return (
            <TouchableOpacity
                style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Ticket', { order: item })}
                activeOpacity={0.7}
            >
                <View style={styles.orderMain}>
                    <View style={styles.orderInfo}>
                        <Text style={[styles.orderId, { color: theme.onSurface }]}>{item.numero_pedido || `#UNL-${item.id}`}</Text>
                        <Text style={[styles.orderDate, { color: theme.secondaryText }]}>{date}</Text>
                    </View>
                    <View style={styles.orderStatus}>
                        <Text style={[styles.totalValue, { color: theme.onSurface }]}>${orderTotal.toFixed(2)}</Text>
                        <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
                            {item.estado}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const filteredOrders = orders.filter(order => {
        if (activeFilter === 'Todos') return true;
        if (activeFilter === 'Completados') return order.estado === 'ENTREGADO' || order.estado === 'PAGADO';
        if (activeFilter === 'Pendientes') return order.estado === 'PENDIENTE';
        return true;
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.surface} />
            <Header showGreeting={false} />

            <View style={styles.headerSection}>
                <Text style={[styles.title, { color: theme.onSurface }]}>Historial</Text>
            </View>

            <View style={styles.filterWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                    {filters.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterItem,
                                activeFilter === filter && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: theme.secondaryText },
                                activeFilter === filter && { color: '#fff', fontWeight: 'bold' }
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Package color={theme.border} size={64} style={{ marginBottom: 16 }} />
                            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No hay pedidos que coincidan con el filtro</Text>
                        </View>
                    }
                />
            )}

            <BottomNavigation />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        paddingHorizontal: 20,
        marginBottom: 15,
        marginTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    filterWrapper: {
        marginBottom: 20,
    },
    filterContainer: {
        paddingHorizontal: 15,
    },
    filterItem: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    filterText: {
        fontSize: 14,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    orderCard: {
        borderRadius: 15,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 1,
    },
    orderMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
    },
    orderStatus: {
        alignItems: 'flex-end',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
    }
});
