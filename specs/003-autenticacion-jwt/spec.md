# Feature Specification: Autenticación con JWT

**Feature Branch**: `003-autenticacion-jwt`  
**Created**: 2026-05-27  
**Status**: Ready for Implementation  
**Input**: Spec-Kit Analysis, Constitution v1.2.0

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login con Email y Contraseña (Priority: P0)

As a registered user, I want to log in with my email and password so that I can access my account and make purchases.

**Why this priority**: Fundamental entry point. Without authentication, users cannot create orders or access personalized features. BLOCKING all other features.

**Independent Test**: Can be tested by sending valid credentials and verifying token is returned.

**Acceptance Scenarios**:

1. **Given** a registered user with valid email and password, **When** they submit login form, **Then** they receive `access_token` and `refresh_token`.
2. **Given** a user enters incorrect credentials, **When** they attempt login, **Then** the system returns 401 Unauthorized with clear error message.
3. **Given** a user submits email without password, **When** they attempt login, **Then** the system validates and returns 400 Bad Request.

---

### User Story 2 - Token Refresh (Priority: P0)

As a user with expired access token, I want to refresh my token using the refresh token so that I can continue using the app without logging in again.

**Why this priority**: Essential for maintaining session without forcing re-login every hour.

**Independent Test**: Can be tested by sending refresh token and verifying new access token is returned.

**Acceptance Scenarios**:

1. **Given** a valid `refresh_token`, **When** the user requests token refresh, **Then** a new `access_token` is returned.
2. **Given** an invalid or expired `refresh_token`, **When** the user requests token refresh, **Then** the system returns 401 Unauthorized.

---

### User Story 3 - Logout Seguro (Priority: P0)

As a user, I want to log out and invalidate my tokens so that my account is secure when I use public devices.

**Why this priority**: Security. Users must be able to revoke their own sessions.

**Independent Test**: Can be tested by sending logout request and verifying subsequent requests with token are rejected.

**Acceptance Scenarios**:

1. **Given** an authenticated user with valid token, **When** they request logout, **Then** tokens are invalidated and API rejects subsequent requests with that token.
2. **Given** an already logged-out user, **When** they attempt logout again, **Then** the system returns 400 Bad Request (already logged out).

---

### User Story 4 - Perfil del Usuario Autenticado (Priority: P0)

As an authenticated user, I want to view and update my profile so that I can manage my personal information.

**Why this priority**: Essential for user experience. Users need to verify and update their data.

**Independent Test**: Can be tested by retrieving user profile and verifying all fields are present and writable.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they request their profile (`GET /usuarios/me/`), **Then** they receive all their user data.
2. **Given** an authenticated user, **When** they update their profile via `PUT /usuarios/me/`, **Then** changes are saved and returned.
3. **Given** an unauthenticated request, **When** they attempt to access `/usuarios/me/`, **Then** the system returns 401 Unauthorized.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST issue `access_token` and `refresh_token` on successful login.
- **FR-002**: `access_token` MUST expire after 24 hours (configurable via `settings.py`).
- **FR-003**: `refresh_token` MUST expire after 7 days (configurable).
- **FR-004**: System MUST validate credentials (email + password) against stored user.
- **FR-005**: System MUST hash passwords using Django's built-in hasher (PBKDF2 or bcrypt).
- **FR-006**: System MUST reject login if user is inactive (`is_active=False`).
- **FR-007**: System MUST support token refresh without re-entering password.
- **FR-008**: System MUST invalidate tokens on logout.
- **FR-009**: System MUST allow authenticated users to view their profile.
- **FR-010**: System MUST allow authenticated users to update their profile (except email and role).

### Non-Functional Requirements

- **NFR-001**: Login response time MUST be < 500ms.
- **NFR-002**: All authentication endpoints MUST use HTTPS in production.
- **NFR-003**: Tokens MUST be stored securely (HttpOnly cookies or Secure storage on frontend).
- **NFR-004**: Failed login attempts MUST be rate-limited (max 5 attempts per 15 minutes per IP).

### Key Entities *(include if feature involves data)*

- **AuthToken**: Represents issued tokens. Fields: access_token, refresh_token, expires_in, token_type.
- **Usuario**: (Existing) Used for authentication validation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of successful logins return valid JWT tokens.
- **SC-002**: 100% of invalid credentials are rejected with 401 status.
- **SC-003**: Login endpoint responds in < 500ms.
- **SC-004**: Token refresh succeeds for valid refresh tokens.
- **SC-005**: Logged-out tokens are rejected by API (blacklisted).
- **SC-006**: User profile endpoint returns correct user data in < 200ms.

## Assumptions

- **Password Security**: Passwords are hashed client-side or server-side using industry standard (Django PBKDF2+SHA256).
- **Token Storage (Frontend)**: Frontend will implement secure token storage (HttpOnly cookies or localStorage with CSRF protection).
- **Clock Sync**: System assumes server and client clocks are reasonably synchronized.
- **No OAuth2**: Initial spec does NOT include Google/GitHub login (can be added later).

---

## Implementation Notes

- Use `djangorestframework-simplejwt` for JWT implementation.
- Implement a blacklist/logout mechanism (Redis recommended, fallback to database).
- Add rate limiting using `django-ratelimit` or `djangorestframework-throttling`.
- Document all endpoints in OpenAPI/Swagger format.
