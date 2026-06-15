# 🎯 PLAN DE ACCIÓN - Integraciones Críticas (MVP)  
**Fecha:** 27 de Mayo 2026  
**Objetivo:** Completar 3 features críticas en 4 semanas (Junio 2026)  

---

## VISIÓN GENERAL

```
Situación Actual (Mayo 2026):
├─ ✅ 56 tests pasando
├─ ✅ 5 specs completadas
├─ ✅ Catálogo funcional
├─ ✅ Órdenes funcionales
└─ ❌ SIN PAGOS, SIN CARRITO, SIN LDAP

Situación Objetivo (Julio 2026):
├─ ✅ 80+ tests
├─ ✅ Pagos via CopyAndPay
├─ ✅ Carrito completamente funcional
└─ ✅ LDAP UNL integrado
```

---

## P0.1: PASARELA DE PAGOS (CopyAndPay)

### Duración: 3-4 semanas

### 1.1 Especificación

**Archivo:** `specs/006-sistema-pagos/spec.md`

```markdown
# SPEC-006: Sistema de Pagos - CopyAndPay

## Objetivo
Integrar PrimeiroPay (CopyAndPay) para procesar transacciones de tarjeta
de crédito/débito de forma segura según PCI-DSS.

## Requisitos Funcionales

### RF1: Preparar Checkout
**Endpoint:** POST /api/pagos/preparar-checkout/
**Flujo:** Backend genera checkout_id en PrimeiroPay

Request:
```json
{
  "pedido_id": 42,
  "monto": 39.96,
  "moneda": "USD",
  "descripcion": "Pedido P-20260527-001"
}
```

Response:
```json
{
  "checkout_id": "f8d0e1f8-8a9f-4b3e-9f1c-5d1e0c8d0e1f",
  "formulario_html": "<html>...</html>",  // Iframe para tarjeta
  "estado": "PENDING_PAYMENT"
}
```

### RF2: Confirmar Pago
**Endpoint:** GET /api/pagos/confirmar/?resourcePath=/v1/checkouts/{id}/payment
**Flujo:** Post-pago, PrimeiroPay redirige aquí

Response:
```json
{
  "transaccion_id": "TX-12345",
  "estado": "APROBADO",
  "monto": 39.96,
  "pedido_id": 42,
  "metodo": "VISA",
  "ultimos_digitos": "4242"
}
```

### RF3: Registrar Transacción
**Modelo:** Transaccion
```python
class Transaccion(models.Model):
    numero_transaccion = CharField(unique=True)  # TX-12345
    pedido = FK(Pedido)
    monto = Decimal()
    moneda = CharField()  # USD
    estado = CharField(choices=['PENDING', 'APROBADO', 'RECHAZADO', 'CANCELADO'])
    metodo_pago = CharField(choices=['VISA', 'MASTERCARD', 'CREDITO', 'EFECTIVO'])
    referencia_primeiropay = CharField()
    error_message = TextField(blank=True)
    fecha_creacion = DateTimeField(auto_now_add=True)
```

### RF4: Cambiar Orden a PAGADO
- Transaccion.estado = APROBADO → Pedido.estado = LISTO (auto)
- Enviar email de confirmación
- Generar recibo PDF

## Requisitos No Funcionales

### Seguridad
- ✅ NO almacenar datos de tarjeta (PCI-DSS compliant)
- ✅ Webhook signature validation
- ✅ HTTPS obligatorio
- ✅ Timeout de 5 minutos en checkout

### Performance
- ✅ Response < 500ms (sin incluir red PrimeiroPay)
- ✅ Reintentos automáticos (3x con exponential backoff)

### Integración PrimeiroPay
- ✅ API Key en .env
- ✅ Modo test vs production
- ✅ Error handling específico
```

---

### 1.2 Tasks Detalladas

**T001:** Crear modelo `Transaccion` + migrations
- Archivo: `tienda/models.py`
- Agregar 15 líneas
- Crear migration

**T002:** Crear serializers para pagos
- Archivo: `tienda/serializers.py`
- `TransaccionSerializer` (read-only)
- `CheckoutRequestSerializer` (validar monto, pedido)

**T003:** Implementar ViewSet de Pagos
- Archivo: `tienda/views.py`
- `PagoViewSet` con:
  - `prepare_checkout()` - Generar checkout_id en PrimeiroPay
  - `confirm_payment()` - Validar pago y crear Transaccion
  - Permissions: IsAuthenticated

