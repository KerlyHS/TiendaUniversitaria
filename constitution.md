# TiendaUniversitaria - Project Constitution

**Versión:** 1.5.0  
**Última ac
✅ Corriendo en: http://localhost:8000
✅ API disponible en: http://localhost:8000/api/v1/
✅ Admin panel: http://localhost:8000/admin/tualización:** Marzo 2026  
**Status:** ✅ Production

## 1. Propósito del Proyecto

Desarrollar un sistema de gestión de tienda universitaria con capacidades de:
- Catálogo de productos
- Gestión de usuarios con múltiples roles
- Sistema de órdenes y pedidos
- Autenticación y autorización con JWT
- APIs REST completas con documentación Quarto

## 2. Stack Tecnológico

### Backend
- **Framework:** Django 6.0.4
- **API:** Django REST Framework 3.15.1
- **Autenticación:** djangorestframework-simplejwt 5.5.1 (JWT)
- **Base de Datos:** SQLite (dev), PostgreSQL (production)
- **CORS:** django-cors-headers 4.3.1
- **Filtrado:** django-filter 25.2

### Frontend (Guía de Integración)
- **Framework:** React 18+
- **State Management:** React Hooks
- **HTTP Client:** Axios
- **Documentation:** Quarto/HTML

## 3. Estructura del Proyecto

```
TiendaUniversitaria/
├── core/                           # Configuración Django
│   ├── settings.py                # Configuración principal
│   ├── urls.py                    # URLs globales
│   ├── wsgi.py / asgi.py         # Deployment
│   └── __init__.py
├── tienda/                         # Aplicación principal
│   ├── models.py                  # Modelos de BD (Producto, Usuario, Pedido, etc)
│   ├── serializers.py             # Serializers REST (validación, transformación)
│   ├── views.py                   # ViewSets y API endpoints
│   ├── tests.py                   # Suite de tests (56 tests)
│   ├── urls.py                    # Rutas de la aplicación
│   ├── migrations/                # Migraciones de BD
│   └── admin.py                   # Admin interface
├── specs/                          # Especificaciones por feature
│   ├── 001-user-registration-lopdp/
│   │   ├── spec.md               # Especificación funcional
│   │   ├── plan.md               # Plan de implementación
│   │   ├── tasks.md              # Desglose de tareas
│   │   └── checklists/
│   ├── 002-product-catalog/
│   └── 005-ordenes-pedidos/      # ✨ Nuevo sistema de órdenes
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
├── docs/                          # Documentación Quarto
│   ├── catalogo-productos.qmd    # Guía de catálogo
│   ├── ordenes-pedidos.qmd       # Guía de órdenes ✨
│   └── [otras guías]
├── manage.py                      # Django management
├── requirements.txt               # Dependencias Python
├── db.sqlite3                     # BD de desarrollo
└── README.md                      # Guía del proyecto
```

## 4. Modelos Principales

### Usuario
```python
class Usuario:
    - username: Email único
    - email: Email
    - nombre_completo: Nombre del usuario
    - rol: ADMINISTRADOR | CLIENTE | CAJERO | BODEGUERO | GERENTE | SUPERVISOR
    - fecha_registro: Timestamp
    - is_active: Estado del usuario
```

**Roles y Permisos:**
| Rol | Create Order | List All Orders | Update Status | Manage Products |
|-----|---|---|---|---|
| ADMINISTRADOR | ✅ | ✅ | ✅ | ✅ |
| CLIENTE | ✅ | Own | ❌ | ❌ |
| BODEGUERO | ❌ | ✅ | ✅ | ❌ |
| CAJERO | ❌ | ✅ | ✅ | ❌ |
| GERENTE | ❌ | ✅ | ✅ | ✅ |
| SUPERVISOR | ❌ | ✅ | ❌ | ❌ |

### Producto
```python
class Producto:
    - codigo: SKU único
    - nombre: Nombre del producto
    - descripcion: Descripción
    - precio: Precio unitario (Decimal)
    - stock: Cantidad disponible
    - categoria: Categoría (TEXTIL, ACCESORIOS, etc)
    - aplica_impuesto: Boolean (IVA 12%)
    - is_activo: Estado
    - imagen_url: URL de imagen
```

### Pedido (✨ Nuevo)
```python
class Pedido:
    - numero_pedido: P-YYYYMMDD-XXX (único)
    - cliente: FK Usuario
    - estado: RECIBIDO | PREPARACION | LISTO | ENTREGADO | CANCELADO
    - tipo_entrega: TIENDA | DOMICILIO
    - subtotal: Decimal
    - impuesto: Decimal (12% si producto.aplica_impuesto)
    - total: Decimal
    - fecha_creacion: Timestamp
    - fecha_modificacion: Timestamp
```

### DetalleVenta
```python
class DetalleVenta:
    - venta: FK Venta (nullable, para venta completada)
    - pedido: FK Pedido (nullable, para orden actual) ✨
    - producto: FK Producto
    - nombre_producto: Snapshot del nombre
    - cantidad: Cantidad comprada
    - precio_unitario: Precio histórico
    - subtotal: cantidad * precio_unitario
```

## 5. APIs REST - Endpoints Principales

### Autenticación
- `POST /api/token/` - Obtener JWT
- `POST /api/token/refresh/` - Refrescar token

