# Tienda Universitaria Constitution

## Core Principles

### I. Arquitectura y Tecnologías

#### Backend API
- **Framework Core**: Headless Django REST Framework (DRF) API (Python 3.x / Django 6.0.4).
- **Autenticación**: JWT (JSON Web Tokens) con djangorestframework-simplejwt.
- **Base de Datos**: Relacional (PostgreSQL en Producción / SQLite en Desarrollo).
- **Documentación del Código**: 100% cobertura con **Quarto** (`.qmd` → HTML/PDF).
  - Archivos de documentación: `docs/*.qmd`
  - Generación: `quarto render docs/`
  - Publicación: GitHub Pages / ReadTheDocs
  - Sincronización: Documentación viva, actualizada con cambios de código

#### Frontend
- **Framework UI**: React 18+ (TypeScript recomendado).
- **Gestión de Estado**: Context API / Redux / Zustand (a definir).
- **Autenticación**: Consumidor de JWT del backend.
- **Comunicación**: Fetch API / Axios hacia `/api/v1/`.
- **Documentación**: Componentes documentados en Storybook + Quarto.

#### Integraciones Críticas
- **Pago**: PrimeiroPay (Patrón Copy and Pay con backend-to-backend communication `checkout_id`).
- **Geolocalización**: SerpApi (Google Maps Local SDK) para ubicaciones relacionadas a la tienda universitaria.
- **Chatbot de Asistencia AI**: Gemini API (Gemini 2.5 Flash). La `GEMINI_API_KEY` DEBE residir obligatoriamente en el archivo `.env` o gestor seguro y **NUNCA** ser expuesta al frontend.

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

### IV. Documentación Viva (Specification Driven Development + Quarto)

#### Estándares de Documentación

**Backend (Python/Django):**
- Todo módulo, clase y función DEBE contar con docstrings en formato Quarto-compatible.
- Ejemplo:
```python
def crear_usuario(email: str, nombre: str) -> Usuario:
    """
    # Crear Usuario
    
    Crea un nuevo usuario en el sistema con consentimiento LOPDP obligatorio.
    
    ## Parámetros
    - `email` (str): Correo electrónico único del usuario
    - `nombre` (str): Nombre completo del usuario
    
    ## Retorna
    - `Usuario`: Objeto usuario creado
    
    ## Raises
    - `ValueError`: Si el email ya existe
    - `ValidationError`: Si no cumple con LOPDP
    
    ## Ejemplo
    ```python
    usuario = crear_usuario("juan@unl.edu.ec", "Juan Pérez")
    ```
    """
    ...
```

**Frontend (React/TypeScript):**
- Componentes documentados en JSDoc + Storybook
- Historias de Storybook para cada componente reutilizable

**Documentación Arquitectura:**
- Archivos `.qmd` en `docs/` para:
  - `docs/arquitectura.qmd` → Diagrama C4 + descripción
  - `docs/api-endpoints.qmd` → Referencia completa de API
  - `docs/guia-desarrollo.qmd` → Setup, convenciones, workflow
  - `docs/seguridad-lopdp.qmd` → Compliance y medidas de seguridad
  - `docs/integraciones.qmd` → PrimeiroPay, SerpApi, Gemini

#### Publicación de Documentación
- Comando: `quarto render docs/` (genera HTML/PDF)
- CI/CD: Automático en cada merge a `main`
- Host: GitHub Pages / ReadTheDocs
- Sincronización: Especificaciones → Código → Documentación (viva)

#### Documentación Implementada ✅
- `docs/autenticacion-jwt.qmd` → Sistema JWT completo (v1.0.0)
- `docs/seguridad-tokens.qmd` → Mejores prácticas de seguridad (v1.0.0)
- Pendiente:
  - `docs/especificacion-api.qmd` → Referencia de 25 endpoints
  - `docs/arquitectura.qmd` → Diagramas C4 y patrones
  - `docs/conformidad-lopdp.qmd` → Compliance documentation
  - `docs/integraciones.qmd` → PrimeiroPay, SerpApi, Gemini

## Specification Driven Development (SDD)
Usamos **Spec-Kit** y **Quarto** para documentación viva.
Toda API, modelos Django, y documentación Quarto son la implementación directa de `especificaciones.yaml`, `endpoints.yaml` y los diagramas C4 (Nivel 1 al 4).
El código y la documentación (`docs/*.qmd`) deben estar estrechamente sincronizados.

**Version**: 1.2.0 (Actualizado 2026-05-27) | **Ratified**: 2026-05-13
