# Tasks: Product Catalog

**Input**: Design documents from `specs/002-product-catalog/`

## Phase 1: Foundation (Data Model)

- [X] T001 Create `Producto` model in `tienda/models.py`
- [X] T002 Generate and apply migrations: `python manage.py makemigrations` and `python manage.py migrate`
- [X] T003 Register `Producto` in `tienda/admin.py`

## Phase 2: API Implementation

- [X] T004 Create `ProductoSerializer` in `tienda/serializers.py`
- [X] T005 Implement `ProductoViewSet` in `tienda/views.py`
- [X] T006 Configure URL routing in `tienda/urls.py`

## Phase 3: Testing & Validation

- [X] T007 Add integration tests for Product API in `tienda/tests.py`
- [X] T008 Verify catalog functionality in Django Admin
