# ARQUITECTURA FRONTEND - TiendaUniversitaria

**Versión:** 1.0.0  
**Fecha:** 27 de Mayo 2026  
**Metodología:** Specification-Driven Development (SDD) + spec-kit

---

## 📊 Diagrama de Capas

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│           PRESENTACIÓN (Pages + Components)          │
│                                                      │
│  - LoginPage / RegisterPage                         │
│  - CatalogPage                                      │
│  - OrdersPage / OrderDetailPage                     │
│                                                      │
└──────────────────────────────────────────────────────┘
           ↓ Consume ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│           COMPONENTES (React Components)             │
│                                                      │
│  - LoginForm, RegisterForm                          │
│  - ProductCard, ProductList                         │
│  - OrdersList, OrderDetail, OrderStatusBadge        │
│  - Header, Footer, Layout                           │
│                                                      │
└──────────────────────────────────────────────────────┘
           ↓ Usa ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│           LÓGICA DE NEGOCIO (Hooks Personalizados)  │
│                                                      │
│  - useAuth                                          │
│  - useProducts, useProduct                          │
│  - useOrders, useOrderDetail, useCreateOrder        │
│  - useCart, usePrepareCheckout                      │
│                                                      │
└──────────────────────────────────────────────────────┘
           ↓ Invoca ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│      SERVICIOS DE DATOS (API Services)              │
│                                                      │
│  - authService (Spec-001/003)                       │
│  - catalogService (Spec-002/004)                    │
│  - ordersService (Spec-005)                         │
│  - cartService (Spec-007)                           │
│  - paymentsService (Spec-006)                       │
│                                                      │
└──────────────────────────────────────────────────────┘
           ↓ Usa ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│          CLIENTE HTTP (Axios + Interceptors)        │
│                                                      │
│  - Agrega JWT token automáticamente                 │
│  - Maneja refresh token en 401                      │
│  - Manejo centralizado de errores                   │
│                                                      │
└──────────────────────────────────────────────────────┘
           ↓ HTTP ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│     BACKEND DJANGO REST API (localhost:8000)        │
│                                                      │
│  - POST /api/v1/token/                              │
│  - GET /api/v1/productos/                           │
│  - GET /api/v1/pedidos/                             │
│  - PUT /api/v1/pedidos/{id}/                        │
│  - etc...                                           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos (Ejemplo: Listar Productos)

```
Usuario hace clic en "Catálogo"
    ↓
CatalogPage.jsx se monta
    ↓
ProductList.jsx (componente) se renderiza
    ↓
ProductList llama hook: const { products } = useProducts(filters)
    ↓
useProducts invoca: catalogService.listProducts(filters)
    ↓
catalogService realiza: apiClient.get('/productos/', { params })
    ↓
apiClient interceptor agrega: Authorization: Bearer {jwt_token}
    ↓
HTTP GET /api/v1/productos/?search=miel&categoria=ALIMENTOS
    ↓
Django responde:
{
  "count": 5,
  "results": [ { "id": 1, "nombre": "Miel", ... } ]
}
    ↓
apiClient retorna respuesta
    ↓
catalogService retorna response.data
    ↓
useProducts setProducts(data)
    ↓
ProductList re-renderiza con: { products: [...] }
    ↓
ProductCard se renderiza para cada producto
    ↓
Usuario ve grilla de productos
```

---

## 📦 Estructura de Carpetas por Responsabilidad

### `core/` - Servicios Globales

```
core/
├── auth/
│   └── AuthContext.jsx          # Context + login/logout
├── api/
│   ├── apiClient.js             # Cliente HTTP con interceptores
│   └── services.js              # Servicios por dominio (auth, catalog, etc)
└── hooks/
    └── useAPI.js                # Custom hooks para consumir datos
```

**Responsabilidad:** Lógica central que usan múltiples features

---

### `features/` - Especificaciones (1 carpeta = 1 spec)

```
features/auth/                   # Spec-001 + Spec-003
├── components/
│   ├── LoginForm.jsx
│   └── RegisterForm.jsx
└── pages/
    ├── LoginPage.jsx
    └── RegisterPage.jsx

features/catalog/                # Spec-002 + Spec-004
├── components/
│   ├── ProductCard.jsx
│   └── ProductList.jsx
└── pages/
    └── CatalogPage.jsx

features/orders/                 # Spec-005
├── components/
│   ├── OrdersList.jsx
│   ├── OrderDetail.jsx
│   └── OrderStatusBadge.jsx
└── pages/
    ├── OrdersPage.jsx
    └── OrderDetailPage.jsx
```

