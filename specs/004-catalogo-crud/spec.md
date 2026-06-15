# Feature Specification: Catalog CRUD Operations

**Feature Branch**: `004-catalogo-crud`  
**Created**: 2026-05-27  
**Status**: In Progress  
**Priority**: P1 (Blocker for Frontend)  
**Input**: Constitution requirements, endpoints-completos.md mapping

## Overview

Implementación completa de operaciones CRUD (Create, Read, Update, Delete) para el catálogo de productos con validaciones, filtrado, búsqueda y paginación.

---

## User Scenarios & Testing (P0 Acceptance)

### User Story 1 - Browse Product Catalog (Priority: P0)

As a student or visitor, I want to see a paginated list of products filtered by category so that I can browse efficiently.

**Acceptance Scenarios**:

1. **Given** there are 15 products in the database, **When** a user accesses `/productos/`, **Then** they receive the first page with 10 items and pagination info.
2. **Given** a user filters by `categoria=TEXTIL`, **When** they request `/productos/?categoria=TEXTIL`, **Then** only products in that category are returned.
3. **Given** a user searches for "Camiseta", **When** they request `/productos/?search=Camiseta`, **Then** products matching that name are returned.
4. **Given** a user orders by price, **When** they request `/productos/?ordering=-precio`, **Then** products are sorted by price descending.

---

### User Story 2 - View Product Details

As a customer, I want to see all details of a specific product including stock and pricing so that I can decide whether to purchase.

**Acceptance Scenarios**:

1. **Given** Product ID 5 exists, **When** accessing `/productos/5/`, **Then** all product fields are returned including `codigo`, `stock`, `categoria`.
2. **Given** a product is inactive (`is_activo=False`), **When** a public user requests it, **Then** a 404 is returned.

---

### User Story 3 - Create Product (Admin Only)

As an administrator or bodeguero, I want to create new products with complete information so that the catalog stays updated.

**Acceptance Scenarios**:

1. **Given** I'm authenticated as ADMIN, **When** I POST to `/productos/` with valid data, **Then** a new product is created with `201` response.
2. **Given** I'm an unauthenticated user, **When** I try to POST to `/productos/`, **Then** I receive a `401` Unauthorized error.
3. **Given** I submit a product without required fields (e.g., `nombre`), **When** I POST to `/productos/`, **Then** I receive a `400` Bad Request with error details.

---

### User Story 4 - Update Product (Admin Only)

As an administrator, I want to update product information (price, stock, description) so that the catalog reflects current state.

**Acceptance Scenarios**:

1. **Given** I'm authenticated and Product ID 3 exists, **When** I PUT `/productos/3/` with updated `precio=15.00`, **Then** the product is updated and `200` is returned.
2. **Given** I'm an unauthenticated user, **When** I try to PUT a product, **Then** I receive a `401` Unauthorized error.
3. **Given** I try to update a non-existent product, **When** I PUT `/productos/999/`, **Then** I receive a `404` Not Found error.

---

### User Story 5 - Delete Product (Admin Only)

As an administrator, I want to delete products that are no longer available.

**Acceptance Scenarios**:

1. **Given** I'm authenticated as ADMIN and Product ID 2 exists, **When** I DELETE `/productos/2/`, **Then** the product is deleted and `204` No Content is returned.
2. **Given** a product has active orders referencing it, **When** I try to DELETE, **Then** validation prevents deletion with error message.

---

## Requirements (Mandatory)

### Functional Requirements

| ID | Requirement | Priority |
|-----|------------|----------|
| FR-001 | List all active products with pagination (10 items per page) | P0 |
| FR-002 | Filter products by: categoria, is_activo, precio_min, precio_max | P0 |
| FR-003 | Search products by name and description | P0 |
| FR-004 | Order products by: nombre, precio, fecha_creacion | P0 |
| FR-005 | Retrieve detailed product info by ID | P0 |
| FR-006 | Create new products (authenticated users only) | P0 |
| FR-007 | Update product fields: nombre, descripcion, precio, stock, categoria, is_activo | P0 |
| FR-008 | Delete products (with referential integrity checks) | P0 |
| FR-009 | Validate stock cannot be negative | P0 |
| FR-010 | Validate precio > 0 | P0 |
| FR-011 | Return external image URLs in responses | P0 |
| FR-012 | Track product creation timestamp | P0 |
| FR-013 | Soft delete via is_activo flag (public queries exclude is_activo=False) | P0 |

