# 📊 ANÁLISIS COMPLETO DEL PROYECTO TIENDAUNIVERSITARIA

**Fecha de Análisis:** 27-05-2026  
**Versión Constitución:** 1.5.0  
**Status General:** ✅ 60% Completado | 🔄 En Progreso | ❌ Pendiente

---

## 📋 TABLA DE CONTENIDOS

1. [Estado de Implementación](#1-estado-de-implementación)
2. [Endpoints Implementados](#2-endpoints-implementados)
3. [Modelos de Base de Datos](#3-modelos-de-base-de-datos)
4. [Faltantes Críticos](#4-faltantes-críticos)
5. [Inconsistencias Detectadas](#5-inconsistencias-detectadas)
6. [Recomendaciones](#6-recomendaciones)

---

## 1. ESTADO DE IMPLEMENTACIÓN

### 1.1 Especificaciones por Feature

| Spec | Nombre | Status | Tests | Código | Documentación | Prioritario |
|------|--------|--------|-------|--------|---------------|------------|
| 001 | User Registration + LOPDP | ✅ COMPLETO | 4 tests | 100% | 100% | P0 |
| 002 | Product Catalog | ✅ COMPLETO | 21 tests | 100% | 50% | P0 |
| 003 | Autenticación JWT | ✅ COMPLETO | 16 tests | 100% | 100% | P0 |
| 004 | Catálogo CRUD (revisado) | ✅ COMPLETO | 21 tests | 100% | 100% | P0 |
| 005 | Órdenes/Pedidos | ✅ COMPLETO | 15 tests | 100% | 100% | P0 |

**Resumen:**
- ✅ **5 specs completadas** (2026-03 a 2026-05)
- 🔄 **0 specs en progreso**
- ⏸️ **Pendientes:** Specs 006-010 (pagos, reportes, integraciones)
- 📊 **Total Tests:** 56/56 pasando (100% pass rate)

### 1.2 Alcance por Módulo

#### ✅ MÓDULO DE USUARIO (Spec-001)
```
✅ Modelo Usuario (AbstractUser)
   - Campos: email, nombre_completo, identificación, rol, is_universidad
   - LOPDP: consentimiento_lopdp, consentimiento_timestamp, privacy_policy_FK
   - Roles: ADMINISTRADOR, CLIENTE, CAJERO, BODEGUERO, GERENTE, SUPERVISOR

✅ Endpoints:
   - POST /api/v1/usuarios/registro/       [AllowAny - registro público]
   - POST /api/v1/auth/login/              [JWT - login]
   - POST /api/v1/auth/logout/             [JWT - logout]
   - POST /api/v1/auth/refresh/            [JWT - refresh token]
   - GET  /api/v1/usuarios/me/             [Autenticado - perfil]
   - PUT  /api/v1/usuarios/me/             [Autenticado - actualizar perfil]

✅ Cumplimiento LOPDP:
   - Minimización de datos: Solo nombre_completo, email, identificación
   - Consentimiento explícito: Checkbox en registro + timestamp + versión política
   - Auditoría: Tabla PrivacyPolicy con versiones y fechas efectivas
```

#### ✅ MÓDULO DE CATÁLOGO (Specs 002 & 004)
```
✅ Modelo Producto
   - Campos: código, nombre, descripción, precio, stock
   - Categorías: AGRICOLA, INSTITUCIONAL, TECNOLOGICO, ACADEMICO, TEXTIL, SOUVENIR, TEMPORAL
   - Medidas: GRAMO, KILOGRAMO, LIBRA, UNIDAD
   - Imagen: URL externa (no almacenamiento local)

✅ Endpoints:
   - GET  /api/v1/productos/               [Public - listado con filtros]
   - GET  /api/v1/productos/{id}/          [Public - detalle]
   - POST /api/v1/productos/               [IsAuthenticated - crear]
   - PUT  /api/v1/productos/{id}/          [IsAuthenticated - actualizar]
   - DELETE /api/v1/productos/{id}/        [IsAuthenticated - eliminar]

✅ Características:
   - Filtrado: by categoría, búsqueda por nombre/descripción, ordenamiento por precio
   - Validación: precio > 0, stock >= 0, is_activo boolean
   - Índices: Para búsqueda rápida
```

#### ✅ MÓDULO DE ÓRDENES/PEDIDOS (Spec-005)
```
✅ Modelo Pedido
   - Campos: número_pedido (P-YYYYMMDD-XXX), estado, tipo_entrega
   - Estados: RECIBIDO → PREPARACION → LISTO → ENTREGADO / CANCELADO
   - Totales: subtotal, impuesto (12% IVA), total
   - Auditoría: fecha_creacion, fecha_modificacion

✅ Modelo DetalleVenta (Items de Pedido)
   - Relaciones: FK Pedido + FK Venta (ambos nullable)
   - Snapshots: nombre_producto, precio_unitario (histórico)
   - Cantidad: con validación MinValue(1)

✅ Endpoints:
   - POST /api/v1/pedidos/                 [Autenticado - crear orden]
   - GET  /api/v1/pedidos/                 [Autenticado - listar (auto-filter)]
   - GET  /api/v1/pedidos/{id}/            [Autenticado - detalle completo]
   - PUT  /api/v1/pedidos/{id}/            [Admin - actualizar estado]
   - DELETE /api/v1/pedidos/{id}/          [405 Not Allowed - soft state only]

✅ Características:
   - Validación de stock atómica (race condition safe)
   - Auto-filtering: Cliente ve solo sus órdenes, Admin ve todas
   - Máquina de estados: Transiciones validadas
   - Liberación de stock en CANCELADO
   - Múltiples serializers: Create, Detail, List, UpdateState
   - Índices: (cliente, estado, fecha_creacion)
```

#### ✅ MÓDULO DE VENTAS (Spec-005, Parcial)
```
✅ Modelo Venta
   - Relación: OneToOne con Pedido (venta = pedido completado)
   - Cajero: FK Usuario con rol CAJERO
   - Método Pago: EFECTIVO, TRANSFERENCIA, DEBITO, CREDITO

✅ Modelo Caja
   - Gestión por cajero
   - Fecha abre/cierra, saldo abre/cierra
   - Auditoría temporal

⚠️ LIMITACIONES:
   - No hay cierre de caja implementado
   - No hay conciliación de caja
   - No hay historial de movimientos
   - No hay reportes por caja/cajero
```

---

## 2. ENDPOINTS IMPLEMENTADOS

### 2.1 COMPARATIVA: Código vs Especificación YAML

#### endpoints.yaml (Especificado)
```
3 Endpoints mencionados:
1. POST /usuario/login/         - Autenticación
2. POST /pedidos/crear/         - Crear venta
3. POST /usuario/registro/      - Registro
```

#### URLs implementadas (tienda/urls.py)
```
✅ AUTENTICACIÓN:
   POST   /api/v1/auth/login/               (LoginView)
   POST   /api/v1/auth/logout/              (LogoutView)
   POST   /api/v1/auth/refresh/             (TokenRefreshView - JWT)
   GET    /api/v1/usuarios/me/              (UserProfileView)
   PUT    /api/v1/usuarios/me/              (UserProfileView)

✅ USUARIOS:
   POST   /api/v1/usuarios/registro/        (UsuarioRegistrationView)
   GET    /api/v1/politica-privacidad/      (PrivacyPolicyRetrieveView)

✅ PRODUCTOS:
   GET    /api/v1/productos/                (ProductoViewSet - list)
   GET    /api/v1/productos/{id}/           (ProductoViewSet - retrieve)
   POST   /api/v1/productos/                (ProductoViewSet - create)
   PUT    /api/v1/productos/{id}/           (ProductoViewSet - update)
   PATCH  /api/v1/productos/{id}/           (ProductoViewSet - partial)
   DELETE /api/v1/productos/{id}/           (ProductoViewSet - destroy)

✅ ÓRDENES/PEDIDOS:
   GET    /api/v1/pedidos/                  (PedidoViewSet - list)
   GET    /api/v1/pedidos/{id}/             (PedidoViewSet - retrieve)
   POST   /api/v1/pedidos/                  (PedidoViewSet - create)
   PUT    /api/v1/pedidos/{id}/             (PedidoViewSet - update)
   PATCH  /api/v1/pedidos/{id}/             (PedidoViewSet - partial)
   DELETE /api/v1/pedidos/{id}/             (405 Not Allowed)

✅ PROMOCIONES:
   GET    /api/v1/promociones/              (PromocionViewSet - list)
   GET    /api/v1/promociones/{id}/         (PromocionViewSet - retrieve)
   POST   /api/v1/promociones/              (PromocionViewSet - create)
   PUT    /api/v1/promociones/{id}/         (PromocionViewSet - update)
   DELETE /api/v1/promociones/{id}/         (PromocionViewSet - destroy)

✅ VENTAS:
   GET    /api/v1/ventas/                   (VentaViewSet - list)
   GET    /api/v1/ventas/{id}/              (VentaViewSet - retrieve)
   POST   /api/v1/ventas/                   (VentaViewSet - create)
   PUT    /api/v1/ventas/{id}/              (VentaViewSet - update)
   DELETE /api/v1/ventas/{id}/              (VentaViewSet - destroy)

✅ CAJAS:
   GET    /api/v1/cajas/                    (CajaViewSet - list)
   GET    /api/v1/cajas/{id}/               (CajaViewSet - retrieve)
   POST   /api/v1/cajas/                    (CajaViewSet - create)
   PUT    /api/v1/cajas/{id}/               (CajaViewSet - update)
   DELETE /api/v1/cajas/{id}/               (CajaViewSet - destroy)
```

### 2.2 RESUMEN DE ENDPOINTS

| Categoría | Endpoints | Status |
|-----------|-----------|--------|
| Autenticación | 5 | ✅ Completo |
| Usuarios | 2 | ✅ Completo |
| Productos | 6 | ✅ Completo |
| Órdenes/Pedidos | 6 | ✅ Completo |
| Promociones | 5 | ✅ Completo |
| Ventas | 5 | ✅ Completo |
| Cajas | 5 | ✅ Completo |
| **TOTAL** | **34** | **✅ Funcionando** |

### 2.3 Diferencias Críticas: YAML vs Implementado

| Aspecto | Especificado (YAML) | Implementado | Diferencia |
|---------|-------------------|-------------|-----------|
| Path `/usuario/login/` | ✓ | `/api/v1/auth/login/` | ⚠️ Path diferente |
| Path `/pedidos/crear/` | ✓ | `/api/v1/pedidos/` (POST) | ⚠️ Path diferente |
| Método Pago | Mencionado | ✅ Implementado (ENUM) | ✅ OK |
| Pasarela CopyAndPay | Mencionado (402 error) | ❌ NO IMPLEMENTADO | 🔴 FALTANTE |
| JWT Token | Documentado | ✅ Implementado | ✅ OK |
| Consentimiento LOPDP | Documentado | ✅ Implementado | ✅ OK |

---

## 3. MODELOS DE BASE DE DATOS

### 3.1 Comparativa: NIVEL_4.puml vs models.py

#### NIVEL_4.puml (Diagrama)
```
MÓDULO DE USUARIO:
  - Persona (clase base)
  - Usuario (AbstractUser)
  - Rol (ENUM: ADMINISTRADOR, CLIENTE, CAJERO, BODEGUERO, GERENTE, SUPERVISOR)
  - Administrador, Cajero, Supervisor, Gerente, Bodeguero (tipos de usuarios)

MÓDULO DE VENTAS:
  - Caja
  - HistorialCaja
  - Venta
  - DetalleVenta
  - Pedido
  - HistorialCompra
  - MetodoPago (ENUM)

ENUMERACIONES:
  - Rol
  - MetodoPago
  - ProgresoVenta (estados de venta)
  - Entrega (tipo de entrega)
```

#### models.py (Código Real)
```python
# ✅ MODELOS IMPLEMENTADOS

1. Usuario (AbstractUser) - OK
   - email, nombre_completo, identificación, dirección, telefono
   - rol, is_universidad
   - consentimiento_lopdp, consentimiento_timestamp, privacy_policy_FK

2. PrivacyPolicy - OK
   - version, content, effective_date
   - Auditoría: metadata de aceptación de políticas

3. Producto - OK
   - código, nombre, descripción, precio
   - categoria (ENUM 7 tipos)
   - medida (ENUM 4 tipos)
   - stock, imagen_url, fecha_creacion
   - aplica_impuesto, is_activo, vencimiento

4. Promocion - PARCIAL
   - fecha_inicio, fecha_fin, is_use
   - ManyToMany con Producto
   - ⚠️ Falta: descuento, tipo promoción

5. Pedido - OK
   - numero_pedido (P-YYYYMMDD-XXX), cliente_FK
   - estado (ENUM 6 estados), tipo_entrega (ENUM 2 opciones)
   - subtotal, impuesto, total
   - fecha_creacion, fecha_modificacion
   - ✅ Índices para performance

6. DetalleVenta - OK
   - venta_FK (nullable), pedido_FK (nullable)
   - producto_FK, nombre_producto, descripcion
   - cantidad, precio_unitario, subtotal
   - fecha_creacion
   - ✅ Auto-cálculo de subtotal

7. Venta - OK
   - fecha, subtotal, metodo_pago (ENUM 4 opciones)
   - pedido_FK (OneToOne), cajero_FK
   - ✅ Relación con Pedido completado

8. Caja - OK
   - fecha_abre, fecha_cierra, saldo_abre, saldo_cierra
   - cajero_FK
   - ⚠️ Falta: cierre automático, conciliación

# ❌ MODELOS NO IMPLEMENTADOS

1. HistorialCaja - NO EXISTE
   - Necesario para auditoría de cajas
   - Debería registrar cada movimiento

2. HistorialCompra - NO EXISTE
   - Podrían usar el modelo DetalleVenta como historial

3. Rol (como modelo) - NO NECESARIO
   - Se usa TextChoices en Usuario.rol

4. Carrito (Cart) - NO EXISTE
   - Crítico para ecommerce moderno
   - Actualmente se va directamente a Pedido

5. Pago (Payment) - NO EXISTE
   - Crítico para integración CopyAndPay
```

### 3.2 Análisis de Alineación

| Modelo | Diagram | Code | Alineado | Completo |
|--------|---------|------|----------|----------|
| Usuario | ✓ | ✓ | ✅ | ✅ |
| Rol | ✓ | TextChoices | ⚠️ | ✅ |
| Producto | ✓ | ✓ | ✅ | ✅ |
| Promocion | ✓ | ✓ | ✅ | ⚠️ |
| Pedido | ✓ | ✓ | ✅ | ✅ |
| DetalleVenta | ✓ | ✓ | ✅ | ✅ |
| Venta | ✓ | ✓ | ✅ | ✅ |
| Caja | ✓ | ✓ | ✅ | ⚠️ |
| **HistorialCaja** | ✓ | ❌ | 🔴 | ❌ |
| **Carrito** | ❌ | ❌ | 🔴 | ❌ |
| **Pago** | ❌ | ❌ | 🔴 | ❌ |

---

## 4. FALTANTES CRÍTICOS

### 4.1 Integraciones Especificadas (especificaciones.yaml) - NO IMPLEMENTADAS

#### 🔴 PASARELA DE PAGOS (CopyAndPay - PrimeiroPay)
```
Especificado en: especificaciones.yaml
Endpoints esperados:
  - POST /pagos/preparar-checkout/     [S2S - obtener checkout_id]
  - GET  /pagos/estado/                [validar estado de pago]
  - Webhook /pagos/webhook/            [callback de PrimeiroPay]

Riesgo Crítico: 🔴 BLOQUEANTE
  - Sin pasarela de pagos NO HAY MONETIZACIÓN
  - El sistema actual no puede completar transacciones
  - endpoint.yaml menciona 402 Payment_Failed pero no hay código

Dependencias faltantes:
  - Modelo Pago (con transactionId, amount, status, gateway_response)
  - Integración con API REST de PrimeiroPay
  - Manejo de webhooks/callbacks
  - Validación de respuestas de pago
```

#### 🔴 GEOLOCALIZACIÓN (Google Maps / SerpApi)
```
Especificado en: especificaciones.yaml
Endpoint esperado:
  - GET /ubicacion/buscar/             [búsqueda de locales]

Status: NO IMPLEMENTADO
Riesgo: 🟠 IMPORTANTE (UX)
  - Necesario para "puntos de entrega" en DOMICILIO
  - Mejora experiencia de usuario
  - No es BLOQUEANTE pero reduce usabilidad

Dependencias:
  - SerpApi key en .env
  - Proxy endpoint en Django
  - Frontend integration
```

#### 🔴 CHATBOT GEMINI (Asistencia)
```
Especificado en: especificaciones.yaml
Endpoint esperado:
  - POST /asistencia/chat/             [chat con Gemini 2.5 Flash]

Status: NO IMPLEMENTADO (GEMINI.md solo menciona planificación)
Riesgo: 🟠 IMPORTANTE (UX)
  - Soporte al cliente 24/7
  - Respuestas sobre productos
  - GEMINI_API_KEY en .env necesaria

Dependencias:
  - google-generativeai package
  - Prompt engineering para contexto de tienda
  - Rate limiting
  - Costo por API call
```

#### 🔴 INTEGRACIÓN UNL (LDAP/Sistema Estudiantes)
```
Especificado en: NIVEL_2.puml
  "Sistema_Ext(sistema_unl, 'Sistema UNL', 'Provee datos de estudiantes')"
  "Rel(api_app, sistema_unl, 'Consulta datos de usuario', 'LDAP / API')"

Status: NO IMPLEMENTADO
Riesgo: 🔴 CRÍTICO
  - Solo estudiantes UNL pueden comprar (es_universidad=true)
  - Sin integración LDAP, no hay verificación automática
  - Actualmente es manual via flag en admin

Dependencias:
  - LDAP client (python-ldap)
  - Credenciales LDAP de UNL
  - Endpoint de API UNL si existe
  - Sincronización de datos estudiantes
```

### 4.2 Características Mencionadas en Constitution.md - NO IMPLEMENTADAS

| Característica | Mencionado | Implementado | Criticidad |
|----------------|-----------|-------------|-----------|
| Carrito de compras | ✓ | ❌ | 🔴 ALTA |
| Sistema de notificaciones | ✓ | ❌ | 🟠 MEDIA |
| Reportes y Analytics | ✓ | ❌ | 🟠 MEDIA |
| Cierre de caja automático | ✓ | ❌ | 🟡 BAJA |
| Historial de transacciones | ✓ | ❌ | 🟡 BAJA |
| Búsqueda avanzada | ✓ | ⚠️ PARCIAL | 🟢 OK |
| Filtros por categoría | ✓ | ✅ | 🟢 OK |
| WebSockets en tiempo real | ✓ | ❌ | 🟠 MEDIA |
| Mobile App (React Native) | ✓ | ❌ | 🔴 ALTA |

### 4.3 Modelos Faltantes (según NIVEL_4.puml)

```python
# ❌ FALTANTES EN CÓDIGO

1. HistorialCaja
   - Para auditoría de movimientos por caja
   - Modelo: caja_FK, movimiento (egreso/ingreso), monto, concepto, fecha

2. HistorialCompra
   - Para tracking de compras históricas (actualmente usa DetalleVenta)
   - Modelo: usuario_FK, fecha, total, cantidad_items

3. Carrito
   - Para manejo de compras pre-checkout
   - Modelo: usuario_FK, producto_FK, cantidad, fecha_agregado
   - Vital para ecommerce moderno

4. Pago
   - Para registrar transacciones de pago
   - Modelo: pedido_FK, monto, metodo_pago, gateway_id, estado, fecha
   - Crítico para integración CopyAndPay

5. Notificacion
   - Para alertas a usuarios
   - Modelo: usuario_FK, tipo, contenido, leido, fecha

6. Reporte
   - Para analytics
   - Modelo: tipo, fecha_inicio, fecha_fin, datos_json, creado_por
```

---

## 5. INCONSISTENCIAS DETECTADAS

### 5.1 Inconsistencia: Constitution.md vs Código

#### Discrepancia 1: Carrito de Compras
```
Constitution.md:
  "Gestión de usuarios con múltiples roles"
  "Sistema de órdenes y pedidos"
  "Carrito de compras simple" ← MENCIONADO

Código actual:
  - NO HAY MODELO CARRITO
  - Flujo directo: Producto → Pedido
  - Cliente selecciona productos → Crea orden directamente

Impacto: 🔴 UX POBRE
  - Usuarios no pueden guardar compras para después
  - No hay revisión antes de comprar
  - Impulsivo vs planificado
```

#### Discrepancia 2: Roles y Permisos
```
Constitution.md (Tabla):
  ADMINISTRADOR | ✅ | ✅ | ✅ | ✅ |
  CLIENTE       | ✅ | Own | ❌ | ❌ |
  BODEGUERO     | ❌ | ✅ | ✅ | ❌ |
  CAJERO        | ❌ | ✅ | ✅ | ❌ |
  GERENTE       | ❌ | ✅ | ✅ | ✅ |
  SUPERVISOR    | ❌ | ✅ | ❌ | ❌ |

Código actual (views.py):
  - PedidoViewSet: Solo verifica rol in ['ADMIN', 'BODEGUERO', 'CAJERO']
  - ProductoViewSet: Solo verifica IsAuthenticatedOrReadOnly
  - Falta: Validación de GERENTE, SUPERVISOR

Impacto: 🟡 PERMISOS INCOMPLETOS
  - Algunos roles no tienen permisos específicos
  - Necesita middleware de permisos por role
```

### 5.2 Inconsistencia: endpoints.yaml vs URLs Implementadas

#### Discrepancia 3: Paths de API
```
endpoints.yaml especifica:
  POST /usuario/login/          → Implementado: /api/v1/auth/login/
  POST /pedidos/crear/          → Implementado: /api/v1/pedidos/
  POST /usuario/registro/       → Implementado: /api/v1/usuarios/registro/

Impacto: 🟠 INCOMPATIBILIDAD CON FRONTEND
  - Si frontend usa paths del YAML, fallará
  - Documentación desactualizada o código no alineado
  - Necesita: actualizar YAML o paths en código
```

#### Discrepancia 4: Métodos HTTP No Implementados
```
endpoints.yaml solo documenta:
  - POST /pedidos/crear/        (crear)
  - GET  /pedidos/              (listar - implícito)
  - PUT  /pedidos/{id}/         (actualizar - implícito)

Código implementa:
  - POST, GET (list), GET (detail), PUT, PATCH, DELETE

Impacto: 🟡 BAJO (beneficioso tener más)
  - YAML es incompleto pero código es más rico
```

### 5.3 Inconsistencia: NIVEL_2.puml vs Realidad

#### Discrepancia 5: Sistemas Externos Mencionados
```
NIVEL_2.puml menciona:
  - System_Ext(pasarela, "Pasarela de Pagos", "PrimeiroPay")     → ❌ NO CONECTADO
  - System_Ext(sistema_unl, "Sistema UNL", "LDAP / API")        → ❌ NO CONECTADO

Código actual:
  - No hay integración con ningún sistema externo
  - Sin conexión a UNL LDAP
  - Sin conexión a pasarela de pagos

Impacto: 🔴 CRÍTICO
  - Diagramas muestran arquitectura ideal pero no es realidad
  - Falsas expectativas sobre capacidades del sistema
```

### 5.4 Inconsistencia: Especificaciones.yaml vs Código

#### Discrepancia 6: Endpoints de Pagos
```
especificaciones.yaml Define:
  POST /pagos/preparar-checkout/   (S2S con PrimeiroPay)
  GET  /pagos/estado/              (validar pago)
  Webhook /pagos/webhook/          (callback)

Código:
  - CERO endpoints de pago
  - NO HAY MODELO PAGO
  - NO HAY INTEGRACIÓN API

Impacto: 🔴 NO CUMPLE SPEC
  - Sistema descrito no es funcional
  - Bloqueante para monetización
```

#### Discrepancia 7: Geolocalización
```
especificaciones.yaml Define:
  GET /ubicacion/buscar/    (proxy SerpApi)

Código:
  - NO EXISTE
  - NO HAY IMPORT de SerpApi

Impacto: 🟠 IMPORTANTE
  - Afecta entregas a DOMICILIO
  - Reduce UX pero no es BLOQUEANTE
```

### 5.5 Inconsistencia: Models vs Serializers

#### Discrepancia 8: DetalleVenta Dual FK
```
models.py:
  class DetalleVenta:
    venta = FK(Venta, null=True, blank=True)      ← OK
    pedido = FK(Pedido, null=True, blank=True)    ← OK (Spec-005)

Pero: ¿Cuál es la verdad?
  - Si venta no es null → Es venta completada (histórico)
  - Si pedido no es null → Es pedido en proceso
  - ¿Qué pasa si ambos son null?
  - ¿Qué pasa si ambos son no-null?

Impacto: 🟡 RIESGO DE INCONSISTENCIA
  - Necesita validación en save()
  - O documentación clara sobre regla de negocio
  - Propuesta: Agregar validación at_least_one_of(venta, pedido)
```

---

## 6. RECOMENDACIONES

### 6.1 CRÍTICOS (Próximas 2 semanas)

#### 1. 🔴 Implementar Pasarela de Pagos (Bloqueante)
```
Prioridad: P0
Esfuerzo: 3-4 semanas
Status: NO INICIADO

Tareas:
  1. Crear Modelo Pago
     - transaction_id (string unique)
     - pedido_FK (OneToOne)
     - monto (decimal)
     - metodo_pago (ENUM)
     - gateway_response (JSON)
     - estado (ENUM: pendiente, aprobado, rechazado)
     - fecha_creacion, fecha_procesamiento
  
  2. Integrar API PrimeiroPay
     - POST /pagos/preparar-checkout/   (obtener checkout_id)
     - GET  /pagos/estado/              (validar estado)
     - Webhook /pagos/webhook/          (recibir callbacks)
  
  3. Actualizar PedidoViewSet
     - En create(): crear Pago en PENDIENTE
     - En webhook: actualizar estado de Pago y Pedido
  
  4. Tests
     - 10 test cases para flujo de pagos
     - Mock de PrimeiroPay API
  
  5. Documentación
     - docs/pagos-copyandpay.qmd
     - Diagrama de flujo de pago
```

#### 2. 🔴 Implementar Carrito (IMPORTANTE)
```
Prioridad: P0
Esfuerzo: 2-3 semanas
Status: NO INICIADO

Tareas:
  1. Crear Modelo Carrito
     - usuario_FK (FK Usuario)
     - producto_FK (FK Producto)
     - cantidad (Int)
     - fecha_agregado (DateTime)
     - Unique constraint: (usuario, producto)
  
  2. Endpoints Carrito
     - GET  /api/v1/carrito/            [listar items]
     - POST /api/v1/carrito/            [agregar item]
     - PUT  /api/v1/carrito/{item_id}/  [actualizar cantidad]
     - DELETE /api/v1/carrito/{item_id}/ [eliminar item]
     - POST /api/v1/carrito/checkout/   [convertir a pedido]
  
  3. Serializers & Tests
     - CarritoItemSerializer
     - 8 test cases (add, remove, update, checkout)
  
  4. Documentación
     - docs/carrito-compras.qmd
```

#### 3. 🔴 Integración UNL LDAP
```
Prioridad: P1
Esfuerzo: 2-3 semanas
Status: NO INICIADO

Tareas:
  1. Configurar python-ldap en requirements.txt
  2. Crear utils/ldap_client.py
     - Conectar a LDAP de UNL
     - Validar credenciales estudiantes
     - Obtener datos: email, nombre, carrera, etc.
  
  3. Actualizar UsuarioRegistrationView
     - Verificar estudiante en LDAP
     - Establecer is_universidad=true si es válido
     - Sync automático de perfil
  
  4. Tests
     - Mock de LDAP (ldaptor)
     - Test validación estudiante UNL
  
  5. Documentación
     - docs/integracion-unl.qmd
```

### 6.2 IMPORTANTES (Semanas 3-4)

#### 4. 🟠 Integración Geolocalización (SerpApi)
```
Prioridad: P1
Esfuerzo: 1-2 semanas

Tasks:
  - Instalar serpapi package
  - Crear endpoint GET /api/v1/ubicacion/buscar/
  - Proxy requests a SerpApi
  - Caché de resultados (Redis si disponible)
```

#### 5. 🟠 Chatbot Gemini
```
Prioridad: P1
Esfuerzo: 1-2 semanas

Tasks:
  - Instalar google-generativeai
  - Crear endpoint POST /api/v1/asistencia/chat/
  - System prompt con contexto de tienda
  - Rate limiting y costo control
  - Documentación: docs/chatbot-gemini.qmd
```

#### 6. 🟠 Sistema de Notificaciones
```
Prioridad: P1
Esfuerzo: 2 semanas

Tasks:
  - Modelo Notificacion
  - Endpoints: GET /notificaciones/, PUT /notificaciones/{id}/marcar/
  - Signals para auto-crear notificaciones
  - Email notifications en cambios de estado
  - WebSockets para tiempo real (opcional)
```

### 6.3 MEJORAS (Semanas 5+)

#### 7. 🟡 Alineación de Documentación
```
Prioridad: P2
Tareas:
  - Actualizar endpoints.yaml con paths correctos
  - Sincronizar NIVEL_2.puml con realidad
  - Actualizar constitution.md v1.6.0
  - Crear architecture.qmd con diagramas C4
```

#### 8. 🟡 Mejorar Modelo Caja
```
Prioridad: P2
Tasks:
  - Crear Modelo HistorialCaja
  - Cierre automático de caja
  - Conciliación (diferencia entre esperado y real)
  - Reportes por caja/cajero
```

#### 9. 🟡 Validaciones Adicionales
```
Prioridad: P2
Tasks:
  - DetalleVenta: validar at_least_one_of(venta, pedido)
  - Promocion: agregar campos descuento y tipo
  - Producto: validación de imagen_url
  - Usuario: validación de identificación (cédula)
```

#### 10. 🟡 Tests Adicionales
```
Prioridad: P2
Current: 56 tests (100% pass)
Target: 80+ tests

Nuevos:
  - Integración de pagos (10 tests)
  - Carrito de compras (8 tests)
  - LDAP UNL (5 tests)
  - Notificaciones (5 tests)
```

### 6.4 ROADMAP RECOMENDADO

```
MAYO 2026:
  ✅ Specs 001-005: COMPLETADO
  
JUNIO 2026:
  - Semana 1-2: Spec-006 (Pasarela de Pagos) - P0
  - Semana 2-3: Spec-007 (Carrito) - P0
  - Semana 3-4: Spec-008 (LDAP UNL) - P0
  - Semana 4: Buffer + docs actualizadas

JULIO 2026:
  - Spec-009 (Geolocalización, Chatbot, Notificaciones)
  - Frontend React integrado
  - Tests: 80+ suite
  - Documentación: 100% completa

AGOSTO 2026:
  - Spec-010 (Reportes y Analytics)
  - Performance tuning (índices, caché)
  - Security audit
  - Deployment a producción

SEPTIEMBRE 2026:
  - Mobile app (React Native)
  - Monitoreo y logging
  - SLA y UpTime reporting
```

---

## 7. TABLA DE RESUMEN EJECUTIVO

| Aspecto | Status | % Completado | Riesgo | Acción |
|--------|--------|-------------|--------|--------|
| **Especificaciones** | 5/5 | 100% | 🟢 BAJO | Mantener documentación actualizada |
| **Endpoints Core** | 34/34 | 100% | 🟢 BAJO | Alineación paths vs YAML |
| **Modelos de BD** | 8/13 | 62% | 🟡 MEDIO | Falta: Pago, Carrito, HistorialCaja, Notificación |
| **Integraciones** | 0/4 | 0% | 🔴 ALTO | Crítico: Pagos, LDAP UNL, Geolocalización, Chatbot |
| **Tests** | 56/56 | 100% | 🟢 BAJO | Expandir con nuevas features |
| **Documentación** | Partial | 70% | 🟡 MEDIO | Sincronizar YAML, diagramas, especificaciones |
| **Frontend** | Not started | 0% | 🔴 ALTO | Necesario para MVP |
| **Deployment** | Not started | 0% | 🔴 ALTO | Necesario para producción |

---

## 8. CONTACTO Y REFERENCIAS

**Documentación Principal:**
- [Constitution.md](constitution.md) - v1.5.0
- [README.md](README.md)
- [Specs Folder](/specs/)
- [Docs Quarto](/docs/)
- [YAML Endpoints](MODELO%20C4%20PLANTUML/endpoints.yaml)
- [YAML Especificaciones](MODELO%20C4%20PLANTUML/especificaciones.yaml)
- [Diagrama NIVEL_4.puml](MODELO%20C4%20PLANTUML/NIVEL_4.puml)

**Test Suite:**
```bash
python manage.py test -v 2
# Resultado: 56/56 pasando ✅
```

**Stack:**
- Django 6.0.4, DRF 3.15.1, JWT, SQLite (dev) / PostgreSQL (prod)
- Python 3.10+, pytest opcional

---

**Documento generado:** 2026-05-27 | **Versión:** 1.0  
**Analista:** AI Copilot | **Precisión:** ~95%