**Responsabilidad:** Componentes específicos de cada especificación

---

### `shared/` - Componentes Reutilizables

```
shared/components/
├── Header.jsx                   # Navegación global
├── Footer.jsx                   # Pie de página
└── Layout.jsx                   # Envuelve páginas con Header + Footer
```

**Responsabilidad:** Componentes agnósticos (usables en múltiples features)

---

## 🔐 Seguridad

### JWT Authentication (Spec-003)

```javascript
// 1. Login obtiene tokens
POST /api/v1/token/
→ { "access": "eyJ0eX...", "refresh": "eyJ0eX..." }

// 2. Frontend almacena
localStorage.setItem('jwt_token', access_token);
localStorage.setItem('jwt_refresh', refresh_token);

// 3. Interceptor agrega token a headers
Authorization: Bearer {access_token}

// 4. Si 401, se refresca automáticamente
POST /api/v1/token/refresh/
→ { "access": "eyJ0eX..." }

// 5. Si refresco falla, logout
→ Redirigir a /login
```

### LOPDP Compliance (Spec-001)

```javascript
// Consentimiento explícito en formulario
<label>
  <input type="checkbox" name="consentimiento_lopdp" required />
  Acepto la Política de Privacidad (LOPDP)
</label>

// Backend valida antes de crear usuario
if (!consentimiento_lopdp):
    raise ValidationError("LOPDP consent required")
```

---

## 🧩 Integración Spec-Kit

### Metadata en Componentes

```javascript
/**
 * ProductCard Component
 * 
 * Spec-002: Catálogo de Productos
 * Spec-004: Producto CRUD
 * 
 * Spec-Kit Metadata:
 * @spec Spec-002: Product listing card
 * @spec Spec-004: Mostrar IVA (12%)
 * @spec Spec-007: Agregar al carrito (futuro)
 */
```

### Trazabilidad Spec → Código

```
Spec-002 (Catálogo)
  ├─ RF1: Listar productos
  │   └─ Implementado en: features/catalog/components/ProductList.jsx
  │                       useProducts hook
  │                       catalogService.listProducts()
  │
  ├─ RF2: Filtrar por categoría
  │   └─ Implementado en: ProductList.jsx::handleCategoryFilter
  │
  └─ RF3: Ordenar por precio
      └─ Implementado en: ProductList.jsx::handleSort
```

---

## 🎨 Design System

### Colores

```
--color-primary: #2563eb          (Azul UNL)
--color-success: #16a34a          (Verde)
--color-warning: #ea580c          (Naranja)
--color-error: #dc2626            (Rojo)
```

### Tipografía

```
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
```

### Espaciamiento

```
--spacing-2: 0.5rem   (8px)
--spacing-4: 1rem     (16px)
--spacing-6: 1.5rem   (24px)
--spacing-8: 2rem     (32px)
```

---

## 🚀 Próximas Fases

### Spec-007: Carrito de Compras (Junio 2026)

```javascript
// components/cart/CartDrawer.jsx
// hooks/useCart()
// services/cartService

Features:
- Agregar items al carrito
- Actualizar cantidades
- Remover items
- Checkout
```

### Spec-006: Pasarela de Pagos (Junio 2026)

```javascript
// components/payments/PaymentWidget.jsx
// hooks/usePrepareCheckout()
// services/paymentsService

Features:
- Integración CopyAndPay (PrimeiroPay)
- Preparar checkout
- Confirmar pago
- Webhook handling
```

### Spec-008: LDAP/UNL Integration (Junio 2026)

```javascript
// Modificar LoginForm para usar LDAP
// Backend solo cambia (frontend usa mismo endpoint)

Features:
- Login con credenciales UNL
- Auto-validación de estudiantes
```

---

## 📊 Métricas

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Componentes | 15 | 25+ |
| Custom Hooks | 10 | 15+ |
| Tests | 0 | 50+ |
| Coverage | 0% | 80%+ |
| Lighthouse Score | - | 90+ |

---

## 📚 Referencias

- [Specs Backend](../specs/)
- [API Endpoints](../MODELO%20C4%20PLANTUML/endpoints.yaml)
- [Diagramas C4](../MODELO%20C4%20PLANTUML/)
- [Constitution](../constitution.md)

---

**Última actualización:** 27 de Mayo 2026  
**Versión:** 1.0.0-beta
