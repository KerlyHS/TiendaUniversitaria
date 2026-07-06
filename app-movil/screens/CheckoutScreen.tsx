import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { downloadReceiptPDF } from '../services/ReceiptService';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const CheckoutScreen = ({ route }: any) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  
  // Asumimos que route.params recibe el ID del pedido y el total
  // Ej: navigation.navigate('Checkout', { pedidoId: 123, totalPagar: '25.50' })
  const { pedidoId, totalPagar } = route.params || { pedidoId: null, totalPagar: '0.00' };

  const fetchPaymentIntentClientSecret = async () => {
    const response = await axios.post(`${API_URL}/pagos/crear-payment-intent/`, {
      pedido_id: pedidoId
    });
    return response.data.client_secret;
  };

  const openPaymentSheet = async () => {
    if (!pedidoId) {
      Alert.alert('Error', 'No se ha proporcionado un ID de pedido válido.');
      return;
    }

    try {
      setLoading(true);
      
      const clientSecret = await fetchPaymentIntentClientSecret();

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Tienda Universitaria UNL',
        paymentIntentClientSecret: clientSecret,
      });

      if (initError) throw new Error(initError.message);

      const { error: paymentError } = await presentPaymentSheet();
      
      if (paymentError) {
        Alert.alert('Pago Cancelado', paymentError.message);
      } else {
        const paymentIntentId = clientSecret.split('_secret_')[0];
        
        Alert.alert(
          '¡Pago Exitoso!',
          'Tu transacción ha sido aprobada. Generando comprobante...',
          [{ text: "Aceptar", onPress: () => downloadReceiptPDF(paymentIntentId) }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error en la transacción', error.message || 'Error desconocido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Pago</Text>
      <Text style={styles.total}>Total a pagar: ${totalPagar}</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={openPaymentSheet}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Pagar de forma segura</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center', 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  total: { 
    fontSize: 20, 
    color: '#006633', 
    textAlign: 'center', 
    marginBottom: 40, 
    fontWeight: '600' 
  },
  button: { 
    backgroundColor: '#006633', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  buttonDisabled: { 
    backgroundColor: '#a1a1aa' 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
