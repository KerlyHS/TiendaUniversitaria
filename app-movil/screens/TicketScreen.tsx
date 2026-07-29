import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Download, Share2, Printer, ChevronLeft } from 'lucide-react-native';
import { generateInvoiceHTML } from '../utils/InvoiceHTMLTemplate';
import { AnimatedButton } from '../components/AnimatedButton';
import { useTheme } from '../context/ThemeContext';

export const TicketScreen: React.FC = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const [isGenerating, setIsGenerating] = useState(false);
    const { theme } = useTheme();

    const order = route.params?.order || {};
    const { detalles = [], cliente_nombre = '', cliente_email = '', numero_pedido = 'P-N/A' } = order;

    const total = Number(order.total) || 0;
    const subtotal = Number(order.subtotal) || 0;
    const impuesto = Number(order.impuesto) || 0;

    const issueDate = new Date();

    const handleDownload = async () => {
        try {
            setIsGenerating(true);
            const html = generateInvoiceHTML(order);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
                dialogTitle: 'Guardar Comprobante'
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            Alert.alert('Error', 'No se pudo generar el comprobante.');
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
            Alert.alert('Error', 'No se pudo compartir el comprobante.');
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                    <ChevronLeft color={theme.onSurface} size={24} />
                    <Text style={[styles.backText, { color: theme.onSurface }]}>Volver al Inicio</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.ticketContainer, { backgroundColor: theme.card }]}>
                    <View style={styles.ticketHeader}>
                        <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary }]}>
                            <Text style={styles.logoText}>UNL</Text>
                        </View>
                        <Text style={[styles.uniName, { color: theme.onSurface }]}>Universidad Nacional de Loja</Text>
                        <Text style={[styles.storeName, { color: theme.secondaryText }]}>Tienda Universitaria</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>Ticket N°:</Text>
                            <Text style={[styles.infoValue, { color: theme.onSurface }]} numberOfLines={1} ellipsizeMode="middle">{numero_pedido}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>Emisión:</Text>
                            <Text style={[styles.infoValue, { color: theme.onSurface }]}>{issueDate.toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>Cliente:</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoValue, { color: theme.onSurface, textAlign: 'right' }]} numberOfLines={2}>{cliente_nombre || 'Consumidor Final'}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, { color: theme.secondaryText }]}>Correo:</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoValue, { color: theme.onSurface, textAlign: 'right' }]} numberOfLines={1} ellipsizeMode="tail">{cliente_email || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.dividerDashed, { borderColor: theme.border }]} />

                    <View style={styles.productsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Detalle de Compra</Text>
                        {detalles.map((item: any, index: number) => (
                            <View key={index} style={styles.productRow}>
                                <Text style={[styles.productQty, { color: theme.onSurface }]}>{item.cantidad}x</Text>
                                <View style={{ flex: 1, paddingHorizontal: 8 }}>
                                    <Text style={[styles.productName, { color: theme.onSurface }]} numberOfLines={2}>{item.nombre_producto}</Text>
                                    {!!item.variacion_nombre && (
                                        <Text style={[styles.itemVariation, { color: theme.secondaryText }]}>{item.variacion_nombre}</Text>
                                    )}
                                </View>
                                <Text style={[styles.productPrice, { color: theme.onSurface }]}>${parseFloat(item.subtotal || 0).toFixed(2)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.dividerDashed, { borderColor: theme.border }]} />

                    <View style={styles.totalsSection}>
                        <View style={styles.totalRow}>
                            <Text style={[styles.totalLabel, { color: theme.secondaryText }]}>Subtotal</Text>
                            <Text style={[styles.totalValue, { color: theme.onSurface }]}>${subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={[styles.totalLabel, { color: theme.secondaryText }]}>IVA (12%)</Text>
                            <Text style={[styles.totalValue, { color: theme.onSurface }]}>${impuesto.toFixed(2)}</Text>
                        </View>
                        <View style={styles.finalTotalRow}>
                            <Text style={[styles.finalTotalLabel, { color: theme.onSurface }]}>TOTAL</Text>
                            <Text style={[styles.finalTotalValue, { color: theme.primary }]}>${total.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.qrSection}>
                        <Text style={[styles.qrInstructions, { color: theme.secondaryText }]}>Presenta este código en caja para pagar</Text>
                        <View style={[styles.qrCodeWrapper, { backgroundColor: '#fff', borderColor: theme.border }]}>
                            <QRCode
                                value={numero_pedido}
                                size={120}
                                backgroundColor="transparent"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <AnimatedButton
                        style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }, isGenerating && styles.disabledButton]}
                        onPress={handleDownload}
                        disabled={isGenerating}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {isGenerating ? <ActivityIndicator size="small" color={theme.primary} /> : <Download color={theme.primary} size={20} />}
                            <Text style={[styles.actionText, { color: theme.primary }]}>Descargar</Text>
                        </View>
                    </AnimatedButton>
                    <AnimatedButton
                        style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }, isGenerating && styles.disabledButton]}
                        onPress={handleShare}
                        disabled={isGenerating}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {isGenerating ? <ActivityIndicator size="small" color={theme.primary} /> : <Share2 color={theme.primary} size={20} />}
                            <Text style={[styles.actionText, { color: theme.primary }]}>Compartir</Text>
                        </View>
                    </AnimatedButton>
                    <AnimatedButton
                        style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }, isGenerating && styles.disabledButton]}
                        onPress={handlePrint}
                        disabled={isGenerating}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {isGenerating ? <ActivityIndicator size="small" color={theme.primary} /> : <Printer color={theme.primary} size={20} />}
                            <Text style={[styles.actionText, { color: theme.primary }]}>Imprimir</Text>
                        </View>
                    </AnimatedButton>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        padding: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        marginLeft: 4,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    ticketContainer: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    ticketHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    uniName: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    storeName: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 15,
    },
    dividerDashed: {
        height: 1,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginVertical: 15,
    },
    infoSection: {
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 13,
        fontWeight: '500',
        width: 90,
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    productsSection: {
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    productQty: {
        fontSize: 13,
        fontWeight: 'bold',
        width: 25,
    },
    productName: {
        fontSize: 13,
    },
    itemVariation: {
        fontSize: 11,
        marginTop: 2,
    },
    productPrice: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 10,
        minWidth: 50,
        textAlign: 'right',
    },
    totalsSection: {
        gap: 6,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: {
        fontSize: 13,
    },
    totalValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 0,
    },
    finalTotalLabel: {
        fontSize: 18,
        fontWeight: '900',
    },
    finalTotalValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    qrSection: {
        alignItems: 'center',
        marginTop: 10,
    },
    qrInstructions: {
        fontSize: 12,
        marginBottom: 15,
        textAlign: 'center',
    },
    qrCodeWrapper: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    actionText: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: 'bold',
    }
});
