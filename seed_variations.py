import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from tienda.models import Producto, ProductoVariacion

# Añadir tallas a las Remeras (ID 5 y 12)
remeras = Producto.objects.filter(nombre__icontains='Remera')
for remera in remeras:
    if not ProductoVariacion.objects.filter(producto=remera).exists():
        ProductoVariacion.objects.create(producto=remera, nombre='Talla S', stock=10)
        ProductoVariacion.objects.create(producto=remera, nombre='Talla M', stock=15)
        ProductoVariacion.objects.create(producto=remera, nombre='Talla L', stock=0) # Out of stock para probar el disable
        ProductoVariacion.objects.create(producto=remera, nombre='Talla XL', stock=5)
        print(f"Variaciones añadidas a {remera.nombre}")

# Añadir Unidad / Kilo a Miel o Tomates si hubieran (simularemos con la Miel)
mieles = Producto.objects.filter(nombre__icontains='Miel')
for miel in mieles:
    if not ProductoVariacion.objects.filter(producto=miel).exists():
        ProductoVariacion.objects.create(producto=miel, nombre='Por Unidad', stock=50, precio_fijo=miel.precio)
        ProductoVariacion.objects.create(producto=miel, nombre='Por Kilo', stock=10, precio_fijo=miel.precio * 2) # el doble
        print(f"Variaciones añadidas a {miel.nombre}")
        
print("Completado.")
