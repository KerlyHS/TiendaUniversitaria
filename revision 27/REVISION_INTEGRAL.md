# 📋 REVISIÓN INTEGRAL - TiendaUniversitaria  
**Fecha:** 27 de Mayo 2026  
**Versión:** 1.5.0  
**Revisado por:** Backend Development Team  

---

## EJECUTIVO

### Estado General del Proyecto
- **Completitud:** 60% (implementado) / 40% (pendiente)
- **Salud:** 🟢 **ESTABLE** - Núcleo funcional, pero faltantes críticos para MVP
- **Producción:** 🟡 **NO LISTA** - Requiere 3 integraciones críticas
- **Tests:** ✅ 56/56 (100% pass rate)
- **Documentación:** ✅ 85% (falta integraciones)

### Métricas Clave
| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Endpoints Implementados | 34 | 40+ |
| Especificaciones Completadas | 5 | 8+ |
| Cobertura de Tests | 85% | 90%+ |
| Líneas de Código | ~2500 | 4000+ |
| Documentación | 3500+ líneas | 5000+ |

---

## 1. ANÁLISIS DE REQUISITOS

### 1.1 Requisitos Funcionales por Spec

#### ✅ SPEC-001: User Registration + LOPDP  
**Status:** COMPLETADO  
**Implementación:**
- ✅ Registro de usuario con consentimiento LOPDP
- ✅ Validación de email
- ✅ Almacenamiento de policy version con timestamp
- ✅ Destrucción de datos por solicitud
- ✅ Tests: 4/4 ✅

**Documentación:** specs/001-user-registration-lopdp/

**Conformidad LOPDP:**
- ✅ Art. 39 (Privacidad por diseño)
- ✅ Art. 40 (Consentimiento explícito)
- ✅ Art. 44 (Derechos del titular)

---

#### ✅ SPEC-002: Product Catalog (Catálogo)  
**Status:** COMPLETADO  
**Implementación:**
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Filtrado por categoría (TEXTIL, ACCESORIOS, etc)
- ✅ Búsqueda por nombre/descripción
- ✅ Ordenamiento por precio, nombre, stock
- ✅ Paginación
- ✅ Tests: 21/21 ✅

**Documentación:** docs/catalogo-productos.qmd

**Endpoints Implementados:**
```
GET    /api/productos/              (Listar con filtros)
POST   /api/productos/              (Crear)
GET    /api/productos/{id}/         (Detalle)
PUT    /api/productos/{id}/         (Actualizar)
DELETE /api/productos/{id}/         (Borrar)
```

---

#### ✅ SPEC-003: JWT Authentication  
**Status:** COMPLETADO  
**Implementación:**
- ✅ Tokens JWT con expiración (24h access, 7d refresh)
- ✅ Refresh token automático
- ✅ Logout con token blacklist
- ✅ Tests: 16/16 ✅

**Endpoints Implementados:**
```
POST /api/token/                (Obtener token)
POST /api/token/refresh/        (Refrescar token)
POST /api/logout/               (Logout)
```

---

#### ✅ SPEC-004: Producto Extended CRUD  
**Status:** COMPLETADO  
**Implementación:**
- ✅ Stock management con validación
- ✅ Categorías con enums
- ✅ Impuestos (aplica_impuesto boolean)
- ✅ Imágenes (imagen_url)
- ✅ Tests: 21/21 ✅

**Documentación:** docs/catalogo-productos.qmd

---

#### ✅ SPEC-005: Órdenes/Pedidos  
**Status:** COMPLETADO  
**Implementación:**
- ✅ Creación de órdenes con validación de stock (atómica)
- ✅ Generación automática de número (P-YYYYMMDD-XXX)
- ✅ Máquina de estados (RECIBIDO→PREPARACION→LISTO→ENTREGADO/CANCELADO)
- ✅ Cálculo automático de impuestos (12% IVA)
- ✅ Liberación de stock en CANCELADO
- ✅ Auto-filtering por rol
- ✅ Tests: 15/15 ✅

**Documentación:** docs/ordenes-pedidos.qmd