### Non-Functional Requirements

| ID | Requirement |
|-----|------------|
| NFR-001 | List endpoint response time < 200ms |
| NFR-002 | Search response time < 300ms |
| NFR-003 | Database indexes on: nombre, categoria, precio |
| NFR-004 | Support for 1000+ products without performance degradation |
| NFR-005 | CORS enabled for frontend (localhost:3000, :5173) |

### Permission Matrix

| Endpoint | GET | POST | PUT | DELETE | Notes |
|----------|-----|------|-----|--------|-------|
| `/productos/` | Public | Authenticated | - | - | Lectura pública, creación requiere auth |
| `/productos/{id}/` | Public | - | Authenticated | Authenticated | CRUD para admin/bodeguero |

---

## Success Criteria

### Measurable Outcomes

| Criterion | Target |
|-----------|--------|
| SC-001 | 100% of product CRUD operations tested |
| SC-002 | List endpoint response time < 200ms for 1000 products |
| SC-003 | 0 unhandled exceptions in CRUD operations |
| SC-004 | All validation errors return appropriate HTTP status codes |
| SC-005 | Inactive products excluded from public list |
| SC-006 | Search returns relevant results within 300ms |

---

## Data Model: Producto

```python
class Producto(models.Model):
    # Identificación
    codigo = CharField(max_length=20, unique=True, nullable)
    nombre = CharField(max_length=150, required)
    descripcion = TextField(required)
    
    # Precios y Stock
    precio = DecimalField(max_digits=10, decimal_places=2, required, min=0.01)
    stock = IntegerField(default=0, required, min=0)
    
    # Categorización
    categoria = CharField(choices=CategoriaProducto, default='SOUVENIR')
    medida = CharField(choices=Medida, default='UNIDAD')
    
    # Metadatos
    aplica_impuesto = BooleanField(default=True)
    is_activo = BooleanField(default=True)
    vencimiento = DateField(nullable)
    imagen_url = URLField(nullable)
    fecha_creacion = DateTimeField(auto_now_add=True)
```

---

## API Endpoints

### GET /productos/ (List)

```
Lectura Pública | Paginación: 10 items/page
```

**Query Parameters**:
- `page`: Número de página (default: 1)
- `categoria`: Filtrar por categoría (AGRICOLA, INSTITUCIONAL, etc.)
- `search`: Búsqueda en nombre y descripción
- `ordering`: Campo para ordenar (+nombre, -precio, +fecha_creacion)
- `precio_min`, `precio_max`: Rango de precios

