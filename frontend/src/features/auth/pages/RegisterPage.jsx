import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, FileText, Phone, MapPin, Briefcase } from 'lucide-react';
import { Input } from '../../../shared/components/UI/Input';
import { Button } from '../../../shared/components/UI/Button';
import { Checkbox } from '../../../shared/components/UI/Checkbox';
import { authService } from '../../../core/api/services';
import { useToast } from '../../../shared/context/ToastContext';

export const RegisterPage = () => {
  const [userType, setUserType] = useState('UNL'); // 'UNL' o 'GENERAL'
  const [formData, setFormData] = useState({
    nombre_completo: '',
    identificacion: '',
    email: '',
    direccion: '',
    telefono: '',
    rol: '',
    password: '',
    confirmPassword: '',
    consentimiento_lopdp: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isFormHovered, setIsFormHovered] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const idLen = formData.identificacion.trim().length;
    if (idLen < 9) {
      setErrorMsg('Faltan dígitos en la identificación. Debe tener 9 (Pasaporte) o 10 (Cédula).');
      return;
    }
    if (idLen > 10) {
      setErrorMsg('La identificación no puede tener más de 10 dígitos.');
      return;
    }

    if (userType === 'UNL' && !formData.email.trim().toLowerCase().endsWith('@unl.edu.ec')) {
      setErrorMsg('Si eres de la Comunidad UNL, tu correo debe terminar obligatoriamente en @unl.edu.ec');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.consentimiento_lopdp) {
      setErrorMsg('Debe aceptar la Política de Privacidad (LOPDP).');
      return;
    }

    if (userType === 'UNL' && !formData.rol) {
      setErrorMsg('Seleccione su rol en la Universidad.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nombre_completo: formData.nombre_completo,
        identificacion: formData.identificacion,
        email: formData.email,
        direccion: formData.direccion,
        telefono: formData.telefono,
        password: formData.password,
        consentimiento_lopdp: formData.consentimiento_lopdp,
        is_universidad: userType === 'UNL',
        rol: userType === 'UNL' ? formData.rol : 'PUBLICO_GENERAL'
      };

      await authService.register(payload);

      addToast({
        title: '¡Registro exitoso!',
        message: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        type: 'success'
      });

      navigate('/login');
    } catch (error) {
      console.error('Error de registro:', error);
      const backendError = error.response?.data;
      if (backendError) {
        // Extraer mensajes de error de Django REST framework (puede ser un objeto con errores por campo)
        const errorString = Object.values(backendError).map(val => Array.isArray(val) ? val[0] : val).join(' ');
        setErrorMsg(errorString || 'Ocurrió un error al registrar la cuenta. Verifique sus datos.');
      } else {
        setErrorMsg('Error de conexión con el servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center w-full p-4 overflow-hidden">
      
      {/* Imagen de Fondo Dinámica */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out ${isFormHovered ? 'blur-md scale-105' : 'blur-0 scale-100'}`}
        style={{ backgroundImage: 'url("/bg-login.jpg")' }}
      ></div>

      {/* Capa de oscurecimiento para mejorar contraste */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-700 ease-in-out ${isFormHovered ? 'opacity-40' : 'opacity-20'}`}></div>

      {/* Tarjeta Glassmorphism */}
      <div 
        className="relative z-10 w-full max-w-[480px] bg-white/80 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-2xl border border-white/60 flex flex-col items-center my-8"
        onMouseEnter={() => setIsFormHovered(true)}
        onMouseLeave={() => setIsFormHovered(false)}
      >

        {/* Logo and Header */}
        <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-4 shadow-sm">
          <GraduationCap size={32} />
        </div>

        <h2 className="text-headline-lg font-bold text-on-surface mb-1">Crear Cuenta</h2>
        <p className="text-on-surface-variant font-body-sm mb-6">Tienda Universitaria</p>

        {/* Error Message */}
        {errorMsg && (
          <div className="w-full bg-error-container text-on-error-container p-3 rounded-md mb-6 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form className="w-full space-y-5" onSubmit={handleSubmit}>

          {/* User Type Toggle */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm font-bold text-on-surface">Tipo de Usuario <span className="text-error">*</span></label>
            <div className="flex bg-surface-container-low p-1 rounded-md border border-outline-variant/50">
              <button
                type="button"
                onClick={() => setUserType('UNL')}
                className={`flex-1 py-2 px-2 text-sm font-bold rounded flex items-center justify-center text-center transition-colors ${userType === 'UNL' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Soy de la Comunidad UNL
              </button>
              <button
                type="button"
                onClick={() => setUserType('GENERAL')}
                className={`flex-1 py-2 px-2 text-sm font-bold rounded flex items-center justify-center text-center transition-colors ${userType === 'GENERAL' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Soy Público General
              </button>
            </div>
            {userType === 'UNL' ? (
              <p className="text-xs text-on-surface-variant flex gap-1 items-start mt-1">
                <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                Los miembros de la comunidad UNL acceden a beneficios institucionales exclusivos.
              </p>
            ) : (
              <p className="text-xs text-on-surface-variant flex gap-1 items-start mt-1">
                <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                El público general puede realizar compras y acceder al catálogo de productos institucionales. Regístrate con tu correo personal.
              </p>
            )}
          </div>

          <Input
            label="Nombre Completo *"
            type="text"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleInputChange}
            placeholder="Ej. Juan Pérez"
            icon={User}
            required
            disabled={isLoading}
          />

          <div className="flex flex-col gap-1">
            <Input
              label="Identificación (Cédula/Pasaporte) *"
              type="text"
              name="identificacion"
              value={formData.identificacion}
              onChange={(e) => {
                if (e.target.value.length <= 10) handleInputChange(e);
              }}
              placeholder="Número de documento"
              icon={FileText}
              required
              disabled={isLoading}
              maxLength={10}
            />
            {formData.identificacion.length > 0 && (
              <span className={`text-xs ml-1 ${formData.identificacion.length < 9 ? 'text-error' : 'text-primary'}`}>
                {formData.identificacion.length} / 10 caracteres
                {formData.identificacion.length === 9 && ' (Formato Pasaporte)'}
                {formData.identificacion.length === 10 && ' (Formato Cédula)'}
                {formData.identificacion.length < 9 && ' (Faltan dígitos)'}
              </span>
            )}
          </div>

          <Input
            label={userType === 'UNL' ? "Correo Institucional *" : "Correo Electrónico *"}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={userType === 'UNL' ? "usuario@unl.edu.ec" : "ejemplo@correo.com"}
            icon={Mail}
            required
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teléfono *"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="0999999999"
              icon={Phone}
              required
              disabled={isLoading}
            />

            {userType === 'UNL' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-on-surface">Rol en la Universidad <span className="text-error">*</span></label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-on-surface-variant/70 z-10">
                    <Briefcase size={18} />
                  </div>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/60 rounded-md text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    disabled={isLoading}
                  >
                    <option value="">Seleccione su rol</option>
                    <option value="ESTUDIANTE">Estudiante</option>
                    <option value="DOCENTE">Docente</option>
                    <option value="ADMINISTRATIVO">Administrativo</option>
                  </select>
                  <div className="absolute right-3 text-on-surface-variant pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Dirección de envío / facturación *"
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            placeholder="Calle principal y secundaria"
            icon={MapPin}
            required
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contraseña *"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              icon={Lock}
              required
              disabled={isLoading}
            />
            <Input
              label="Confirmar *"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              icon={Lock}
              required
              disabled={isLoading}
            />
          </div>

          <div className="bg-surface-container-low p-4 rounded-md border border-outline-variant/30 mt-6">
            <Checkbox
              name="consentimiento_lopdp"
              checked={formData.consentimiento_lopdp}
              onChange={handleInputChange}
              label={
                <span className="text-xs text-on-surface-variant leading-tight block ml-1">
                  Acepto la Política de Privacidad y el tratamiento de mis datos
                  personales conforme a las normativas de la{' '}
                  <a
                    href="https://www.telecomunicaciones.gob.ec/wp-content/uploads/2023/11/Resumen.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    LOPDP (Arts. 39-44)
                  </a>.
                </span>
              }
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold shadow-md mt-6"
            size="lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            {!isLoading && <span className="material-symbols-outlined ml-2 text-[20px]">person_add</span>}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary-container transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