**Endpoints Implementados:**
```
POST   /api/pedidos/              (Crear orden)
GET    /api/pedidos/              (Listar)
GET    /api/pedidos/{id}/         (Detalle)
PUT    /api/pedidos/{id}/         (Actualizar estado)
DELETE /api/pedidos/{id}/         (No permitido - 405)
```

---

### 1.2 Requisitos NO Funcionales

#### Rendimiento
| Requisito | Status | Notas |
|-----------|--------|-------|
| Response time < 200ms | ✅ Implementado | Índices de BD en lugar |
| Manejo de 1000 req/s | ⚠️ No testado | Requiere load testing |
| Caching | ⚠️ Parcial | Solo select_related/prefetch |
| Rate limiting | ❌ No implementado | Necesario |

#### Seguridad
| Requisito | Status | Notas |
|-----------|--------|-------|
| HTTPS | ✅ Requerido | En settings.py |
| CSRF Protection | ✅ Django nativo | Middleware activo |
| XSS Prevention | ✅ Django templating | DRF JSON safe |
| SQL Injection | ✅ ORM protegido | Parámetros enlazados |
| JWT Security | ✅ Implementado | Secrets en .env |
| HTTPS Redirect | ✅ Configurado | Except localhost |
| CORS | ✅ Configurado | localhost:3000, :5173 |

---

## 2. ANÁLISIS DE LÓGICA DE NEGOCIO

### 2.1 Flujo de Usuario (Clientes)

```
1. REGISTRO (LOPDP)
   ├─ Email + Consentimiento
   ├─ Validación LOPDP
   └─ Crear Usuario + PrivacyPolicy

2. AUTENTICACIÓN
   ├─ POST /api/token/ (email + password)
   ├─ Recibir access_token (24h) + refresh_token (7d)
   └─ Guardar en localStorage

3. COMPRA (PENDIENTE - Carrito)
   ├─ Navegar catálogo (GET /api/productos/)
   ├─ Agregar al carrito (POR IMPLEMENTAR)
   ├─ Checkout (POR IMPLEMENTAR)
   └─ Procesar pago (POR IMPLEMENTAR - CopyAndPay)

4. CREAR ORDEN (IMPLEMENTADO)
   ├─ POST /api/pedidos/ (items + tipo_entrega)
   ├─ Backend valida stock
   ├─ Crea Pedido + DetalleVenta
   ├─ Reduce stock
   ├─ Calcula totales (subtotal + 12% IVA)
   └─ Retorna numero_pedido único

5. SEGUIMIENTO DE ORDEN
   ├─ GET /api/pedidos/ (ver mis órdenes)
   ├─ GET /api/pedidos/{id}/ (detalle completo)
   └─ Ver estado: RECIBIDO / PREPARACION / LISTO / ENTREGADO

6. PAGO (POR IMPLEMENTAR)
   ├─ Integración con CopyAndPay
   ├─ Procesamiento de tarjeta
   └─ Confirmación de transacción
```

### 2.2 Flujo Administrativo (Staff)

```
1. GESTIÓN DE PRODUCTOS
   ├─ POST /api/productos/ (crear)
   ├─ PUT /api/productos/{id}/ (actualizar)
   ├─ DELETE /api/productos/{id}/ (eliminar)
   └─ Manage stock, categorías, impuestos

2. PROCESAMIENTO DE ÓRDENES
   ├─ GET /api/pedidos/ (ver TODAS las órdenes)
   ├─ PUT /api/pedidos/{id}/ (cambiar estado)
   │  └─ RECIBIDO → PREPARACION → LISTO → ENTREGADO
   └─ Notificaciones al cliente

3. GESTIÓN DE CAJAS (POR IMPLEMENTAR)
   ├─ Abrir caja diaria
   ├─ Registrar movimientos
   └─ Conciliación

4. REPORTES (POR IMPLEMENTAR)
   ├─ Ventas por día/mes
   ├─ Productos más vendidos
   ├─ Rentabilidad
   └─ Stock bajo
```

### 2.3 Máquina de Estados (Órdenes)

```
                    ┌─────────────────────┐
                    │  CANCELADO (Final)  │
                    └─────────────────────┘
                           ↑
                           │
                      [Admin]
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐         ┌──────────┐      ┌──────┐
    │RECIBIDO│────────▶│PREPARACION│────▶│LISTO │
    └────────┘         └──────────┘      └──────┘
                                            │
                                            ▼
                                      ┌───────────┐
                                      │ENTREGADO  │
                                      │(Transac)  │
                                      └───────────┘
```

