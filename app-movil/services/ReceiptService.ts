import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { API_URL } from '../context/AuthContext';
import { handleAppError } from '../utils/errorHelper';

export const downloadReceiptPDF = async (paymentIntentId: string) => {
  try {
    const url = `${API_URL}/pagos/comprobante/?payment_intent=${paymentIntentId}`;
    const fileUri = `${FileSystem.documentDirectory}Comprobante_UNL_${paymentIntentId}.pdf`;

    const downloadRes = await FileSystem.downloadAsync(
      url,
      fileUri,
      {
        headers: {
          // Authorization: `Bearer ${TU_JWT_TOKEN}` 
        }
      }
    );

    if (downloadRes.status !== 200) {
      Alert.alert("Aviso", handleAppError({ status: downloadRes.status }, 'downloadReceiptPDF'));
      return;
    }

    const isSharingAvailable = await Sharing.isAvailableAsync();
    
    if (isSharingAvailable) {
      await Sharing.shareAsync(downloadRes.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Comprobante de Pago Tienda UNL',
        UTI: 'com.adobe.pdf' 
      });
    } else {
      Alert.alert("Éxito", `Comprobante descargado en la ruta interna de la app.`);
    }
  } catch (error) {
    Alert.alert("Aviso", handleAppError(error, 'downloadReceiptPDF'));
  }
};
