# ESTADO DE IMPLEMENTACIÓN - Plan de Acción

**Generado:** 2026-05-27  
**Basado en:** Spec-Kit v1.1.0, Constitution v1.1.0, Endpoints-Completos v1.0

---

## 📊 RESUMEN EJECUTIVO

```
┌─────────────────────────────────────────────────────────┐
│ COBERTURA GLOBAL: 40% (10/25 endpoints)                 │
├─────────────────────────────────────────────────────────┤
│ ✅ IMPLEMENTADO:        10 endpoints (40%)               │
│ ⚠️  PARCIAL:             4 endpoints (16%)               │
│ ❌ PENDIENTE:            11 endpoints (44%)              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 MATRIZ DE PRIORIZACIÓN

### 🔴 P0 - BLOQUEANTE (Debe hacerse antes de producción)

| # | Endpoint | Status | Razón | ETA |
|----|----------|--------|--------|-----|
| 1 | POST `/auth/login/` | ❌ | Autenticación base | Semana 1 |
| 2 | POST `/auth/logout/` | ❌ | Cierre seguro sesión | Semana 1 |
| 3 | GET `/usuarios/me/` | ❌ | Perfil autenticado | Semana 1 |
| 4 | POST `/usuarios/me/` actualización | ❌ | Modificar perfil | Semana 1 |

### 🟠 P1 - CRÍTICA (Debe tener en MVP)

| # | Endpoint | Status | Razón | ETA |
|----|----------|--------|--------|-----|
| 1 | POST `/pedidos/` | ❌ | Crear órdenes | Semana 2 |
| 2 | GET `/pedidos/{id}/` | ❌ | Detalle orden | Semana 2 |
| 3 | PATCH `/pedidos/{id}/estado/` | ❌ | Cambiar estado | Semana 2 |
| 4 | GET `/productos/?search` | ⚠️ | Búsqueda productos | Semana 2 |
| 5 | GET `/productos/?categoria` | ⚠️ | Filtrado categorías | Semana 2 |
| 6 | POST `/auth/refresh/` | ❌ | Renovar token | Semana 1 |

### 🟡 P2 - IMPORTANTE (Debe tener post-MVP)

| # | Endpoint | Status | Razón | ETA |
|----|----------|--------|--------|-----|
| 1 | POST `/ventas/` | ⚠️ | Crear venta | Semana 3 |
| 2 | GET `/ventas/reportes/` | ❌ | Reportes gerenciales | Semana 3 |
| 3 | POST `/caja/apertura/` | ❌ | Abrir caja | Semana 3 |
| 4 | POST `/caja/cierre/` | ❌ | Cerrar caja | Semana 3 |
| 5 | GET `/politica-privacidad/versiones/` | ❌ | Historial políticas | Semana 4 |

### 🟢 P3 - NICE TO HAVE (Futuro)

| # | Endpoint | Status | Razón | ETA |
|----|----------|--------|--------|-----|
| 1 | POST `/promociones/` | ❌ | Crear promociones | Backlog |
| 2 | GET `/usuarios/{id}/` | ❌ | Admin users | Backlog |
| 3 | Búsqueda avanzada | ❌ | UX mejorada | Backlog |

---

## ✅ IMPLEMENTADO (10 Endpoints)

### 1. 📦 Módulo: Catálogo (Spec-002)

**Status:** 100% ✅ COMPLETADO

```
✅ GET    /api/v1/productos/
✅ POST   /api/v1/productos/
✅ GET    /api/v1/productos/{id}/
✅ PUT    /api/v1/productos/{id}/
✅ DELETE /api/v1/productos/{id}/
✅ GET    /api/v1/promociones/
✅ POST   /api/v1/promociones/
```

**Archivos:**
- `tienda/models.py` → `Producto`, `Promocion`
- `tienda/serializers.py` → `ProductoSerializer`, `PromocionSerializer`
- `tienda/views.py` → `ProductoViewSet`, `PromocionViewSet`
- `tienda/urls.py` → Rutas registradas
- `tienda/admin.py` → Admin registrado

**Tests:** ✅ 2/2 pasando

---

### 2. 👤 Módulo: Usuarios - Registro (Spec-001)

**Status:** 100% ✅ COMPLETADO

```
✅ POST   /api/v1/usuarios/registro/
✅ GET    /api/v1/politica-privacidad/
```

**Archivos:**
- `tienda/models.py` → `Usuario`, `PrivacyPolicy`
- `tienda/serializers.py` → `UsuarioSerializer`, `PrivacyPolicySerializer`
- `tienda/views.py` → `UsuarioRegistrationView`, `PrivacyPolicyRetrieveView`
- `tienda/urls.py` → Rutas registradas

**Tests:** ✅ 5/5 pasando

---

## ⚠️ PARCIALMENTE IMPLEMENTADO (4 Endpoints)

### 1. 🛒 Módulo: Pedidos (Incompleto)

**Status:** 60% ⚠️

```
⚠️  GET    /api/v1/pedidos/                (CRUD básico, falta filtrado)
⚠️  POST   /api/v1/pedidos/                (Creación básica, falta validaciones)
⚠️  GET    /api/v1/pedidos/{id}/           (ViewSet, no customizado)
❌ PATCH   /api/v1/pedidos/{id}/estado/    (NO EXISTE)
```

**Archivo:**
- `tienda/models.py` → Modelo `Pedido` definido
- `tienda/views.py` → `PedidoViewSet` básico
- `tienda/serializers.py` → `PedidoSerializer` básico

**Problemas:**
- No hay validación de stock
- No hay cambio de estado
- No hay historial de cambios
- No hay filtrado por usuario

**Tests:** ❌ 0/3 pasando

---

### 2. 💳 Módulo: Ventas (Incompleto)

**Status:** 40% ⚠️

```
⚠️  GET    /api/v1/ventas/
⚠️  POST   /api/v1/ventas/
⚠️  GET    /api/v1/ventas/{id}/
❌ GET    /api/v1/ventas/reportes/
```

**Archivo:**
- `tienda/models.py` → Modelos `Venta`, `DetalleVenta`
- `tienda/views.py` → `VentaViewSet` básico
- `tienda/serializers.py` → `VentaSerializer`, `DetalleVentaSerializer`

**Problemas:**
- No hay integración con PrimeiroPay
- No hay reportes
- No hay validaciones de caja abierta
- No hay cálculo automático de impuestos

**Tests:** ❌ 0/4 pasando

---

## ❌ PENDIENTE (11 Endpoints)

### 🔐 Autenticación (3 endpoints) - **P0 BLOQUEANTE**

```
❌ POST   /api/v1/auth/login/              → Crear token
❌ POST   /api/v1/auth/logout/             → Invalidar token
❌ POST   /api/v1/auth/refresh/            → Renovar token
```

**Requisitos:**
- Implementar AuthSerializer con validación email
- Crear TokenObtainPairView
- Manejar tokens JWT/DRF

**Archivo a crear:**
- `tienda/authentication.py` (nueva)

**Estimación:** 4 horas

**Dependencias:** Ninguna (pero necesario para todo lo demás)

---

### 👤 Usuarios - Perfil (3 endpoints) - **P0 BLOQUEANTE**

```
❌ GET    /api/v1/usuarios/me/             → Perfil autenticado
❌ PUT    /api/v1/usuarios/me/             → Actualizar perfil
❌ GET    /api/v1/usuarios/{id}/           → Detalle usuario (Admin)
```

**Requisitos:**
- Crear `MeViewSet` o vistas específicas
- Permisos por rol
- Validaciones de actualización

**Archivos a modificar:**
- `tienda/views.py` (agregar `UserProfileView`, `UserDetailView`)
- `tienda/urls.py` (agregar rutas)

**Estimación:** 3 horas

**Dependencias:** Autenticación funcionando

---

### 🛒 Pedidos - Completo (3 endpoints) - **P1 CRÍTICA**

```
❌ POST   /api/v1/pedidos/crear/           → Crear con validaciones
❌ PATCH  /api/v1/pedidos/{id}/estado/     → Cambiar estado
❌ GET    /api/v1/pedidos/mis-pedidos/     → Filtrado por usuario
```

**Requisitos:**
- Validar stock antes de crear
- Historial de cambios de estado
- Descuento de stock al crear
- Filtrado por usuario autenticado

**Archivos a modificar:**
- `tienda/models.py` (agregar campo `historial_estados`)
- `tienda/serializers.py` (mejorar `PedidoSerializer`)
- `tienda/views.py` (mejorar `PedidoViewSet`)
- `tienda/urls.py` (agregar acciones personalizadas)

**Estimación:** 8 horas

**Dependencias:** Autenticación funcionando

---

### 💰 Caja (2 endpoints) - **P2**

```
❌ POST   /api/v1/caja/apertura/           → Abrir turno
❌ POST   /api/v1/caja/cierre/             → Cerrar turno
```

**Requisitos:**
- Validar solo un cajero puede abrir caja
- Registrar movimientos
- Calcular diferencias

**Archivos a modificar:**
- `tienda/models.py` (campos adicionales si es necesario)
- `tienda/views.py` (crear `CajaViewSet` mejorado)
- `tienda/serializers.py` (mejorar `CajaSerializer`)

**Estimación:** 5 horas

**Dependencias:** Autenticación funcionando

---

---

## 📋 PLAN DE ACCIÓN PASO A PASO

### **SEMANA 1 - Autenticación Base (P0)**

**Objetivo:** Implementar sistema de autenticación completo

#### Día 1-2: Configurar JWT/Token
```python
# Tareas:
1. Instalar djangorestframework-simplejwt (si aplica)
2. Configurar SIMPLE_JWT en settings.py
3. Crear authentication.py con validación
```

#### Día 3: Endpoints Login/Logout/Refresh
```
Tasks:
- Crear AuthSerializer
- Implementar LoginView, LogoutView, RefreshView
- Agregar rutas en urls.py
- Crear tests (5+ casos)
```

#### Día 4: Perfil de Usuario
```
Tasks:
- Crear UserProfileView (GET /usuarios/me/)
- Crear UserProfileUpdateView (PUT /usuarios/me/)
- Agregar permisos IsAuthenticated
- Crear tests
```

**Output esperado:**
- 6 endpoints funcionales con tests
- Autenticación asegurada en todo el sistema
- 100% de cobertura en auth

---

### **SEMANA 2 - Catálogo Mejorado + Pedidos Base (P1)**

**Objetivo:** Mejorar búsqueda en catálogo e implementar pedidos básicos

#### Día 1-2: Búsqueda y Filtrado Avanzado
```
Tasks:
- Agregar SearchFilter a ProductoViewSet
- Agregar DjangoFilterBackend para categorías
- Implementar filtrado por precio (min/max)
- Tests de búsqueda
```

#### Día 3-5: Sistema de Pedidos
```
Tasks:
- Mejorar PedidoSerializer con validaciones
- Agregar validación de stock
- Descuento de stock automático
- Tests de pedidos (8+ casos)
- Cambio de estado con historial
```

**Output esperado:**
- Catálogo con búsqueda funcional
- Pedidos con validaciones completas
- 15+ tests nuevos

---

### **SEMANA 3 - Ventas y Caja (P2)**

**Objetivo:** Completar módulos de ventas y caja

#### Día 1-3: Ventas
```
Tasks:
- Mejorar VentaViewSet
- Integración con DetalleVenta (nested)
- Reportes básicos
- Tests de ventas
```

#### Día 4-5: Caja
```
Tasks:
- Crear CajaViewSet mejorado
- Validar caja abierta antes de venta
- Historial de movimientos
- Tests de caja
```

**Output esperado:**
- Módulo de ventas funcional
- Gestión de caja completada
- Reportes de ventas

---

### **SEMANA 4 - Admin y Pulido (P2)**

**Objetivo:** Completar Admin y mejorar UX

#### Día 1-2: Django Admin
```
Tasks:
- Registrar Venta en admin.py
- Registrar Caja en admin.py
- Registrar DetalleVenta en admin.py
- Filtros y búsqueda en admin
```

#### Día 3-5: Testing y Documentación
```
Tasks:
- Crear test suite completo (50+ tests)
- Documentación de API en Postman/OpenAPI
- README.md actualizado
- Performance testing
```

**Output esperado:**
- Sistema completo y documentado
- 50+ tests pasando
- Documentación lista para frontend

---

## 📂 ARCHIVOS A CREAR/MODIFICAR

### Nuevos Archivos

```
tienda/
├── authentication.py          (NUEVO)
│   ├── AuthSerializer
│   ├── LoginView
│   ├── LogoutView
│   └── RefreshView
│
└── filters.py                 (NUEVO)
    ├── ProductoFilterSet
    └── SearchFilter personalizado