**Validaciones:**
- RECIBIDO → {PREPARACION, CANCELADO}
- PREPARACION → {LISTO, CANCELADO}
- LISTO → {ENTREGADO, CANCELADO}
- ENTREGADO → {CANCELADO}
- CANCELADO → [Sin transiciones] (Final)

**Efectos Secundarios:**
- CANCELADO: Libera stock atomicamente

### 2.4 Cálculo de Totales

```
Para cada DetalleVenta:
  subtotal_item = cantidad * precio_unitario
  si producto.aplica_impuesto:
    impuesto_item = subtotal_item * 0.12  (12% IVA)
  
pedido.subtotal = SUM(subtotal_item)
pedido.impuesto = SUM(impuesto_item)
pedido.total = pedido.subtotal + pedido.impuesto
```

**Ejemplo:**
```
Camiseta (aplica_impuesto=False)
  cantidad=2, precio=15.50
  subtotal_item = 31.00, impuesto_item = 0.00

Gorra (aplica_impuesto=True)
  cantidad=1, precio=8.00
  subtotal_item = 8.00, impuesto_item = 0.96

Pedido:
  subtotal = 39.00
  impuesto = 0.96
  total = 39.96
```

---

## 3. ANÁLISIS DE MODELOS C4

### 3.1 NIVEL 1 (Contexto)

**Esperado (endpoints.yaml):**
```
Estudiante ↔ Tienda ↔ PrimeiroPay
Admin     ↔ Tienda ↔ UNL System
          ↔ Tienda ↔ Google Maps
          ↔ Tienda ↔ SMTP
```

**Implementado:**
```
✅ Estudiante ↔ Tienda (API REST)
✅ Admin ↔ Tienda (API REST)
❌ Tienda ↔ PrimeiroPay (NO EXISTE)
❌ Tienda ↔ UNL System (NO EXISTE - LDAP)
❌ Tienda ↔ Google Maps (NO EXISTE)
✅ Tienda ↔ SMTP (Básico en Spec-001, no usado)
```

**Brecha:** 40% de integraciones externas faltantes

---

### 3.2 NIVEL 2 (Contenedores)

**Esperado:**
```
Frontend (Django Templates) → API (Django REST) → BD (PostgreSQL)
                                 ↓
                         Integraciones Externas
```

**Implementado:**
```
Frontend (React - por docs)   ✅ Rutas en docs/
API (Django REST)             ✅ 34 endpoints
BD (SQLite/PostgreSQL)        ✅ 8+ modelos
Integraciones                 ❌ FALTA
```

---

### 3.3 NIVEL 3 (Componentes)

**Esperado (NIVEL_3.puml):**
```
URLs → ViewSets → Módulos:
  - Inventario (Productos, Stock)
  - Ventas (Órdenes, DetalleVenta)
  - Usuario (Auth, Roles)
  - Catálogo (Promociones)
  - Reportes (Analytics)

+ Servicios Externos:
  - Payment Service (CopyAndPay)
  - Notification Service (SMTP)
```

**Implementado:**
```
✅ URLs (core/urls.py)
✅ ViewSets:
   - ProductoViewSet
   - PedidoViewSet
   - AuthViewSet
✅ Models (tienda/models.py):
   - Usuario, Producto, Pedido, DetalleVenta, Venta, PrivacyPolicy, Promocion
❌ Servicios de Pagos (NO EXISTE)
⚠️ Servicios de Notificación (Básico, no integrado)
❌ Reportes (NO EXISTE)
```

---

### 3.4 NIVEL 4 (Clases)

**Modelos Implementados:**
```
✅ Persona (Abstract base)
✅ Usuario (Rol enum: ADMIN, CLIENTE, CAJERO, BODEGUERO, GERENTE, SUPERVISOR)
✅ Producto (con aplica_impuesto, categoría)
✅ Pedido (P-YYYYMMDD-XXX, estado máquina)
✅ DetalleVenta (dual FK: venta + pedido)
✅ Venta (transacción completada)
✅ PrivacyPolicy (LOPDP)
✅ Caja (movimientos diarios)
✅ Promocion (descuentos)
```

