import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from tienda.models import Producto, CategoriaProducto, Medida, PrivacyPolicy
from django.utils import timezone

User = get_user_model()

def run_setup():
    print("Iniciando Setup de Entorno de Desarrollo...")
    
    # 1. Crear politica de privacidad si no existe (requerido para registrar usuarios)
    policy, created = PrivacyPolicy.objects.get_or_create(
        version="v1.0.0",
        defaults={
            "content": "Política de privacidad de desarrollo.",
            "effective_date": timezone.now()
        }
    )

    # 2. Usuarios base
    users_data = [
        {
            "email": "admin@unl.edu.ec",
            "username": "admin",
            "password": "admin",
            "nombre_completo": "Administrador UNL",
            "rol": "ADMIN",
            "is_superuser": True,
            "is_staff": True
        },
        {
            "email": "cajero@unl.edu.ec",
            "username": "cajero",
            "password": "cajero",
            "nombre_completo": "Cajero Central UNL",
            "rol": "CAJERO",
            "is_superuser": False,
            "is_staff": False
        },
        {
            "email": "consumidor.final@unl.edu.ec",
            "username": "consumidor_final",
            "password": "consumidor_final",
            "nombre_completo": "Consumidor Final",
            "identificacion": "9999999999",
            "rol": "CLIENTE",
            "is_superuser": False,
            "is_staff": False
        }
    ]

    for data in users_data:
        if not User.objects.filter(email=data['email']).exists():
            if data['is_superuser']:
                user = User.objects.create_superuser(
                    email=data['email'],
                    username=data['username'],
                    password=data['password'],
                    nombre_completo=data['nombre_completo']
                )
                user.rol = data['rol']
                user.save()
            else:
                user = User.objects.create_user(
                    email=data['email'],
                    username=data['username'],
                    password=data['password'],
                    nombre_completo=data['nombre_completo'],
                    rol=data['rol'],
                    identificacion=data.get('identificacion', ''),
                    privacy_policy=policy,
                    consentimiento_lopdp=True,
                    consentimiento_timestamp=timezone.now()
                )
            print(f"Creado usuario: {data['email']} (Rol: {data['rol']})")
        else:
            # Asegurarse que tengan el rol correcto
            user = User.objects.get(email=data['email'])
            user.rol = data['rol']
            user.save()
            print(f"Usuario existente actualizado: {data['email']}")

    # 3. Productos Mock (Importando del script original o creando nuevos)
    products_data = [
        {
            "codigo": "PROD-001",
            "nombre": "Kit Universitario UNL (Chompa Oficial + Cuaderno)",
            "descripcion": "Chompa térmica impermeable con logo bordado de la UNL y cuaderno universitario de 100 hojas.",
            "precio": 45.00,
            "stock": 50,
            "categoria": CategoriaProducto.TEXTIL,
            "is_activo": True,
        },
        {
            "codigo": "PROD-002",
            "nombre": "Cuaderno Tapa Dura Premium A4",
            "descripcion": "Cuaderno universitario A4 con diseño exclusivo de la facultad. Hojas de 90g resistentes a tinta.",
            "precio": 8.50,
            "stock": 100,
            "categoria": CategoriaProducto.ACADEMICO,
            "is_activo": True,
        },
        {
            "codigo": "PROD-003",
            "nombre": "Miel de Abeja 500ml Quinta Experimental",
            "descripcion": "Miel de abeja 100% pura, extraída en la quinta experimental Punzara de la UNL.",
            "precio": 6.50,
            "stock": 5, # Low stock para forzar alerta
            "categoria": CategoriaProducto.AGRICOLA,
            "is_activo": True,
            "aplica_impuesto": False
        },
        {
            "codigo": "PROD-004",
            "nombre": "Mochila Porta Laptop Resistente",
            "descripcion": "Mochila ergonómica con compartimento acolchado para laptop de hasta 15.6 pulgadas.",
            "precio": 35.00,
            "stock": 3, # Low stock para forzar alerta
            "categoria": CategoriaProducto.SOUVENIR,
            "is_activo": True,
        },
        {
            "codigo": "PROD-005",
            "nombre": "Remera Algodón Clásica Logo Grande",
            "descripcion": "Camiseta 100% algodón pre-encogido con el escudo tradicional de la universidad.",
            "precio": 15.00,
            "stock": 200,
            "categoria": CategoriaProducto.TEXTIL,
            "is_activo": True,
        },
    ]

    for p_data in products_data:
        obj, created = Producto.objects.get_or_create(
            codigo=p_data['codigo'],
            defaults=p_data
        )
        if created:
            print(f"Producto creado: {obj.nombre}")
        else:
            # Update stock for testing
            obj.stock = p_data['stock']
            obj.save()

    print("Setup completado.")

if __name__ == '__main__':
    run_setup()
