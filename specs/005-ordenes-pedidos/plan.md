# Implementation Plan: Order Management System

**Feature**: 005-ordenes-pedidos  
**Timeline**: 9 hours over 4 phases  
**Start Date**: 2026-05-27  
**Target Completion**: 2026-05-28

---

## Overview

Plan de implementación del sistema completo de órdenes/pedidos con gestión de estado, validación de stock y seguimiento de transacciones.

---

## Phase 1: Data Model Enhancement (1.5 hours)

### Objectives
- Mejorar modelo Pedido con campo numero_pedido único
- Agregar timestamps de modificación
- Validar relaciones con Usuario y DetalleVenta

### Key Changes

**tienda/models.py - Pedido**:
```python
class Pedido(models.Model):
    numero_pedido = CharField(max_length=20, unique=True)  # NEW: P-20260527-001
    # ... resto de campos existentes
    subtotal = DecimalField(max_digits=10, decimal_places=2, default=0.00)  # NEW
    impuesto = DecimalField(max_digits=10, decimal_places=2, default=0.00)  # NEW
    total = DecimalField(max_digits=10, decimal_places=2, default=0.00)     # NEW
    fecha_creacion = DateTimeField(auto_now_add=True)  # NEW
    fecha_modificacion = DateTimeField(auto_now=True)  # NEW
```

**tienda/models.py - DetalleVenta**:
```python
class DetalleVenta(models.Model):
    # Campos históricos para preservar precios de la venta
    nombre_producto = CharField(max_length=255)  # Snapshot
    precio_unitario_snapshot = DecimalField(...)  # Precio al momento
    subtotal = DecimalField(...)  # cantidad * precio
```

### Deliverables
- Modelos mejorados
- Migración creada y aplicada
- No hay pérdida de datos existentes

---

## Phase 2: Serializers & Business Logic (2 hours)

### Objectives
- PedidoSerializer con validaciones completas
- DetalleVentaSerializer para items
- Lógica de cálculo de totales
- Generación automática de número de pedido

### Implementation Details

**tienda/serializers.py - PedidoSerializer**:
```python
class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre_completo', read_only=True)
    
    class Meta:
        model = Pedido
        fields = ['id', 'numero_pedido', 'cliente', 'cliente_nombre', 'estado', 
                  'tipo_entrega', 'subtotal', 'impuesto', 'total', 'detalles', 
                  'fecha_creacion', 'fecha_modificacion']
        read_only_fields = ['id', 'numero_pedido', 'subtotal', 'impuesto', 'total', 
                           'fecha_creacion', 'fecha_modificacion']
    
    def validate_detalles(self, value):
        # Validar stock para cada producto
        for detalle in value:
            producto = detalle['producto']
            cantidad = detalle['cantidad']
            if producto.stock < cantidad:
                raise ValidationError(
                    f"Stock insuficiente: {producto.nombre}. "
                    f"Disponible: {producto.stock}, Solicitado: {cantidad}"
                )
        return value
    
    def create(self, validated_data):
        # Generar número de pedido
        numero_pedido = generate_order_number()
        
        # Crear pedido
        pedido = Pedido.objects.create(
            numero_pedido=numero_pedido,
            cliente=self.context['request'].user,
            **{k: v for k, v in validated_data.items() if k != 'detalles'}
        )
        
        # Crear detalles y actualizar totales
        for detalle in validated_data.get('detalles', []):
            DetalleVenta.objects.create(pedido=pedido, **detalle)
            
            # Reducir stock
            producto = detalle['producto']
            producto.stock -= detalle['cantidad']
            producto.save()
            
            # Calcular totales
            subtotal = detalle['cantidad'] * producto.precio
            pedido.subtotal += subtotal
            if producto.aplica_impuesto:
                pedido.impuesto += subtotal * 0.12
        
        pedido.total = pedido.subtotal + pedido.impuesto
        pedido.save()
        
        return pedido
```

### Deliverables
- Serializers con validaciones completas
- Lógica de cálculo de totales
- Generación automática de número de pedido
- Manejo de errores

---

## Phase 3: ViewSets & Permissions (2.5 hours)

### Objectives
- PedidoViewSet con CRUD completo
- Permisos: Clientes ven solo sus pedidos
- Admins actualizan estado
- Transiciones de estado validadas

### Implementation Details

