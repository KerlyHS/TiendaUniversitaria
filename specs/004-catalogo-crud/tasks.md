# Tasks: Catalog CRUD Operations

**Input**: Design document from `specs/004-catalogo-crud/spec.md`  
**Total Effort**: 12 hours across 5 phases

---

## Phase 1: Data Model & Validation (2 hours)

### Task Group: Validators & Model Constraints

- [x] **T001** Review Producto model in tienda/models.py - ensure all fields match spec
  - Fields: codigo, nombre, descripcion, precio, stock, categoria, medida, aplica_impuesto, is_activo, vencimiento, imagen_url, fecha_creacion
  - Constraints: precio > 0, stock >= 0, codigo unique

- [x] **T002** Add database indexes on frequently queried fields
  - Index on: nombre, categoria, precio
  - Run: `python manage.py makemigrations` and `python manage.py migrate`

- [x] **T003** Document model validation rules in docstring

---

## Phase 2: Serializers & ViewSet (3 hours)

### Task Group: Implement CRUD Serializer & ViewSet

- [x] **T004** Create/Review ProductoSerializer in tienda/serializers.py
  - Include: All fields from Producto model
  - Read-only: id, fecha_creacion
  - Validators: precio >= 0.01, stock >= 0, nombre required

- [x] **T005** Implement ProductoViewSet in tienda/views.py
  - Support: List, Create, Retrieve, Update, Delete
  - Permissions: IsAuthenticatedOrReadOnly (read=public, write=auth)
  - Default queryset: Producto.objects.filter(is_activo=True).order_by('nombre')

- [x] **T006** Register ProductoViewSet in router (tienda/urls.py)
  - Route: `router.register(r'productos', ProductoViewSet, basename='producto')`
  - Result: GET/POST /productos/, GET/PUT/DELETE /productos/{id}/

---

## Phase 3: Filtering, Search, Sorting (2 hours)

### Task Group: Implement Query Features

- [x] **T007** Configure Django Filter Backends in ViewSet
  - Add: DjangoFilterBackend, SearchFilter, OrderingFilter
  - Settings already configured in core/settings.py

- [x] **T008** Define filterable_fields and search_fields
  - filterable_fields = ['categoria', 'is_activo', 'precio']
  - search_fields = ['nombre', 'descripcion']
  - ordering_fields = ['nombre', 'precio', 'fecha_creacion']

- [x] **T009** Add pagination configuration
  - Uses DEFAULT_PAGINATION_CLASS from settings (10 items/page)
  - Automatic in DRF

---

## Phase 4: Testing (3 hours)

### Task Group: Comprehensive Test Coverage

- [ ] **T010** Create ProductoListTest (test_list_products)
  - Verify: Return 200, has pagination structure
  - Verify: Only active products (is_activo=True)
  - Verify: Sorted by nombre ascending

- [ ] **T011** Create ProductoFilterTest (test_filter_by_categoria)
  - Test: GET /productos/?categoria=TEXTIL
  - Verify: Only TEXTIL products returned

- [ ] **T012** Create ProductoSearchTest (test_search_products)
  - Test: GET /productos/?search=Camiseta
  - Verify: Products with "Camiseta" in nombre or descripcion returned

- [ ] **T013** Create ProductoOrderingTest (test_order_by_price)
  - Test: GET /productos/?ordering=-precio (descending)
  - Verify: Products ordered by price descending

- [ ] **T014** Create ProductoDetailTest (test_retrieve_product_detail)
  - Test: GET /productos/{id}/
  - Verify: All fields present in response
  - Verify: 404 for non-existent product

- [ ] **T015** Create ProductoCreateTest (test_create_product_authenticated)
  - Test: POST /productos/ with valid data + auth token
  - Verify: 201 Created
  - Verify: Product appears in database
  - Verify: fecha_creacion set automatically

- [ ] **T016** Create ProductoCreateUnauthorizedTest (test_create_product_unauthorized)
  - Test: POST /productos/ without authentication
  - Verify: 401 Unauthorized or 403 Forbidden

- [ ] **T017** Create ProductoValidationTest (test_create_product_invalid_price)
  - Test: POST /productos/ with precio=-5
  - Verify: 400 Bad Request with error message
  - Test: POST /productos/ with stock=-1
  - Test: POST /productos/ without required fields

- [ ] **T018** Create ProductoUpdateTest (test_update_product)
  - Test: PUT /productos/{id}/ with updated precio
  - Verify: 200 OK
  - Verify: Database updated

- [ ] **T019** Create ProductoDeleteTest (test_delete_product)
  - Test: DELETE /productos/{id}/
  - Verify: 204 No Content
  - Verify: Product removed from database
  - Test: GET /productos/{id}/ returns 404

- [ ] **T020** Create ProductoInactiveTest (test_inactive_product_not_listed)
  - Create product with is_activo=False
  - Test: GET /productos/ does not include it
  - Test: GET /productos/{id}/ returns 404

---

## Phase 5: Documentation (2 hours)

### Task Group: Quarto Documentation

- [ ] **T021** Create docs/catalogo-productos.qmd
  - Overview: Catalog browsing and CRUD operations
  - Include: 7 endpoint examples (List, Filter, Search, Retrieve, Create, Update, Delete)
  - Include: React integration examples with fetch/axios
  - Include: Pagination handling in frontend
  - Include: Error handling code examples
  - Format: Quarto markdown with code examples and diagrams

- [ ] **T022** Add Mermaid diagrams to documentation
  - Entity-relationship diagram for Producto
  - State diagram for product lifecycle
  - Flowchart for CRUD permissions

- [ ] **T023** Generate HTML documentation
  - Run: `quarto render docs/catalogo-productos.qmd --to html`
  - Verify: HTML renders correctly

- [ ] **T024** Update constitution.md with Catalog section reference
  - Link to: docs/catalogo-productos.qmd

---

## Phase 6: Code Quality (No separate tasks - parallel with Phase 4-5)

- [ ] Review: All code follows LOPDP requirements (no sensitive data exposed)
- [ ] Review: All endpoints return appropriate HTTP status codes
- [ ] Review: Error messages don't expose internal implementation
- [ ] Review: Response times acceptable (< 200ms for list, < 300ms for search)

---

## Execution Order

```
T001-T003 (Data Model) → 
T004-T006 (ViewSet) → 
T007-T009 (Filtering) → 
T010-T020 (Tests in parallel) → 
T021-T024 (Documentation)
```

---

## Success Criteria

- ✅ All 13 tests pass
- ✅ 100% test coverage for ProductoViewSet
- ✅ Response time < 200ms for list endpoint
- ✅ Quarto documentation generated successfully
- ✅ No unhandled exceptions in CRUD operations

---

## Notes

- Filtrado y ordenamiento ya configurados en `core/settings.py`
- Paginación automática (10 items/page)
- CORS ya habilitado para frontend

**Version**: 1.0.0  
**Status**: In Progress  
**Last Updated**: 2026-05-27
