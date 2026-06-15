import { useState } from 'react';
import { useAuth } from '../../../core/hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

/**
 * RegisterForm Component - TiendaUniversitaria
 * 
 * Spec-001: Registro de usuario con consentimiento LOPDP
 * 
 * Features:
 * - Email, Password, Nombre Completo
 * - LOPDP checkbox (required)
 * - Password strength validation
 * - Error handling
 * 
 * Spec-Kit Metadata:
 * @spec Spec-001: User registration with LOPDP consent
 * @spec Spec-001: Art. 39-44 LOPDP compliance
 */

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    nombre_completo: '',
    consentimiento_lopdp: false,
  });

  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validaciones
    if (!formData.consentimiento_lopdp) {
      setFormError('Debes aceptar la Política de Privacidad');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Spec-001: Register con consentimiento LOPDP
    const result = await register(
      formData.email,
      formData.password,
      formData.nombre_completo,
      formData.consentimiento_lopdp
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-header">
        <h2>Crear Cuenta</h2>
        <p className="subtitle">Únete a TiendaUniversitaria</p>
      </header>

      <form onSubmit={handleSubmit} className="auth-form">
        {(formError || error) && (
          <div className="alert alert-error" role="alert">
            {formError || error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="nombre_completo" className="form-label">
            Nombre Completo
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="nombre_completo"
            name="nombre_completo"
            value={formData.nombre_completo}
            onChange={handleChange}
            placeholder="Juan Pérez"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Correo Electrónico
            <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="usuario@unl.edu.ec"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Contraseña
            <span className="required">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="form-input"
          />
          <small className="form-hint">Mínimo 8 caracteres</small>
        </div>

        <div className="form-group">
          <label htmlFor="password_confirm" className="form-label">
            Confirmar Contraseña
            <span className="required">*</span>
          </label>
          <input
            type="password"
            id="password_confirm"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="form-input"
          />
        </div>

        <fieldset className="privacy-section">
          <legend>Política de Privacidad</legend>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="consentimiento_lopdp"
              checked={formData.consentimiento_lopdp}
              onChange={handleChange}
              required
            />
            <span>
              Acepto la Política de Privacidad y el tratamiento de mis datos (LOPDP)
              <span className="required">*</span>
            </span>
          </label>
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isLoading}
        >
          {isLoading ? '⏳ Creando cuenta...' : '✓ Crear Cuenta'}
        </button>

        <p className="auth-footer-text">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="link-secondary">
            Inicia sesión
          </a>
        </p>
      </form>
    </div>
  );
};