### Usuarios
- `POST /api/register/` - Registro de usuarios
- `GET /api/users/` - Listar usuarios (Admin)
- `GET /api/users/{id}/` - Detalle usuario

### Productos
- `GET /api/productos/` - Listar productos (filtrado, búsqueda, ordenamiento)
- `POST /api/productos/` - Crear producto (Admin)
- `GET /api/productos/{id}/` - Detalle producto
- `PUT /api/productos/{id}/` - Actualizar producto (Admin)
- `DELETE /api/productos/{id}/` - Borrar producto (Admin)

### Órdenes ✨ (Nuevo)
- `POST /api/pedidos/` - Crear orden con validación de stock
- `GET /api/pedidos/` - Listar órdenes (auto-filtering por rol)
- `GET /api/pedidos/{id}/` - Detalle de orden
- `PUT /api/pedidos/{id}/` - Actualizar estado (máquina de estados)
- `DELETE /api/pedidos/{id}/` - ❌ No permitido (405)

**Máquina de Estados:**
```
RECIBIDO ←→ PREPARACION ←→ LISTO ←→ ENTREGADO
    ↓              ↓          ↓          ↓
CANCELADO ← CANCELADO ← CANCELADO ← CANCELADO
```

## 6. Especificaciones por Feature

### Spec-001: User Registration with LOPDP
- **Status:** ✅ Completado
- **Tests:** 16 (100% pass rate)
- **Documentación:** [spec.md](specs/001-user-registration-lopdp/spec.md)

### Spec-002: Product Catalog
- **Status:** ✅ Completado
- **Tests:** 25 (100% pass rate)
- **Documentación:** [catalogo-productos.qmd](docs/catalogo-productos.qmd)

### Spec-005: Sistema de Órdenes/Pedidos ✨
- **Status:** ✅ Completado
- **Tests:** 15 (100% pass rate) + 41 regresión = 56 total
- **Documentación:** [ordenes-pedidos.qmd](docs/ordenes-pedidos.qmd)
- **Características:**
  - Generación automática de números de pedido únicos
  - Validación de stock atómica (race condition safe)
  - Transiciones de estado validadas
  - Cálculo automático de impuestos
  - Auto-filtering de órdenes por rol
  - Liberación de stock en cancelación

## 7. Development Workflow

### Crear Nueva Especificación
1. Crear directorio `specs/{number}-{feature}/`
2. Crear archivos: `spec.md`, `plan.md`, `tasks.md`
3. Implementar código siguiendo especificación
4. Escribir tests para cada tarea
5. Crear documentación Quarto
6. Agregar referencia en `constitution.md`

### Testing
```bash
# Correr todos los tests
python manage.py test tienda.tests -v 0

# Correr tests específicos
python manage.py test tienda.tests.PedidoApiTests -v 2

# Con coverage
coverage run --source='tienda' manage.py test
coverage report
```

### Servir Localmente
```bash
python manage.py runserver
# API disponible en http://localhost:8000/api/
```

## 8. Estándares de Código

### Python/Django
- Usar type hints donde sea posible
- Docstrings en formato Google
- Tests para todo nuevo código
- PEP8 compliance (máx 100 caracteres)

### API Responses
- Todos los endpoints retornan JSON
- Incluir `id` en respuestas
- Error responses con `detail` field
- Usar HTTP status codes apropiados

### Validación
- Serializer-level validation en DRF
- Custom validators donde sea necesario
- Mensajes de error específicos
- Atomic transactions para operaciones críticas

## 9. Performance y Seguridad

### Database
- Índices en claves de búsqueda frecuentes
- select_related() y prefetch_related() para evitar N+1
- Transactions atómicas para operaciones críticas

### Autenticación
- JWT tokens con expiración (24h access, 7d refresh)
- Tokens refresh automático
- CORS configurado para localhost:3000 y :5173

### Stock Management
- Validación atómica con transaction.atomic()
- Prevención de overselling mediante locks
- Liberación de stock en estado CANCELADO

## 10. Deployment

### Pre-production Checklist
- ✅ Todos los tests pasan (56/56)
- ✅ No hay warnings en compilación
- ✅ Base de datos migrada completamente
- ✅ Secretos configurados en variables de entorno
- ✅ ALLOWED_HOSTS actualizado
- ✅ DEBUG = False en producción

### Production Environment
```bash
# Database: PostgreSQL
# Server: Gunicorn + Nginx
# Logging: Structured JSON logs
# Monitoring: Health check endpoints
```

## 11. Roadmap Futuro

### Short-term (Próximo mes)
- [ ] Spec-003: Sistema de Pagos
- [ ] Spec-004: Reportes y Analytics
- [ ] Implementar WebSockets para notificaciones en tiempo real

### Medium-term (Q2 2026)
- [ ] Mobile app (React Native)
- [ ] Multi-tenancy para múltiples tiendas
- [ ] Integración con sistemas de pago externos (PayPal, Stripe)

### Long-term (Q3-Q4 2026)
- [ ] AI-powered recomendaciones de productos
- [ ] Inventory forecasting
- [ ] Marketplace de vendedores externos

## 12. Referencias Útiles

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [JWT Authentication](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Quarto Documentation](https://quarto.org/)
- [React Documentation](https://react.dev/)

---

**Mantenido por:** Backend Development Team  
**Última revisión:** Marzo 2026  
**Próxima revisión prevista:** Junio 2026