```

### Modificar Existentes

```
tienda/
├── models.py
│   ├── Agregar: historial_estado a Pedido
│   └── Agregar: campos auxiliares en Caja
│
├── serializers.py
│   ├── Mejorar: UsuarioSerializer
│   ├── Mejorar: PedidoSerializer
│   ├── Mejorar: VentaSerializer
│   ├── Crear: PedidoDetailSerializer
│   └── Crear: VentaDetailSerializer
│
├── views.py
│   ├── Agregar: UserProfileView
│   ├── Mejorar: PedidoViewSet
│   ├── Mejorar: VentaViewSet
│   ├── Mejorar: CajaViewSet
│   └── Agregar: acciones personalizadas
│
├── urls.py
│   └── Agregar: rutas de autenticación y nuevas vistas
│
├── admin.py
│   ├── Registrar: Venta
│   ├── Registrar: Caja
│   └── Registrar: DetalleVenta
│
└── tests.py
    ├── Agregar: AuthTests (10+ casos)
    ├── Agregar: UserTests (5+ casos)
    ├── Agregar: PedidoTests (8+ casos)
    ├── Agregar: VentaTests (6+ casos)
    └── Agregar: CajaTests (5+ casos)
```

---

## 🧪 MATRIZ DE TESTING

| Módulo | Casos Actuales | Casos Requeridos | Delta |
|--------|---|---|---|
| Usuarios | 5 | 15 | +10 |
| Catálogo | 2 | 8 | +6 |
| Autenticación | 0 | 10 | +10 |
| Pedidos | 0 | 15 | +15 |
| Ventas | 0 | 10 | +10 |
| Caja | 0 | 8 | +8 |
| **TOTAL** | **7** | **66** | **+59** |

---

## ⏱️ ESTIMACIÓN DE ESFUERZO

| Tarea | Horas | Días | Semana |
|-------|-------|------|--------|
| Autenticación Completa | 7 | 1 | 1 |
| Perfil de Usuario | 3 | 0.5 | 1 |
| Búsqueda Avanzada | 4 | 1 | 2 |
| Pedidos Completos | 12 | 2 | 2 |
| Ventas | 8 | 1.5 | 3 |
| Caja | 6 | 1 | 3 |
| Testing Suite | 16 | 2 | 4 |
| Admin Completar | 4 | 1 | 4 |
| Documentación | 4 | 1 | 4 |
| **TOTAL** | **64 horas** | **~10 días** | **~4 semanas** |

---

## 🚀 CRITERIOS DE ACEPTACIÓN

### MVP Mínimo (Semana 2)
- ✅ Autenticación funcionando
- ✅ Búsqueda en catálogo
- ✅ Crear pedidos con validaciones
- ✅ Listar pedidos del usuario
- ✅ 25+ tests pasando

### MVP Completo (Semana 4)
- ✅ Todo lo anterior
- ✅ Gestión de caja
- ✅ Reportes de ventas
- ✅ Admin completo
- ✅ 50+ tests pasando
- ✅ Documentación OpenAPI
- ✅ Performance < 300ms promedio

---

## 📌 NOTAS IMPORTANTES

1. **Spec-003** (Autenticación) debe crearse formalmente antes de implementar
2. **LOPDP compliance** debe mantenerse en todos los cambios
3. Todos los endpoints deben documentarse en OpenAPI/Swagger
4. Backend debe estar listo para integración con React frontend
5. Validaciones de negocio deben estar en serializers, no en vistas

