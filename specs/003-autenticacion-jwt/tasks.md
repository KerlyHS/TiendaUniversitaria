# Tasks: Autenticación JWT

**Input**: Design documents from `specs/003-autenticacion-jwt/`

## Phase 1: Setup & Configuration

- [ ] T001 Install dependencies: `pip install djangorestframework-simplejwt django-ratelimit`
- [ ] T002 Configure SIMPLE_JWT settings in `core/settings.py`
- [ ] T003 Add AUTHENTICATION_CLASSES in DRF settings
- [ ] T004 Create `tienda/authentication.py` module

## Phase 2: Token Generation (Login)

- [ ] T005 [P0] Create `AuthSerializer` in `tienda/serializers.py` with email/password validation
- [ ] T006 [P0] Implement `TokenObtainPairView` (or custom `LoginView`) in `tienda/authentication.py`
- [ ] T007 [P0] Add custom claims to JWT tokens (user_id, email, rol)
- [ ] T008 [P0] Configure URL routing in `tienda/urls.py` for login endpoint
- [ ] T009 [P0] Add rate limiting to login endpoint

## Phase 3: Token Refresh & Logout

- [ ] T010 [P0] Implement `TokenRefreshView` in `tienda/authentication.py`
- [ ] T011 [P0] Create token blacklist mechanism (Redis/Database)
- [ ] T012 [P0] Implement `LogoutView` that adds token to blacklist
- [ ] T013 [P0] Configure URL routing for refresh and logout endpoints

## Phase 4: User Profile

- [ ] T014 [P0] Create `UserProfileSerializer` in `tienda/serializers.py`
- [ ] T015 [P0] Implement `UserProfileView` (GET /usuarios/me/) in `tienda/views.py`
- [ ] T016 [P0] Implement `UserProfileUpdateView` (PUT /usuarios/me/)
- [ ] T017 [P0] Add IsAuthenticated permission checks
- [ ] T018 [P0] Configure URL routing for profile endpoints

## Phase 5: Testing & Documentation

- [ ] T019 Create test suite `AuthenticationTests` class in `tienda/tests.py`
- [ ] T020 Test successful login (200, returns tokens)
- [ ] T021 Test invalid credentials (401)
- [ ] T022 Test invalid email format (400)
- [ ] T023 Test missing password (400)
- [ ] T024 Test inactive user cannot login (401)
- [ ] T025 Test token refresh with valid refresh_token (200)
- [ ] T026 Test token refresh with invalid token (401)
- [ ] T027 Test logout invalidates token (subsequent request rejected)
- [ ] T028 Test user profile GET (200, returns user data)
- [ ] T029 Test user profile PUT (200, updates data)
- [ ] T030 Test unauthenticated profile access (401)
- [ ] T031 Test email cannot be changed via profile update (403)
- [ ] T032 Create Quarto documentation in `docs/autenticacion.qmd`
- [ ] T033 Document token flow in `docs/seguridad-tokens.qmd`

## Phase 6: Polish & Integration

- [ ] T034 Update `core/settings.py` with JWT configuration
- [ ] T035 Update `requirements.txt` with new dependencies
- [ ] T036 Run full test suite (should pass 66+ tests)
- [ ] T037 Verify backwards compatibility with existing endpoints
- [ ] T038 Create GitHub PR with clear documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Token Generation (Phase 2)**: Depends on Phase 1 completion. BLOCKS Phases 3-4.
- **Token Refresh & Logout (Phase 3)**: Depends on Phase 2 completion.
- **User Profile (Phase 4)**: Depends on Phase 2 completion (Phase 3 optional).
- **Testing (Phase 5)**: Depends on Phases 2-4 completion.
- **Polish (Phase 6)**: Depends on all phases, final integration.

### Critical Path
```
T001-004 → T005-009 → (T010-013, T014-018 parallel) → T019-037
```

**Estimated Duration**: 7 hours total
- Setup: 0.5 hours
- Token Generation: 2 hours
- Token Refresh & Logout: 1.5 hours
- User Profile: 1 hour
- Testing: 1.5 hours
- Polish: 0.5 hours

