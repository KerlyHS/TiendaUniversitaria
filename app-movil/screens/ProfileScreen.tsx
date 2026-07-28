import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity,
    FlatList, 
    TextInput, 
    ActivityIndicator, 
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ShoppingBag, LogOut, User, Mail, Lock, Phone, MapPin, BadgeHelp, CheckCircle2, Moon, Sun } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BottomNavigation } from '../components/BottomNavigation';
import { AnimatedButton } from '../components/AnimatedButton';

interface OrderItem {
    id: number;
    numero_pedido: string;
    fecha_creacion: string;
    total: number | string;
    estado: string;
}

export const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { user, isAuthenticated, isLoading, login, logout, apiFetch } = useAuth();
    const { theme, isDark, toggleTheme } = useTheme();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

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
                return theme.primaryContainer;
        }
    };

    const renderPurchaseItem = ({ item }: { item: OrderItem }) => {
        const orderTotal = typeof item.total === 'number' ? item.total : parseFloat(item.total || '0');
        const orderDate = item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleDateString() : 'N/A';
        
        return (
            <View style={[styles.purchaseCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.purchaseHeader}>
                    <Text style={[styles.orderNumber, { color: theme.onSurface }]}>{item.numero_pedido || `Pedido #${item.id}`}</Text>
                    <Text style={[styles.purchaseDate, { color: theme.muted }]}>{orderDate}</Text>
                </View>
                <View style={styles.purchaseDetails}>
                    <View style={styles.purchaseInfo}>
                        <ShoppingBag color={theme.secondaryText} size={16} style={{ marginRight: 6 }} />
                        <Text style={[styles.purchaseStatusLabel, { color: theme.secondaryText }]}>Estado: {item.estado}</Text>
                    </View>
                    <Text style={[styles.purchaseTotal, { color: theme.primary }]}>${orderTotal.toFixed(2)}</Text>
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
            <SafeAreaView style={[styles.safeArea, styles.loadingCenter, { backgroundColor: theme.surface }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.secondaryText }]}>Cargando información del perfil...</Text>
            </SafeAreaView>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surface }]}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView contentContainerStyle={styles.loginScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.loginHeader}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAbsolute}>
                                <ChevronLeft color={theme.onSurface} size={28} />
                            </TouchableOpacity>
                            <View style={[styles.loginIconContainer, { backgroundColor: theme.primary + '15' }]}>
                                <User color={theme.primary} size={48} />
                            </View>
                            <Text style={[styles.loginTitle, { color: theme.onSurface }]}>¡Bienvenido de nuevo!</Text>
                            <Text style={[styles.loginSubtitle, { color: theme.secondaryText }]}>Ingresa a tu cuenta de la Tienda Universitaria</Text>
                        </View>

                        <View style={[styles.userTypeTipBox, { backgroundColor: isDark ? '#1e293b' : '#e6f4ea', borderColor: isDark ? theme.border : '#34a85360' }]}>
                            <BadgeHelp color={theme.primary} size={20} style={{ marginRight: 8, marginTop: 2 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.userTypeTipTitle, { color: theme.primary }]}>Información de Acceso</Text>
                                <Text style={[styles.userTypeTipText, { color: theme.onSurfaceVariant }]}>
                                    Si eres de la <Text style={{ fontWeight: 'bold' }}>Comunidad UNL</Text>, inicia sesión con tu correo institucional (@unl.edu.ec). El público general puede usar su correo personal registrado.
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.cardContainer, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.black }]}>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.onSurface }]}>Correo Electrónico</Text>
                                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                                    <Mail color={theme.muted} size={20} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.inputField, { color: theme.onSurface }]}
                                        placeholder="ejemplo@correo.com o @unl.edu.ec"
                                        placeholderTextColor={theme.muted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.onSurface }]}>Contraseña</Text>
                                <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                                    <Lock color={theme.muted} size={20} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.inputField, { color: theme.onSurface }]}
                                        placeholder="••••••••"
                                        placeholderTextColor={theme.muted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        editable={!isSubmitting}
                                    />
                                </View>
                            </View>

                            <AnimatedButton
                                style={[styles.loginButton, { backgroundColor: theme.primary, shadowColor: theme.primary }, isSubmitting && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color={theme.onPrimary} />
                                ) : (
                                    <Text style={[styles.loginButtonText, { color: theme.onPrimary }]}>Iniciar Sesión</Text>
                                )}
                            </AnimatedButton>
                        </View>

                        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.registerLinkText, { color: theme.secondaryText }]}>¿No tienes cuenta? <Text style={[styles.registerLinkHighlight, { color: theme.primary }]}>Regístrate aquí</Text></Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
                <BottomNavigation />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surface }]}>
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={theme.onPrimary} size={28} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.onPrimary }]}>Mi Perfil</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.backButton}>
                    <LogOut color={theme.onPrimary} size={24} />
                </TouchableOpacity>
            </View>

            <View style={[styles.profileHeader, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <View style={[styles.avatarWrapper, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                    <Text style={[styles.avatarInitials, { color: theme.onPrimary }]}>
                        {user.nombre_completo ? user.nombre_completo.split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
                    </Text>
                </View>
                <Text style={[styles.profileName, { color: theme.onSurface }]}>{user.nombre_completo}</Text>
                <View style={styles.badgeContainer}>
                    <View style={[styles.userBadge, { backgroundColor: user.is_universidad ? theme.primary + '15' : theme.price + '15' }]}>
                        <CheckCircle2 color={user.is_universidad ? theme.primary : theme.price} size={14} style={{ marginRight: 4 }} />
                        <Text style={[styles.userBadgeText, { color: user.is_universidad ? theme.primary : theme.price }]}>
                            {user.is_universidad ? `Comunidad UNL - ${user.comunidad_rol || 'Miembro'}` : 'Público General'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Configuración</Text>
                    <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            {isDark ? <Moon color={theme.secondaryText} size={18} style={styles.infoIcon} /> : <Sun color={theme.secondaryText} size={18} style={styles.infoIcon} />}
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: theme.muted }]}>Modo Oscuro</Text>
                                <Text style={[styles.infoValue, { color: theme.onSurface }]}>{isDark ? 'Activado' : 'Desactivado'}</Text>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: theme.border, true: theme.primary + '80' }}
                                thumbColor={isDark ? theme.primary : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Datos Personales</Text>
                    <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={[styles.infoRow, { borderBottomColor: theme.surface }]}>
                            <Mail color={theme.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: theme.muted }]}>Correo Electrónico</Text>
                                <Text style={[styles.infoValue, { color: theme.onSurface }]}>{user.email}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomColor: theme.surface }]}>
                            <User color={theme.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: theme.muted }]}>Identificación (Cédula/Pasaporte)</Text>
                                <Text style={[styles.infoValue, { color: theme.onSurface }]}>{user.identificacion || 'No especificada'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomColor: theme.surface }]}>
                            <Phone color={theme.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: theme.muted }]}>Teléfono</Text>
                                <Text style={[styles.infoValue, { color: theme.onSurface }]}>{user.telefono || 'No especificado'}</Text>
                            </View>
                        </View>

                        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                            <MapPin color={theme.secondaryText} size={18} style={styles.infoIcon} />
                            <View style={styles.infoContent}>
                                <Text style={[styles.infoLabel, { color: theme.muted }]}>Dirección de envío</Text>
                                <Text style={[styles.infoValue, { color: theme.onSurface }]}>{user.direccion || 'No especificada'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={[styles.sectionContainer, { marginBottom: 32 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.onSurface }]}>Historial de Pedidos</Text>
                    
                    {loadingOrders ? (
                        <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
                    ) : orders.length === 0 ? (
                        <View style={[styles.emptyOrdersCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <ShoppingBag color={theme.muted} size={40} style={{ marginBottom: 12 }} />
                            <Text style={[styles.emptyOrdersText, { color: theme.muted }]}>Aún no tienes pedidos registrados.</Text>
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
            <BottomNavigation />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    loadingCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 15,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
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
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    loginTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 6,
        textAlign: 'center',
    },
    loginSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 12,
    },
    userTypeTipBox: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 24,
    },
    userTypeTipTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    userTypeTipText: {
        fontSize: 12,
        lineHeight: 16,
    },
    cardContainer: {
        borderRadius: 20,
        padding: 24,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 4,
        borderWidth: 1,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
    },
    inputIcon: {
        marginRight: 10,
    },
    inputField: {
        flex: 1,
        fontSize: 15,
        height: '100%',
    },
    loginButton: {
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 2,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 24,
        alignItems: 'center',
        padding: 8,
    },
    registerLinkText: {
        fontSize: 15,
    },
    registerLinkHighlight: {
        fontWeight: 'bold',
    },

    // Profile Screen Layout
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 28,
        borderBottomWidth: 1,
    },
    avatarWrapper: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    avatarInitials: {
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
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
        marginBottom: 12,
        paddingLeft: 4,
    },
    infoCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
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
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    purchaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: '700',
    },
    purchaseDate: {
        fontSize: 12,
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
    },
    purchaseTotal: {
        fontSize: 16,
        fontWeight: '700',
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
        borderRadius: 16,
        borderWidth: 1,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyOrdersText: {
        fontSize: 14,
        textAlign: 'center',
    }
});

