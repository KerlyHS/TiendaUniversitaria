# Implementation Plan: Catalog CRUD Operations

**Feature**: 004-catalogo-crud  
**Timeline**: 12 hours over 5 phases  
**Start Date**: 2026-05-27  
**Target Completion**: 2026-05-28

---

## Overview

Plan de implementación para completar el CRUD del catálogo de productos con filtrado, búsqueda, ordenamiento y documentación Quarto.

---

## Phase 1: Model Validation (1 hour)

### Objectives
- ✅ Verificar modelo Producto (ya existe)
- ✅ Confirmar validaciones (precio > 0, stock >= 0)
- ✅ Confirmar índices de base de datos

### Deliverables
- Modelo Producto con campos correctos
- Validaciones en serializer
- Índices creados

### Resources Required
- tienda/models.py (revisar)
- tienda/serializers.py (revisar ProductoSerializer)

---

## Phase 2: Serializer & ViewSet (2 hours)

### Objectives
- ✅ ProductoSerializer con validaciones completas
- ✅ ProductoViewSet con permisos IsAuthenticatedOrReadOnly
- ✅ Registrar rutas en tienda/urls.py

### Deliverables
```
✅ GET /productos/ (lista pública, paginada)
✅ GET /productos/{id}/ (detalle público)
✅ POST /productos/ (crear, requiere auth)
✅ PUT /productos/{id}/ (actualizar, requiere auth)
✅ DELETE /productos/{id}/ (borrar, requiere auth)
```

### Implementation Details
```python
# tienda/views.py - ProductoViewSet
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.filter(is_activo=True)
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    # Filtering y Search automáticos via FilterBackends
```

---

## Phase 3: Filtering & Search (1 hour)

### Objectives
- ✅ Configurar DjangoFilterBackend
- ✅ Configurar SearchFilter
- ✅ Configurar OrderingFilter
- ✅ Paginación automática (10 items/page)

### Query Examples
```
GET /productos/ → Lista pagina 1
GET /productos/?categoria=TEXTIL → Filtrar por categoría
GET /productos/?search=Camiseta → Buscar por nombre
GET /productos/?ordering=-precio → Ordenar por precio desc
GET /productos/?page=2 → Página 2
```

### Resources
- core/settings.py (ya configurado)
- tienda/urls.py (router.register)

---

## Phase 4: Comprehensive Testing (5 hours)

### Test Cases (13 total)

#### List & Filter Tests (3)
- [x] test_list_products → Verify pagination + all active products
- [ ] test_filter_by_categoria → Filter results
- [ ] test_search_by_nombre → Search results

#### Retrieve Tests (1)
- [x] test_retrieve_product_detail → GET /{id}/

#### Create Tests (3)
- [ ] test_create_product_authenticated → 201 + data saved
- [ ] test_create_product_unauthorized → 401/403
- [ ] test_create_product_invalid → 400 + error messages

#### Update Tests (2)
- [ ] test_update_product_authenticated → 200 + updated
- [ ] test_update_product_unauthorized → 401/403

#### Delete Tests (2)
- [ ] test_delete_product_authenticated → 204 + removed
- [ ] test_delete_product_unauthorized → 401/403

#### Validation Tests (2)
- [ ] test_create_product_invalid_price → precio < 0.01
- [ ] test_create_product_invalid_stock → stock < 0

### Test Code Location
`tienda/tests.py` → class ProductoApiTests

### Run Tests
```bash
python manage.py test tienda.tests.ProductoApiTests -v 2
# Expected: 13/13 passing
```

---

## Phase 5: Quarto Documentation (3 hours)

### Deliverables

#### 📄 docs/catalogo-productos.qmd
- Descripción del catálogo
- 7 ejemplos de endpoints (GET, POST, PUT, DELETE, Filter, Search)
- React integration examples
- Manejo de paginación en frontend
- Error handling
- Mermaid diagrams (ER, State, Flowchart)

#### Example Structure
```markdown
# Catálogo de Productos - TiendaUniversitaria

## 1. Descripción General

## 2. Operaciones CRUD
### GET /productos/ (List)
### GET /productos/{id}/ (Retrieve)
### POST /productos/ (Create)
### PUT /productos/{id}/ (Update)
### DELETE /productos/{id}/ (Delete)

## 3. Filtrado y Búsqueda
### Filtrar por Categoría
### Buscar por Nombre
### Ordenar Resultados
### Paginación

## 4. Integración React
### Listar Productos
### Buscar y Filtrar
### Crear Producto
### Actualizar Producto
### Eliminar Producto

## 5. Manejo de Errores

## 6. Ejemplos Completos
```

#### Generation & Validation
```bash
quarto render docs/catalogo-productos.qmd --to html
# Verify: docs/_output/catalogo-productos.html generated successfully
```

---

## Resource Allocation

| Phase | Duration | Key Files | Owner |
|-------|----------|-----------|-------|
| 1 | 1h | tienda/models.py | Backend |
| 2 | 2h | tienda/serializers.py, views.py, urls.py | Backend |
| 3 | 1h | core/settings.py (review) | DevOps |
| 4 | 5h | tienda/tests.py | QA/Backend |
| 5 | 3h | docs/catalogo-productos.qmd | Docs/Backend |

---

## Critical Path

```
Phase 1 (1h)
    ↓
Phase 2 (2h)
    ↓
Phase 3 (1h)
    ↓
Phase 4 & 5 (parallel, 5h + 3h)
    ↓
TOTAL: 12 hours (1.5 days)
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Tests passing | 13/13 (100%) | 🔄 2/13 |
| Response time (list) | < 200ms | ✅ |
| Response time (search) | < 300ms | ✅ |
| Documentation | Complete with examples | ⏳ |
| Code coverage | 100% ProductoViewSet | 🔄 |

---

## Risk Management

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Database performance | High | Create indexes on nombre, categoria, precio |
| Missing test cases | Medium | Use checklist from spec.md |
| Quarto render fails | Low | Test syntax locally before commit |
| Permission issues | Medium | Test unauthenticated access explicitly |

---

## Next Steps After Completion

1. ✅ Catálogo CRUD completado
2. 🔄 Começar Spec-005: Órdenes/Pedidos
3. 🔄 Comenzar Spec-006: Sistema de Pago (PrimeiroPay)
4. ⏳ Implementar Frontend React integration

---

## Notes

- El modelo Producto ya existe (creado en Spec-002)
- El ViewSet ya existe con permisos básicos
- Los filtros ya están configurados en settings.py
- Necesitamos expandir tests y crear documentación

**Version**: 1.0.0  
**Last Updated**: 2026-05-27  
**Owner**: Backend Team  
**Status**: In Progress
