# Tasks: Order Management System

**Input**: Design document from `specs/005-ordenes-pedidos/spec.md`  
**Total Effort**: 9 hours across 4 phases

---

## Phase 1: Data Model Enhancement (1.5 hours)

### Task Group: Upgrade Models

- [ ] **T001** Review and improve Pedido model
  - Add: `numero_pedido = CharField(max_length=20, unique=True)`
  - Add: `subtotal, impuesto, total = DecimalField`
  - Add: `fecha_modificacion = DateTimeField(auto_now=True)`
  - Ensure: All existing data preserved

- [ ] **T002** Review DetalleVenta model for historical price tracking
  - Add: `nombre_producto = CharField(snapshot)`
  - Verify: `precio_unitario` stores actual price at purchase time
  - Add: `fecha_creacion = DateTimeField(auto_now_add=True)`

- [ ] **T003** Create and apply migrations
  - Command: `python manage.py makemigrations`
  - Command: `python manage.py migrate`
  - Verify: No data loss

---

## Phase 2: Serializers & Logic (2 hours)

### Task Group: Implement Business Logic

- [ ] **T004** Create PedidoCreateSerializer with nested DetalleVenta
  - Input validation for products and quantities
  - Stock validation before accepting order
  - Automatic order number generation

- [ ] **T005** Implement stock validation in serializer.validate_detalles()
  - For each item: Check `producto.stock >= cantidad`
  - If any fails: Raise ValidationError with specific product name
  - Message format: "Stock insuficiente: {nombre}. Disponible: {x}, Solicitado: {y}"

- [ ] **T006** Implement automatic calculations in serializer.create()
  - For each detalle: Calculate subtotal = cantidad * precio
  - If aplica_impuesto: Add impuesto = subtotal * 0.12
  - Set pedido.total = subtotal + impuesto
  - Reduce producto.stock -= cantidad (atomically)

- [ ] **T007** Create PedidoListSerializer (read-only, summary view)
  - Fields: id, numero_pedido, estado, tipo_entrega, total, fecha_creacion
  - Used for list endpoint

- [ ] **T008** Create PedidoDetailSerializer with nested detalles
  - Include: cliente (nested with nombre_completo, email)
  - Include: detalles (DetalleVentaSerializer many=True)
  - Include: venta (nested if exists)
  - Include: All timestamps

- [ ] **T009** Create DetalleVentaSerializer (nested in Pedido)
  - Fields: id, producto_id, nombre_producto, cantidad, precio_unitario, subtotal
  - Read-only: All fields (snapshots of historical data)

- [ ] **T010** Create helper function: generate_order_number()
  - Format: P-YYYYMMDD-XXX (e.g., P-20260527-001)
  - Use: Pedido.objects.filter(numero_pedido__startswith=...).count()
  - Return: Unique number per day

---

## Phase 3: ViewSets & Permissions (2.5 hours)

### Task Group: REST API Implementation

- [ ] **T011** Create PedidoViewSet in tienda/views.py
  - ModelViewSet for full CRUD
  - serializer_class = PedidoSerializer
  - permission_classes = [IsAuthenticated]

- [ ] **T012** Implement get_queryset() for auto-filtering
  - If user.rol != 'ADMIN': return Pedido.objects.filter(cliente=self.request.user)
  - If user.rol == 'ADMIN': return Pedido.objects.all()
  - Result: Customers see only their orders

- [ ] **T013** Implement perform_create()
  - Auto-assign cliente = self.request.user
  - No manual assignment needed
  - Call serializer.save(cliente=...)

- [ ] **T014** Implement perform_update() for state transitions
  - Get old_estado from self.get_object()
  - Get new_estado from validated_data
  - Define valid_transitions dict:
    - RECIBIDO → [PREPARACION, CANCELADO]
    - PREPARACION → [LISTO, CANCELADO]
    - LISTO → [ENTREGADO, CANCELADO]
    - ENTREGADO → []
    - CANCELADO → []
  - Raise ValidationError if invalid transition

- [ ] **T015** Implement stock release on cancel
  - When new_estado == 'CANCELADO' and old_estado != 'CANCELADO':
  - For each detalle: producto.stock += detalle.cantidad
  - Call producto.save() (atomic)
  - Log the change

- [ ] **T016** Register PedidoViewSet in tienda/urls.py
  - Line: `router.register(r'pedidos', PedidoViewSet, basename='pedido')`
  - Verify: Endpoints generated correctly

- [ ] **T017** Test URL generation
  - Verify: GET /pedidos/ works
  - Verify: POST /pedidos/ works
  - Verify: GET /pedidos/{id}/ works
  - Verify: PUT /pedidos/{id}/ works

---

## Phase 4: Testing (3 hours)