**Response (200)**:
```json
{
  "count": 45,
  "next": "http://api/productos/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "codigo": "CAM-001",
      "nombre": "Camiseta UNL",
      "descripcion": "Camiseta oficial de la UNL",
      "precio": "15.00",
      "stock": 50,
      "categoria": "TEXTIL",
      "medida": "UNIDAD",
      "aplica_impuesto": true,
      "is_activo": true,
      "imagen_url": "https://example.com/camiseta.jpg",
      "fecha_creacion": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /productos/{id}/ (Retrieve)

**Response (200)**:
```json
{
  "id": 1,
  "codigo": "CAM-001",
  "nombre": "Camiseta UNL",
  "descripcion": "Camiseta oficial de la UNL",
  "precio": "15.00",
  "stock": 50,
  "categoria": "TEXTIL",
  "medida": "UNIDAD",
  "aplica_impuesto": true,
  "is_activo": true,
  "imagen_url": "https://example.com/camiseta.jpg",
  "fecha_creacion": "2024-01-15T10:30:00Z"
}
```

**Error (404)**: Producto no encontrado o inactivo

---

### POST /productos/ (Create)

**Autenticación requerida**: Sí

**Request**:
```json
{
  "codigo": "CAM-002",
  "nombre": "Gorra UNL",
  "descripcion": "Gorra oficial negra",
  "precio": "12.50",
  "stock": 100,
  "categoria": "TEXTIL",
  "medida": "UNIDAD",
  "aplica_impuesto": true,
  "is_activo": true,
  "imagen_url": "https://example.com/gorra.jpg"
}
```

**Response (201)**:
```json
{
  "id": 2,
  "codigo": "CAM-002",
  "nombre": "Gorra UNL",
  "descripcion": "Gorra oficial negra",
  "precio": "12.50",
  "stock": 100,
  "categoria": "TEXTIL",
  "medida": "UNIDAD",
  "aplica_impuesto": true,
  "is_activo": true,
  "imagen_url": "https://example.com/gorra.jpg",
  "fecha_creacion": "2024-05-27T14:22:00Z"
}
```

**Errores (400)**:
```json
{
  "precio": ["Asegúrate de que este valor sea mayor o igual a 0.01."],
  "stock": ["Asegúrate de que este valor sea mayor o igual a 0."],
  "nombre": ["Este campo no puede estar vacío."]
}
```

**Error (401)**: No autenticado

---

### PUT /productos/{id}/ (Update)

**Autenticación requerida**: Sí

**Request** (actualización parcial):
```json
{
  "precio": "14.99",
  "stock": 45
}
```

**Response (200)**:
```json
{
  "id": 1,
  "codigo": "CAM-001",
  "nombre": "Camiseta UNL",
  "descripcion": "Camiseta oficial de la UNL",
  "precio": "14.99",
  "stock": 45,
  "categoria": "TEXTIL",
  "medida": "UNIDAD",
  "aplica_impuesto": true,
  "is_activo": true,
  "imagen_url": "https://example.com/camiseta.jpg",
  "fecha_creacion": "2024-01-15T10:30:00Z"
}
```

**Error (404)**: Producto no encontrado  
**Error (401)**: No autenticado

---

### DELETE /productos/{id}/ (Delete)

**Autenticación requerida**: Sí

**Response (204)**: No Content (sin body)

**Error (404)**: Producto no encontrado  
**Error (401)**: No autenticado  
**Error (409)**: Conflicto - Producto referenciado en órdenes activas

---

## Implementation Checklist

### Phase 1: Validators & Serializers (Complete ✓)
- [x] ProductoSerializer con validaciones
- [x] Validar precio > 0
- [x] Validar stock >= 0
- [x] Validar unicidad de código

### Phase 2: ViewSet & Permissions (Complete ✓)
- [x] ProductoViewSet con CRUD
- [x] Permisos IsAuthenticatedOrReadOnly
- [x] Filtrado por categoria
- [x] Búsqueda por nombre
- [x] Ordenamiento por múltiples campos

### Phase 3: Paginación & Filtering (Complete ✓)
- [x] DjangoFilterBackend para filtros
- [x] SearchFilter para búsqueda
- [x] OrderingFilter para ordenamiento
- [x] Paginación automática

### Phase 4: Tests (In Progress)
- [ ] Test: GET /productos/ listar todos
- [ ] Test: GET /productos/ con filtros
- [ ] Test: GET /productos/ con búsqueda
- [ ] Test: GET /productos/{id}/ detalle
- [ ] Test: POST /productos/ crear (auth)
- [ ] Test: POST /productos/ crear sin auth
- [ ] Test: PUT /productos/{id}/ actualizar
- [ ] Test: DELETE /productos/{id}/ eliminar
- [ ] Test: Validaciones de precio y stock

### Phase 5: Documentation (To Do)
- [ ] docs/catalogo-productos.qmd
- [ ] Ejemplos de React integration
- [ ] Guía de filtrado y búsqueda

---

## References

- Backend Implementation: `tienda/views.py:ProductoViewSet`
- Serializer: `tienda/serializers.py:ProductoSerializer`
- URLs: `tienda/urls.py` (router registration)
- Tests: `tienda/tests.py:ProductoApiTests`
- Model: `tienda/models.py:Producto`

---

**Version**: 1.0.0  
**Status**: In Development  
**Last Updated**: 2026-05-27  
**Owner**: Backend Team
