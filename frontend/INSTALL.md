# GUÍA DE INSTALACIÓN Y USO - Frontend TiendaUniversitaria

**Fecha:** 27 de Mayo 2026  
**Versión:** 1.0.0-beta  
**Tecnologías:** React 18, Vite, Tailwind CSS, spec-kit

---

## ✅ Requisitos Previos

- **Node.js** 18.0.0 o superior
- **npm** 9.0.0 o superior
- **Backend Django** ejecutándose en `http://localhost:8000`

```bash
# Verificar versiones
node --version  # v18.0.0+
npm --version   # 9.0.0+
```

---

## 🚀 Instalación Rápida

```bash
# 1. Entrar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir navegador
# http://localhost:3000
```

---

## 📁 Árbol Completo de Carpetas

```
frontend/
│
├── src/
│   │
│   ├── app/                              # Configuración global
│   │   ├── App.jsx                      # Router principal con todas las rutas
│   │   └── index.css                    # Estilos globales + tokens CSS
│   │
│   ├── core/                             # Servicios y contextos globales
│   │   │
│   │   ├── auth/
│   │   │   └── AuthContext.jsx          # Context de autenticación (Spec-001/003)
│   │   │                                 # - useAuth() hook
│   │   │                                 # - login(), register(), logout()
│   │   │
│   │   ├── api/
│   │   │   ├── apiClient.js             # Cliente HTTP (Axios)
│   │   │   │                             # - Agrega JWT automáticamente
│   │   │   │                             # - Maneja refresh token en 401
│   │   │   │                             # - Manejo global de errores
│   │   │   │
│   │   │   └── services.js              # Servicios API por dominio
│   │   │       ├── authService          # POST /token/, /register/, /logout/
│   │   │       ├── catalogService       # GET /productos/, POST /productos/, etc
│   │   │       ├── ordersService        # GET /pedidos/, POST /pedidos/, etc
│   │   │       ├── cartService          # (Futuro - Spec-007)
│   │   │       └── paymentsService      # (Futuro - Spec-006)
│   │   │
│   │   └── hooks/
│   │       └── useAPI.js                # Custom hooks para consumir datos
│   │           ├── useProducts()        # Listar productos (Spec-002)
│   │           ├── useProduct()         # Detalle producto (Spec-004)
│   │           ├── useOrders()          # Listar órdenes (Spec-005)
│   │           ├── useOrderDetail()     # Detalle orden (Spec-005)
│   │           ├── useCreateOrder()     # Crear orden (Spec-005)
│   │           ├── useUpdateOrderStatus() # Cambiar estado (Spec-005)
│   │           ├── useCart()            # Carrito (Spec-007 futuro)
│   │           └── usePrepareCheckout() # Pagos (Spec-006 futuro)
│   │
│   ├── features/                         # Características (1 carpeta = 1 spec)
│   │   │
│   │   ├── auth/                        # Spec-001 + Spec-003
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx        # Formulario de login
│   │   │   │   │                        # - Email + Password
│   │   │   │   │                        # - LOPDP checkbox (obligatorio)
│   │   │   │   │                        # - Manejo de errores
│   │   │   │   │
│   │   │   │   └── RegisterForm.jsx     # Formulario de registro
│   │   │   │                            # - Email, Password, Nombre
│   │   │   │                            # - LOPDP consent
│   │   │   │                            # - Validación de contraseña
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── LoginPage.jsx        # Página de login
│   │   │       └── RegisterPage.jsx     # Página de registro
│   │   │
│   │   ├── catalog/                     # Spec-002 + Spec-004
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.jsx      # Tarjeta de producto
│   │   │   │   │                        # - Imagen, nombre, precio
│   │   │   │   │                        # - Mostrar IVA (12%)
│   │   │   │   │                        # - Botón agregar carrito
│   │   │   │   │
│   │   │   │   └── ProductList.jsx      # Grilla de productos
│   │   │   │                            # - Búsqueda por nombre
│   │   │   │                            # - Filtro por categoría
│   │   │   │                            # - Ordenamiento
│   │   │   │                            # - Paginación
│   │   │   │
│   │   │   └── pages/
│   │   │       └── CatalogPage.jsx      # Página catálogo
│   │   │
│   │   ├── orders/                      # Spec-005
│   │   │   ├── components/
│   │   │   │   ├── OrdersList.jsx       # Tabla de órdenes
│   │   │   │   │                        # - Filtrar por estado
│   │   │   │   │                        # - Ver detalles
│   │   │   │   │
│   │   │   │   ├── OrderDetail.jsx      # Detalle de orden
│   │   │   │   │                        # - Items con precios
│   │   │   │   │                        # - Totales y impuestos
│   │   │   │   │                        # - Estado actual
│   │   │   │   │
│   │   │   │   └── OrderStatusBadge.jsx # Badge con estado visual
│   │   │   │                            # - RECIBIDO (amarillo)
│   │   │   │                            # - PREPARACION (naranja)
│   │   │   │                            # - LISTO (verde)
│   │   │   │                            # - ENTREGADO (índigo)
│   │   │   │                            # - CANCELADO (rojo)
│   │   │   │
│   │   │   └── pages/
│   │   │       ├── OrdersPage.jsx       # Dashboard de órdenes
│   │   │       └── OrderDetailPage.jsx  # Página de detalle
│   │   │
│   │   ├── cart/                        # Spec-007 (Futuro - Junio 2026)
│   │   │   ├── components/
│   │   │   │   ├── CartDrawer.jsx       # Carrito como drawer
│   │   │   │   ├── CartItem.jsx         # Item individual
│   │   │   │   └── CartSummary.jsx      # Resumen + checkout
│   │   │   │
│   │   │   └── pages/
│   │   │       └── CartPage.jsx         # Página carrito
│   │   │
│   │   └── payments/                    # Spec-006 (Futuro - Junio 2026)
│   │       ├── components/
│   │       │   ├── PaymentWidget.jsx    # Widget CopyAndPay
│   │       │   └── CheckoutSummary.jsx  # Resumen antes de pagar
│   │       │
│   │       └── pages/
│   │           └── CheckoutPage.jsx     # Página de checkout
│   │
│   ├── shared/                           # Componentes reutilizables
│   │   └── components/
│   │       ├── Header.jsx               # Navegación global
│   │       │                            # - Logo, navegación
│   │       │                            # - Auth state (login/register o menú)
│   │       │
│   │       ├── Footer.jsx               # Pie de página
│   │       │                            # - Info legal
│   │       │                            # - Enlaces útiles
│   │       │
│   │       └── Layout.jsx               # Envuelve páginas
│   │                                    # - Header + main + Footer
│   │
│   └── main.jsx                         # Punto de entrada (ReactDOM)
│
├── public/                              # Archivos estáticos
│   └── assets/
│       ├── images/                      # Imágenes de productos
│       └── icons/                       # SVGs y favicon
│
├── index.html                           # HTML principal
├── package.json                         # Dependencias y scripts
├── vite.config.js                       # Configuración de Vite
│
├── README.md                            # Guía del proyecto
├── ARCHITECTURE.md                      # Detalles de arquitectura
│
└── .env.local                           # (Crear manualmente)
    VITE_API_URL=http://localhost:8000/api
```

