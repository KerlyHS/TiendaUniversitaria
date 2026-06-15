# TiendaUniversitaria Frontend

**Fecha:** 27 de Mayo 2026  
**Stack:** React 18 + Vite + Tailwind CSS  
**Metodología:** Specification-Driven Development (SDD)  
**Integración:** spec-kit para trazabilidad

---

## 📋 Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Instalación y Setup](#instalación-y-setup)
3. [Arquitetura](#arquitectura)
4. [Componentes por Spec](#componentes-por-spec)
5. [Guía de Desarrollo](#guía-de-desarrollo)
6. [Contribución](#contribución)

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                          # Configuración global
│   │   ├── App.jsx                  # Router principal
│   │   └── index.css                # Estilos globales
│   │
│   ├── core/                         # Servicios compartidos
│   │   ├── auth/
│   │   │   └── AuthContext.jsx      # Context de autenticación (Spec-001/003)
│   │   ├── api/
│   │   │   ├── apiClient.js         # Cliente HTTP con JWT
│   │   │   └── services.js          # Servicios por dominio
│   │   └── hooks/
│   │       └── useAPI.js            # Custom hooks para consumir APIs
│   │
│   ├── features/                     # Características (1 carpeta = 1 spec)
│   │   │
│   │   ├── auth/                    # Spec-001 + Spec-003
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   └── pages/
│   │   │       ├── LoginPage.jsx
│   │   │       └── RegisterPage.jsx
│   │   │
│   │   ├── catalog/                 # Spec-002 + Spec-004
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   └── ProductList.jsx
│   │   │   └── pages/
│   │   │       └── CatalogPage.jsx
│   │   │
│   │   ├── orders/                  # Spec-005
│   │   │   ├── components/
│   │   │   │   ├── OrdersList.jsx
│   │   │   │   ├── OrderDetail.jsx
│   │   │   │   └── OrderStatusBadge.jsx
│   │   │   └── pages/
│   │   │       ├── OrdersPage.jsx
│   │   │       └── OrderDetailPage.jsx
│   │   │
│   │   ├── cart/                    # Spec-007 (futuro)
│   │   │   ├── components/
│   │   │   └── pages/
│   │   │
│   │   └── payments/                # Spec-006 (futuro)
│   │       ├── components/
│   │       └── pages/
│   │
│   ├── shared/                       # Componentes reutilizables
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── Layout.jsx
│   │
│   └── main.jsx                      # Entrada de la aplicación
│
├── public/                           # Archivos estáticos
│   └── assets/
│       ├── images/
│       └── icons/
│
├── index.html                        # HTML principal
├── package.json                      # Dependencias y scripts
├── vite.config.js                    # Configuración de Vite
└── README.md                         # Este archivo
```

---

## ⚙️ Instalación y Setup

### Requisitos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# 1. Navegar a carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api
EOF

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:3000
```

### Build para Producción

```bash
npm run build
npm run preview
```

---

## 🏗️ Arquitectura

### Principios de Diseño

```
┌─────────────────────────────────────────────────────┐
│              APLICACIÓN REACT (Frontend)             │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Pages (LoginPage, CatalogPage, OrdersPage)         │
│     ↓                                                │
│  Components (LoginForm, ProductCard, OrdersList)    │
│     ↓                                                │
│  Hooks (useProducts, useOrders, useAuth)            │
│     ↓                                                │
│  Services (apiClient, authService, catalogService) │
│     ↓                                                │
│  ┌────────────────────────────────────────────────┐ │
│  │ Django REST API (Backend)                      │ │
│  │ - POST /api/v1/token/                          │ │
│  │ - GET /api/v1/productos/                       │ │
│  │ - GET /api/v1/pedidos/                         │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario interactúa** con Page/Component
2. **Component llama Hook** (ej: `useProducts()`)
3. **Hook usa Service** (ej: `catalogService.listProducts()`)
4. **Service usa apiClient** para HTTP
5. **apiClient agrega JWT** y realiza petición
6. **Respuesta se guarda** en state
7. **Component re-renderiza** con datos

---

## 🎯 Componentes por Spec

### Spec-001 + Spec-003: Autenticación

**Archivos:**
- `features/auth/components/LoginForm.jsx` - Formulario de login con LOPDP
- `features/auth/components/RegisterForm.jsx` - Formulario de registro
- `core/auth/AuthContext.jsx` - Context global de autenticación
- `core/api/services.js::authService` - Servicios de autenticación

**Features:**
✅ Email + Password  
✅ LOPDP Consent (obligatorio)  
✅ JWT Token Management (access + refresh)  
✅ Auto-logout en token expirado  

### Spec-002 + Spec-004: Catálogo

**Archivos:**
- `features/catalog/components/ProductCard.jsx` - Tarjeta de producto
- `features/catalog/components/ProductList.jsx` - Grilla con filtros
- `core/hooks/useAPI.js::useProducts` - Hook para listar productos

**Features:**
✅ GET /api/v1/productos/ con filtros  
✅ Búsqueda por nombre  
✅ Filtro por categoría  
✅ Ordenamiento (precio, nombre, stock)  
✅ Paginación  
✅ Mostrar IVA (12%) si aplica_impuesto=true  

### Spec-005: Órdenes/Pedidos

**Archivos:**
- `features/orders/components/OrdersList.jsx` - Tabla de órdenes
- `features/orders/components/OrderDetail.jsx` - Detalle de orden
- `features/orders/components/OrderStatusBadge.jsx` - Badge con estado
- `core/hooks/useAPI.js::useOrders` - Hooks para órdenes

**Features:**
✅ GET /api/v1/pedidos/ (auto-filtrado por usuario)  
✅ Máquina de estados visual (RECIBIDO → PREPARACION → LISTO → ENTREGADO)  
✅ Tabla con búsqueda y filtrado  
✅ Detalle completo con items y totales  
✅ Cálculo de impuestos mostrado  

---

## 👨‍💻 Guía de Desarrollo

### Agregar un Nuevo Componente

1. **Crear carpeta** en `features/{spec}/components/`
2. **Crear archivo** `NombreComponent.jsx`
3. **Agregar comentario Spec-Kit** al inicio:

```javascript
/**
 * NombreComponent - TiendaUniversitaria
 * 
 * Spec-00X: Descripción
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * Spec-Kit Metadata:
 * @spec Spec-00X: Descripción
 */
```

4. **Usar hooks** del archivo `core/hooks/useAPI.js`
5. **Importar en Page** correspondiente

### Agregar un Nuevo Hook

1. **Crear en** `core/hooks/useAPI.js`
2. **Seguir patrón:**

```javascript
export const useNombreHook = (params) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceMethod(params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
```

### Integración con Backend

**Endpoint GET /api/v1/productos/**
```javascript
// Frontend
const { products } = useProducts({ search: 'miel', categoria: 'ALIMENTOS' });

// Backend responde
{
  "count": 5,
  "next": "http://localhost:8000/api/v1/productos/?offset=10",
  "previous": null,
  "results": [
    { "id": 1, "nombre": "Miel", "precio": 5.00, ... },
    { "id": 2, "nombre": "Miel Oscura", "precio": 7.00, ... }
  ]
}
```

---

## 🧪 Testing

```bash
# (Futuro) Correr tests
npm run test

# (Futuro) Coverage
npm run test:coverage
```

---

## 📖 Documentación Adicional

- [Especificaciones Backend](../specs/001-008)
- [API Reference](../MODELO%20C4%20PLANTUML/endpoints.yaml)
- [Arquitectura C4](../MODELO%20C4%20PLANTUML/NIVEL_1.puml)

---

## 🤝 Contribución

1. **Branch:** `feature/spec-00X-nombre`
2. **Commit:** `Spec-00X: Descripción del cambio`
3. **Pull Request:** Referenciar issues relacionados

---

## 📝 Licencia

© 2026 TiendaUniversitaria UNL. Todos los derechos reservados.

---

## 📞 Soporte

Para dudas, crear issue o contactar al equipo de desarrollo.

---

**Última actualización:** 27 de Mayo 2026  
**Versión:** 1.0.0-beta
