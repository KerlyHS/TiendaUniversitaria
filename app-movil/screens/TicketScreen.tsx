import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants/Colors';
import { Download, Share2, Printer, ChevronLeft } from 'lucide-react-native';
import { generateInvoiceHTML } from '../utils/InvoiceHTMLTemplate';
import { AnimatedButton } from '../components/AnimatedButton';
import { useTheme } from '../context/ThemeContext';

export const TicketScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const [isGenerating, setIsGenerating] = useState(false);
    const { theme } = useTheme();

    // Si viene de CheckoutScreen, pasamos 'order'
    const order = route.params?.order || {};
    const { detalles = [], cliente_nombre = '', cliente_email = '', numero_pedido = 'P-N/A' } = order;

    // Aseguramos que el total sea un número
    const total = Number(order.total) || 0;
    const subtotal = Number(order.subtotal) || 0;
    const impuesto = Number(order.impuesto) || 0;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // 3 días para pagar

    const handleDownload = async () => {
        try {
            setIsGenerating(true);
            const html = generateInvoiceHTML(order);
            const { uri } = await Print.printToFileAsync({ html });

            if (Platform.OS === 'android') {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                    const fileName = `Factura_${numero_pedido.replace(/-/g, '_')}.pdf`;
                    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf');
                    await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                    Alert.alert('Éxito', 'La factura ha sido guardada en tu dispositivo.');
                } else {
                    await Sharing.shareAsync(uri);
                }
            } else {
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            Alert.alert('Error', 'No se pudo generar o descargar la factura.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        try {
            setIsGenerating(true);
            const html = generateInvoiceHTML(order);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('Error sharing PDF:', error);
            Alert.alert('Error', 'No se pudo compartir la factura.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = async () => {
        try {
            setIsGenerating(true);
            const html = generateInvoiceHTML(order);
            await Print.printAsync({ html });
        } catch (error) {
            console.error('Error printing PDF:', error);
            Alert.alert('Error', 'No se pudo abrir el diálogo de impresión.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
            
            {/* Cabecera para regresar */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <ChevronLeft color={Colors.onSurface} size={24} />
                    <Text style={styles.backText}>Volver al Inicio</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Ticket Container */}
                <View style={styles.ticketContainer}>
                    {/* Header Ticket */}
                    <View style={styles.ticketHeader}>
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoText}>UNL</Text>
                        </View>
                        <Text style={styles.uniName}>Universidad Nacional del Litoral</Text>
                        <Text style={styles.storeName}>Tienda Universitaria</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Datos Cliente y Ticket */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Ticket N°:</Text>
                            <Text style={styles.infoValue}>{numero_pedido}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Emisión:</Text>
                            <Text style={styles.infoValue}>{issueDate.toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Vencimiento:</Text>
                            <Text style={styles.infoValue}>{dueDate.toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Cliente:</Text>
                            <Text style={styles.infoValue}>{cliente_nombre || 'Consumidor Final'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Correo:</Text>
                            <Text style={styles.infoValue}>{cliente_email || 'N/A'}</Text>
                        </View>
                    </View>

                    <View style={styles.dividerDashed} />

                    {/* Productos */}
                    <View style={styles.productsSection}>
                        <Text style={styles.sectionTitle}>Detalle de Compra</Text>
                        {detalles.map((item: any, index: number) => (
                            <View key={index} style={styles.productRow}>
                                <Text style={styles.productQty}>{item.cantidad}x</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.productName}>{item.nombre_producto}</Text>
                                    {item.variacion_nombre && <Text style={styles.itemVariation}>{item.variacion_nombre}</Text>}
                                </View>
                                <Text style={styles.productPrice}>${parseFloat(item.subtotal).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.dividerDashed} />

                    {/* Totales */}
                    <View style={styles.totalsSection}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IVA (12%)</Text>
                            <Text style={styles.totalValue}>${impuesto.toFixed(2)}</Text>
                        </View>
                        <View style={styles.finalTotalRow}>
                            <Text style={styles.finalTotalLabel}>TOTAL A PAGAR</Text>
                            <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Códigos de Pago */}
                    <View style={styles.qrSection}>
                        <Text style={styles.qrInstructions}>Presenta este código en caja para pagar</Text>
                        <View style={styles.qrCodeWrapper}>
                            <QRCode
                                value={numero_pedido}
                                size={120}
                                backgroundColor="transparent"
                            />
                        </View>
                        <View style={styles.barcodePlaceholder}>
                            <Text style={styles.barcodeText}>|||||||||||||||||||||||||||||||||||||||</Text>
                            <Text style={styles.referenceText}>{numero_pedido.replace(/-/g, '')}</Text>
                        </View>
                    </View>

                </View>

                {/* Acciones */}
                <View style={styles.actionsContainer}>
                    <AnimatedButton
                        style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }, isGenerating && styles.disabledButton]}
                        onPress={handleDownload}
                        disabled={isGenerating}
                    >
                        {isGenerating ? <ActivityIndicator size="small" color={theme.primary} /> : <Download color={theme.primary} size={20} />}
                        <Text style={[styles.actionText, { color: theme.primary }]}>Descargar</Text>
                    </AnimatedButton>
                    <AnimatedButton
                        style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }, isGenerating && styles.disabledButton]}
                        onPress={handleShare}
                        disabled={isGenerating}
                    >
                        {isGenerating ? <ActivityIndicator size="small" color={theme.primary} /> : <Share2 color={theme.primary} size={20} />}
                        <Text style={[styles.actionText, { color: theme.primary }]}>Compartir</Text>
                    </AnimatedButton>
                    <AnimatedButton
                        style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }, isGenerating && styles.disabledButton]}
                        onPress={handlePrint}
                        disabled={isGenerating}
                    >
                        {isGenerating ? <ActivityIndicator size="small" color={theme.primary} /> : <Printer color={theme.primary} size={20} />}
                        <Text style={[styles.actionText, { color: theme.primary }]}>Imprimir</Text>
                    </AnimatedButton>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#f1f5f9',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        color: Colors.onSurface,
        marginLeft: 4,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    ticketContainer: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 6,
    },
    ticketHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: Colors.primaryContainer,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    uniName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.onSurface,
        textAlign: 'center',
    },
    storeName: {
        fontSize: 14,
        color: Colors.secondaryText,
        textAlign: 'center',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 16,
    },
    dividerDashed: {
        height: 1,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        marginVertical: 16,
    },
    infoSection: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 14,
        color: Colors.secondaryText,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.onSurface,
    },
    productsSection: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.onSurface,
        marginBottom: 4,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    productQty: {
        width: 30,
        fontSize: 14,
        color: Colors.onSurface,
        fontWeight: '600',
    },
    productName: {
        fontSize: 14,
        color: Colors.onSurface,
    },
    itemVariation: {
        fontSize: 11,
        color: Colors.secondaryText,
        marginTop: 2,
    },
    productPrice: {
        fontSize: 14,
        color: Colors.onSurface,
        fontWeight: '600',
        marginLeft: 8,
    },
    totalsSection: {
        gap: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: {
        fontSize: 14,
        color: Colors.secondaryText,
    },
    totalValue: {
        fontSize: 14,
        color: Colors.onSurface,
    },
    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    finalTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.onSurface,
    },
    finalTotalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    qrSection: {
        alignItems: 'center',
        marginTop: 8,
    },
    qrInstructions: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginBottom: 16,
    },
    qrCodeWrapper: {
        padding: 16,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16,
    },
    barcodePlaceholder: {
        alignItems: 'center',
    },
    barcodeText: {
        fontSize: 24,
        letterSpacing: 2,
        color: Colors.onSurface,
    },
    referenceText: {
        fontSize: 10,
        color: Colors.secondaryText,
        marginTop: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    actionButton: {
        flex: 1,
        backgroundColor: Colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    disabledButton: {
        opacity: 0.5,
    },
    actionText: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    }
});
