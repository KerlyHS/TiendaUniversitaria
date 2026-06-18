import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock } from 'lucide-react';
import { Input } from '../../../shared/components/UI/Input';
import { Button } from '../../../shared/components/UI/Button';
import { Checkbox } from '../../../shared/components/UI/Checkbox';
import { authService } from '../../../core/api/services';
import { useToast } from '../../../shared/context/ToastContext';

export const LoginPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [isFormHovered, setIsFormHovered] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // Usamos el username (email) y el password
      const response = await authService.login(formData.username, formData.password);
      
      if (response.access) {
        // Guardar token y redirigir
        localStorage.setItem('jwt_token', response.access);
        if (response.refresh) {
          localStorage.setItem('jwt_refresh', response.refresh);
        }
        
        addToast({
          title: '¡Bienvenido!',
          message: 'Has iniciado sesión correctamente.',
          type: 'success'
        });
        
        navigate('/catalogo');
      }
    } catch (error) {
      console.error('Error de login:', error);
      setErrorMsg(
        error.response?.data?.detail || 
        'Credenciales incorrectas. Verifica tu correo y contraseña.'
      );
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
        className="relative z-10 w-full max-w-[420px] bg-white/70 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white/50 flex flex-col items-center"
        onMouseEnter={() => setIsFormHovered(true)}
        onMouseLeave={() => setIsFormHovered(false)}
      >
        
        {/* Logo and Header */}
        <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm">
          <GraduationCap size={32} />
        </div>
        
        <h2 className="text-headline-lg font-bold text-on-surface mb-1">Iniciar Sesión</h2>
        <p className="text-on-surface-variant font-body-sm mb-8">Tienda Universitaria</p>

        {/* Error Message */}
        {errorMsg && (
          <div className="w-full bg-error-container text-on-error-container p-3 rounded-md mb-6 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          <Input 
            label="Correo Electrónico *"
            type="email" 
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="ejemplo@correo.com" 
            icon={Mail}
            required
            disabled={isLoading}
          />
          
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

          <div className="flex items-center justify-between">
            <Checkbox label="Recordarme" />
            <Link to="/recuperar-password" className="text-sm font-semibold text-primary hover:text-primary-container transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold shadow-md" 
            size="lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-on-surface-variant">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="font-bold text-primary hover:text-primary-container transition-colors">
            Crear Cuenta
          </Link>
        </div>
      </div>
    </div>
  );
};
