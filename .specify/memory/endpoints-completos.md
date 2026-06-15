# ENDPOINTS COMPLETOS - Tienda Universitaria API v1.0

**Versión:** 1.0.0  
**Estado:** Estructura Propuesta (Spec-Kit Ready)  
**Base URL:** `/api/v1`  
**Autenticación:** Bearer Token (JWT/DRF Token)  
**Cumplimiento:** LOPDP Ecuador, Constitución v1.1.0

---

## 📋 INDICE DE ENDPOINTS

### 🔐 Módulo Autenticación/Sesión
- [POST] `/auth/login/` - Login con email/password
- [POST] `/auth/logout/` - Cierre de sesión
- [POST] `/auth/refresh/` - Renovación de token

### 👤 Módulo Usuarios
- [POST] `/usuarios/registro/` - Registro público (LOPDP)
- [GET] `/usuarios/me/` - Perfil del usuario autenticado
- [PUT] `/usuarios/me/` - Actualizar perfil personal
- [GET] `/usuarios/{id}/` - Detalle de usuario (Admin)
- [PUT] `/usuarios/{id}/` - Actualizar usuario (Admin)
- [DELETE] `/usuarios/{id}/` - Eliminar usuario (Admin)

### 📜 Módulo Política de Privacidad
- [GET] `/politica-privacidad/` - Obtener política vigente
- [GET] `/politica-privacidad/versiones/` - Historial de versiones
- [POST] `/politica-privacidad/` - Crear versión (Admin)

### 📦 Módulo Catálogo de Productos
- [GET] `/productos/` - Listar todos los productos (con filtrado)
- [POST] `/productos/` - Crear producto (Admin)
- [GET] `/productos/{id}/` - Detalle de producto
- [PUT] `/productos/{id}/` - Actualizar producto (Admin)
- [DELETE] `/productos/{id}/` - Eliminar producto (Admin)
- [GET] `/productos/categorias/` - Listar categorías
- [GET] `/productos/búsqueda/` - Búsqueda por nombre/descripción

### 🛒 Módulo Pedidos/Órdenes
- [POST] `/pedidos/` - Crear nuevo pedido
- [GET] `/pedidos/` - Listar pedidos del usuario
- [GET] `/pedidos/{id}/` - Detalle de pedido
- [PATCH] `/pedidos/{id}/estado/` - Cambiar estado de pedido
- [DELETE] `/pedidos/{id}/` - Cancelar pedido
- [GET] `/pedidos/historial/` - Historial de pedidos del usuario

### 💳 Módulo Ventas
- [POST] `/ventas/` - Crear venta (Cajero)
- [GET] `/ventas/` - Listar ventas (Cajero/Admin)
- [GET] `/ventas/{id}/` - Detalle de venta
- [GET] `/ventas/reportes/` - Reportes de ventas

### 💰 Módulo Caja
- [POST] `/caja/apertura/` - Abrir caja (Cajero)
- [POST] `/caja/cierre/` - Cerrar caja (Cajero)
- [GET] `/caja/estado/` - Estado actual de caja
- [GET] `/caja/historial/` - Historial de movimientos

### 🎁 Módulo Promociones
- [GET] `/promociones/` - Listar promociones vigentes
- [POST] `/promociones/` - Crear promoción (Admin)
- [GET] `/promociones/{id}/` - Detalle de promoción
- [PUT] `/promociones/{id}/` - Actualizar promoción (Admin)
- [DELETE] `/promociones/{id}/` - Eliminar promoción (Admin)

---

## 🔐 AUTENTICACIÓN & SESIÓN

### 1. POST `/auth/login/`
**Descripción:** Autenticación de usuario con email y contraseña.  
**Autenticación:** Pública (AllowAny)  
**Rol requerido:** N/A

**Request Body:**
```json
{
  "email": "usuario@unl.edu.ec",
  "password": "contraseña_segura"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Bienvenido Juan Pérez",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre_completo": "Juan Pérez",
    "email": "usuario@unl.edu.ec",
    "rol": "CLIENTE",
    "is_universidad": true
  }
}
```

**Response (401):**
```json
{
  "error": "El correo o la contraseña no coinciden.",
  "tipo": "AUTH_ERROR"
}
```

---

