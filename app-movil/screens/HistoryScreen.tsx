import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedButton } from '../components/AnimatedButton';
import { Package, ChevronRight } from 'lucide-react-native';

export const HistoryScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    const { apiFetch } = useAuth();

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
            case 'PENDIENTE': return '#f59e0b';
            case 'PAGADO': return '#10b981';
            case 'ENTREGADO': return '#3b82f6';
            case 'CANCELADO': return Colors.error;
            default: return Colors.secondaryText;
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const date = new Date(item.fecha).toLocaleDateString();
        const orderTotal = Number(item.total) || 0;

        return (
            <AnimatedButton
                style={[styles.orderCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => {}}
            >
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Package color={Colors.primary} size={20} />
                        <Text style={styles.orderId}>{item.numero_pedido}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
                            {item.estado}
                        </Text>
                    </View>
                </View>

                <View style={styles.orderDetails}>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailLabel}>Fecha</Text>
                        <Text style={styles.detailValue}>{date}</Text>
                    </View>
                    <View style={styles.detailCol}>
                        <Text style={styles.detailLabel}>Método</Text>
                        <Text style={styles.detailValue}>{item.venta?.metodo_pago || 'STRIPE'}</Text>
                    </View>
                    <View style={styles.detailColRight}>
                        <Text style={styles.detailLabel}>Total</Text>
                        <Text style={styles.totalValue}>${orderTotal.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.orderFooter}>
                    <Text style={[styles.viewDetailsText, { color: theme.primary }]}>Ver detalles</Text>
                    <ChevronRight color={theme.primary} size={16} />
                </View>
            </AnimatedButton>
        );
    };

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.headerTitle}>
                <Text style={styles.title}>Historial de Compras</Text>
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Package color={Colors.border} size={64} style={{ marginBottom: 16 }} />
                            <Text style={styles.emptyText}>No tienes compras aún</Text>
                            <TouchableOpacity 
                                style={styles.shopButton}
                                onPress={() => navigation.navigate('Home')}
                            >
                                <Text style={styles.shopButtonText}>Ir a comprar</Text>
                            </TouchableOpacity>
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
        backgroundColor: Colors.surface,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        padding: 16,
        backgroundColor: Colors.surface,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.onSurface,
    },
    listContent: {
        padding: 16,
    },
    orderCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    orderId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.onSurface,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailCol: {
        flex: 1,
    },
    detailColRight: {
        alignItems: 'flex-end',
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.secondaryText,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.onSurface,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.onSurface,
    },
    orderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: 12,
    },
    viewDetailsText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
        marginRight: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.secondaryText,
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
    }
});
