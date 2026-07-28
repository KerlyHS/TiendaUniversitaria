import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { Colors } from '../constants/Colors';
import { Header } from '../components/Header';
import { CreditCard, Landmark, Banknote, MapPin, CheckCircle2, Circle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { AnimatedButton } from '../components/AnimatedButton';
import { useTheme } from '../context/ThemeContext';

type PaymentMethod = 'CARD' | 'TRANSFER' | 'CASH';

export const CheckoutScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { cartItems, subtotal, iva, total, clearCart } = useCart();
    const { user, apiFetch } = useAuth();
    const { theme } = useTheme();

    // Rellenamos los datos de facturación con el perfil actual
    const [rut, setRut] = useState(user?.identificacion || '');
    const [name, setName] = useState(user?.nombre_completo || '');
    const [email, setEmail] = useState(user?.email || '');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirmOrder = async () => {
        if (!rut || !name || !email) {
            Alert.alert('Campos incompletos', 'Por favor, completa tus datos de facturación.');
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Crear Orden en backend (Simulación)
            const detalles = cartItems.map(item => ({
                producto_id: parseInt(item.id, 10),
                variacion_id: item.selectedVariation ? parseInt(item.selectedVariation.id.toString(), 10) : null,
                cantidad: item.cantidad
            }));

            const orderRes = await apiFetch('/pedidos/', {
                method: 'POST',
                body: JSON.stringify({
                    tipo_entrega: 'TIENDA',
                    detalles
                })
            });

            const responseText = await orderRes.text();

            if (!orderRes.ok) {
                console.error("Error Response Body:", responseText);
                try {
                    const errData = JSON.parse(responseText);
                    throw new Error("No se pudo crear el pedido: " + JSON.stringify(errData));
                } catch (e) {
                    throw new Error(`Error del servidor (${orderRes.status})`);
                }
            }

            let order;
            try {
                order = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse success response as JSON:", responseText);
                throw new Error("El servidor respondió con un formato inesperado.");
            }

            // 2. Simular Procesamiento de Pago
            // En este proyecto no usamos Stripe Real, solo simulamos éxito
            clearCart();

            if (paymentMethod === 'CARD') {
                Alert.alert('¡Pago Simulado Exitoso!', 'Tu orden con tarjeta ha sido procesada correctamente.');
                navigation.replace('Ticket', { order });
            } else if (paymentMethod === 'CASH') {
                Alert.alert('Orden Generada', 'Presenta tu ticket en caja para realizar el pago.');
                navigation.replace('Ticket', { order });
            } else {
                Alert.alert('Orden Creada', 'Te hemos enviado las instrucciones de transferencia a tu correo.');
                navigation.replace('History');
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Ocurrió un error al procesar tu pedido. Intenta nuevamente.');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.pageTitle}>Completar Pedido (Simulación)</Text>

                {/* Modalidad de Retiro */}
                <View style={styles.section}>
                    <View style={styles.pickupAlert}>
                        <MapPin color={Colors.primary} size={24} />
                        <View style={styles.pickupTextContainer}>
                            <Text style={styles.pickupTitle}>MODALIDAD: RETIRO EN TIENDA FÍSICA</Text>
                            <Text style={styles.pickupDesc}>Tu pedido estará disponible para ser retirado en el campus principal. Recibirás un correo cuando esté listo.</Text>
                        </View>
                    </View>
                </View>

                {/* Datos de Facturación */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos de Facturación</Text>
                    <Text style={{fontSize: 12, color: Colors.secondaryText, marginBottom: 8}}>
                        El pedido se registrará a nombre de tu usuario. Revisa tus datos:
                    </Text>
                    
                    <Text style={styles.label}>RUT / DOCUMENTO DE IDENTIDAD</Text>
                    <TextInput 
                        style={[styles.input, {backgroundColor: '#f1f5f9', color: '#64748b'}]} 
                        placeholder="Ej: 12.345.678-9" 
                        value={rut}
                        editable={false}
                    />

                    <Text style={styles.label}>NOMBRE COMPLETO O RAZÓN SOCIAL</Text>
                    <TextInput 
                        style={[styles.input, {backgroundColor: '#f1f5f9', color: '#64748b'}]} 
                        placeholder="Nombre completo" 
                        value={name}
                        editable={false}
                    />

                    <Text style={styles.label}>CORREO ELECTRÓNICO PARA FACTURA</Text>
                    <TextInput 
                        style={[styles.input, {backgroundColor: '#f1f5f9', color: '#64748b'}]} 
                        placeholder="correo@institucion.edu" 
                        value={email}
                        editable={false}
                    />
                </View>

                {/* Método de Pago */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Método de Pago (Simulado)</Text>

                    {/* Tarjeta */}
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'CARD' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('CARD')}
                    >
                        <View style={styles.paymentOptionHeader}>
                            {paymentMethod === 'CARD' ? <CheckCircle2 color={Colors.primary} size={20} /> : <Circle color={Colors.border} size={20} />}
                            <CreditCard color={Colors.onSurface} size={20} style={{ marginLeft: 12 }} />
                            <View style={styles.paymentOptionText}>
                                <Text style={styles.paymentOptionTitle}>Tarjeta de Crédito / Débito (Simulación)</Text>
                                <Text style={styles.paymentOptionDesc}>Simula el ingreso de datos de tarjeta</Text>
                            </View>
                        </View>
                        {paymentMethod === 'CARD' && (
                            <View style={styles.cardFieldContainer}>
                                <View style={styles.simulatedCard}>
                                    <Text style={styles.simulatedCardText}>**** **** **** 4242</Text>
                                    <Text style={styles.simulatedCardText}>12/28</Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Transferencia */}
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'TRANSFER' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('TRANSFER')}
                    >
                        <View style={styles.paymentOptionHeader}>
                            {paymentMethod === 'TRANSFER' ? <CheckCircle2 color={Colors.primary} size={20} /> : <Circle color={Colors.border} size={20} />}
                            <Landmark color={Colors.onSurface} size={20} style={{ marginLeft: 12 }} />
                            <View style={styles.paymentOptionText}>
                                <Text style={styles.paymentOptionTitle}>Transferencia Bancaria</Text>
                                <Text style={styles.paymentOptionDesc}>Instrucciones enviadas al correo</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Efectivo */}
                    <TouchableOpacity 
                        style={[styles.paymentOption, paymentMethod === 'CASH' && styles.paymentOptionActive]}
                        onPress={() => setPaymentMethod('CASH')}
                    >
                        <View style={styles.paymentOptionHeader}>
                            {paymentMethod === 'CASH' ? <CheckCircle2 color={Colors.primary} size={20} /> : <Circle color={Colors.border} size={20} />}
                            <Banknote color={Colors.onSurface} size={20} style={{ marginLeft: 12 }} />
                            <View style={styles.paymentOptionText}>
                                <Text style={styles.paymentOptionTitle}>Pago en Efectivo en Tienda</Text>
                                <Text style={styles.paymentOptionDesc}>Paga directamente en la caja al retirar</Text>
                            </View>
                        </View>
                        {paymentMethod === 'CASH' && (
                            <View style={styles.cashWarning}>
                                <Text style={styles.cashWarningText}>
                                    <Text style={{fontWeight: 'bold'}}>IMPORTANTE: </Text>
                                    Debe acercarse a caja a realizar el pago antes de retirar sus productos. Sin el comprobante de pago de caja, no se podrá entregar su pedido.
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Resumen */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Resumen de la Orden</Text>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} items)</Text>
                        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Costo de Envío</Text>
                        <Text style={[styles.summaryValue, { color: Colors.primary }]}>Gratis (Retiro)</Text>
                    </View>
                    
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total a Pagar</Text>
                        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Terms and conditions */}
                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                        Al continuar, aceptas los <Text style={styles.termsLink}>Términos de Servicio</Text> y la <Text style={styles.termsLink}>Política de Privacidad</Text>.
                    </Text>
                </View>

                {/* Botón */}
                <AnimatedButton
                    style={[styles.submitButton, { backgroundColor: theme.primary }, isProcessing && styles.submitButtonDisabled]}
                    onPress={handleConfirmOrder}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={theme.onPrimary} />
                    ) : (
                        <Text style={[styles.submitButtonText, { color: theme.onPrimary }]}>Confirmar Pedido</Text>
                    )}
                </AnimatedButton>
                
                <View style={{height: 40}} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    scrollContent: {
        padding: 16,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.onSurface,
        marginBottom: 16,
    },
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    pickupAlert: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
    },
    pickupTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    pickupTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.onSurface,
        marginBottom: 4,
    },
    pickupDesc: {
        fontSize: 12,
        color: Colors.secondaryText,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.secondaryText,
        marginBottom: 4,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: Colors.onSurface,
        backgroundColor: Colors.white,
    },
    paymentOption: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        backgroundColor: Colors.white,
    },
    paymentOptionActive: {
        borderColor: Colors.primary,
        backgroundColor: '#F0F9F4', // Muy leve verde
    },
    paymentOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentOptionText: {
        marginLeft: 12,
        flex: 1,
    },
    paymentOptionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.onSurface,
    },
    paymentOptionDesc: {
        fontSize: 12,
        color: Colors.secondaryText,
    },
    cardFieldContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    simulatedCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    simulatedCardText: {
        color: '#64748b',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    cashWarning: {
        marginTop: 16,
        backgroundColor: '#E5EEFF', // Azul claro, como en la imagen
        padding: 12,
        borderRadius: 8,
    },
    cashWarningText: {
        fontSize: 12,
        color: Colors.secondaryText,
        lineHeight: 18,
    },
    summaryContainer: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.onSurface,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.secondaryText,
    },
    summaryValue: {
        fontSize: 14,
        color: Colors.onSurface,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.onSurface,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    termsContainer: {
        marginBottom: 16,
    },
    termsText: {
        fontSize: 12,
        color: Colors.secondaryText,
        textAlign: 'center',
    },
    termsLink: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: Colors.muted,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

