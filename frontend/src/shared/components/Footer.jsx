import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-on-background border-t border-outline mt-auto w-full">
      <div className="w-full py-8 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto flex flex-col md:flex-row justify-between items-center gap-6">

        {/* Brand Logo */}
        <div className="flex-shrink-0">
          <span className="text-headline-lg font-headline-lg text-primary-fixed-dim">Tienda Universitaria UNL</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <a href="#" className="text-surface-dim font-body-sm text-body-sm hover:text-primary-fixed-dim transition-colors focus:ring-2 focus:ring-primary rounded-sm">Ubicaciones</a>
          <a href="#" className="text-surface-dim font-body-sm text-body-sm hover:text-primary-fixed-dim transition-colors focus:ring-2 focus:ring-primary rounded-sm">Términos y Condiciones</a>
          <a href="#" className="text-surface-dim font-body-sm text-body-sm hover:text-primary-fixed-dim transition-colors focus:ring-2 focus:ring-primary rounded-sm">Políticas de Privacidad</a>
          <a href="#" className="text-surface-dim font-body-sm text-body-sm hover:text-primary-fixed-dim transition-colors focus:ring-2 focus:ring-primary rounded-sm">Contacto Institucional</a>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right">
          <span className="font-body-sm text-body-sm text-surface-dim opacity-80">
            © {new Date().getFullYear()} Universidad Nacional de Loja. Todos los derechos reservados.
          </span>
        </div>

      </div>
    </footer>
  );
};
