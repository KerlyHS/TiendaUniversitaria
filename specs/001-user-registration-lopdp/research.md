# Research Report: User Registration & LOPDP Compliance

## Decisions & Rationale

### 1. Framework Extensions (DRF)
- **Decision**: Include **Django Rest Framework (DRF)**.
- **Rationale**: The `especificaciones.yaml` explicitly mentions "serializadores" and defines API-style paths (e.g., `/api/v1/usuarios/registro`). DRF is the industry standard for implementing these in Django.
- **Alternatives considered**: Standard Django Views with JSON responses. Rejected because it lacks the robust serialization and validation features required by the SDD approach.

### 2. Custom User Model
- **Decision**: Use `AbstractUser` as the base for the `Usuario` model.
- **Rationale**: Best practice in Django for adding custom fields (like `consentimiento_lopdp`) while keeping the built-in authentication system.
- **Alternatives considered**: `OneToOneField` to a Profile model. Rejected because it complicates queries and extends registration complexity.

### 3. LOPDP Audit Trail
- **Decision**: Store `consentimiento_lopdp` (Boolean), `consentimiento_timestamp` (DateTimeField), and a reference to the `PrivacyPolicy` version.
- **Rationale**: LOPDP requires proof of consent. A timestamp and link to the specific policy version accepted provide a robust audit trail.
- **Alternatives considered**: Storing only a boolean. Rejected as it doesn't satisfy legal traceability requirements.

### 4. Data Minimization
- **Decision**: Collect only `nombre_completo`, `email`, and `password`.
- **Rationale**: Aligns with LOPDP "Minimización de datos" principle and the "UsuarioRegistroInput" schema in the spec.
- **Alternatives considered**: Collecting username separately. Rejected to simplify the user journey (email will serve as the primary identifier).

## Research Findings

- **LOPDP Art. 39**: "Privacidad desde el Diseño" implies that the system should default to the highest privacy settings and only collect what is strictly necessary.
- **Django 6.0 compatibility**: All chosen libraries (Django, DRF) are compatible with the latest Python/Django versions.

## Resolved Clarifications

- **DRF for serializadores?**: **YES**. DRF will be used for the API endpoints, while standard Django templates will be used for the web frontend to satisfy the "MVT" pattern mentioned in the constitution.
