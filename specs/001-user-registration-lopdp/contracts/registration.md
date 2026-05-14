# Interface Contracts: User Registration

## REST API Contract

### Endpoint: `/api/v1/usuarios/registro`
**Method**: `POST`  
**Description**: Registers a new user with LOPDP consent.

**Request Header**:
- `Content-Type`: `application/json`

**Request Body**:
```json
{
  "nombre_completo": "John Doe",
  "email": "john.doe@unl.edu.ec",
  "password": "secure_password123",
  "consentimiento_lopdp": true
}
```

**Success Response (201 Created)**:
```json
{
  "id": 123,
  "nombre_completo": "John Doe",
  "email": "john.doe@unl.edu.ec",
  "fecha_registro": "2026-05-11T20:30:00Z"
}
```

**Error Response (400 Bad Request)**:
- Missing required fields.
- `consentimiento_lopdp` is `false`.
- Invalid email format.
- Password too weak.

**Error Response (409 Conflict)**:
- Email already exists.

---

### Endpoint: `/api/v1/politica-privacidad`
**Method**: `GET`  
**Description**: Retrieves the current active privacy policy.

**Success Response (200 OK)**:
```json
{
  "version": "v1.0",
  "contenido": "Full text of the privacy policy...",
  "fecha_entrada_vigor": "2026-05-11"
}
```
