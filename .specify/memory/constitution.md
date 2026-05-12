# Tienda Universitaria Constitution

## Core Principles

### I. Arquitectura y Tecnologías
- **Framework Core**: Django Monolítico bajo el patrón MVT (Model-View-Template).
- **Base de Datos**: Relacional (PostgreSQL/MySQL).
- **Integraciones Críticas**:
  - Pago: PrimeiroPay (Patrón Copy and Pay con backend-to-backend communication `checkout_id`).
  - Geolocalización: SerpApi (Google Maps Local SDK) para ubicaciones relacionadas a la tienda universitaria.
  - Chatbot de Asistencia AI: Gemini API (Gemini 2.5 Flash). La `GEMINI_API_KEY` DEBE residir obligatoriamente en el archivo `.env` o gestor seguro y **NUNCA** ser expuesta al frontend.

### II. Requisitos No Funcionales y Seguridad
- Estricto uso de **HTTPS** en los entornos de producción.
- Prevenir vulnerabilidades (CSRF y XSS) mediante las herramientas nativas que nos brinda Django.
- Todo desarrollo se rige por procesos controlados en versionamiento con Git/GitHub.
- Rendimiento y tiempos de respuesta optimizados para el uso académico y de gran concurrencia.

### III. Normativa Legal Obligatoria (LOPDP Ecuador)
El diseño respeta estrictamente la Ley Orgánica de Protección de Datos Personales:
- **Consentimiento Obligatorio**: Todo registro requiere el campo `consentimiento_lopdp=True`. Este campo funcionará como traza de auditoría.
- **Minimización de datos**: Solo obtener la data esencial como `nombre_completo`, `email` y `password` al registrar un usuario.
- **Privacidad desde el Diseño (Art. 39)**: Anonimización o seudonimización donde sea aplicable.

## Specification Driven Development (SDD)
Usamos **Spec-Kit**. Antes de implementar modelos o endpoints en Django, validamos su existencia y lógica en nuestra base de especificaciones (`especificaciones.yaml`).
Toda API o vista debe ser un reflejo del OpenAPI SDD para la tienda.

**Version**: 1.0.0 | **Ratified**: 2026-05-11
