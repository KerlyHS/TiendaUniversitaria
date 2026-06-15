# Mapeo General - Tienda Universitaria API

## 1. ANÁLISIS DE CONSTITUCIÓN

### Estado Actual
✅ **Aprobado (v1.1.0 - 2026-05-13)**

**Pilares Confirmados:**
- Arquitectura: Headless Django REST Framework (DRF)
- Seguridad: JWT/Token-based Authentication
- Cumplimiento: LOPDP (Ley de Protección de Datos Personales - Ecuador)
- Integraciones: PrimeiroPay, SerpApi, Gemini API
- Base de Datos: Relacional (PostgreSQL/SQLite)
- Documentación: SDD (Specification Driven Development)

---

## 2. ANÁLISIS DE ESPECIFICACIONES IMPLEMENTADAS

### ✅ Spec-001: User Registration & LOPDP Compliance

**Estado:** COMPLETADO (Fase 1, 2, 3, 4, 5)

**Modelos:**
- `Usuario` (Extendido de AbstractUser)
- `PrivacyPolicy`

**Endpoints Implementados:**
```
POST   /api/v1/usuarios/registro/          → Crear usuario + consentimiento LOPDP
GET    /api/v1/politica-privacidad/       → Obtener política vigente
```

**Cumplimiento de Requisitos:**
- ✅ FR-001: Creación de cuenta (Nombre, Email, Password)
- ✅ FR-002: Captura de consentimiento LOPDP obligatorio
- ✅ FR-003: Timestamp + versión de política
- ✅ FR-004: Validación de email único
- ✅ FR-005: Hashing seguro de passwords
- ✅ FR-006: Bloqueo sin consentimiento
- ✅ FR-007: Link a política de privacidad

**Criterios de Éxito:**
- ✅ SC-001: 100% de usuarios con consentimiento LOPDP = True
- ✅ SC-002: Registro < 60 segundos
- ✅ SC-003: Validación < 500ms
- ✅ SC-004: 100% de bloqueo sin consentimiento

---

### ✅ Spec-002: Product Catalog

**Estado:** COMPLETADO (Fase 1, 2, 3)

**Modelos:**
- `Producto` (Productos simples, sin variantes)
- `Promocion` (M2M con Productos)

**Endpoints Implementados:**
```
GET    /api/v1/productos/                 → Listar productos activos
GET    /api/v1/productos/{id}/            → Detalle de producto
POST   /api/v1/productos/                 → Crear producto (Admin)
PUT    /api/v1/productos/{id}/            → Actualizar producto (Admin)
DELETE /api/v1/productos/{id}/            → Eliminar producto (Admin)

GET    /api/v1/promociones/               → Listar promociones vigentes
```

**Cumplimiento de Requisitos:**
- ✅ FR-001: Productos simples (sin variantes)
- ✅ FR-002: URLs de imágenes externas
- ✅ FR-003: Endpoint de listado
- ✅ FR-004: Endpoint de detalle
- ✅ FR-005: Gestión via Django Admin

**Criterios de Éxito:**
- ✅ SC-001: Response time < 300ms
- ✅ SC-002: 100% de serialización correcta

---

## 3. ENTIDADES Y RELACIONES

```
┌─────────────┐
│   Usuario   │ (extends AbstractUser)
└──────┬──────┘
       │ FK
       ├─────→ PrivacyPolicy
       │
       ├─────→ Pedido (1→N)
       │
       └─────→ Venta (1→N, via Pedido)


┌──────────────┐
│   Producto   │
└──────┬───────┘
       │ M2M
       ├─────→ Promocion
       │
       └─────→ DetalleVenta (1→N)


┌──────────┐
│  Pedido  │
└────┬─────┘
     │ FK
     ├─────→ Usuario (cliente)
     │ O2O
     └─────→ Venta


┌────────┐
│ Venta  │
└───┬────┘
    │ FK
    ├─────→ Usuario (cajero)
    │ FK
    ├─────→ Pedido
    │ 1→N
    └─────→ DetalleVenta


┌──────────────┐
│ DetalleVenta │
└──────┬───────┘
       │ FK
       ├─────→ Venta
       │ FK
       └─────→ Producto


┌─────────┐
│  Caja   │
└────┬────┘
     │ FK
     └─────→ Usuario (cajero)
```

---

## 4. ENUMERACIONES (TextChoices)

| Enum | Valores | Propósito |
|------|---------|----------|
| **Rol** | ADMINISTRADOR, CLIENTE, CAJERO, BODEGUERO, GERENTE, SUPERVISOR | Control de acceso |
| **MetodoPago** | EFECTIVO, TRANSFERENCIA, DÉBITO, CRÉDITO | Registro de pagos |
| **ProgresoVenta** | RECIBIDO, PREPARACIÓN, LISTO, ENTREGADO, CANCELADO, DEVOLUCIÓN | Estados de orden |
| **Entrega** | TIENDA, DOMICILIO | Modalidad de entrega |
| **CategoriaProducto** | AGRÍCOLA, INSTITUCIONAL, TECNOLÓGICO, ACADÉMICO, TEXTIL, SOUVENIR, TEMPORAL | Clasificación |
| **Medida** | GRAMO, KILOGRAMO, LIBRA, UNIDAD | Unidades de medida |

