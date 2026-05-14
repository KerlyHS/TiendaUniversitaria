# Tienda Universitaria Constitution

## Core Principles

### I. Arquitectura y Tecnologías
- **Framework Core**: Headless Django REST Framework (DRF) API.
- **Frontend**: React (consumidor de la API, desacoplado).
- **Base de Datos**: Relacional (PostgreSQL/MySQL - SQLite para Dev).
- **Integraciones Críticas**:
  - Pago: PrimeiroPay (Patrón Copy and Pay con backend-to-backend communication `checkout_id`).
  - Geolocalización: SerpApi (Google Maps Local SDK) para ubicaciones relacionadas a la tienda universitaria.
  - Chatbot de Asistencia AI: Gemini API (Gemini 2.5 Flash). La `GEMINI_API_KEY` DEBE residir obligatoriamente en el archivo `.env` o gestor seguro y **NUNCA** ser expuesta al frontend.

### II. Requisitos No Funcionales y Seguridad
- Estricto uso de **HTTPS** en los entornos de producción.
- Autenticación mediante **JWT (JSON Web Tokens)** o Tokens nativos DRF.
- Prevenir vulnerabilidades (CSRF y XSS) asegurando endpoints y CORS explícitos.
- Todo desarrollo se rige por procesos controlados en versionamiento con Git/GitHub.
- Rendimiento y tiempos de respuesta optimizados acorde a diseño SDD.

### III. Normativa Legal Obligatoria (LOPDP Ecuador)
El diseño respeta estrictamente la Ley Orgánica de Protección de Datos Personales:
- **Consentimiento Obligatorio**: Todo registro requiere el campo `consentimiento_lopdp=True`. Este campo funcionará como traza de auditoría.
- **Minimización de datos**: Solo obtener la data esencial como `nombre_completo` y `email`.
- **Privacidad desde el Diseño (Art. 39)**: Anonimización o seudonimización donde sea aplicable.

## Specification Driven Development (SDD)
Usamos **Spec-Kit** y **Quarto** para documentación viva.
Toda API, modelos Django, y documentación Quarto son la implementación directa de `especificaciones.yaml`, `endpoints.yaml` y los diagramas C4 (Nivel 1 al 4).
El código y la documentación (`docs/*.qmd`) deben estar estrechamente sincronizados.

**Version**: 1.1.0 | **Ratified**: 2026-05-13
