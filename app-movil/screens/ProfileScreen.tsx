import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    Image, 
    TouchableOpacity, 
    FlatList, 
    TextInput, 
    ActivityIndicator, 
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ShoppingBag, LogOut, User, Mail, Lock, Phone, MapPin, BadgeHelp, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
    id: number;
    numero_pedido: string;
    fecha_creacion: string;
    total: number | string;
    estado: string;
}

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user, isAuthenticated, isLoading, error: authError, login, logout, apiFetch } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Cargar órdenes reales del usuario cuando esté autenticado
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserOrders();
        }
    }, [isAuthenticated]);

    const fetchUserOrders = async () => {
        setLoadingOrders(true);
        try {
            const res = await apiFetch('/pedidos/');
            if (res.ok) {
                const data = await res.json();
                // Si la respuesta es paginada, obtenemos data.results, si no, data directa
                const orderList = Array.isArray(data) ? data : (data.results || []);
                setOrders(orderList);
            }
        } catch (err) {
            console.log('Error al cargar pedidos del móvil:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña.');
            return;
        }

        setIsSubmitting(true);
        const result = await login(email.trim(), password.trim());
        setIsSubmitting(false);

        if (!result.success) {
            Alert.alert('Error de Inicio de Sesión', result.error || 'Credenciales inválidas.');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas salir de tu cuenta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Cerrar Sesión', 
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        setEmail('');
                        setPassword('');
                    } 
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ENTREGADO':
                return '#10b981';
            case 'LISTO':
                return '#0284c7';
            case 'PREPARACION':
                return '#f59e0b';
            case 'CANCELADO':
                return '#ef4444';
            default:
                return Colors.primaryContainer;
        }
    };

    const renderPurchaseItem = ({ item }: { item: OrderItem }) => {
        const orderTotal = typeof item.total === 'number' ? item.total : parseFloat(item.total || '0');
        const orderDate = item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : 'N/A';
        
        return (
            <View style={styles.purchaseCard}>
                <View style={styles.purchaseHeader}>
                    <Text style={styles.orderNumber}>{item.numero_pedido || `Pedido #${item.id}`}</Text>
                    <Text style={styles.purchaseDate}>{orderDate}</Text>
                </View>
                <View style={styles.purchaseDetails}>
                    <View style={styles.purchaseInfo}>
                        <ShoppingBag color={Colors.secondaryText} size={16} style={{ marginRight: 6 }} />
                        <Text style={styles.purchaseStatusLabel}>Estado: {item.estado}</Text>
                    </View>
                    <Text style={styles.purchaseTotal}>${orderTotal.toFixed(2)}</Text>
                </View>
                <View style={styles.purchaseFooter}>
                    <Text style={[
                        styles.purchaseStatus, 
                        { 
                            color: getStatusColor(item.estado), 
                            backgroundColor: getStatusColor(item.estado) + '15' 
                        }
                    ]}>
                        {item.estado}
                    </Text>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.loadingCenter]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando información del perfil...</Text>
            </SafeAreaView>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView contentContainerStyle={styles.loginScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.loginHeader}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAbsolute}>
                                <ChevronLeft color={Colors.onSurface} size={28} />
                            </TouchableOpacity>
                            <View style={styles.loginIconContainer}>
                                <User color={Colors.primary} size={48} />
                            </View>
                            <Text style={styles.loginTitle}>¡Bienvenido de nuevo!</Text>
                            <Text style={styles.loginSubtitle}>Ingresa a tu cuenta de la Tienda Universitaria</Text>
                        </View>

                        {/* Indicación de tipo de usuario */}
                        <View style={styles.userTypeTipBox}>
                            <BadgeHelp color={Colors.primary} size={20} style={{ marginRight: 8, marginTop: 2 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userTypeTipTitle}>Información de Acceso</Text>
                                <Text style={styles.userTypeTipText}>
                                    Si eres de la <Text style={{ fontWeight: 'bold' }}>Comunidad UNL</Text>, inicia sesión con tu correo institucional (@unl.edu.ec). El público general puede usar su correo personal registrado.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.cardContainer}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Correo Electrónico</Text>
                                <View style={styles.inputWrapper}>
                                    <Mail color={Colors.muted} size={20} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder="ejemplo@correo.com o @unl.edu.ec"
                                        placeholderTextColor={Colors.muted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Contraseña</Text>
                                <View style={styles.inputWrapper}>
                                    <Lock color={Colors.muted} size={20} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder="••••••••"
                                        placeholderTextColor={Colors.muted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]} 
                                onPress={handleLogin}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color={Colors.onPrimary} />
                                ) : (
                                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLinkText}>¿No tienes cuenta? <Text style={styles.registerLinkHighlight}>Regístrate aquí</Text></Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={Colors.onPrimary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mi Perfil</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.backButton}>
                    <LogOut color={Colors.onPrimary} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
                <View style={styles.avatarWrapper}>
                    <Text style={styles.avatarInitials}>
                        {user.nombre_completo ? user.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={styles.profileName}>{user.nombre_completo}</Text>
                <View style={styles.badgeContainer}>
                    <View style={[styles.userBadge, { backgroundColor: user.is_universidad ? '#005e2615' : '#0ea5e915' }]}>
                        <CheckCircle2 color={user.is_universidad ? Colors.primary : Colors.price} size={14} style={{ marginRight: 4 }} />
                        <Text style={[styles.userBadgeText, { color: user.is_universidad ? Colors.primary : Colors.price }]}>
                            {user.is_universidad ? `Comunidad UNL - ${user.comunidad_rol || 'Miembro'}` : 'Público General'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Datos Personales</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Mail color={Colors.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Correo Electrónico</Text>
                                <Text style={styles.infoValue}>{user.email}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <User color={Colors.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Identificación (Cédula/Pasaporte)</Text>
                                <Text style={styles.infoValue}>{user.identificacion || 'No especificada'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Phone color={Colors.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Teléfono</Text>
                                <Text style={styles.infoValue}>{user.telefono || 'No especificado'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            <MapPin color={Colors.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Dirección de envío</Text>
                                <Text style={styles.infoValue}>{user.direccion || 'No especificada'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.sectionContainer, { marginBottom: 32 }]}>
                    <Text style={styles.sectionTitle}>Historial de Pedidos</Text>
                    
                    {loadingOrders ? (
                        <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
                    ) : orders.length === 0 ? (
                        <View style={styles.emptyOrdersCard}>
                            <ShoppingBag color={Colors.muted} size={40} style={{ marginBottom: 12 }} />
                            <Text style={styles.emptyOrdersText}>Aún no tienes pedidos registrados.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={orders}
                            renderItem={renderPurchaseItem}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.ordersList}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    loadingCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: Colors.secondaryText,
        fontSize: 15,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        color: Colors.onPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    
    // Login Screen Redesign
    loginScroll: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    loginHeader: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 24,
    },
    backButtonAbsolute: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 4,
    },
    loginIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.onSurface,
        marginBottom: 6,
        textAlign: 'center',
    },
    loginSubtitle: {
        fontSize: 14,
        color: Colors.secondaryText,
        textAlign: 'center',
        paddingHorizontal: 12,
    },
    userTypeTipBox: {
        flexDirection: 'row',
        backgroundColor: '#e6f4ea',
        borderWidth: 1,
        borderColor: '#34a85360',
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
    },
    userTypeTipTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 2,
    },
    userTypeTipText: {
        fontSize: 12,
        color: Colors.onSurfaceVariant,
        lineHeight: 16,
    },
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.onSurface,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 10,
        backgroundColor: Colors.surface,
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 10,
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        color: Colors.onSurface,
        height: '100%',
    },
    loginButton: {
        height: 48,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: Colors.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 24,
        alignItems: 'center',
        padding: 8,
    },
    registerLinkText: {
        color: Colors.secondaryText,
        fontSize: 15,
    },
    registerLinkHighlight: {
        color: Colors.primary,
        fontWeight: 'bold',
    },

    // Profile Screen Layout
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 28,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    avatarWrapper: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    avatarInitials: {
        fontSize: 32,
        color: Colors.onPrimary,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.onSurface,
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    userBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    userBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.onSurface,
        marginBottom: 12,
        paddingLeft: 4,
    },
    infoCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surface,
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.muted,
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: Colors.onSurface,
        fontWeight: '600',
    },
    infoIcon: {
        marginRight: 8,
    },

    // Orders History Card
    ordersList: {
        paddingBottom: 16,
    },
    purchaseCard: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    purchaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.onSurface,
    },
    purchaseDate: {
        fontSize: 12,
        color: Colors.muted,
    },
    purchaseDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    purchaseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    purchaseStatusLabel: {
        fontSize: 13,
        color: Colors.secondaryText,
    },
    purchaseTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
    },
    purchaseFooter: {
        alignItems: 'flex-start',
    },
    purchaseStatus: {
        fontSize: 11,
        fontWeight: '700',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
    },
    emptyOrdersCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyOrdersText: {
        fontSize: 14,
        color: Colors.muted,
        textAlign: 'center',
    }
});