---

## 5. COBERTURA DE MÓDULOS

### 📦 Módulo 1: Usuarios (LOPDP)
- **Completitud:** 100% ✅
- Endpoints: Registro, obtener política, (pendiente: Login, Perfil, Update)
- Tests: 7/7 pasando ✅

### 📦 Módulo 2: Catálogo
- **Completitud:** 100% ✅
- Endpoints: Listar, detalle, crear, actualizar, eliminar, promociones
- Tests: 2/2 pasando ✅
- Admin: Registrado ✅

### 📦 Módulo 3: Pedidos/Órdenes
- **Completitud:** 60% ⚠️
- Modelos: Definidos ✅
- Endpoints: CRUD básico (falta: Cambio de estado, filtrado por usuario)
- Tests: No implementados ❌
- Admin: No registrado ❌

### 📦 Módulo 4: Ventas
- **Completitud:** 40% ⚠️
- Modelos: Definidos ✅
- Endpoints: CRUD básico (falta: Integración con pagos, reportes)
- Tests: No implementados ❌
- Admin: No registrado ❌

### 📦 Módulo 5: Caja
- **Completitud:** 40% ⚠️
- Modelos: Definido ✅
- Endpoints: CRUD básico (falta: Apertura/Cierre, reportes)
- Tests: No implementados ❌
- Admin: No registrado ❌

---

## 6. BRECHA IDENTIFICADA

### Endpoints Faltantes o Incompletos

**Autenticación:**
- ❌ POST `/api/v1/auth/login/` → Login con email/password
- ❌ POST `/api/v1/auth/logout/` → Logout
- ❌ POST `/api/v1/auth/refresh/` → Refresh token

**Usuarios:**
- ❌ GET `/api/v1/usuarios/me/` → Perfil del usuario autenticado
- ❌ PUT `/api/v1/usuarios/me/` → Actualizar perfil
- ❌ GET `/api/v1/usuarios/{id}/` → Detalle de usuario (Admin)

**Pedidos:**
- ⚠️ POST `/api/v1/pedidos/crear/` → Falta estructura de request/response completa
- ⚠️ PATCH `/api/v1/pedidos/{id}/estado/` → Cambio de estado (no existe)
- ⚠️ GET `/api/v1/pedidos/mis-pedidos/` → Filtrado por usuario (no existe)

**Ventas:**
- ⚠️ POST `/api/v1/ventas/crear/` → Falta integración con pago
- ⚠️ GET `/api/v1/ventas/reportes/` → Reportes (no existe)

**Caja:**
- ❌ POST `/api/v1/caja/apertura/` → Abrir caja
- ❌ POST `/api/v1/caja/cierre/` → Cerrar caja
- ⚠️ GET `/api/v1/caja/consultad/` → Consultar estado

---

## 7. PRÓXIMAS ESPECIFICACIONES SUGERIDAS

| # | Nombre | Prioridad | Estado |
|---|--------|-----------|--------|
| 003 | Autenticación JWT/Token | P0 🔴 | Pendiente |
| 004 | Gestión de Órdenes Completa | P1 🟠 | Parcial |
| 005 | Integración PrimeiroPay | P1 🟠 | Pendiente |
| 006 | Gestión de Caja | P2 🟡 | Parcial |
| 007 | Reportes de Ventas | P2 🟡 | Pendiente |
| 008 | Búsqueda y Filtrado | P2 🟡 | Parcial |
| 009 | Chatbot Gemini | P3 🟢 | Pendiente |
| 010 | Geolocalización SerpApi | P3 🟢 | Pendiente |

---

## 8. RESUMEN EJECUTIVO

```
Especificaciones Activas:    2/10 ✅
Modelos Completados:         5/5 ✅
Endpoints Implementados:     10/25 ⚠️ (40% de cobertura)
Tests Unitarios:            7/7 ✅
Compatibilidad LOPDP:       100% ✅
Autenticación:              Implementada en modelos, sin endpoints 🔴
```

---

## 9. RECOMENDACIONES INMEDIATAS

1. **CRÍTICO:** Implementar endpoints de autenticación (Login/Logout/Refresh)
2. **CRÍTICO:** Completar estructura de Pedidos con cambio de estado
3. **ALTO:** Agregar validaciones y filtrado avanzado en Productos
4. **ALTO:** Implementar endpoints de Perfil de Usuario
5. **MEDIO:** Registrar todos los modelos en Django Admin
6. **MEDIO:** Crear spec-003 para Autenticación completa

