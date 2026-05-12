# Tasks: User Registration & LOPDP Compliance (API)

**Input**: Design documents from `specs/001-user-registration-lopdp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Configure `.env` support using `django-environ` in `core/settings.py`
- [X] T002 [P] Initialize project dependencies in `requirements.txt` (Django, DRF, django-environ)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T003 Create `PrivacyPolicy` model in `tienda/models.py`
- [X] T004 Create custom `Usuario` model extending `AbstractUser` in `tienda/models.py`
- [X] T005 [P] Configure `AUTH_USER_MODEL = 'tienda.Usuario'` in `core/settings.py`
- [X] T006 Run initial migrations: `python manage.py makemigrations tienda` and `python manage.py migrate`

**Checkpoint**: Foundation ready - API implementation can now begin

---

## Phase 3: User Story 1 - Standard User Registration API (Priority: P1) 🎯 MVP

**Goal**: Register a user via API with mandatory LOPDP consent.

**Independent Test**: Send a POST request to `/api/v1/usuarios/registro/` and verify the record in the database includes the consent flag and timestamp.

### Implementation for User Story 1

- [X] T007 [P] [US1] Create `UsuarioSerializer` for API registration in `tienda/serializers.py`
- [X] T008 [US1] Implement registration API view (DRF) in `tienda/views.py`
- [X] T009 [P] [US1] Configure API URL routing in `tienda/urls.py` and `core/urls.py`
- [X] T010 [US1] Add API integration tests for registration and consent in `tienda/tests.py` using `APITestCase`

**Checkpoint**: User Story 1 API is functional and testable independently.

---

## Phase 4: User Story 2 - Privacy Policy API (Priority: P2)

**Goal**: Provide an endpoint for the React frontend to fetch the active privacy policy.

**Independent Test**: Send a GET request to `/api/v1/politica-privacidad/` and verify the content matches the active policy.

### Implementation for User Story 2

- [X] T011 [P] [US2] Create `PrivacyPolicySerializer` in `tienda/serializers.py`
- [X] T012 [US2] Implement API view to retrieve the active `PrivacyPolicy` in `tienda/views.py`
- [X] T013 [P] [US2] Add URL routing for privacy policy API in `tienda/urls.py`
- [X] T014 [US2] Add API tests for privacy policy retrieval in `tienda/tests.py`

**Checkpoint**: User Story 2 API is integrated and testable.

---

## Phase 5: User Story 3 - Data Minimization API Validation (Priority: P3)

**Goal**: Ensure the API only accepts and stores necessary data.

**Independent Test**: Attempt API registration with extra fields and verify they are rejected or ignored.

### Implementation for User Story 3

- [X] T015 [US3] Add validation to `UsuarioSerializer` to reject unexpected fields in `tienda/serializers.py`
- [X] T016 [US3] Add API test case for data minimization in `tienda/tests.py`

**Checkpoint**: API is fully compliant with LOPDP minimization principles.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect the API service

- [X] T017 [P] Update `README.md` with API endpoint documentation
- [X] T018 Run `quickstart.md` validation for API setup

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on T001, T002. BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Phase 2 completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

---

## Implementation Strategy

### MVP First (User Story 1 API Only)

1. Complete Setup and Foundational phases.
2. Implement User Story 1 (API registration).
3. **VALIDATE**: Run T010 (API Tests).