### 2. POST `/auth/logout/`
**Descripción:** Cierre de sesión del usuario.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** Cualquiera

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Sesión cerrada correctamente"
}
```

---

### 3. POST `/auth/refresh/`
**Descripción:** Renovación de token JWT.  
**Autenticación:** Pública (con refresh token)  
**Rol requerido:** N/A

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

---

## 👤 USUARIOS

### 1. POST `/usuarios/registro/`
**Descripción:** Registro público con consentimiento LOPDP obligatorio.  
**Autenticación:** Pública (AllowAny)  
**Rol requerido:** N/A  
**Cumplimiento:** LOPDP Art. 39 - Privacidad desde el Diseño

**Request Body:**
```json
{
  "nombre_completo": "María García López",
  "email": "maria.garcia@unl.edu.ec",
  "password": "P@ssw0rd123!",
  "identificacion": "1104567890",
  "telefono": "0987654321",
  "is_universidad": true,
  "consentimiento_lopdp": true
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Cuenta creada exitosamente. Bienvenido a Tienda Universitaria.",
  "user": {
    "id": 5,
    "nombre_completo": "María García López",
    "email": "maria.garcia@unl.edu.ec",
    "rol": "CLIENTE",
    "is_universidad": true,
    "consentimiento_lopdp": true,
    "consentimiento_timestamp": "2026-05-27T10:30:00Z",
    "privacy_policy_version": "v1.0.0"
  }
}
```

**Response (400):**
```json
{
  "errors": {
    "consentimiento_lopdp": ["Debes aceptar la política de privacidad para registrarte"],
    "email": ["Este correo ya está registrado"]
  }
}
```

---

### 2. GET `/usuarios/me/`
**Descripción:** Obtener perfil del usuario autenticado.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** Cualquiera

**Response (200):**
```json
{
  "id": 1,
  "nombre_completo": "Juan Pérez García",
  "email": "juan.perez@unl.edu.ec",
  "identificacion": "1103456789",
  "direccion": "Av. Atahuallpa, Loja",
  "telefono": "0998765432",
  "rol": "CLIENTE",
  "is_universidad": true,
  "consentimiento_lopdp": true,
  "consentimiento_timestamp": "2026-05-10T14:20:00Z",
  "privacy_policy_version": "v1.0.0",
  "date_joined": "2026-05-10T14:20:00Z",
  "last_login": "2026-05-27T09:15:00Z"
}
```

---

### 3. PUT `/usuarios/me/`
**Descripción:** Actualizar perfil del usuario autenticado.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** Cualquiera  
**Nota:** No se puede cambiar email, password aquí (endpoint separado).

**Request Body:**
```json
{
  "nombre_completo": "Juan Carlos Pérez García",
  "identificacion": "1103456789",
  "direccion": "Av. Atahuallpa 123, Loja",
  "telefono": "0999876543"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Perfil actualizado correctamente",
  "user": {
    "id": 1,
    "nombre_completo": "Juan Carlos Pérez García",
    "email": "juan.perez@unl.edu.ec",
    "identificacion": "1103456789",
    "direccion": "Av. Atahuallpa 123, Loja",
    "telefono": "0999876543",
    "updated_at": "2026-05-27T10:45:00Z"
  }
}
```

---

### 4. GET `/usuarios/{id}/`
**Descripción:** Obtener detalle de usuario (Solo Admin).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR

**Response (200):**
```json
{
  "id": 2,
  "nombre_completo": "Laura Sánchez",
  "email": "laura.sanchez@unl.edu.ec",
  "rol": "CAJERO",
  "is_universidad": true,
  "is_staff": true,
  "is_active": true,
  "date_joined": "2026-05-15T09:00:00Z",
  "consentimiento_lopdp": true
}
```

---

### 5. PUT `/usuarios/{id}/`
**Descripción:** Actualizar usuario (Solo Admin).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR

**Request Body:**
```json
{
  "nombre_completo": "Laura María Sánchez Cruz",
  "rol": "BODEGUERO",
  "is_active": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Usuario actualizado correctamente",
  "user": { ... }
}
```

---

### 6. DELETE `/usuarios/{id}/`
**Descripción:** Eliminar usuario (Solo Admin).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR

**Response (204):** Sin contenido

---

## 📜 POLÍTICA DE PRIVACIDAD

### 1. GET `/politica-privacidad/`
**Descripción:** Obtener la política de privacidad vigente.  
**Autenticación:** Pública (AllowAny)

**Response (200):**
```json
{
  "version": "v1.0.0",
  "contenido": "La Tienda Universitaria respeta la Ley Orgánica de Protección de Datos Personales...",
  "fecha_entrada_vigor": "2026-05-11",
  "activa": true
}
```

---

### 2. GET `/politica-privacidad/versiones/`
**Descripción:** Historial de versiones de política.  
**Autenticación:** Pública (AllowAny)

**Response (200):**
```json
{
  "count": 2,
  "versions": [
    {
      "version": "v1.0.0",
      "fecha_entrada_vigor": "2026-05-11",
      "activa": true
    },
    {
      "version": "v0.9.0",
      "fecha_entrada_vigor": "2026-05-01",
      "activa": false
    }
  ]
}
```

---

### 3. POST `/politica-privacidad/`
**Descripción:** Crear nueva versión de política (Solo Admin).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR

**Request Body:**
```json
{
  "version": "v1.1.0",
  "content": "Nueva versión de la política con cambios en..."
}
```

**Response (201):**
```json
{
  "status": "success",
  "version": "v1.1.0",
  "effective_date": "2026-05-27T11:00:00Z"
}
```

---

## 📦 CATÁLOGO DE PRODUCTOS

### 1. GET `/productos/`
**Descripción:** Listar productos con filtrado, búsqueda y paginación.  
**Autenticación:** Pública (AllowAny)  
**Query Parameters:**
- `search` (string): Buscar en nombre/descripción
- `categoria` (string): Filtrar por categoría
- `precio_min` (decimal): Precio mínimo
- `precio_max` (decimal): Precio máximo
- `in_stock` (boolean): Solo productos con stock
- `page` (integer): Página (default: 1)
- `page_size` (integer): Resultados por página (default: 20)
- `ordering` (string): Campo para ordenar (ej: `precio`, `-nombre`)

**Example Request:**
```
GET /api/v1/productos/?categoria=SOUVENIR&in_stock=true&ordering=precio
```

**Response (200):**
```json
{
  "count": 45,
  "next": "http://api.tiendauniversitaria.unl.edu.ec/v1/productos/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "codigo": "PROD-001",
      "nombre": "Camiseta UNL Edición Limitada",
      "descripcion": "Camiseta 100% algodón con logo de la UNL",
      "precio": "25.00",
      "categoria": "SOUVENIR",
      "medida": "UNIDAD",
      "stock": 150,
      "aplica_impuesto": true,
      "imagen_url": "https://cdn.tiendauniversitaria.unl.edu.ec/products/camiseta-001.jpg",
      "is_activo": true,
      "fecha_creacion": "2026-05-11T09:30:00Z"
    },
    {
      "id": 2,
      "codigo": "PROD-002",
      "nombre": "Gorra UNL Azul Marino",
      "descripcion": "Gorra ajustable con bordado de UNL",
      "precio": "15.00",
      "categoria": "SOUVENIR",
      "medida": "UNIDAD",
      "stock": 75,
      "aplica_impuesto": true,
      "imagen_url": "https://cdn.tiendauniversitaria.unl.edu.ec/products/gorra-001.jpg",
      "is_activo": true,
      "fecha_creacion": "2026-05-11T09:35:00Z"
    }
  ]
}
```

---

### 2. POST `/productos/`
**Descripción:** Crear nuevo producto (Solo Admin/Bodeguero).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR, BODEGUERO

**Request Body:**
```json
{
  "codigo": "PROD-003",
  "nombre": "Mochila UNL con Compartimentos",
  "descripcion": "Mochila resistente para estudiantes con múltiples compartimentos",
  "precio": "45.50",
  "categoria": "INSTITUCIONAL",
  "medida": "UNIDAD",
  "stock": 50,
  "aplica_impuesto": true,
  "imagen_url": "https://cdn.tiendauniversitaria.unl.edu.ec/products/mochila-001.jpg"
}
```

**Response (201):**
```json
{
  "status": "success",
  "id": 3,
  "codigo": "PROD-003",
  "nombre": "Mochila UNL con Compartimentos",
  "precio": "45.50",
  "created_at": "2026-05-27T11:20:00Z"
}
```

---

### 3. GET `/productos/{id}/`
**Descripción:** Obtener detalle completo de un producto.  
**Autenticación:** Pública (AllowAny)

**Response (200):**
```json
{
  "id": 1,
  "codigo": "PROD-001",
  "nombre": "Camiseta UNL Edición Limitada",
  "descripcion": "Camiseta 100% algodón con logo de la UNL. Disponible en tallas S, M, L, XL",
  "precio": "25.00",
  "categoria": "SOUVENIR",
  "medida": "UNIDAD",
  "stock": 150,
  "aplica_impuesto": true,
  "vencimiento": null,
  "imagen_url": "https://cdn.tiendauniversitaria.unl.edu.ec/products/camiseta-001.jpg",
  "is_activo": true,
  "fecha_creacion": "2026-05-11T09:30:00Z",
  "promociones": [
    {
      "id": 1,
      "nombre": "Promoción de Fin de Mes",
      "fecha_inicio": "2026-05-25",
      "fecha_fin": "2026-05-31"
    }
  ]
}
```

---

### 4. PUT `/productos/{id}/`
**Descripción:** Actualizar producto (Solo Admin/Bodeguero).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR, BODEGUERO

**Request Body:**
```json
{
  "precio": "28.50",
  "stock": 120,
  "is_activo": true
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Producto actualizado correctamente",
  "producto": { ... }
}
```

---

### 5. DELETE `/productos/{id}/`
**Descripción:** Eliminar producto (Solo Admin).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR

**Response (204):** Sin contenido

---

### 6. GET `/productos/categorias/`
**Descripción:** Listar todas las categorías disponibles.  
**Autenticación:** Pública (AllowAny)

**Response (200):**
```json
{
  "categorias": [
    {
      "valor": "AGRICOLA",
      "etiqueta": "Agrícola"
    },
    {
      "valor": "INSTITUCIONAL",
      "etiqueta": "Institucional"
    },
    {
      "valor": "TECNOLOGICO",
      "etiqueta": "Tecnológico"
    },
    {
      "valor": "ACADEMICO",
      "etiqueta": "Académico"
    },
    {
      "valor": "TEXTIL",
      "etiqueta": "Textil"
    },
    {
      "valor": "SOUVENIR",
      "etiqueta": "Souvenir"
    },
    {
      "valor": "TEMPORAL",
      "etiqueta": "Temporal"
    }
  ]
}
```

---

### 7. GET `/productos/búsqueda/`
**Descripción:** Búsqueda avanzada de productos.  
**Autenticación:** Pública (AllowAny)  
**Query Parameters:**
- `q` (string): Término de búsqueda
- `fields` (string): Campos en los que buscar (default: nombre,descripcion)

**Example Request:**
```
GET /api/v1/productos/búsqueda/?q=camiseta&fields=nombre,descripcion
```

**Response (200):**
```json
{
  "query": "camiseta",
  "count": 3,
  "resultados": [
    {
      "id": 1,
      "nombre": "Camiseta UNL Edición Limitada",
      "precio": "25.00",
      "categoria": "SOUVENIR",
      "relevancia": 0.95
    }
  ]
}
```

---

## 🛒 PEDIDOS/ÓRDENES

### 1. POST `/pedidos/`
**Descripción:** Crear nuevo pedido (Usuario autenticado).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CLIENTE

**Request Body:**
```json
{
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2
    },
    {
      "producto_id": 2,
      "cantidad": 1
    }
  ],
  "tipo_entrega": "TIENDA"
}
```

**Response (201):**
```json
{
  "status": "success",
  "id": 12,
  "numero_pedido": "PED-2026-00012",
  "cliente": {
    "id": 1,
    "nombre_completo": "Juan Pérez García"
  },
  "items": [
    {
      "producto_id": 1,
      "nombre": "Camiseta UNL",
      "cantidad": 2,
      "precio_unitario": "25.00",
      "subtotal": "50.00"
    },
    {
      "producto_id": 2,
      "nombre": "Gorra UNL",
      "cantidad": 1,
      "precio_unitario": "15.00",
      "subtotal": "15.00"
    }
  ],
  "subtotal": "65.00",
  "impuesto": "7.80",
  "total": "72.80",
  "tipo_entrega": "TIENDA",
  "estado": "RECIBIDO",
  "fecha_creacion": "2026-05-27T12:00:00Z"
}
```

---

### 2. GET `/pedidos/`
**Descripción:** Listar pedidos del usuario autenticado.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CLIENTE  
**Query Parameters:**
- `estado` (string): Filtrar por estado
- `fecha_desde` (date): Filtrar desde fecha
- `fecha_hasta` (date): Filtrar hasta fecha
- `ordering` (string): Ordenar resultados

**Response (200):**
```json
{
  "count": 3,
  "resultados": [
    {
      "id": 12,
      "numero_pedido": "PED-2026-00012",
      "fecha_creacion": "2026-05-27T12:00:00Z",
      "estado": "RECIBIDO",
      "total": "72.80",
      "tipo_entrega": "TIENDA"
    },
    {
      "id": 11,
      "numero_pedido": "PED-2026-00011",
      "fecha_creacion": "2026-05-20T14:30:00Z",
      "estado": "ENTREGADO",
      "total": "45.50",
      "tipo_entrega": "DOMICILIO"
    }
  ]
}
```

---

### 3. GET `/pedidos/{id}/`
**Descripción:** Obtener detalle de pedido.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CLIENTE (propio), ADMINISTRADOR (cualquiera)

**Response (200):**
```json
{
  "id": 12,
  "numero_pedido": "PED-2026-00012",
  "cliente": {
    "id": 1,
    "nombre_completo": "Juan Pérez García",
    "email": "juan.perez@unl.edu.ec"
  },
  "items": [ ... ],
  "subtotal": "65.00",
  "impuesto": "7.80",
  "total": "72.80",
  "tipo_entrega": "TIENDA",
  "estado": "RECIBIDO",
  "fecha_creacion": "2026-05-27T12:00:00Z",
  "fecha_entrega_estimada": "2026-05-29T18:00:00Z",
  "historial_estado": [
    {
      "estado": "RECIBIDO",
      "fecha": "2026-05-27T12:00:00Z",
      "nota": "Pedido recibido en el sistema"
    }
  ]
}
```

---

### 4. PATCH `/pedidos/{id}/estado/`
**Descripción:** Cambiar estado de pedido (Admin/Gerente).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR, GERENTE

**Request Body:**
```json
{
  "nuevo_estado": "EN_PREPARACION",
  "nota": "Pedido en preparación en almacén"
}
```

**Response (200):**
```json
{
  "status": "success",
  "id": 12,
  "estado_anterior": "RECIBIDO",
  "estado_nuevo": "EN_PREPARACION",
  "fecha_cambio": "2026-05-27T12:15:00Z",
  "nota": "Pedido en preparación en almacén"
}
```

---

### 5. DELETE `/pedidos/{id}/`
**Descripción:** Cancelar pedido (Usuario propietario o Admin).  
**Autenticación:** Requerida (IsAuthenticated)

**Response (200):**
```json
{
  "status": "success",
  "id": 12,
  "estado_anterior": "RECIBIDO",
  "estado_nuevo": "CANCELADO",
  "mensaje": "Pedido cancelado correctamente"
}
```

---

### 6. GET `/pedidos/historial/`
**Descripción:** Obtener historial de pedidos del usuario con estadísticas.  
**Autenticación:** Requerida (IsAuthenticated)

**Response (200):**
```json
{
  "estadisticas": {
    "total_pedidos": 5,
    "total_gastado": "285.50",
    "promedio_por_pedido": "57.10",
    "pedidos_por_estado": {
      "RECIBIDO": 1,
      "PREPARACION": 0,
      "LISTO": 1,
      "ENTREGADO": 3,
      "CANCELADO": 0,
      "DEVOLUCION": 0
    }
  },
  "pedidos_recientes": [ ... ]
}
```

---

## 💳 VENTAS

### 1. POST `/ventas/`
**Descripción:** Crear venta (Cajero).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CAJERO, ADMINISTRADOR

**Request Body:**
```json
{
  "pedido_id": 12,
  "metodo_pago": "EFECTIVO",
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": "25.00"
    }
  ]
}
```

**Response (201):**
```json
{
  "status": "success",
  "id": 5,
  "numero_transaccion": "TX-2026-00005",
  "pedido_id": 12,
  "fecha": "2026-05-27T12:20:00Z",
  "subtotal": "65.00",
  "impuesto": "7.80",
  "total": "72.80",
  "metodo_pago": "EFECTIVO",
  "cajero": "Laura Sánchez"
}
```

---

### 2. GET `/ventas/`
**Descripción:** Listar ventas (Cajero/Admin).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CAJERO, ADMINISTRADOR

**Response (200):**
```json
{
  "count": 150,
  "resultados": [
    {
      "id": 5,
      "numero_transaccion": "TX-2026-00005",
      "fecha": "2026-05-27T12:20:00Z",
      "total": "72.80",
      "metodo_pago": "EFECTIVO",
      "cajero": "Laura Sánchez"
    }
  ]
}
```

---

### 3. GET `/ventas/{id}/`
**Descripción:** Detalle de venta con detalles completos.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CAJERO, ADMINISTRADOR

**Response (200):**
```json
{
  "id": 5,
  "numero_transaccion": "TX-2026-00005",
  "pedido": { ... },
  "detalles": [
    {
      "producto_id": 1,
      "nombre": "Camiseta UNL",
      "cantidad": 2,
      "precio_unitario": "25.00",
      "subtotal": "50.00"
    }
  ],
  "subtotal": "65.00",
  "impuesto": "7.80",
  "total": "72.80",
  "metodo_pago": "EFECTIVO",
  "cajero": "Laura Sánchez",
  "fecha": "2026-05-27T12:20:00Z"
}
```

---

### 4. GET `/ventas/reportes/`
**Descripción:** Reportes de ventas con filtros.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR, GERENTE  
**Query Parameters:**
- `fecha_desde` (date): Fecha inicio
- `fecha_hasta` (date): Fecha fin
- `metodo_pago` (string): Filtro por método
- `cajero_id` (integer): Filtro por cajero

**Response (200):**
```json
{
  "periodo": {
    "desde": "2026-05-01",
    "hasta": "2026-05-27"
  },
  "resumen": {
    "total_ventas": 150,
    "total_ingresos": "5,842.30",
    "promedio_venta": "38.95",
    "total_impuestos": "700.70"
  },
  "por_metodo_pago": {
    "EFECTIVO": {
      "cantidad": 95,
      "total": "3,200.00"
    },
    "TRANSFERENCIA": {
      "cantidad": 35,
      "total": "1,642.30"
    }
  },
  "por_cajero": [
    {
      "cajero": "Laura Sánchez",
      "cantidad_ventas": 75,
      "total": "2,900.00"
    }
  ]
}
```

---

## 💰 CAJA

### 1. POST `/caja/apertura/`
**Descripción:** Abrir caja de turno (Cajero).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CAJERO, ADMINISTRADOR

**Request Body:**
```json
{
  "saldo_inicial": "500.00"
}
```

**Response (201):**
```json
{
  "status": "success",
  "id": 3,
  "fecha_abre": "2026-05-27T08:00:00Z",
  "saldo_abre": "500.00",
  "cajero": "Laura Sánchez",
  "estado": "ABIERTA"
}
```

---

### 2. POST `/caja/cierre/`
**Descripción:** Cerrar caja de turno (Cajero).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CAJERO, ADMINISTRADOR

**Request Body:**
```json
{
  "saldo_final": "1,250.75"
}
```

**Response (200):**
```json
{
  "status": "success",
  "id": 3,
  "fecha_cierra": "2026-05-27T18:00:00Z",
  "saldo_abre": "500.00",
  "saldo_cierra": "1250.75",
  "diferencia": "750.75",
  "cajero": "Laura Sánchez",
  "estado": "CERRADA"
}
```

---

### 3. GET `/caja/estado/`
**Descripción:** Estado actual de la caja del turno.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CAJERO, ADMINISTRADOR

**Response (200):**
```json
{
  "caja_abierta": true,
  "id": 3,
  "fecha_abre": "2026-05-27T08:00:00Z",
  "saldo_abre": "500.00",
  "ventas_realizadas": 35,
  "total_vendido": "750.75",
  "saldo_estimado": "1,250.75",
  "cajero": "Laura Sánchez"
}
```

---

### 4. GET `/caja/historial/`
**Descripción:** Historial de movimientos de caja.  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** CAJERO, ADMINISTRADOR

**Response (200):**
```json
{
  "cajas_cerradas": 5,
  "historial": [
    {
      "id": 3,
      "fecha_abre": "2026-05-27T08:00:00Z",
      "fecha_cierra": "2026-05-27T18:00:00Z",
      "saldo_abre": "500.00",
      "saldo_cierra": "1250.75",
      "cajero": "Laura Sánchez"
    }
  ]
}
```

---

## 🎁 PROMOCIONES

### 1. GET `/promociones/`
**Descripción:** Listar promociones vigentes.  
**Autenticación:** Pública (AllowAny)

**Response (200):**
```json
{
  "count": 3,
  "promociones": [
    {
      "id": 1,
      "nombre": "Promoción de Fin de Mes",
      "fecha_inicio": "2026-05-25",
      "fecha_fin": "2026-05-31",
      "cantidad_productos": 15,
      "is_use": true
    }
  ]
}
```

---

### 2. POST `/promociones/`
**Descripción:** Crear promoción (Solo Admin).  
**Autenticación:** Requerida (IsAuthenticated)  
**Rol requerido:** ADMINISTRADOR

**Request Body:**
```json
{
  "nombre": "Promoción Especial Junio",
  "fecha_inicio": "2026-06-01",
  "fecha_fin": "2026-06-30",
  "productos": [1, 2, 5, 8]
}
```

**Response (201):**
```json
{
  "status": "success",
  "id": 4,
  "nombre": "Promoción Especial Junio",
  "fecha_inicio": "2026-06-01",
  "fecha_fin": "2026-06-30"
}
```

---

## 📊 RESPUESTAS DE ERROR ESTÁNDAR

### 400 - Bad Request
```json
{
  "errors": {
    "campo": ["Mensaje de error específico"]
  },
  "timestamp": "2026-05-27T12:30:00Z"
}
```

### 401 - Unauthorized
```json
{
  "error": "No autorizado",
  "detail": "Las credenciales de autenticación no fueron proporcionadas.",
  "tipo": "AUTHENTICATION_ERROR"
}
```

### 403 - Forbidden
```json
{
  "error": "Acceso denegado",
  "detail": "No tienes permisos suficientes para realizar esta acción.",
  "tipo": "PERMISSION_ERROR"
}
```

### 404 - Not Found
```json
{
  "error": "No encontrado",
  "detail": "El recurso solicitado no existe.",
  "tipo": "NOT_FOUND"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Error interno del servidor",
  "detail": "Ha ocurrido un error inesperado. Intenta más tarde.",
  "tipo": "SERVER_ERROR",
  "reference_id": "ERR-2026-05-27-001"
}
```

---

## 🔑 GUÍA DE AUTENTICACIÓN

**Header requerido para endpoints autenticados:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ciclo de vida del token:**
1. Usuario hace login → recibe `access_token` y `refresh_token`
2. Usa `access_token` en headers (válido 24 horas)
3. Cuando expira → usa `refresh_token` para obtener nuevo `access_token`
4. Logout → invalida ambos tokens

---

## 📋 TABLA DE PERMISOS POR ENDPOINT

| Endpoint | Público | CLIENTE | CAJERO | ADMIN | Rol Específico |
|----------|---------|---------|--------|-------|---|
| POST `/auth/login/` | ✅ | - | - | - | - |
| POST `/usuarios/registro/` | ✅ | - | - | - | - |
| GET `/politica-privacidad/` | ✅ | - | - | - | - |
| GET `/productos/` | ✅ | - | - | - | - |
| POST `/productos/` | ❌ | ❌ | ✅ | ✅ | BODEGUERO |
| POST `/pedidos/` | ❌ | ✅ | ❌ | ✅ | CLIENTE |
| POST `/ventas/` | ❌ | ❌ | ✅ | ✅ | - |
| POST `/caja/apertura/` | ❌ | ❌ | ✅ | ✅ | - |

---

**Versión del Documento:** 1.0.0  
**Última Actualización:** 2026-05-27  
**Próxima Revisión:** 2026-06-10  
**Creado con:** Spec-Kit v1.0 - Specification Driven Development

