# Feature Specification: Order Management System

**Feature Branch**: `005-ordenes-pedidos`  
**Created**: 2026-05-27  
**Status**: In Progress  
**Priority**: P1 (Blocker for Frontend)  
**Input**: Constitution requirements, business requirements

## Overview

Sistema completo de gestión de órdenes/pedidos con estados, validación de stock, detalles de venta y seguimiento de estado. Permite a clientes crear órdenes, y a administradores gestionar el flujo de pedidos desde recepción hasta entrega.

---

## User Scenarios & Testing

### User Story 1 - Customer Creates Order (Priority: P0)

As a customer, I want to create an order by selecting products and quantities so that I can purchase items from the store.

**Acceptance Scenarios**:

1. **Given** I'm authenticated and have selected products, **When** I POST to `/pedidos/`, **Then** an order is created with status `RECIBIDO`.
2. **Given** a product has 10 units in stock and I order 5, **When** I create the order, **Then** the order is created and stock is reserved.
3. **Given** a product has 5 units in stock and I try to order 10, **When** I create the order, **Then** I receive a 400 Bad Request with "Insufficient stock" message.
4. **Given** I'm not authenticated, **When** I try to POST to `/pedidos/`, **Then** I receive 401 Unauthorized.

---

### User Story 2 - View Order Status

As a customer, I want to see the status of my orders so that I know when they're ready for pickup.

**Acceptance Scenarios**:

1. **Given** I have placed orders, **When** I GET `/pedidos/`, **Then** I receive a list of my orders with their statuses.
2. **Given** I have a specific order ID, **When** I GET `/pedidos/{id}/`, **Then** I receive the full details including items and status.

---

### User Story 3 - Admin Manages Order Status

As a store manager, I want to update order status from `RECIBIDO` → `PREPARACION` → `LISTO` so that customers know when to pick up.

**Acceptance Scenarios**:

1. **Given** an order exists in `RECIBIDO` status, **When** I PUT `/pedidos/{id}/` with `estado=PREPARACION`, **Then** status is updated.
2. **Given** an order is in `LISTO` status, **When** customer picks up, **Then** admin can mark as `ENTREGADO`.
3. **Given** an order is in any status, **When** admin marks as `CANCELADO`, **Then** stock is released back to inventory.

---

### User Story 4 - View Order Details with Items

As a customer or admin, I want to see all items in an order with prices and quantities.

**Acceptance Scenarios**:

1. **Given** an order with 3 items exists, **When** I GET `/pedidos/{id}/`, **Then** the response includes a nested `detalles` array with all items.
2. **Given** an item's price was $10 when ordered, **When** the actual product price becomes $12, **Then** the order still shows $10 (historical price preserved).

---

## Requirements (Mandatory)

### Functional Requirements

| ID | Requirement | Priority |
|-----|------------|----------|
| FR-001 | Create order with one or more products | P0 |
| FR-002 | Validate stock before creating order | P0 |
| FR-003 | List customer's orders (auto-filtered by user) | P0 |
| FR-004 | Retrieve full order details with items | P0 |
| FR-005 | Update order status (RECIBIDO → PREPARACION → LISTO → ENTREGADO) | P0 |
| FR-006 | Cancel order and release stock | P0 |
| FR-007 | Track order state transitions | P0 |
| FR-008 | Store historical item prices (not affected by future price changes) | P0 |
| FR-009 | Auto-filter orders by authenticated user (customers see only their orders) | P0 |
| FR-010 | Support delivery type selection (TIENDA / DOMICILIO) | P0 |
| FR-011 | Validate order cannot be deleted (soft state management only) | P0 |
| FR-012 | Track order creation and modification timestamps | P0 |

### Non-Functional Requirements

| ID | Requirement |
|-----|------------|
| NFR-001 | Order creation response time < 500ms |
| NFR-002 | List orders response time < 200ms |
| NFR-003 | Support concurrent order creation without stock conflicts |
| NFR-004 | Orders database indexed on: cliente, estado, fecha_creacion |

### Permission Matrix

| Endpoint | GET | POST | PUT | DELETE | Notes |
|----------|-----|------|-----|--------|-------|
| `/pedidos/` | Authenticated | Authenticated | - | - | Clientes ven solo sus pedidos; Admins ven todos |
| `/pedidos/{id}/` | Authenticated | - | Authenticated (admin) | - | Solo propietario o admin puede actualizar |

---

## Data Models