**Modelos Faltantes (según NIVEL_4.puml):**
```
❌ Bodega
❌ Proveedor
❌ OrdenCompra
❌ SolicitudAbastecimiento
❌ Inventario (centralizado)
❌ Reporte (agregaciones)
```

---

## 4. ANÁLISIS DE ENDPOINTS

### 4.1 Endpoints Implementados vs YAML

#### Autenticación
| Endpoint | Esperado (YAML) | Implementado | Status |
|----------|-----------------|--------------|--------|
| POST /usuario/login/ | ✅ Sí | POST /api/token/ | ⚠️ Path distinto |
| POST /usuario/registro/ | ✅ Sí | POST /api/register/ | ⚠️ Path distinto |

#### Productos
| Endpoint | YAML | Código | Status |
|----------|------|--------|--------|
| GET /productos/ | Implícito | ✅ | ✅ |
| POST /productos/ | Implícito | ✅ | ✅ |
| PUT /productos/{id}/ | Implícito | ✅ | ✅ |
| DELETE /productos/{id}/ | Implícito | ✅ | ✅ |

#### Órdenes/Pedidos
| Endpoint | YAML | Código | Status |
|----------|------|--------|--------|
| POST /pedidos/crear/ | ✅ Existe | ✅ POST /api/pedidos/ | ⚠️ Path distinto |
| GET /pedidos/ | ❌ No | ✅ Existe | ✅ Extra |
| PUT /pedidos/{id}/ | ❌ No | ✅ Existe | ✅ Extra |

#### Pagos (YAML define, NO implementado)
| Endpoint | YAML | Código | Status |
|----------|------|--------|--------|
| POST /pagos/preparar-checkout/ | ✅ Define | ❌ No existe | 🔴 CRÍTICO |
| GET /pagos/estado/ | ✅ Define | ❌ No existe | 🔴 CRÍTICO |

#### Ubicación (YAML define, NO implementado)
| Endpoint | YAML | Código | Status |
|----------|------|--------|--------|
| GET /ubicacion/buscar/ | ✅ Define | ❌ No existe | 🟡 Importante |

#### Chatbot (YAML define, NO implementado)
| Endpoint | YAML | Código | Status |
|----------|------|--------|--------|
| POST /asistencia/chat/ | ✅ Define | ❌ No existe | 🟡 Importante |

---

## 5. ANÁLISIS DE DOCUMENTACIÓN

### 5.1 Cobertura de Documentación

| Componente | Documentado | Líneas | Formato |
|-----------|-------------|--------|---------|
| Catálogo | ✅ | 2000+ | Quarto (.qmd) |
| Órdenes | ✅ | 1500+ | Quarto (.qmd) |
| Especificaciones | ✅ | spec.md × 5 | Markdown |
| Planes | ✅ | plan.md × 5 | Markdown |
| Tasks | ✅ | tasks.md × 5 | Markdown |
| Constitución | ✅ | 300+ | Markdown |
| API (OpenAPI) | ⚠️ Parcial | endpoints.yaml | YAML |
| Diagramas C4 | ⚠️ Parcial | NIVEL_1-4.puml | PlantUML |

**Faltantes:**
- ❌ Documentación de Pagos (CopyAndPay)
- ❌ Documentación de LDAP/UNL
- ❌ Documentación de Geolocalización
- ❌ Documentación de Chatbot Gemini
- ❌ Documentación de Reportes

---

## 6. INCONSISTENCIAS DETECTADAS

### 6.1 Paths de API

**Problema:** `endpoints.yaml` define paths pero implementación usa prefijo `/api/`

```
YAML Especificado          Implementado
POST /usuario/login/       POST /api/token/
POST /usuario/registro/    POST /api/register/
POST /pedidos/crear/       POST /api/pedidos/
GET  /productos/           GET  /api/productos/
```

**Impacto:** Clientes no pueden seguir contrato YAML  
**Solución:** Actualizar `endpoints.yaml` con paths reales o agregar aliases

---

### 6.2 DetalleVenta Dual FK (Design Flaw)