---

## 🔧 Configuración

### 1. Variables de Entorno

```bash
# Crear archivo: frontend/.env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=TiendaUniversitaria
EOF
```

### 2. Verificar Backend Corriendo

```bash
# En otra terminal
cd ..
python manage.py runserver

# Debe responder en: http://localhost:8000/api/v1/
```

### 3. Instalar Dependencias

```bash
npm install
```

---

## 🏃 Ejecutar Proyecto

```bash
# Modo desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

**URLs disponibles:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API: http://localhost:8000/api/v1/

---

## 📌 Rutas Principales

| Ruta | Página | Spec | Protegida |
|------|--------|------|-----------|
| `/login` | Login | Spec-001/003 | ❌ No |
| `/registro` | Registro | Spec-001 | ❌ No |
| `/catalogo` | Catálogo | Spec-002/004 | ❌ No |
| `/catalogo/:id` | Detalle producto | Spec-004 | ❌ No |
| `/dashboard` | Mis pedidos | Spec-005 | ✅ Sí |
| `/pedidos` | Mis pedidos (alias) | Spec-005 | ✅ Sí |
| `/pedidos/:id` | Detalle pedido | Spec-005 | ✅ Sí |
| `/carrito` | Carrito (futuro) | Spec-007 | ✅ Sí |
| `/checkout` | Checkout (futuro) | Spec-006 | ✅ Sí |

---

## 🔑 Flujo de Autenticación

```
Usuario intenta acceder → /dashboard
          ↓
