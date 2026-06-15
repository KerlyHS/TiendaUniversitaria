# Implementation Plan: Autenticación con JWT

**Branch**: `003-autenticacion-jwt` | **Date**: 2026-05-27 | **Spec**: [spec.md](./spec.md)
**Input**: Specification from `specs/003-autenticacion-jwt/spec.md`

## Summary

Implement JWT-based authentication system for Tienda Universitaria using `djangorestframework-simplejwt`. This provides secure token-based authentication for all API endpoints, enabling user login, token refresh, logout, and profile management.

## Technical Context

**Language/Version**: Python 3.x / Django 6.0.4  
**Primary Dependencies**: djangorestframework-simplejwt, djangorestframework  
**Storage**: PostgreSQL (Production) / SQLite (Development)  
**Testing**: Django Testing Framework / DRF APITestCase  
**Target Platform**: Backend API (JWT Authentication)  
**Performance Goals**: Login < 500ms, Token refresh < 300ms  
**Constraints**: HTTPS Mandatory (Production), Rate Limiting, Token Expiration  
**Scale/Scope**: Academic environment, high concurrency support

## Constitution Check

- **Arquitectura**: Django REST Framework + JWT. (Pass)
- **Base de Datos**: Relacional. (Pass)
- **Autenticación**: JWT Tokens. (Pass)
- **Seguridad**: HTTPS, Rate Limiting. (Pass)
- **Documentación**: Quarto integration ready. (Pass)

## Project Structure

### Documentation (this feature)

```text
specs/003-autenticacion-jwt/
├── spec.md              # Feature specification
├── plan.md              # This file
├── tasks.md             # Task breakdown
└── contracts/           # API contracts (if needed)
```

### Source Code (repository root)

```text
core/
├── settings.py          # SIMPLE_JWT configuration
├── urls.py              # Auth routes

tienda/
├── models.py            # (No changes needed)
├── authentication.py    # NEW - Token views & serializers
├── serializers.py       # Add AuthSerializer
├── views.py             # Add auth views
├── urls.py              # Register auth routes
└── tests.py             # Add authentication tests
```

## Implementation Strategy

### Phase 1: Setup (Dependencies & Configuration)
1. Install `djangorestframework-simplejwt`
2. Configure JWT settings in `settings.py`
3. Add JWT middleware/authentication backend

### Phase 2: Token Generation
1. Create `LoginSerializer` with email/password validation
2. Create `LoginView` that validates and returns tokens
3. Add token generation logic

### Phase 3: Token Refresh & Logout
1. Create `RefreshTokenView` (built into simplejwt)
2. Create logout endpoint with token blacklist
3. Implement token invalidation mechanism

### Phase 4: User Profile
1. Create `UserProfileSerializer`
2. Create `UserProfileView` (GET) and `UserProfileUpdateView` (PUT)
3. Implement permission checks

### Phase 5: Testing & Documentation
1. Write comprehensive tests (10+ cases)
2. Document endpoints in OpenAPI
3. Add Quarto documentation

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Token Blacklist | Security for logout | Simple expiration allows re-use of leaked tokens |
| Rate Limiting | Prevent brute force | Without it, attackers can try infinite passwords |
| Custom Claims | Audit trail | Standard JWT lacks user context info |

---

## Dependencies & Timelines

### External Dependencies
- `djangorestframework-simplejwt` - JWT library
- `django-ratelimit` or built-in throttling - Rate limiting
- Redis (optional) - Token blacklist backend

### Internal Dependencies
- `Usuario` model (already exists)
- `PrivacyPolicy` model (already exists)

### Execution Order
1. Install dependencies
2. Configure JWT in settings
3. Implement LoginView
4. Implement RefreshView + LogoutView
5. Implement UserProfileView
6. Add tests
7. Document in Quarto

**Estimated Total Time**: 7 hours (1 day intensive)