**Problema:**
```python
class DetalleVenta:
    venta = FK(nullable=True)      # Venta completada
    pedido = FK(nullable=True)     # Orden en proceso
```

**Caso Problemático:**
```
✅ Válido:  venta=123, pedido=null (en Venta completada)
✅ Válido:  venta=null, pedido=456 (en Pedido en proceso)
❌ Inválido: venta=null, pedido=null (huérfano)
❌ Inválido: venta=123, pedido=456 (duplicado)
```

**Solución Propuesta:**
```python
# Opción 1: Genérico (mejor flexibilidad)
class DetalleVenta:
    # Relationship a entidad padre (Venta o Pedido)
    parent_type = CharField(choices=['venta', 'pedido'])
    parent_id = IntegerField()
    
    class Meta:
        constraints = [
            CheckConstraint(
                Q(parent_type='venta') | Q(parent_type='pedido'),
                name='valid_parent_type'
            )
        ]

# Opción 2: Separar modelos (mejor type safety)
class DetalleVenta(models.Model):
    producto = FK(Producto)
    cantidad = IntegerField()
    precio_unitario = Decimal()

class VentaDetalle(DetalleVenta):
    venta = FK(Venta, related_name='detalles')

class PedidoDetalle(DetalleVenta):
    pedido = FK(Pedido, related_name='detalles')
```

---

### 6.3 Roles Incompletos

**Definido (constitution.md):**
```
ADMINISTRADOR, CLIENTE, CAJERO, BODEGUERO, GERENTE, SUPERVISOR
```

**Permisos Implementados Parcialmente:**
```
✅ ADMINISTRADOR: Acceso total
✅ CLIENTE: Crear orden, ver propias
✅ BODEGUERO: Ver todas, cambiar estado
✅ CAJERO: Ver todas, cambiar estado
❌ GERENTE: Solo parcial (ver todas, manage productos)
❌ SUPERVISOR: No tiene implementación
```

**Faltante:**
```python
# GERENTE: Debería poder ver reportes, gestionar permisos
# SUPERVISOR: Debería poder supervisar bodeguero, gerente
```

---

### 6.4 Integración LDAP UNL (No existe)

**Esperado por NIVEL_1.puml y especificaciones.yaml:**
```
Flujo: Usuario login → Validar contra LDAP UNL → Crear Usuario local
```

**Implementado:**
```
Login local con email/password
SIN integración a directorio LDAP
```

**Impacto:** Estudiantes reales de UNL no pueden validarse  
**Criticidad:** 🔴 CRÍTICA para MVP

---

### 6.5 Carrito de Compras (No existe)

**Esperado:**
```
GET  /carrito/ - Ver carrito actual
POST /carrito/items/ - Agregar item
PUT  /carrito/items/{id}/ - Actualizar cantidad
DELETE /carrito/items/{id}/ - Eliminar item
```

**Implementado:**
```
Falta completamente
Flujo actual: Producto → Pedido directo (sin carrito)
```

**Impacto:** UX deficiente, no se puede modificar compra antes de pagar  
**Criticidad:** 🔴 CRÍTICA para MVP

---

## 7. RESUMEN DE FALTANTES

### 🔴 CRÍTICO (Bloqueantes MVP)

| Faltante | Esfuerzo | Impact | Prioridad |
|----------|----------|--------|-----------|
| Pasarela Pagos (CopyAndPay) | 3-4 semanas | Sin ingresos = 0 | P0 |
| Carrito de Compras | 2-3 semanas | UX deficiente | P0 |
| LDAP/UNL Integration | 2-3 semanas | Usuarios reales no validados | P0 |

**Bloqueador de Producción:** Sin estos 3, no puede operar

---

### 🟠 IMPORTANTE (Próximo mes)

| Faltante | Esfuerzo | Impact | Prioridad |
|----------|----------|--------|-----------|
| Geolocalización (SerpApi) | 1-2 semanas | Entrega = 0 | P1 |
| Chatbot Gemini | 1-2 semanas | Soporte deficiente | P1 |
| Sistema de Notificaciones | 1-2 semanas | Tracking = 0 | P1 |
| Rate Limiting | 1 semana | DDoS vulnerable | P1 |

---