**T004:** Agregar rutas
- Archivo: `tienda/urls.py`
- `POST /api/pagos/preparar-checkout/`
- `GET /api/pagos/confirmar/`

**T005:** Integración PrimeiroPay
- Crear `tienda/services/payment.py`
- Clase `PrimeiroPay`:
  ```python
  class PrimeiroPay:
      def __init__(self, api_key):
          self.api_key = api_key
          self.base_url = "https://api.primeiropay.com/v1"
      
      def create_checkout(self, monto, pedido_id):
          # POST /checkouts
          pass
      
      def get_payment_status(self, checkout_id):
          # GET /checkouts/{id}/payment
          pass
  ```

**T006:** Manejar Webhooks
- Crear `tienda/webhooks.py`
- Endpoint: `POST /api/webhooks/primeiropay/`
- Validar firma de webhook
- Actualizar estado de Transaccion

**T007:** Tests (15 casos)
- test_prepare_checkout_success
- test_prepare_checkout_pedido_no_existe
- test_confirm_payment_success
- test_confirm_payment_amount_mismatch
- test_confirm_payment_timeout
- test_webhook_signature_invalid
- test_transaccion_creates_pedido_listo
- test_transaccion_send_email
- test_retry_mechanism
- test_concurrent_checkouts
- test_fraud_detection
- test_refund_success
- test_refund_partial
- test_payment_cancel
- test_error_messages_specific

**T008:** Documentación
- Actualizar `docs/pagos-copyandpay.qmd`
- Ejemplos React de checkout
- Error handling guide
- Troubleshooting

---

### 1.3 Dependencias Externas

```bash
# Agregar a requirements.txt
requests==2.32.0          # HTTP calls a PrimeiroPay
cryptography==43.0.0      # Webhook signature validation
```

---

### 1.4 Configuración

```python
# core/settings.py

# PrimeiroPay
PRIMEIROPAY_API_KEY = os.getenv('PRIMEIROPAY_API_KEY')
PRIMEIROPAY_SECRET = os.getenv('PRIMEIROPAY_SECRET')
PRIMEIROPAY_MODE = os.getenv('PRIMEIROPAY_MODE', 'test')  # test o production
PRIMEIROPAY_WEBHOOK_URL = os.getenv('PRIMEIROPAY_WEBHOOK_URL')

# URLs de retorno
PAYMENT_SUCCESS_URL = os.getenv('PAYMENT_SUCCESS_URL', 'http://localhost:3000/payment/success')
PAYMENT_FAILURE_URL = os.getenv('PAYMENT_FAILURE_URL', 'http://localhost:3000/payment/failure')
```

---

### 1.5 Testing Strategy

```python
# tienda/tests.py - Nueva clase

class PagoApiTests(TestCase):
    def setUp(self):
        # Mock PrimeiroPay responses
        self.patcher = patch('tienda.services.payment.PrimeiroPay')
        self.mock_payment = self.patcher.start()
        
    def test_prepare_checkout_success(self):
        """Generar checkout_id válido"""
        # Given: Pedido existente
        pedido = Pedido.objects.create(...)
        
        # When: POST /api/pagos/preparar-checkout/
        res = self.client.post(
            reverse('pago-preparar-checkout'),
            {'pedido_id': pedido.id},
            format='json'
        )
        
        # Then: Retorna checkout_id
        self.assertEqual(res.status_code, 200)
        self.assertIn('checkout_id', res.data)
        self.assertIn('formulario_html', res.data)
```

---

## P0.2: CARRITO DE COMPRAS

### Duración: 2-3 semanas

### 2.1 Especificación

**Archivo:** `specs/007-carrito-compras/spec.md`

```markdown
# SPEC-007: Carrito de Compras

## Objetivo
Permitir usuarios agregar productos, modificar cantidades y
revisar antes de pagar (mejora UX vs directo a pedido).

## Modelos

### Carrito
```python
class Carrito(models.Model):
    usuario = FK(Usuario)
    fecha_creacion = DateTimeField(auto_now_add=True)
    fecha_modificacion = DateTimeField(auto_now=True)
    
    def get_subtotal(self):
        return sum(item.subtotal for item in self.items.all())
    
    def get_total(self):
        # Incluye impuestos según producto.aplica_impuesto
        pass
