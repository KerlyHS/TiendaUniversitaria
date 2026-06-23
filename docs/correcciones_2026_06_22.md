# Registro de Correcciones e Implementaciones
**Fecha:** 22 de Junio de 2026
**Proyecto:** Tienda Universitaria UNL

A continuación se detalla el listado de todas las correcciones de bugs y nuevas funcionalidades implementadas el día de hoy, categorizadas por su respectivo módulo.

## 1. Módulo de Catálogo y Búsqueda
- **Bug de Búsqueda (Pantalla Blanca):** Se corrigió un error crítico en el frontend donde al hacer clic en un resultado del buscador la página colapsaba (pantalla en blanco).
- **Redirección Forzada a Detalles (Alimentos y Ropa):** Se ajustó el flujo de usuario para que cuando se agregue un producto de categoría alimenticia o textil (ropa), el sistema redirija automáticamente al detalle del producto. Esto asegura que el cliente elija cómo desea que se le cobre (ej. por kilo o libra, talla, etc.) y no se agreguen al carrito como "unidades" genéricas por error.
- **Visualización de Precios:** Se ajustaron los helpers de precios (`priceHelper.js`) para asegurar que el dashboard del catálogo refleje el precio base correcto (por ejemplo, el precio en Kilogramos para hortalizas) y se le permita la elección dinámica al usuario.

## 2. Módulo de Autenticación y Registro
- **Validación de Teléfono en Registro:** En el proceso de registro (`RegisterScreen.tsx` y componentes web), se implementaron las siguientes restricciones estrictas para los números de celular ecuatorianos:
  - Solo permite ingresar caracteres numéricos.
  - La longitud debe ser exactamente de **10 dígitos**, ni más ni menos.
  - El número debe iniciar obligatoriamente con el prefijo **`09`**.
- **Error del Servidor Backend (`rest_framework.permissions`):** Se resolvieron conflictos en `authentication.py` y `serializers.py` que impedían arrancar el proyecto o autenticarse al no encontrar el módulo de permisos de DRF.

## 3. Módulo de Carrito de Compras
- **Bug de Cobro de Alimentos en $0.00:** Se solucionó un problema que causaba que al añadir alimentos al carrito (como tomates), el sistema los marcara sin precio ($0.00). Ahora el carrito respeta la elección de la variación del cliente (kilo o libra) y refleja el subtotal real.
- **Eliminación de Artículos "No Alimenticios":** Se corrigió un error lógico en la función `removeFromCart` (`CartContext.jsx`). El sistema impedía borrar del carrito a los productos estándar (sin variaciones, ej. mochilas, cuadernos) debido a una incompatibilidad entre valores de variaciones "nulas" (`null` vs `undefined`).
- **Vista de Carrito del Cajero Físico (`CajaAdminPage`):** Se adaptó el flujo de cobro del administrador/cajero. Cuando pesen un producto en balanza física, pueden ingresar la cantidad decimal (ej. 1.25 libras) directamente en el input del carrito y el sistema calculará correctamente el cobro y deducirá los inventarios con redondeo hacia arriba.

## 4. Módulo de Inventario y Administración
- **Redirecciones de Stock Bajo:** Se configuró el panel principal (`DashboardAdminPage`) para que, al dar clic en una alerta de stock bajo, redirija instantáneamente al producto afectado dentro del Inventario, abriendo su modal de edición automáticamente.
- **Eliminación de Productos (UI):** Se removió la alerta estándar y poco estética del navegador web (`window.confirm()`) al tratar de borrar un producto. En su reemplazo, se integró un **Modal de Confirmación Personalizado** y responsivo.
- **Protección de Datos (Soft-Delete):** Anteriormente, el sistema backend arrojaba un error 500 y no permitía borrar productos que ya hubieran sido comprados (debido a protección de bases de datos relacionales). Se re-programó el controlador (`ProductoViewSet.destroy`) para que el borrado sea "Lógico". El producto ya no se destruye de la base de datos para no dañar facturas pasadas, simplemente se cambia su estado a Inactivo (`is_activo = False`) y desaparece del inventario web de forma limpia.

## 5. Módulo de Pagos y Comprobantes
- **Generador de PDF de Recibos:** Se desarrolló un servicio en el backend (`pdf_receipt.py`) potenciado por la librería `ReportLab`.
- **Nuevo Endpoint:** Se agregó la ruta segura `/api/pagos/comprobante/?payment_intent=<id>` para consultar el recibo.
- **Descarga para Cliente:** En la pantalla de **Pago Exitoso** (`CheckoutSuccessPage.jsx`), se añadió un botón que le permite al cliente descargar instantáneamente el comprobante de pago en formato PDF. Este documento oficial contiene su Número de Transacción, detalles y totales, sirviéndole como ticket físico o digital para que pueda reclamar y que le despachen sus compras en la sucursal de la UNL.
