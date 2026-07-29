import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    FlatList, 
    TextInput, 
    ActivityIndicator, 
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    Image,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, ShoppingBag, LogOut, User, Mail, Lock, Phone, MapPin, BadgeHelp, CheckCircle2, Moon, Sun, Bell, ShieldAlert } from 'lucide-react-native';
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
                            <Image
                                source={require('../assets/icon.png')}
                                style={styles.loginLogo}
                                resizeMode="contain"
                            />
                            <Text style={[styles.loginTitle, { color: theme.onSurface }]}>¡Bienvenido!</Text>
                            <Text style={[styles.loginSubtitle, { color: theme.secondaryText }]}>Inicia sesión en tu cuenta</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.onSurface }]}>Correo institucional</Text>
                                <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
                                    <TextInput
                                        style={[styles.inputField, { color: theme.onSurface }]}
                                        placeholder="usuario@unl.edu.ec"
                                        placeholderTextColor={theme.muted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.onSurface }]}>Contraseña</Text>
                                <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
                                    <TextInput
                                        style={[styles.inputField, { color: theme.onSurface }]}
                                        placeholder="••••••••"
                                        placeholderTextColor={theme.muted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                    <TouchableOpacity>
                                        <Text style={{ color: theme.muted }}>👁️</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: theme.primary }]}
                                onPress={handleLogin}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.dividerContainer}>
                                <View style={[styles.line, { backgroundColor: theme.border }]} />
                                <Text style={[styles.dividerText, { color: theme.muted }]}>o continúa con</Text>
                                <View style={[styles.line, { backgroundColor: theme.border }]} />
                            </View>

                            <TouchableOpacity style={[styles.googleButton, { borderColor: theme.border }]}>
                                <Text style={[styles.googleButtonText, { color: theme.onSurface }]}>G Google</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                            <Text style={[styles.registerLinkText, { color: theme.secondaryText }]}>
                                ¿No tienes cuenta? <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Regístrate</Text>
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
                <BottomNavigation />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.surface }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.surface} />

            <View style={styles.profileHeader}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.background }]}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/150x150/006837/ffffff?text=User' }}
                        style={styles.avatar}
                    />
                </View>
                <Text style={[styles.profileName, { color: theme.onSurface }]}>{user.nombre_completo}</Text>
                <Text style={[styles.profileEmail, { color: theme.secondaryText }]}>{user.email}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuContainer}>
                {[
                    { label: 'Mis datos', icon: User },
                    { label: 'Direcciones', icon: MapPin },
                    { label: 'Métodos de pago', icon: Lock },
                    { label: 'Mis pedidos', icon: ShoppingBag, onPress: () => navigation.navigate('History') },
                    { label: 'Notificaciones', icon: Bell },
                    { label: 'Configuración', icon: ShieldAlert },
                ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, { borderBottomColor: theme.border }]}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuItemLeft}>
                                <Icon color={theme.onSurface} size={20} />
                                <Text style={[styles.menuItemLabel, { color: theme.onSurface }]}>{item.label}</Text>
                            </View>
                            <ChevronRight color={theme.muted} size={20} />
                        </TouchableOpacity>
                    );
                })}

                <View style={styles.themeToggle}>
                    <View style={styles.menuItemLeft}>
                        {isDark ? <Moon color={theme.onSurface} size={20} /> : <Sun color={theme.onSurface} size={20} />}
                        <Text style={[styles.menuItemLabel, { color: theme.onSurface }]}>Modo Oscuro</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: theme.border, true: theme.primary + '80' }}
                        thumbColor={isDark ? theme.primary : '#f4f3f4'}
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut color={theme.error} size={20} />
                    <Text style={[styles.logoutText, { color: theme.error }]}>Cerrar sesión</Text>
                </TouchableOpacity>
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
        paddingHorizontal: 30,
        paddingBottom: 40,
    },
    loginHeader: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    loginLogo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    loginSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 15,
        paddingHorizontal: 16,
        height: 56,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        height: 56,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
    },
    googleButton: {
        height: 56,
        borderRadius: 15,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    registerLink: {
        marginTop: 30,
        alignItems: 'center',
    },
    registerLinkText: {
        fontSize: 14,
    },
    registerLinkHighlight: {
        fontWeight: 'bold',
    },

    // Profile Header
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
    },
    // Menu
    menuContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        borderBottomWidth: 1,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 30,
        paddingVertical: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