```

### CarritoItem
```python
class CarritoItem(models.Model):
    carrito = FK(Carrito)
    producto = FK(Producto)
    cantidad = IntegerField()
    precio_snapshot = Decimal()  # Precio al agregar
    
    @property
    def subtotal(self):
        return self.cantidad * self.precio_snapshot
```

## Endpoints

- GET /api/carrito/ - Ver carrito del usuario
- POST /api/carrito/items/ - Agregar item
- PUT /api/carrito/items/{id}/ - Actualizar cantidad
- DELETE /api/carrito/items/{id}/ - Remover item
- POST /api/carrito/checkout/ - Convertir a Pedido

## Validaciones

- Cantidad > 0
- Stock suficiente en tiempo real
- Carrito expira en 24 horas (sin compra)
```

---

### 2.2 Tasks

**T009:** Crear modelos `Carrito` + `CarritoItem`
**T010:** Serializers para carrito
**T011:** CarritoViewSet con CRUD
**T012:** Endpoint checkout (Carrito → Pedido)
**T013:** Tests (12 casos)
**T014:** Documentación

---

## P0.3: LDAP/UNL INTEGRATION

### Duración: 2-3 semanas

### 3.1 Especificación

**Archivo:** `specs/008-ldap-unl/spec.md`

```markdown
# SPEC-008: Integración LDAP - Universidad Nacional de Loja

## Objetivo
Validar usuarios contra directorio LDAP de UNL (LOPDP compliant).

## Flujo de Autenticación

1. Usuario submite email UNL + password
2. Backend busca en LDAP: uid=usuario, ou=students, dc=unl, dc=edu, dc=ec
3. Si existe y válido: Crear/actualizar Usuario local
4. Retornar JWT token

## Configuración

```python
# .env
LDAP_SERVER = ldap://ldap.unl.edu.ec:389
LDAP_BASE_DN = ou=students,dc=unl,dc=edu,dc=ec
LDAP_BIND_DN = cn=admin,dc=unl,dc=edu,dc=ec
LDAP_BIND_PASSWORD = [from vault]
```

## Validaciones

- ✅ Email debe terminar en @unl.edu.ec
- ✅ Debe existir en LDAP
- ✅ Password validado por LDAP (no guardamos)
- ✅ Sincronizar nombre completo de LDAP
```

---

### 3.2 Tasks

**T015:** Instalar python-ldap
**T016:** Crear `tienda/auth/ldap.py` - Backend custom
**T017:** Serializer para LDAP auth
**T018:** ViewSet LDAP login
**T019:** Tests (10 casos - Mocked LDAP)
**T020:** Documentación

---

## GESTIÓN DEL PROYECTO

### Equipo Sugerido
- 1-2 Backend developers
- 1 QA/Test automation
- 1 DevOps (PrimeiroPay + LDAP setup)

### Herramientas
- Jira/GitHub Projects para tracking
- Postman para testing de APIs
- Swagger UI para documentación

### Weekly Sync
- Lunes 9am: Kickoff + bloqueantes
- Miércoles 5pm: Mid-week check
- Viernes 4pm: Review + retrospective

### Git Workflow
```bash
main (prod)
 ↑
staging (QA)
 ↑
develop (integration)
 ↑
feature/pago-copyandpay
feature/carrito
feature/ldap-unl
```

### Definición de Done
- [ ] Código escrito + 1 review
- [ ] Tests: 100% pass rate
- [ ] Documentación actualizada
- [ ] Deployment a staging
- [ ] QA sign-off

---

## RIESGOS Y MITIGACIÓN

### Riesgo 1: Cambios de API PrimeiroPay
**Probabilidad:** Media  
**Impacto:** Alto  
**Mitigación:** 
- Usar cliente SDK official si existe
- Tests mocked para evitar cambios de API
- Versioning explícito de endpoints

### Riesgo 2: LDAP unavailable
**Probabilidad:** Baja  
**Impacto:** Alto  
**Mitigación:**
- Fallback a auth local para debugging
- Cache de LDAP lookups (1 hora)
- Health check endpoint

### Riesgo 3: Timeout en pagos
**Probabilidad:** Media  
**Impacto:** Alto  
**Mitigación:**
- Timeout configurables (5 min default)
- Reintentos automáticos
- Status check asyncrono

