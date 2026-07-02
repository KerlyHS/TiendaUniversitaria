import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    Alert, 
    KeyboardAvoidingView, 
    Platform,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
    ChevronLeft, 
    UserPlus, 
    User, 
    Mail, 
    Lock, 
    FileText, 
    Phone, 
    MapPin, 
    Briefcase, 
    ShieldAlert, 
    Check,
    Info
} from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const { register, isLoading } = useAuth();
    
    // Estados del Formulario
    const [userType, setUserType] = useState<'UNL' | 'GENERAL'>('UNL');
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [identificacion, setIdentificacion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [rol, setRol] = useState<string>(''); // ESTUDIANTE, DOCENTE, ADMINISTRATIVO
    const [consentimientoLopdp, setConsentimientoLopdp] = useState(false);

    // Lista de roles universitarios
    const rolesList = [
        { id: 'ESTUDIANTE', label: 'Estudiante' },
        { id: 'DOCENTE', label: 'Docente' },
        { id: 'ADMINISTRATIVO', label: 'Administrativo' }
    ];

    const handleRegister = async () => {
        // Validaciones Básicas
        if (!nombreCompleto.trim() || !email.trim() || !password.trim() || !identificacion.trim() || !telefono.trim() || !direccion.trim()) {
            Alert.alert('Campos requeridos', 'Por favor llena todos los campos obligatorios (*).');
            return;
        }

        const idLen = identificacion.trim().length;
        if (idLen < 9 || idLen > 10) {
            Alert.alert('Identificación inválida', 'La identificación debe tener 9 dígitos (Pasaporte) o 10 dígitos (Cédula).');
            return;
        }

        const phoneClean = telefono.trim();
        if (phoneClean.length !== 10) {
            Alert.alert('Teléfono inválido', 'El teléfono debe tener exactamente 10 dígitos.');
            return;
        }

        if (!phoneClean.startsWith('09')) {
            Alert.alert('Teléfono inválido', 'El teléfono debe iniciar obligatoriamente con 09.');
            return;
        }

        if (userType === 'UNL' && !email.trim().toLowerCase().endsWith('@unl.edu.ec')) {
            Alert.alert('Correo institucional obligatorio', 'Si eres de la Comunidad UNL, tu correo debe terminar obligatoriamente en @unl.edu.ec');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Contraseñas no coinciden', 'Las contraseñas ingresadas no son iguales.');
            return;
        }

        if (userType === 'UNL' && !rol) {
            Alert.alert('Rol no seleccionado', 'Por favor selecciona tu rol en la universidad.');
            return;
        }

        if (!consentimientoLopdp) {
            Alert.alert('Aceptación de Privacidad', 'Debes aceptar la Política de Privacidad (LOPDP) para registrarte.');
            return;
        }

        // Armar payload
        const payload = {
            nombre_completo: nombreCompleto.trim(),
            identificacion: identificacion.trim(),
            email: email.trim().toLowerCase(),
            direccion: direccion.trim(),
            telefono: telefono.trim(),
            password: password,
            consentimiento_lopdp: consentimientoLopdp,
            is_universidad: userType === 'UNL',
            comunidad_rol: userType === 'UNL' ? rol : ''
        };

        const result = await register(payload);

        if (result.success) {
            Alert.alert(
                '¡Registro Exitoso!',
                'Tu cuenta ha sido creada e iniciaste sesión automáticamente.',
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
            );
        } else {
            Alert.alert('Error de Registro', result.error || 'Ocurrió un error al crear la cuenta. Por favor verifica los datos.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color={Colors.onPrimary} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crear Cuenta</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconContainer}>
                        <UserPlus color={Colors.primary} size={40} />
                    </View>
                    
                    <Text style={styles.title}>Únete a la Tienda</Text>
                    <Text style={styles.subtitle}>Completa tus datos para crear una cuenta.</Text>

                    {/* Selector de Tipo de Usuario - Estilo Web */}
                    <View style={styles.typeSelectorContainer}>
                        <TouchableOpacity 
                            style={[styles.typeButton, userType === 'UNL' && styles.typeButtonActive]}
                            onPress={() => {
                                setUserType('UNL');
                                if (!email.endsWith('@unl.edu.ec') && email.includes('@')) {
                                    setEmail(''); // Limpia para sugerir institucional
                                }
                            }}
                        >
                            <Text style={[styles.typeButtonText, userType === 'UNL' && styles.typeButtonTextActive]}>
                                Comunidad UNL
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.typeButton, userType === 'GENERAL' && styles.typeButtonActive]}
                            onPress={() => setUserType('GENERAL')}
                        >
                            <Text style={[styles.typeButtonText, userType === 'GENERAL' && styles.typeButtonTextActive]}>
                                Público General
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info box de acuerdo al tipo de usuario */}
                    <View style={styles.infoBox}>
                        <Info color={Colors.primary} size={18} style={{ marginRight: 8, marginTop: 1 }} />
                        <Text style={styles.infoBoxText}>
                            {userType === 'UNL' 
                                ? 'Los miembros de la comunidad UNL acceden a beneficios exclusivos. Requiere correo institucional @unl.edu.ec.'
                                : 'El público general puede realizar compras y acceder al catálogo. Regístrate con tu correo personal.'
                            }
                        </Text>
                    </View>

                    <View style={styles.cardContainer}>
                        {/* Nombre Completo */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre Completo *</Text>
                            <View style={styles.inputWrapper}>
                                <User color={Colors.muted} size={18} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Ej. Juan Pérez"
                                    placeholderTextColor={Colors.muted}
                                    value={nombreCompleto}
                                    onChangeText={setNombreCompleto}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Identificación */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Identificación *</Text>
                            <View style={styles.inputWrapper}>
                                <FileText color={Colors.muted} size={18} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Número de documento (Cédula o Pasaporte)"
                                    placeholderTextColor={Colors.muted}
                                    value={identificacion}
                                    onChangeText={(text) => {
                                        if (text.length <= 10) setIdentificacion(text.replace(/[^0-9]/g, ''));
                                    }}
                                    keyboardType="numeric"
                                    editable={!isLoading}
                                />
                            </View>
                            {identificacion.length > 0 && (
                                <Text style={[
                                    styles.charCount, 
                                    { color: identificacion.length < 9 ? Colors.error : Colors.primary }
                                ]}>
                                    {identificacion.length} / 10 dígitos {identificacion.length === 9 ? '(Pasaporte)' : identificacion.length === 10 ? '(Cédula)' : '(Faltan dígitos)'}
                                </Text>
                            )}
                        </View>

                        {/* Correo Electrónico */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                {userType === 'UNL' ? 'Correo Institucional *' : 'Correo Electrónico *'}
                            </Text>
                            <View style={styles.inputWrapper}>
                                <Mail color={Colors.muted} size={18} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder={userType === 'UNL' ? "usuario@unl.edu.ec" : "ejemplo@correo.com"}
                                    placeholderTextColor={Colors.muted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Teléfono */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Teléfono *</Text>
                            <View style={styles.inputWrapper}>
                                <Phone color={Colors.muted} size={18} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Ej. 0999999999"
                                    placeholderTextColor={Colors.muted}
                                    value={telefono}
                                    onChangeText={(text) => {
                                        const cleaned = text.replace(/[^0-9]/g, '');
                                        if (cleaned.length <= 10) {
                                            setTelefono(cleaned);
                                        }
                                    }}
                                    keyboardType="phone-pad"
                                    editable={!isLoading}
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        {/* Rol universitario (Solo si es Comunidad UNL) */}
                        {userType === 'UNL' && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Rol en la Universidad *</Text>
                                <View style={styles.roleSelectionRow}>
                                    {rolesList.map((r) => (
                                        <TouchableOpacity
                                            key={r.id}
                                            style={[
                                                styles.roleSelectCard, 
                                                rol === r.id && styles.roleSelectCardActive
                                            ]}
                                            onPress={() => setRol(r.id)}
                                            disabled={isLoading}
                                        >
                                            <Briefcase 
                                                color={rol === r.id ? Colors.onPrimary : Colors.secondaryText} 
                                                size={16} 
                                                style={{ marginBottom: 4 }} 
                                            />
                                            <Text style={[
                                                styles.roleSelectLabel,
                                                rol === r.id && styles.roleSelectLabelActive
                                            ]}>
                                                {r.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Dirección de envío */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Dirección de envío / facturación *</Text>
                            <View style={styles.inputWrapper}>
                                <MapPin color={Colors.muted} size={18} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Calle principal, secundaria y referencias"
                                    placeholderTextColor={Colors.muted}
                                    value={direccion}
                                    onChangeText={setDireccion}
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Contraseña */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Contraseña *</Text>
                            <View style={styles.inputWrapper}>
                                <Lock color={Colors.muted} size={18} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="••••••••"
                                    placeholderTextColor={Colors.muted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Confirmar Contraseña */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Confirmar Contraseña *</Text>
                            <View style={styles.inputWrapper}>
                                <Lock color={Colors.muted} size={18} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="••••••••"
                                    placeholderTextColor={Colors.muted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Consentimiento LOPDP */}
                        <TouchableOpacity 
                            style={styles.consentCheckboxRow}
                            onPress={() => setConsentimientoLopdp(!consentimientoLopdp)}
                            disabled={isLoading}
                        >
                            <View style={[
                                styles.checkbox,
                                consentimientoLopdp && styles.checkboxChecked
                            ]}>
                                {consentimientoLopdp && <Check color={Colors.white} size={12} strokeWidth={3} />}
                            </View>
                            <Text style={styles.consentLabel}>
                                Acepto la Política de Privacidad y el tratamiento de mis datos personales según la normativa de la <Text style={styles.lopdpLink}>LOPDP (Arts. 39-44)</Text>.
                            </Text>
                        </TouchableOpacity>

                        {/* Botón de Registro */}
                        <TouchableOpacity 
                            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                            onPress={handleRegister}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={Colors.onPrimary} />
                            ) : (
                                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Profile')} disabled={isLoading}>
                        <Text style={styles.loginLinkText}>¿Ya tienes cuenta? <Text style={styles.loginLinkHighlight}>Inicia Sesión</Text></Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.surface,
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
    scrollContainer: {
        padding: 20,
        alignItems: 'center',
        paddingBottom: 40,
    },
    iconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.onSurface,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.secondaryText,
        marginBottom: 20,
        textAlign: 'center',
    },
    
    // User type tabs
    typeSelectorContainer: {
        flexDirection: 'row',
        backgroundColor: '#e2e8f0',
        borderRadius: 10,
        padding: 4,
        width: '100%',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    typeButtonActive: {
        backgroundColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.secondaryText,
    },
    typeButtonTextActive: {
        color: Colors.onPrimary,
    },

    // Info Box
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.primary + '08',
        borderWidth: 1,
        borderColor: Colors.primary + '20',
        borderRadius: 10,
        padding: 12,
        width: '100%',
        marginBottom: 20,
    },
    infoBoxText: {
        fontSize: 12,
        color: Colors.secondaryText,
        flex: 1,
        lineHeight: 16,
    },

    // Form container card
    cardContainer: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 18,
        width: '100%',
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputContainer: {
        marginBottom: 16,
        width: '100%',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.onSurface,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        backgroundColor: Colors.surface,
        paddingHorizontal: 12,
        height: 46,
    },
    inputIcon: {
        marginRight: 8,
    },
    inputField: {
        flex: 1,
        fontSize: 14,
        color: Colors.onSurface,
        height: '100%',
    },
    charCount: {
        fontSize: 11,
        marginTop: 4,
        alignSelf: 'flex-start',
        fontWeight: '500',
        marginLeft: 2,
    },

    // Role selection grid
    roleSelectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    roleSelectCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    roleSelectCardActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    roleSelectLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.secondaryText,
    },
    roleSelectLabelActive: {
        color: Colors.onPrimary,
    },

    // LOPDP Checkbox
    consentCheckboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
        marginBottom: 16,
        paddingHorizontal: 2,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.muted,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    consentLabel: {
        flex: 1,
        fontSize: 11,
        color: Colors.secondaryText,
        lineHeight: 15,
    },
    lopdpLink: {
        color: Colors.primary,
        fontWeight: '700',
    },

    // Action button
    registerButton: {
        height: 48,
        backgroundColor: Colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: Colors.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    
    // Bottom link
    loginLink: {
        marginTop: 24,
        padding: 8,
    },
    loginLinkText: {
        color: Colors.secondaryText,
        fontSize: 14,
    },
    loginLinkHighlight: {
        color: Colors.primary,
        fontWeight: 'bold',
    }
});
