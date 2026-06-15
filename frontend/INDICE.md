# 📖 ÍNDICE MAESTRO - Documentación Completa

**TiendaUniversitaria Frontend**  
**Versión:** 1.0.0-beta  
**Fecha:** 27 de Mayo 2026

---

## 🎯 Documentos por Propósito

### 🚀 Quiero Empezar Ahora (5 minutos)

**Lee:** [`QUICKSTART.md`](QUICKSTART.md)
- Instalación rápida
- Ejecución inmediata
- Pruebas básicas
- Links útiles

---

### 📚 Quiero Entender la Arquitectura

**Lee:** [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Diagrama de capas
- Flujo de datos
- Estructura de carpetas
- Seguridad (JWT + LOPDP)
- Próximas fases

---

### 📋 Quiero Instrucciones Detalladas

**Lee:** [`INSTALL.md`](INSTALL.md)
- Requisitos previos
- Setup paso a paso
- Árbol completo de carpetas (con descripciones)
- Configuración completa
- Troubleshooting
- Checklist pre-producción

---

### 📖 Quiero la Guía General

**Lee:** [`README.md`](README.md)
- Tabla de contenidos completa
- Componentes por Spec
- Cómo desarrollar nuevos componentes
- Próximas fases
- Testing (futuro)

---

### 📦 Quiero Ver Qué Se Implementó

**Lee:** [`IMPLEMENTACION_RESUMEN.md`](IMPLEMENTACION_RESUMEN.md)
- Estadísticas completas
- Qué está implementado
- Qué falta
- Status por Spec
- Checklist completado

---

### 📁 Quiero Ver Listado de Archivos

**Lee:** [`ARCHIVOS_CREADOS.md`](ARCHIVOS_CREADOS.md)
- Estructura completa de carpetas
- Líneas de código por archivo
- Estado de cada archivo
- Próximos pasos

---

## 🗺️ Documentación por Tema

### Autenticación (Spec-001/003)

**Archivos:**
- `src/features/auth/components/LoginForm.jsx`
- `src/features/auth/components/RegisterForm.jsx`
- `src/core/auth/AuthContext.jsx`

**Documentación:**
- [README.md - SPEC-001 + SPEC-003](README.md#spec-001--spec-003-autenticación)
- [ARCHITECTURE.md - Flujo JWT](ARCHITECTURE.md#flujo-de-datos-ejemplo-listar-productos)
- [INSTALL.md - Flujo de Autenticación](INSTALL.md#flujo-de-autenticación)

**Rutas:**
- `/login` - Formulario de login
- `/registro` - Formulario de registro
- `/dashboard` - Área protegida

---

### Catálogo (Spec-002/004)

**Archivos:**
- `src/features/catalog/components/ProductCard.jsx`
- `src/features/catalog/components/ProductList.jsx`

**Documentación:**
- [README.md - SPEC-002 + SPEC-004](README.md#spec-002--spec-004-catálogo)
- [ARCHITECTURE.md - Design System](ARCHITECTURE.md#design-system)

**Rutas:**
- `/catalogo` - Lista de productos con filtros
- `/catalogo/:id` - Detalle de producto

---

### Órdenes (Spec-005)

**Archivos:**
- `src/features/orders/components/OrdersList.jsx`
- `src/features/orders/components/OrderDetail.jsx`
- `src/features/orders/components/OrderStatusBadge.jsx`

**Documentación:**
- [README.md - SPEC-005](README.md#spec-005-órdenes-pedidos)

**Rutas:**
- `/dashboard` - Dashboard de órdenes
- `/pedidos` - Lista de órdenes
- `/pedidos/:id` - Detalle de orden

---

### Carrito (Spec-007 - Futuro)

**Estado:** 🟡 Preparado, esperando backend

**Documentación:**
- [ARCHITECTURE.md - SPEC-007](ARCHITECTURE.md#spec-007-carrito-de-compras-junio-2026)
- [README.md - Próximas Fases](README.md#-próximas-fases-junio-2026)

---

### Pagos (Spec-006 - Futuro)

**Estado:** 🟡 Preparado, esperando backend

**Documentación:**
- [ARCHITECTURE.md - SPEC-006](ARCHITECTURE.md#spec-006-pasarela-de-pagos-junio-2026)
- [README.md - Próximas Fases](README.md#-próximas-fases-junio-2026)

---

## 🔧 Documentación Técnica

### Setup y Configuración

1. **Primero:** [QUICKSTART.md](QUICKSTART.md) (5 min)
2. **Luego:** [INSTALL.md](INSTALL.md) (20 min)
3. **Referencia:** [ARCHITECTURE.md](ARCHITECTURE.md) (según necesites)

### Desarrollo

1. **Entender estructura:** [README.md](README.md) - Sección "Agregando un nuevo componente"
2. **Ver ejemplos:** Revisar archivos en `src/features/`
3. **Referencia API:** [INSTALL.md](INSTALL.md) - Tabla de rutas

### Troubleshooting

- **Problemas comunes:** [INSTALL.md](INSTALL.md#-troubleshooting)
- **Errores de conexión:** Verificar backend en http://localhost:8000
- **Errores CORS:** Revisar `CORS_ALLOWED_ORIGINS` en Django

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Documentación total | 2,500+ líneas |
| Código total | 2,500+ líneas |
| Componentes | 15+ |
| Custom Hooks | 10+ |
| Especificaciones cubiertas | 5/8 (62%) |
| Archivos creados | 48+ |

---

## 🎓 Cómo Leer la Documentación

### Si tienes 5 minutos:
```
QUICKSTART.md
→ npm install
→ npm run dev
→ http://localhost:3000
```

### Si tienes 30 minutos:
```
1. QUICKSTART.md (5 min)
2. README.md (15 min)
3. Explorar código en src/ (10 min)
```

### Si tienes 1 hora:
```
1. QUICKSTART.md (5 min)
2. INSTALL.md (20 min)
3. ARCHITECTURE.md (25 min)
4. README.md (10 min)
```

### Si quieres todo:
```
1. QUICKSTART.md - Inicio rápido
2. README.md - Guía general
3. ARCHITECTURE.md - Detalles técnicos
4. INSTALL.md - Setup detallado
5. IMPLEMENTACION_RESUMEN.md - Qué se hizo
6. ARCHIVOS_CREADOS.md - Listado completo
7. Revisar src/ para ver código
```

---

## 🔗 Enlaces Rápidos

### Documentación
- [QUICKSTART.md](QUICKSTART.md) - ⚡ 5 minutos
- [README.md](README.md) - 📖 Guía completa
- [ARCHITECTURE.md](ARCHITECTURE.md) - 🏗️ Diseño técnico
- [INSTALL.md](INSTALL.md) - 📋 Instrucciones detalladas
- [IMPLEMENTACION_RESUMEN.md](IMPLEMENTACION_RESUMEN.md) - 📦 Lo que se hizo
- [ARCHIVOS_CREADOS.md](ARCHIVOS_CREADOS.md) - 📁 Listado de archivos

### Código Principal
- `src/app/App.jsx` - Router principal
- `src/core/auth/AuthContext.jsx` - Autenticación
- `src/core/api/apiClient.js` - Cliente HTTP
- `src/core/api/services.js` - Servicios API
- `src/core/hooks/useAPI.js` - Custom hooks
- `src/features/` - Componentes por Spec

### Estilos
- `src/app/index.css` - Estilos globales (600+ líneas)

---

## ✅ Checklist: ¿Qué Leer Primero?

- [ ] `QUICKSTART.md` (inicio rápido)
- [ ] `README.md` (guía general)
- [ ] Explorar `src/` (ver código)
- [ ] `ARCHITECTURE.md` (entender flujos)
- [ ] `INSTALL.md` (referencia detallada)

---

## 🚀 Próximos Pasos

1. ✅ Leer documentación (estás aquí)
2. 🔄 Ejecutar: `npm install && npm run dev`
3. 🔄 Explorar: http://localhost:3000
4. 🔄 Probar flujos (login, catálogo, órdenes)
5. 🔄 Desarrollar nuevos componentes (Spec-006/007)

---

## 📞 Preguntas Frecuentes

### ¿Cómo inicio?
→ Lee [QUICKSTART.md](QUICKSTART.md)

### ¿Cómo agrego un componente?
→ Lee [README.md](README.md) - Sección "Agregando un nuevo componente"

### ¿Cómo funciona la autenticación?
→ Lee [ARCHITECTURE.md](ARCHITECTURE.md#-seguridad)

### ¿Qué endpoints tengo disponibles?
→ Lee [INSTALL.md](INSTALL.md#-rutas-principales)

### ¿Qué está implementado?
→ Lee [IMPLEMENTACION_RESUMEN.md](IMPLEMENTACION_RESUMEN.md)

### ¿Qué archivos existen?
→ Lee [ARCHIVOS_CREADOS.md](ARCHIVOS_CREADOS.md)

---

## 📝 Documentación por Tipo

### Guías Rápidas
- [`QUICKSTART.md`](QUICKSTART.md) - Inicio en 5 minutos

### Guías Generales
- [`README.md`](README.md) - Referencia completa del proyecto

### Guías Técnicas
- [`ARCHITECTURE.md`](ARCHITECTURE.md) - Diseño de software
- [`INSTALL.md`](INSTALL.md) - Setup y configuración

### Resúmenes
- [`IMPLEMENTACION_RESUMEN.md`](IMPLEMENTACION_RESUMEN.md) - Qué se implementó
- [`ARCHIVOS_CREADOS.md`](ARCHIVOS_CREADOS.md) - Listado de archivos
- Este documento - Índice maestro

---

**Status:** ✅ Documentación completa y lista para consultar

**Última actualización:** 27 de Mayo 2026  
**Versión:** 1.0.0-beta