**tienda/views.py - PedidoViewSet**:
```python
class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Clientes ven solo sus pedidos
        if user.rol != 'ADMIN':
            return Pedido.objects.filter(cliente=user)
        # Admins ven todos
        return Pedido.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)
    
    def perform_update(self, serializer):
        # Validar transiciones de estado
        old_estado = self.get_object().estado
        new_estado = serializer.validated_data.get('estado', old_estado)
        
        valid_transitions = {
            'RECIBIDO': ['PREPARACION', 'CANCELADO'],
            'PREPARACION': ['LISTO', 'CANCELADO'],
            'LISTO': ['ENTREGADO', 'CANCELADO'],
            'ENTREGADO': [],
            'CANCELADO': []
        }
        
        if new_estado not in valid_transitions.get(old_estado, []):
            raise ValidationError(f"Transición inválida: {old_estado} → {new_estado}")
        
        # Si se cancela, liberar stock
        if new_estado == 'CANCELADO' and old_estado != 'CANCELADO':
            for detalle in self.get_object().detalles.all():
                producto = detalle.producto
                producto.stock += detalle.cantidad
                producto.save()
        
        serializer.save()
```

### URL Registration
```python
# tienda/urls.py
router.register(r'pedidos', PedidoViewSet, basename='pedido')
```

### Deliverables
- ViewSet completo con CRUD
- Auto-filtering por usuario
- Validación de transiciones de estado
- Manejo de stock en cancelación

---

## Phase 4: Testing & Documentation (3 hours)

### Objectives
- 12-15 test cases exhaustivos
- docs/ordenes-pedidos.qmd con ejemplos
- Performance validated

### Test Cases

```python
class PedidoApiTests(TestCase):
    # Create Tests (4)
    def test_create_order_success()  # 201
    def test_create_order_insufficient_stock()  # 400
    def test_create_order_unauthenticated()  # 401
    def test_create_order_multiple_items()
    
    # List Tests (3)
    def test_list_own_orders()  # Cliente ve solo sus
    def test_list_all_orders()  # Admin ve todos
    def test_list_filter_by_estado()
    
    # Retrieve Tests (2)
    def test_retrieve_own_order()  # 200
    def test_retrieve_other_order()  # 404 (forbidden)
    
    # Update Tests (3)
    def test_update_order_status_recibido_to_prep()
    def test_update_order_invalid_transition()  # 400
    def test_cancel_order_and_release_stock()
    
    # Edge Cases (2)
    def test_concurrent_orders_stock_conflict()
    def test_order_number_uniqueness()
```

### Documentation

**docs/ordenes-pedidos.qmd** (similar a catalogo-productos.qmd):
- Overview del sistema de órdenes
- 5 endpoints documentados con ejemplos
- React integration examples
- Diagrama de estados
- Handling de errores

### Deliverables
- 15 tests automatizados (100% passing)
- Documentación Quarto
- Benchmarks de performance

---

## Resource Allocation

| Phase | Duration | Key Files | Owner |
|-------|----------|-----------|-------|
| 1 | 1.5h | tienda/models.py | Backend |
| 2 | 2h | tienda/serializers.py | Backend |
| 3 | 2.5h | tienda/views.py, urls.py | Backend |
| 4 | 3h | tienda/tests.py, docs/ | QA/Backend |

---

## Critical Path

```
Phase 1 (1.5h)
    ↓
Phase 2 (2h)
    ↓
Phase 3 (2.5h)
    ↓
Phase 4 (3h)
    ↓
TOTAL: 9 hours
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Tests passing | 15/15 (100%) | ⏳ |
| Response time (create) | < 500ms | ⏳ |
| Response time (list) | < 200ms | ⏳ |
| Stock accuracy | 100% | ⏳ |
| Documentation | Complete | ⏳ |

---

## Risk Management

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Stock race condition | High | Use database transactions, lock mechanism |
| Invalid state transitions | High | Validate all transitions in serializer |
| Concurrent creates | Medium | Test with multiple simultaneous requests |
| Data consistency | High | Use atomic transactions in create/update |

---

## Next Steps After Completion

1. ✅ Sistema de órdenes completado
2. 🔄 Comenzar Spec-006: Carrito de compras
3. 🔄 Comenzar Spec-007: Sistema de pago (PrimeiroPay)
4. ⏳ Implementar Frontend React integration

---

## Notes

- Modelos ya existen; necesitamos mejorar y agregar fields
- Stock management requiere atención a race conditions
- Transiciones de estado deben estar centralizadas
- Documentación debe incluir diagrama de máquina de estados

**Version**: 1.0.0  
**Last Updated**: 2026-05-27  
**Owner**: Backend Team  
**Status**: Planning Complete
