import os
import django

# 1. Configurar entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.conf import settings
settings.DATABASES['default'] = {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}

from django.core.management import call_command
call_command('migrate', verbosity=0)

from tienda.models import Usuario, Producto, Pedido, DetalleVenta, PrivacyPolicy
from tienda.services.payment import StripePaymentService

def run_test():
    print("--- INICIANDO PRUEBA DE STRIPE ---")
    
    # 2. Crear datos de prueba temporales
    policy, _ = PrivacyPolicy.objects.get_or_create(version="v1.0", content="Test")
    
    user, _ = Usuario.objects.get_or_create(
        email="test_stripe@unl.edu.ec",
        defaults={
            "username": "test_stripe@unl.edu.ec",
            "nombre_completo": "Usuario Test Stripe",
            "privacy_policy": policy,
            "consentimiento_lopdp": True
        }
    )
    if not user.check_password("Test1234!"):
        user.set_password("Test1234!")
        user.save()

    producto, _ = Producto.objects.get_or_create(
        codigo="STRIPE01",
        defaults={
            "nombre": "Producto de Prueba Stripe",
            "precio": 25.50,
            "stock": 100,
            "categoria": "OTROS",
            "is_activo": True,
            "aplica_impuesto": True
        }
    )

    import uuid

    # 3. Crear el Pedido
    pedido = Pedido.objects.create(
        numero_pedido=f"P-{uuid.uuid4().hex[:8].upper()}",
        cliente=user,
        estado='RECIBIDO',
        tipo_entrega='TIENDA',
        subtotal=25.50,
        impuesto=3.06, # 12% de 25.50
        total=28.56
    )

    DetalleVenta.objects.create(
        pedido=pedido,
        producto=producto,
        nombre_producto=producto.nombre,
        cantidad=1,
        precio_unitario=producto.precio,
        subtotal=25.50
    )

    print(f"✅ Pedido #{pedido.id} creado por un total de ${pedido.total}")

    # 4. Llamar al servicio de Stripe
    print("⏳ Contactando a Stripe con tu API Key...")
    
    success_url = "http://localhost:3000/exito"
    cancel_url = "http://localhost:3000/cancelado"
    
    try:
        session = StripePaymentService.create_checkout_session(pedido, success_url, cancel_url)
        print("\n🎉 ¡SESIÓN CREADA EXITOSAMENTE!")
        print("======================================================")
        print("Haz clic (o copia y pega) la siguiente URL en tu navegador para ver el checkout real de Stripe:")
        print(session.url)
        print("======================================================")
        print("\nPara probar un pago exitoso, usa los números de tarjeta de prueba de Stripe:")
        print("Número: 4242 4242 4242 4242")
        print("Fecha: Cualquier fecha futura (ej. 12/28)")
        print("CVC: Cualquier número (ej. 123)")
    except Exception as e:
        print(f"\n❌ Error contactando a Stripe: {e}")

if __name__ == '__main__':
    run_test()
