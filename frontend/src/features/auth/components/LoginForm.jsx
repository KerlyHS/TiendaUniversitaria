import { useState } from 'react';
import { useAuth } from '../../../core/hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

/**
 * LoginForm Component - TiendaUniversitaria
 * 
 * Spec-003: Autenticación JWT
 * Spec-001: Consentimiento LOPDP
 * 
 * Features:
 * - Email + Password input
 * - LOPDP checkbox (required)
 * - Manejo de errores
 * - Loading state
 * 
 * Spec-Kit Metadata:
 * @spec Spec-001: LOPDP acceptance checkbox
 * @spec Spec-003: JWT token obtention via POST /api/v1/token/
 */

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    // Validar consentimiento LOPDP (Spec-001)
    if (!formData.consentimiento_lopdp) {
      setFormError('Debes aceptar la Política de Privacidad para continuar');
      return;
    }

    // Spec-003: Login con JWT
    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-header">
        <h2>Iniciar Sesión</h2>
        <p className="subtitle">Ingresa tus credenciales para continuar</p>
      </header>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Mensajes de error */}
        {(formError || error) && (
          <div className="alert alert-error" role="alert">
            {formError || error}
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Correo Electrónico (UNL)
            <span className="required" aria-label="requerido">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="usuario@unl.edu.ec"
            required
            aria-required="true"
            className="form-input"
          />
          <small className="form-hint">Usa tu correo institucional de UNL</small>
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Contraseña
            <span className="required" aria-label="requerido">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            aria-required="true"
            className="form-input"
          />
          <small className="form-hint">Contraseña sensible a mayúsculas y minúsculas</small>
        </div>

        {/* LOPDP Consent (Spec-001) */}
        <fieldset className="privacy-section">
          <legend>Política de Privacidad</legend>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="consentimiento_lopdp"
              checked={formData.consentimiento_lopdp}
              onChange={handleChange}
              required
              aria-required="true"
            />
            <span>
              Acepto la{' '}
              <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer">
                Política de Privacidad
              </a>{' '}
              y el tratamiento de mis datos conforme a la LOPDP
              <span className="required" aria-label="requerido">*</span>
            </span>
          </label>
          <small className="form-hint">
            Consulta nuestra política de privacidad (Art. 39-44 LOPDP)
          </small>
        </fieldset>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isLoading}
          aria-label="Ingresar con las credenciales proporcionadas"
        >
          {isLoading ? '⏳ Ingresando...' : '🔐 Ingresar'}
        </button>

        {/* Link to Register */}
        <p className="auth-footer-text">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="link-secondary">
            Crea una nueva
          </a>
        </p>
      </form>
    </div>
  );
};