---

## EJEMPLOS DE CÓDIGO

### Archivo: `tienda/services/payment.py`

```python
import requests
import hmac
import hashlib
from django.conf import settings

class PrimeiroPay:
    """Cliente seguro para CopyAndPay"""
    
    def __init__(self):
        self.api_key = settings.PRIMEIROPAY_API_KEY
        self.secret = settings.PRIMEIROPAY_SECRET
        self.base_url = f"https://{'api.test' if settings.PRIMEIROPAY_MODE == 'test' else 'api.prod'}.primeiropay.com/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_checkout(self, pedido_id, monto, descripcion):
        """Crear checkout para pago"""
        payload = {
            'amount': float(monto),
            'currency': 'USD',
            'description': descripcion,
            'order_id': str(pedido_id),
            'return_url': settings.PAYMENT_SUCCESS_URL,
            'cancel_url': settings.PAYMENT_FAILURE_URL
        }
        
        response = requests.post(
            f'{self.base_url}/checkouts',
            json=payload,
            headers=self.headers,
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    
    def validate_webhook(self, signature, payload):
        """Validar firma de webhook"""
        expected = hmac.new(
            self.secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(signature, expected)
```

### Archivo: `tienda/auth/ldap.py`

```python
import ldap
from django.contrib.auth.backends import ModelBackend
from tienda.models import Usuario, Rol

class LdapAuthBackend(ModelBackend):
    """Autenticación via LDAP UNL"""
    
    def authenticate(self, request, username=None, password=None):
        # Validar que sea email UNL
        if not username.endswith('@unl.edu.ec'):
            return None
        
        try:
            # Conectar a LDAP
            conn = ldap.initialize(settings.LDAP_SERVER)
            
            # Bind con credenciales admin
            conn.simple_bind_s(
                settings.LDAP_BIND_DN,
                settings.LDAP_BIND_PASSWORD
            )
            
            # Buscar usuario
            search_filter = f"(uid={username.split('@')[0]})"
            result = conn.search_s(
                settings.LDAP_BASE_DN,
                ldap.SCOPE_SUBTREE,
                search_filter
            )
            
            if not result:
                return None
            
            # Validar password directamente con LDAP
            user_dn = result[0][0]
            try:
                user_conn = ldap.initialize(settings.LDAP_SERVER)
                user_conn.simple_bind_s(user_dn, password)
                user_conn.unbind()
            except ldap.INVALID_CREDENTIALS:
                return None
            
            # Crear/actualizar Usuario local
            user, created = Usuario.objects.get_or_create(
                username=username,
                defaults={
                    'email': username,
                    'rol': Rol.CLIENTE.value,
                    'nombre_completo': result[0][1].get('cn', [b''])[0].decode()
                }
            )
            
            return user
        
        except Exception as e:
            print(f"LDAP error: {e}")
            return None
```

---

## CALENDARIO DETALLADO (Junio 2026)

### Semana 1 (3-7 Junio)
- **Lunes:** Kickoff, setup API keys PrimeiroPay
- **Mar-Jue:** T001-T004 (Modelo + ViewSet Pagos)
- **Viernes:** Review + tests básicos

### Semana 2 (10-14 Junio)
- **Lunes:** Integración PrimeiroPay (T005-T006)
- **Tue-Thu:** Webhooks + Tests (T007)
- **Viernes:** Deploy a staging

### Semana 3 (17-21 Junio)
- **Lunes:** Carrito Modelos (T009)
- **Tue-Thu:** Carrito ViewSet (T010-T012)
- **Viernes:** LDAP Básico (T015)

### Semana 4 (24-28 Junio)
- **Lunes:** LDAP Tests (T016-T019)
- **Tue-Thu:** Fixes + QA
- **Viernes:** Final Review + Release Candidate

---

## DEFINICIÓN DE ÉXITO

✅ 3 features críticas implementadas  
✅ 80+ tests con 100% pass rate  
✅ Documentación completa (3 specs nuevos)  
✅ Deployment a staging exitoso  
✅ QA approval sin blockers  
✅ Código review 100%  

→ **MVP listo para Julio 2026**

---

**Preparado por:** Backend Development Team  
**Estimado Horas:** 480 (120 por feature)  
**Timeline:** 4 semanas (Junio 2026)