### 🟡 COMPLEMENTARIO (3+ meses)

| Faltante | Esfuerzo | Impact |
|----------|----------|--------|
| Reportes/Analytics | 2-3 semanas | Business intelligence |
| Mobile App | 4-6 semanas | Acceso móvil |
| Deployment a Prod | 1-2 semanas | Go-live |
| Modelos de Compra (Bodega, Proveedor, Orden Compra) | 3-4 semanas | Supply chain |

---

## 8. RECOMENDACIONES

### Inmediatas (Próximas 2 semanas)
1. ✅ Actualizar `endpoints.yaml` con paths reales (`/api/` prefix)
2. ✅ Crear documento de divergencias: "Spec vs Implementation"
3. ✅ Refactorizar DetalleVenta a GenericFK o separar modelos
4. ✅ Implementar `at_least_one_of(venta, pedido)` constraint

### Fase 1 (Junio 2026 - 4 semanas)
1. 🔴 Pasarela de Pagos - CopyAndPay integration
   - Crear `Transaccion` model
   - Crear `TransactionViewSet`
   - Crear `/api/pagos/*` endpoints
   - Tests: 15+ casos

2. 🔴 Carrito de Compras
   - Crear `Carrito` + `CarritoItem` models
   - Crear `CarritoViewSet`
   - Agregar `/api/carrito/*` endpoints
   - Tests: 10+ casos

3. 🔴 LDAP/UNL Integration
   - Configurar python-ldap
   - Crear `LdapAuthBackend`
   - Sincronizar con Usuario model
   - Tests: 8+ casos

### Fase 2 (Julio 2026 - 3 semanas)
1. Geolocalización (SerpApi)
2. Chatbot Gemini
3. Sistema de Notificaciones (Celery + email)

### Fase 3 (Agosto-Sep 2026)
1. Reportes
2. Mobile app (React Native)
3. Deployment a producción

---

## 9. CHECKLIST PARA PRODUCCIÓN

### Antes de Go-Live

#### Funcionalidad
- [ ] Pasarela de Pagos operativa y testeada
- [ ] Carrito de compras completamente funcional
- [ ] LDAP/UNL integrado y validado
- [ ] Geolocalización para entregas
- [ ] Notificaciones por email

#### Calidad
- [ ] 80+ tests (actualmente 56)
- [ ] Coverage ≥ 85%
- [ ] Code review 100%
- [ ] Load testing (1000 req/s)

#### Seguridad
- [ ] HTTPS obligatorio
- [ ] JWT tokens seguros (.env)
- [ ] Rate limiting activo
- [ ] CORS restrictivo
- [ ] SQL Injection tests
- [ ] XSS tests

#### Operacional
- [ ] Base de datos PostgreSQL en prod
- [ ] Logging centralizado
- [ ] Monitoring (APM)
- [ ] Backup automático
- [ ] Disaster recovery plan

#### Documentación
- [ ] API docs actualizados
- [ ] Arquitectura documentada
- [ ] Runbook de deployment
- [ ] FAQ de soporte
- [ ] Guía de usuarios

---

## 10. TIMELINE RECOMENDADO

```
Junio 2026
├─ W1-W2: Pagos + Carrito (P0)
├─ W2-W3: LDAP/UNL (P0)
└─ W4: Testing + Fixes

Julio 2026
├─ W1: Geolocalización
├─ W2: Chatbot
├─ W3: Notificaciones
└─ W4: Integraciones

Agosto 2026
├─ W1-W2: Reportes
├─ W3: Mobile app
└─ W4: QA + UAT

Septiembre 2026
├─ W1: Deployment
├─ W2: Soft Launch (beta)
├─ W3: Monitoring
└─ W4: Public Release
```

**Total: 4 meses para producción completa**

---

## Conclusión

**El proyecto está en buen estado de salud para el 60% implementado, pero requiere 3 integraciones críticas antes de producción.** La arquitectura es sólida, tests robustos, y documentación completa para lo que existe.

**Recomendación:** Priorizar P0 (Pagos, Carrito, LDAP) para tener MVP en Julio, luego agregar integraciones menores para Septiembre.

---

**Documento preparado por:** Backend Development Team  
**Próxima revisión:** 27 de Junio 2026
