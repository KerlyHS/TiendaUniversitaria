import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock } from 'lucide-react';
import { Input } from '../../../shared/components/UI/Input';
import { Button } from '../../../shared/components/UI/Button';
import { Checkbox } from '../../../shared/components/UI/Checkbox';

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex w-full bg-surface-light">
      {/* Left Side: Illustration / Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/50 to-transparent"></div>
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap size={32} />
            Tienda Universitaria
          </Link>
          <div className="mt-20 max-w-md">
            <h1 className="text-display-lg font-bold leading-tight mb-6">
              El comercio oficial de la UNL.
            </h1>
            <p className="text-lg text-primary-light">
              Adquiere productos de quintas experimentales y mercadería institucional con la garantía de tu universidad.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-sm text-primary-light">
          © {new Date().getFullYear()} Universidad Nacional de Loja. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] bg-white p-8 rounded-lg shadow-level-1 border border-gray-100">
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary mb-4 lg:hidden">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-headline-lg font-bold text-secondary mb-2">Iniciar Sesión</h2>
            <p className="text-gray-500">Bienvenido de vuelta a tu tienda académica</p>
          </div>

          <form className="space-y-6">
            <Input 
              label="Correo Electrónico *"
              type="email" 
              placeholder="ejemplo@unl.edu.ec" 
              icon={Mail}
              required
            />
            
            <Input 
              label="Contraseña *"
              type="password" 
              placeholder="••••••••" 
              icon={Lock}
              required
            />

            <div className="flex items-center justify-between">
              <Checkbox label="Recordarme" />
              <Link to="/recovery" className="text-sm font-semibold text-primary hover:text-primary-dark">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button className="w-full" size="lg">
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