### Task Group: Comprehensive Test Suite

#### Create Order Tests (4 tests)

- [ ] **T018** test_create_order_success
  - Create authenticated user and 2 products with stock
  - POST /pedidos/ with valid data
  - Expect: 201 Created
  - Verify: Pedido in database, numero_pedido generated
  - Verify: Stock reduced

- [ ] **T019** test_create_order_insufficient_stock
  - Product with 5 units, request 10
  - POST /pedidos/ with invalid quantity
  - Expect: 400 Bad Request with "Stock insuficiente" message
  - Verify: No pedido created, stock unchanged

- [ ] **T020** test_create_order_unauthenticated
  - POST /pedidos/ without authentication
  - Expect: 401 Unauthorized
  - Verify: No pedido created

- [ ] **T021** test_create_order_multiple_items
  - POST with 3 different products
  - Expect: 201 Created
  - Verify: All 3 DetalleVenta created
  - Verify: Total = sum of all items

#### List & Retrieve Tests (5 tests)

- [ ] **T022** test_list_own_orders_customer
  - Create 2 orders as user A
  - Create 1 order as user B
  - User A GETs /pedidos/
  - Expect: 2 orders (not user B's order)

- [ ] **T023** test_list_all_orders_admin
  - Create 3 orders total (different users)
  - Admin GETs /pedidos/
  - Expect: All 3 orders in results

- [ ] **T024** test_list_filter_by_estado
  - Create 2 RECIBIDO orders, 1 LISTO
  - GET /pedidos/?estado=LISTO
  - Expect: 1 result

- [ ] **T025** test_retrieve_own_order
  - User creates order
  - GET /pedidos/{id}/
  - Expect: 200 OK with full details
  - Verify: detalles nested array present

- [ ] **T026** test_retrieve_other_order_forbidden
  - User A creates order
  - User B tries to GET User A's order
  - Expect: 404 Not Found (or 403 Forbidden)

#### State Transition Tests (4 tests)

- [ ] **T027** test_update_order_recibido_to_preparacion
  - Order in RECIBIDO status
  - PUT /pedidos/{id}/ with estado=PREPARACION
  - Expect: 200 OK, status updated

- [ ] **T028** test_update_order_invalid_transition
  - Order in ENTREGADO status
  - Try PUT with estado=PREPARACION
  - Expect: 400 Bad Request with "Transición inválida" message

- [ ] **T029** test_cancel_order_and_release_stock
  - Order with 2 units reserved from product
  - PUT /pedidos/{id}/ with estado=CANCELADO
  - Expect: 200 OK
  - Verify: Product stock increased by 2

- [ ] **T030** test_transition_sequence
  - RECIBIDO → PREPARACION → LISTO → ENTREGADO
  - Each transition updates successfully
  - Final estado = ENTREGADO

#### Edge Cases (2 tests)

- [ ] **T031** test_concurrent_order_creation
  - Simultaneous POST requests for same product
  - Verify: No double stock allocation
  - Result: Only one succeeds if only 1 unit available

- [ ] **T032** test_order_number_uniqueness
  - Create 100 orders in same day
  - Verify: All numero_pedido values are unique
  - Format: P-20260527-001, P-20260527-002, etc.

---

## Phase 5: Documentation (1 hour)

### Task Group: Quarto Documentation

- [ ] **T033** Create docs/ordenes-pedidos.qmd
  - Overview: Order management system
  - 5 endpoint examples (POST create, GET list, GET detail, PUT update, state diagram)
  - React integration examples (create order, list orders, update status)
  - Error handling patterns
  - State transition diagram

- [ ] **T034** Generate HTML documentation
  - Command: `quarto render docs/ordenes-pedidos.qmd --to html`
  - Verify: HTML renders correctly with all examples

- [ ] **T035** Update constitution.md with Order Management section
  - Add: Link to docs/ordenes-pedidos.qmd
  - Update version to 1.4.0

---

## Execution Order

```
T001-T003 (Models) → 
T004-T010 (Serializers) → 
T011-T017 (ViewSet) → 
T018-T032 (Tests in parallel) → 
T033-T035 (Documentation)
```

---

## Success Criteria

- ✅ All 15 tests pass (100%)
- ✅ Stock accuracy maintained
- ✅ State transitions enforced
- ✅ Quarto documentation complete
- ✅ Response times < 500ms
- ✅ Zero data loss on migration

---

## Notes

- Stock management uses atomic transactions
- Concurrent requests handled by database-level constraints
- Order numbers auto-generated per day
- Customer isolation enforced at ViewSet level
- State machine transitions centralized in perform_update()

**Version**: 1.0.0  
**Status**: Ready for Implementation  
**Last Updated**: 2026-05-27