### Pedido (Order)

```python
class Pedido(models.Model):
    # Identificación
    id = UUID (primary key)
    numero_pedido = CharField(max_length=20, unique=True)  # P-20240527-001
    
    # Cliente y Estado
    cliente = ForeignKey(Usuario, related_name='pedidos')
    estado = CharField(choices=ProgresoVenta, default='RECIBIDO')
    tipo_entrega = CharField(choices=Entrega, default='TIENDA')
    
    # Metadatos
    fecha_creacion = DateTimeField(auto_now_add=True)
    fecha_modificacion = DateTimeField(auto_now=True)
    
    # Totales
    subtotal = DecimalField(max_digits=10, decimal_places=2, default=0.00)
    impuesto = DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = DecimalField(max_digits=10, decimal_places=2, default=0.00)
```

### DetalleVenta (Order Item)

```python
class DetalleVenta(models.Model):
    # Relaciones
    venta = ForeignKey(Venta, related_name='detalles')
    producto = ForeignKey(Producto, on_delete=models.PROTECT)
    
    # Información del Item
    nombre_producto = CharField(max_length=255)  # Snapshot del nombre
    descripcion = TextField(blank=True)
    cantidad = IntegerField(default=1, min=1)
    
    # Precios (históricos)
    precio_unitario = DecimalField(max_digits=10, decimal_places=2)
    subtotal = DecimalField(max_digits=10, decimal_places=2)
    
    # Auditoría
    fecha_creacion = DateTimeField(auto_now_add=True)
```

### Venta (Sales Transaction)

```python
class Venta(models.Model):
    # Relaciones
    pedido = OneToOneField(Pedido, related_name='venta')
    cajero = ForeignKey(Usuario, limit_choices_to={'rol': 'CAJERO'}, on_delete=models.RESTRICT)
    
    # Totales
    subtotal = DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = CharField(choices=MetodoPago)
    
    # Auditoría
    fecha = DateTimeField(auto_now_add=True)
```

---

## API Endpoints

### POST /pedidos/ (Create Order)

**Autenticación requerida**: Sí

**Request Body**:

```json
{
  "tipo_entrega": "TIENDA",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 3,
      "cantidad": 1
    }
  ]
}
```

**Validaciones**:
- El usuario debe estar autenticado
- Cada `producto_id` debe existir y estar activo
- `cantidad` debe ser >= 1
- Stock debe ser suficiente para cada producto

**Response (201 Created)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero_pedido": "P-20260527-001",
  "cliente": {
    "id": 1,
    "email": "juan@unl.edu.ec",
    "nombre_completo": "Juan Pérez"
  },
  "estado": "RECIBIDO",
  "tipo_entrega": "TIENDA",
  "subtotal": "31.00",
  "impuesto": "3.72",
  "total": "34.72",
  "detalles": [
    {
      "id": 1,
      "producto_id": 1,
      "nombre_producto": "Camiseta UNL",
      "cantidad": 2,
      "precio_unitario": "15.50",
      "subtotal": "31.00"
    }
  ],
  "fecha_creacion": "2026-05-27T14:30:00Z",
  "fecha_modificacion": "2026-05-27T14:30:00Z"
}
```

**Errores (400 Bad Request)**:

```json
{
  "error": "Insufficient stock for Camiseta UNL. Available: 5, Requested: 10"
}
```

**Error (401 Unauthorized)**:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### GET /pedidos/ (List Orders)

**Autenticación requerida**: Sí

**Query Parameters**:
- `estado`: Filtrar por estado (RECIBIDO, PREPARACION, LISTO, ENTREGADO, CANCELADO)
- `tipo_entrega`: Filtrar por tipo (TIENDA, DOMICILIO)
- `page`: Número de página

**Comportamiento**:
- **Clientes**: Ven solo sus pedidos
- **Admins**: Ven todos los pedidos

**Response (200 OK)**:

```json
{
  "count": 15,
  "next": "http://api/pedidos/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "numero_pedido": "P-20260527-001",
      "estado": "LISTO",
      "tipo_entrega": "TIENDA",
      "total": "34.72",
      "fecha_creacion": "2026-05-27T14:30:00Z"
    }
  ]
}
```

---

### GET /pedidos/{id}/ (Retrieve Order Details)

**Autenticación requerida**: Sí

**Autorización**: Solo propietario del pedido o admin

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero_pedido": "P-20260527-001",
  "cliente": {
    "id": 1,
    "email": "juan@unl.edu.ec",
    "nombre_completo": "Juan Pérez"
  },
  "estado": "LISTO",
  "tipo_entrega": "TIENDA",
  "subtotal": "31.00",
  "impuesto": "3.72",
  "total": "34.72",
  "detalles": [
    {
      "id": 1,
      "producto_id": 1,
      "nombre_producto": "Camiseta UNL",
      "cantidad": 2,
      "precio_unitario": "15.50",
      "subtotal": "31.00"
    }
  ],
  "venta": {
    "id": 1,
    "metodo_pago": "EFECTIVO",
    "fecha": "2026-05-27T15:00:00Z"
  },
  "fecha_creacion": "2026-05-27T14:30:00Z",
  "fecha_modificacion": "2026-05-27T15:00:00Z"
}
```