¿JWT token en localStorage?
          ↓
      NO → Redirigir a /login
      ↓
      SÍ → Mostrar página
          ↓
Backend retorna 401 (token expirado)?
          ↓
      SÍ → Refrescar token automáticamente (POST /token/refresh/)
          ↓
      Reintentar request
          ↓
¿Refrescamiento exitoso?
          ↓
      NO → Logout y redirigir a /login
      ↓
      SÍ → Continuar
```

---

## 🧪 Flujos de Prueba

### Test 1: Registro + Login

```
1. Ir a http://localhost:3000/registro
2. Rellenar formulario:
   - Nombre: Juan Pérez
   - Email: juan@unl.edu.ec
   - Contraseña: Secure123!
   - LOPDP: ✓ Aceptar
3. Click "Crear Cuenta"
4. Redirige a /dashboard
5. Backend crea usuario + auto-login
```

### Test 2: Listar Productos

```
1. Ir a http://localhost:3000/catalogo
2. Validar carga de productos (GET /api/v1/productos/)
3. Probar búsqueda: "miel"
4. Probar filtro: Categoría "ALIMENTOS"
5. Probar ordenamiento: "Precio (Menor)"
```

### Test 3: Crear Orden

```
1. Estar logueado
2. Ir a /catalogo
3. Click "Agregar al carrito" (cuando Spec-007 esté listo)
4. Ir a /carrito
5. Click "Checkout"
6. Click "Pagar" (cuando Spec-006 esté listo)
7. Ir a /dashboard
8. Ver orden creada
```

---

## 📊 Especificaciones Implementadas

### ✅ COMPLETADAS

- **Spec-001:** User Registration + LOPDP (100%)
- **Spec-003:** JWT Authentication (100%)
- **Spec-002:** Product Catalog (100%)
- **Spec-004:** Producto CRUD (90% - falta admin panel)
- **Spec-005:** Órdenes/Pedidos (100%)

### 🔄 EN PROGRESO

- **Spec-007:** Carrito de Compras (0% - Backend esperando)
- **Spec-006:** Pasarela CopyAndPay (0% - Backend esperando)
- **Spec-008:** LDAP/UNL Integration (0% - Backend esperando)

---

## 🐛 Troubleshooting

### "Cannot GET /api/v1/productos/"

✅ **Solución:** Backend no está corriendo
```bash
cd .. && python manage.py runserver
```

### "CORS error"

✅ **Solución:** Backend no tiene CORS configurado
```python
# core/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

### "Token inválido / 401"

✅ **Solución:** Limpiar localStorage
```javascript
// En consola del navegador
localStorage.removeItem('jwt_token');
localStorage.removeItem('jwt_refresh');
```

---

## 📚 Recursos

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| README | `frontend/README.md` | Guía general |
| Arquitectura | `frontend/ARCHITECTURE.md` | Detalles técnicos |
| Especificaciones | `specs/` | Requisitos funcionales |
| Endpoints | `MODELO C4/endpoints.yaml` | API Reference |
| Diagramas | `MODELO C4/NIVEL_*.puml` | C4 Models |

---

## ✅ Checklist Pre-Producción

- [ ] Todos los tests pasando
- [ ] Linter sin errores (`npm run lint`)
- [ ] Build exitoso (`npm run build`)
- [ ] Performance > 90 (Lighthouse)
- [ ] HTTPS habilitado
- [ ] JWT secrets en variables de entorno
- [ ] CORS configurado correctamente
- [ ] Documentación actualizada

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar documentación en `README.md` y `ARCHITECTURE.md`
2. Crear issue en GitHub
3. Contactar equipo de desarrollo

---

**Última actualización:** 27 de Mayo 2026  
**Versión:** 1.0.0-beta  
**Status:** Listo para desarrollo
