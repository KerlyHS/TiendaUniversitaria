import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { Header } from '../components/Header';
import { CreditCard, Landmark, Banknote, ChevronLeft, CheckCircle2, Circle, Lock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStripe } from '@stripe/stripe-react-native';

type PaymentMethod = 'CARD' | 'TRANSFER' | 'CASH';

export const CheckoutScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { cartItems, subtotal, iva, total, clearCart } = useCart();
    const { user, apiFetch } = useAuth();
    const { theme, isDark } = useTheme();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchPaymentSheetParams = async () => {
        try {
            const response = await apiFetch('/pagos/intent/', {
                method: 'POST',
                body: JSON.stringify({
                    amount: Math.round(total * 100),
                    currency: 'usd',
                }),
            });

            const responseText = await response.text();
            if (responseText.trim().startsWith('<')) {
                console.warn("Backend returned HTML instead of JSON for payment intent.");
                return {
                    paymentIntent: 'pi_simulated_secret_' + Date.now(),
                    customer: 'cus_simulated',
                    ephemeralKey: 'ek_simulated',
                };
            }

            return JSON.parse(responseText);
        } catch (error) {
            console.error("Error in fetchPaymentSheetParams:", error);
            return {
                paymentIntent: 'pi_simulated_secret_' + Date.now(),
                customer: 'cus_simulated',
                ephemeralKey: 'ek_simulated',
            };
        }
    };

    const initializePaymentSheet = async () => {
        try {
            const { paymentIntent, customer, ephemeralKey } = await fetchPaymentSheetParams();

            if (paymentIntent.includes('simulated')) {
                return;
            }

            const { error } = await initPaymentSheet({
                merchantDisplayName: "Tienda Universitaria UNL",
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                allowsDelayedPaymentMethods: true,
                defaultBillingDetails: {
                    name: user?.nombre_completo,
                    email: user?.email,
                },
            });
            if (error) {
                console.error("Error initializing payment sheet:", error);
            }
        } catch (e) {
            console.error("Error in initializePaymentSheet:", e);
        }
    };

    useEffect(() => {
        if (paymentMethod === 'CARD') {
            initializePaymentSheet();
        }
    }, [paymentMethod, total]);

    const handleConfirmOrder = async () => {
        setIsProcessing(true);
        try {
            if (paymentMethod === 'CARD') {
                const params = await fetchPaymentSheetParams();
                if (params.paymentIntent.includes('simulated')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    const { error } = await presentPaymentSheet();
                    if (error) {
                        if (error.code !== 'Canceled') {
                            Alert.alert(`Error: ${error.code}`, error.message);
                        }
                        setIsProcessing(false);
                        return;
                    }
                }
            }

            const detalles = cartItems.map(item => ({
                producto_id: parseInt(item.id, 10),
                variacion_id: item.selectedVariation ? parseInt(item.selectedVariation.id.toString(), 10) : null,
                cantidad: item.cantidad
            }));

            const orderRes = await apiFetch('/pedidos/', {
                method: 'POST',
                body: JSON.stringify({
                    tipo_entrega: 'TIENDA',
                    metodo_pago: paymentMethod,
                    detalles
                })
            });

            if (!orderRes.ok) throw new Error(`Error del servidor (${orderRes.status})`);

            const order = await orderRes.json();
            clearCart();
            navigation.replace('Ticket', { order });

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ocurrió un error al procesar tu pedido.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.surface} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <ChevronLeft color={theme.onSurface} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.onSurface }]}>Pago</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.stepsContainer}>
                    <View style={styles.step}>
                        <View style={[styles.stepCircle, { backgroundColor: theme.primary }]}>
                            <Text style={styles.stepNumber}>1</Text>
                        </View>
                        <Text style={[styles.stepLabel, { color: theme.onSurface }]}>Envío</Text>
                    </View>
                    <View style={[styles.stepLine, { backgroundColor: theme.primary }]} />
                    <View style={styles.step}>
                        <View style={[styles.stepCircle, { backgroundColor: theme.primary }]}>
                            <Text style={styles.stepNumber}>2</Text>
                        </View>
                        <Text style={[styles.stepLabel, { color: theme.onSurface }]}>Pago</Text>
                    </View>
                    <View style={[styles.stepLine, { backgroundColor: theme.border }]} />
                    <View style={styles.step}>
                        <View style={[styles.stepCircle, { backgroundColor: theme.background }]}>
                            <Text style={[styles.stepNumber, { color: theme.muted }]}>3</Text>
                        </View>
                        <Text style={[styles.stepLabel, { color: theme.muted }]}>Confirmación</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Método de pago</Text>

                {[
                    { id: 'CARD', label: 'Tarjeta de crédito / débito', icon: CreditCard, subtitle: 'VISA, Mastercard' },
                    { id: 'TRANSFER', label: 'Transferencia bancaria', icon: Landmark },
                    { id: 'CASH', label: 'Pago en efectivo', icon: Banknote },
                ].map((item) => (
                    <TouchableOpacity 
                        key={item.id}
                        style={[
                            styles.paymentOption,
                            { borderColor: theme.border },
                            paymentMethod === item.id && { borderColor: theme.primary, backgroundColor: theme.primary + '05' }
                        ]}
                        onPress={() => setPaymentMethod(item.id as PaymentMethod)}
                    >
                        {paymentMethod === item.id ? (
                            <CheckCircle2 color={theme.primary} size={20} />
                        ) : (
                            <Circle color={theme.border} size={20} />
                        )}
                        <View style={styles.paymentInfo}>
                            <Text style={[styles.paymentLabel, { color: theme.onSurface }]}>{item.label}</Text>
                            {!!item.subtitle && <Text style={[styles.paymentSubtitle, { color: theme.secondaryText }]}>{item.subtitle}</Text>}
                        </View>
                        <item.icon color={theme.onSurface} size={24} />
                    </TouchableOpacity>
                ))}

                <View style={styles.summarySection}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Resumen del pedido</Text>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Subtotal</Text>
                        <Text style={[styles.summaryValue, { color: theme.onSurface }]}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>Descuento</Text>
                        <Text style={[styles.summaryValue, { color: theme.onSurface }]}>-$3.75</Text>
                    </View>
                    <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                        <Text style={[styles.totalLabel, { color: theme.onSurface }]}>Total a pagar</Text>
                        <Text style={[styles.totalValue, { color: theme.onSurface }]}>${total.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, { backgroundColor: theme.primary }]}
                    onPress={handleConfirmOrder}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.payButtonText}>Pagar ${total.toFixed(2)}</Text>
                            <View style={{ width: 8 }} />
                            <Lock color="#fff" size={18} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    step: {
        alignItems: 'center',
        width: 80,
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepNumber: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
    stepLine: {
        width: 40,
        height: 2,
        marginTop: -20,
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 12,
    },
    paymentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    paymentLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    paymentSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    summarySection: {
        marginTop: 30,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        marginTop: 10,
        borderTopWidth: 1,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    footer: {
        padding: 20,
    },
    payButton: {
        height: 56,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