**Errores**:
- `404 Not Found`: Pedido no existe o cliente no es propietario
- `401 Unauthorized`: No autenticado

---

### PUT /pedidos/{id}/ (Update Order Status)

**Autenticación requerida**: Sí (Admin)

**Request Body**:

```json
{
  "estado": "PREPARACION"
}
```

**Estados permitidos**:
- RECIBIDO → PREPARACION
- PREPARACION → LISTO
- LISTO → ENTREGADO
- Cualquiera → CANCELADO (con devolución de stock)

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero_pedido": "P-20260527-001",
  "estado": "PREPARACION",
  "fecha_modificacion": "2026-05-27T14:35:00Z",
  ...
}
```

**Errores**:
- `400 Bad Request`: Transición de estado inválida
- `404 Not Found`: Pedido no existe
- `403 Forbidden`: Solo admin puede actualizar

---

## Implementation Details

### Stock Management

```python
# Cuando se crea un pedido:
1. Para cada item: validar producto.stock >= cantidad
2. Si alguno falla: retornar 400 y NO crear pedido
3. Si todos OK: crear pedido y RESERVAR stock
   - producto.stock -= cantidad (o usar campo reservado)

# Cuando se cancela pedido:
1. Para cada item: producto.stock += cantidad (liberar stock)
2. Marcar pedido como CANCELADO
```

### Order Number Generation

```python
# Formato: P-YYYYMMDD-XXX
# Ejemplo: P-20260527-001, P-20260527-002

def generate_order_number():
    today = datetime.now().strftime('%Y%m%d')
    count = Pedido.objects.filter(numero_pedido__startswith=f'P-{today}').count()
    return f'P-{today}-{count+1:03d}'
```

### Automatic Calculations

```python
# En PedidoSerializer.create():
for detalle in detalles:
    precio = producto.precio
    subtotal = precio * cantidad
    pedido.subtotal += subtotal
    
    if producto.aplica_impuesto:
        impuesto = subtotal * 0.12  # IVA 12%
        pedido.impuesto += impuesto

pedido.total = pedido.subtotal + pedido.impuesto
```

---

## Implementation Checklist

### Phase 1: Models & Serializers (2 hours)
- [ ] Mejorar modelo Pedido (agregar numero_pedido, fecha_mod)
- [ ] Mejorar modelo DetalleVenta (agregar snapshot de precios)
- [ ] Crear PedidoSerializer con validaciones
- [ ] Crear DetalleVentaSerializer

### Phase 2: ViewSets & Logic (3 hours)
- [ ] PedidoViewSet con CRUD
- [ ] Validación de stock en create()
- [ ] Auto-filtering por usuario
- [ ] Transiciones de estado validadas

### Phase 3: Tests (3 hours)
- [ ] Test create order con stock válido
- [ ] Test create order con stock insuficiente
- [ ] Test list orders (auto-filtrado)
- [ ] Test retrieve order details
- [ ] Test update order status
- [ ] Test cancel order y devolución de stock

### Phase 4: Documentation (1 hour)
- [ ] docs/ordenes-pedidos.qmd
- [ ] Ejemplos React integration
- [ ] Diagramas de estado

---

## References

- Backend Implementation: `tienda/views.py:PedidoViewSet`
- Serializers: `tienda/serializers.py:PedidoSerializer`
- Models: `tienda/models.py:Pedido, DetalleVenta`
- Tests: `tienda/tests.py:PedidoApiTests`

---

**Version**: 1.0.0  
**Status**: Specification Complete  
**Last Updated**: 2026-05-27  
**Owner**: Backend Team
