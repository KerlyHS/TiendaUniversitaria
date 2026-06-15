import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, FileText } from 'lucide-react';
import { Input } from '../../../shared/components/UI/Input';
import { Button } from '../../../shared/components/UI/Button';
import { Checkbox } from '../../../shared/components/UI/Checkbox';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex w-full bg-surface-light">
      {/* Left Side: Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-secondary flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap size={32} />
            Tienda Universitaria
          </Link>
          <div className="mt-20 max-w-md">
            <h1 className="text-display-lg font-bold leading-tight mb-6">
              Únete a nuestra comunidad.
            </h1>
            <p className="text-lg text-gray-400">
              Registra tu cuenta para acceder a precios preferenciales en productos institucionales y realizar tus compras de forma segura.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-sm text-gray-400">
          © {new Date().getFullYear()} Universidad Nacional de Loja.
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[460px] bg-white p-8 rounded-lg shadow-level-1 border border-gray-100 my-8">
          <div className="mb-8 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-light text-primary mb-4 lg:hidden">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-headline-lg font-bold text-secondary mb-2">Crear Cuenta</h2>
            <p className="text-gray-500">Tienda Universitaria</p>
          </div>

          <form className="space-y-5">
            {/* Type Toggles (simplified representation) */}
            <div className="flex bg-gray-100 p-1 rounded-search mb-6">
              <button type="button" className="flex-1 py-2 text-sm font-semibold rounded text-secondary bg-white shadow-sm">
                Comunidad UNL
              </button>
              <button type="button" className="flex-1 py-2 text-sm font-semibold rounded text-gray-500 hover:text-secondary">
                Público General
              </button>
            </div>

            <Input 
              label="Nombre Completo *"
              type="text" 
              placeholder="Ej. Juan Pérez" 
              icon={User}
              required
            />

            <Input 
              label="Identificación (Cédula/Pasaporte) *"
              type="text" 
              placeholder="Número de documento" 
              icon={FileText}
              required
            />
            
            <Input 
              label="Correo Electrónico *"
              type="email" 
              placeholder="ejemplo@correo.com" 
              icon={Mail}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Contraseña *"
                type="password" 
                placeholder="••••••••" 
                icon={Lock}
                required
              />
              <Input 
                label="Confirmar *"
                type="password" 
                placeholder="••••••••" 
                icon={Lock}
                required
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-soft border border-gray-200 mt-6">
              <Checkbox 
                label={
                  <span className="text-xs">
                    Acepto la Política de Privacidad y el tratamiento de mis datos personales conforme a las normativas de la LOPDP (Arts. 39-44).
                  </span>
                }
                required
              />
            </div>

            <Button className="w-full mt-6" size="lg">
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
