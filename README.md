# Tienda Universitaria - API Service

## Overview
This service provides the backend API for the Tienda Universitaria, ensuring LOPDP compliance for user registration and data management.

## API Endpoints

### User Registration
- **URL**: `/api/v1/usuarios/registro/`
- **Method**: `POST`
- **Description**: Registers a new user with mandatory LOPDP consent.
- **Request Body**:
```json
{
  "nombre_completo": "John Doe",
  "email": "john.doe@unl.edu.ec",
  "password": "secure_password123",
  "consentimiento_lopdp": true
}
```

### Privacy Policy
- **URL**: `/api/v1/politica-privacidad/`
- **Method**: `GET`
- **Description**: Retrieves the latest active privacy policy.

## Technical Stack
- **Framework**: Django 6.0.4
- **API**: Django Rest Framework (DRF)
- **Database**: SQLite (Dev) / PostgreSQL (Prod)

## Compliance
- **LOPDP Art. 39**: Privacy by Design.
- **Data Minimization**: Only essential user data is collected.
- **Consent Audit**: Every user registration includes a timestamped consent linked to a specific policy version.
