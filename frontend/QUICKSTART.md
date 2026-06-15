# ⚡ QUICKSTART - TiendaUniversitaria Frontend

**Inicio rápido en 5 minutos**

---

## 1️⃣ Instalar Dependencias

```bash
cd frontend
npm install
```

---

## 2️⃣ Crear Configuración

```bash
# Crear archivo .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api
EOF
```

---

## 3️⃣ Iniciar Backend (otra terminal)

```bash
cd ..
python manage.py runserver
```

El backend debe estar en: http://localhost:8000

---

## 4️⃣ Iniciar Frontend

```bash
cd frontend
npm run dev
```

**Abre en navegador:** http://localhost:3000

---

## 🧪 Pruebas Rápidas

### Test 1: Registro
1. Ir a `/registro`
2. Llenar formulario
3. Aceptar LOPDP
4. Click "Crear Cuenta"

### Test 2: Login
1. Ir a `/login`
2. Email + Contraseña
3. Click "Iniciar Sesión"

### Test 3: Catálogo
1. Ir a `/catalogo`
2. Ver productos
3. Filtrar por categoría
4. Buscar productos

### Test 4: Órdenes
1. Ir a `/dashboard` (estando logueado)
2. Ver tus órdenes
3. Click en orden para ver detalle

---

## 📁 Estructura Principal

```
frontend/
├── src/core/          → API + Auth + Hooks
├── src/features/      → Componentes (auth, catalog, orders)
├── src/shared/        → Header, Footer, Layout
├── README.md          → Documentación completa
├── ARCHITECTURE.md    → Detalles técnicos
├── INSTALL.md         → Instrucciones detalladas
└── package.json       → Dependencias
```

---

## 📚 Documentación

- **README.md** - Guía general del proyecto
- **ARCHITECTURE.md** - Diseño técnico y flujos
- **INSTALL.md** - Instrucciones detalladas
- **IMPLEMENTACION_RESUMEN.md** - Resumen de lo implementado

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Cannot GET /api/ | Backend no está corriendo en :8000 |
| CORS error | Verificar CORS_ALLOWED_ORIGINS en settings.py |
| Token inválido | `localStorage.clear()` en consola |
| Puerto 3000 ocupado | `npx kill-port 3000` |

---

## 📌 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 🎯 Especificaciones Implementadas

✅ Spec-001: User Registration + LOPDP  
✅ Spec-003: JWT Authentication  
✅ Spec-002: Product Catalog  
✅ Spec-004: Producto Display  
✅ Spec-005: Órdenes/Pedidos  

🟡 Spec-006: Pagos (esperando backend)  
🟡 Spec-007: Carrito (esperando backend)  
🟡 Spec-008: LDAP (no requiere cambios frontend)  

---

## 📞 ¿Necesitas ayuda?

Consulta la documentación completa:
- `README.md` - Guía general
- `INSTALL.md` - Setup detallado
- `ARCHITECTURE.md` - Arquitectura

O revisa los archivos en `frontend/src/` para ver el código.

---

**¡Listo! Tu aplicación React está lista para desarrollo.** 🚀
