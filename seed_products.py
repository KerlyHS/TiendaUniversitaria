import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from tienda.models import Producto, CategoriaProducto

mock_products = [
  { 'id': 1, 'nombre': 'Kit Universitario UNL (Chompa Oficial + Cuaderno)', 'precio': 45.50, 'categoria': CategoriaProducto.SOUVENIR, 'imagen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8s2e43X9WRzmAi0mjrkDrY5jNf36VL85SIqNLvC0MMwdpSHk1qMuvPLzloYnz-7QNM8haZDUxm6qBeDXLgHqB67MP2GEOfjnBQVMkiNDIW5bB2suA7giHGhYf0UYAUsjxGEE5aeqFCNhcDn-FddoSURtKGg-F-KPcJre3vC39jAoshJ44U75ASeHmkORiFtH3Ij0mlE4yJXLDPQkIHaL1Gg9E2MJQZN6qaMDyRkk_DJLlyH7VXbZTHJVHWIj4cFzASiHawdjcLM9O' },
  { 'id': 2, 'nombre': 'Cuaderno Tapa Dura Premium A4', 'precio': 12.50, 'categoria': CategoriaProducto.ACADEMICO, 'imagen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL1sRGzq0Ux-PyFByMuhAeIkIV0uM3EF5TBA0o8vovtX4vGpnFtx1lvoTgiXwAjiivdjXgRgOuhw2cKfg-pyDVVuN43vw1-Z38Ec5IOeYhxCZW7UwYmWIC8zbJB2jU4vqeSdjds-R1RUVIqc70fOGN4oW6yINhUYXWJt--Qciv8KHV3vTPOZMTiHv8ss9_3hex3Orsy-QFGwhh5y1IZkfHDOpmYjCmtT2Qq81iploVwQU-A0Oi81763MbrflwHDzZyc-xtP798EM8i' },
  { 'id': 3, 'nombre': 'Miel de Abeja 500ml Quinta Experimental', 'precio': 8.00, 'categoria': CategoriaProducto.AGRICOLA, 'imagen': 'https://via.placeholder.com/400x400?text=Miel' },
  { 'id': 4, 'nombre': 'Mochila Porta Laptop Resistente', 'precio': 32.00, 'categoria': CategoriaProducto.ACADEMICO, 'imagen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdadbANagg12yUJK3OJeK1cj500h-jJwSnvnEV6lcN9HRRihB0bBt_b9mxhZNmguC3I2y6mw3EdONEfWCIHBqrr0YQQPS4MbceIhN7gYzSeHy739KLU6Y83qQNWHCdRRY3fnv3rWl5vOhK7HbAR9E3FoT2Z_v3UxpHA1IpNpWkOe6v4FcmIdEZnEeutA3R2G5tBTpf7EuRPhNkybs4cR-bR1u-cTg7DWoPBjdm-qDorU_zqMuSwUpvboS5DuRscDuXf5400e1clqWk' },
  { 'id': 5, 'nombre': 'Remera Algodón Clásica Logo Grande', 'precio': 18.90, 'categoria': CategoriaProducto.TEXTIL, 'imagen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQqbUNeGkhTGYj3KTyyAJpfIfAuEbqOTuQMH58T16LA8sbQVsgspjZTUilBTXBqHKNWvOGNXC5fvEN1WsrBaXn-m2vUnUr0JXB0--kXdpb5LOt2KuzXwtf9zjT8rRudpi2lgfbJSS4CSaGTC1GhEVodFkYjNWLI1HP6-NSm2IVfl-9RGRqremYRVomqWu8UYmd6IgjR32DoTQ0DwjoKg5VNdNsYIwXfY3bGoLc2wVxXPHZabLceCHNWR2yRIcWfWbhIC0hGgRtmQb9' },
  { 'id': 6, 'nombre': 'Taza Cerámica Edición Matte Black', 'precio': 8.50, 'categoria': CategoriaProducto.SOUVENIR, 'imagen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_otA51zWbGU7151_63698MNYiFkz5Vxsw5RoPWOzFCAolNU3H1iyEfLpdoIxweNt9pmWYnvwuIy_kK0FnXIqcP5t_x6THXdff7r9YRfHgciyRyrJ5Is9Gx5ot7dx5fIVLfnQ7AX299NrQhTgbo0FkEN5TL41x2FCo2HDc1MVtcGfQDmyVgRVW70ovFBZ-6WCSBnemjxuhIq-UKcgw9b0g_Rq34gegPTa32WMhxQQmeMH8zNSaMV8JUKZQpJkQJghwO8b8Aga49cH8' },
  { 'id': 7, 'nombre': 'Termo Acero Inoxidable 1L Edición Especial', 'precio': 32.00, 'categoria': CategoriaProducto.SOUVENIR, 'imagen': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeyDgAIjcEp0s6KHJhEaGoIi0S5_NkbnkeaX8ZUB3y3AP9-UEuEA7MaXMsEvI5jlJob1IJasaQZDPzMiRnnicNSHQPBQ651nfHXnqTKBymauMMRzNYJR5eH-nT2aasqrwfcQ984dVql9pTwk34hzxHbs9GmBj3TKAOW-v_nM86pE7wSDiD1lnqy_l-94TdhND5n1HrxFh-3IVk83qd7fHaStsePjyfM-p5-ccjV-iy_zXVg1Y7DnpxP2mW4vMIOTfPJeq_RQyys1w7' },
]

print("Seeding mock products...")
for mp in mock_products:
    prod, created = Producto.objects.update_or_create(
        id=mp['id'],
        defaults={
            'nombre': mp['nombre'],
            'precio': mp['precio'],
            'categoria': mp['categoria'],
            'descripcion': mp['nombre'] + ' de excelente calidad.',
            'stock': 100,
            'is_activo': True,
            'codigo': f"SKU-{mp['id']:03d}",
        }
    )
    if mp['imagen'] and not prod.imagen:
        # Save image URL conceptually (since it's an ImageField, we can't save an external URL directly without a custom field,
        # but let's assume we handle images by serving them or just storing path. Wait, ImageField stores paths.
        # If we store a URL in ImageField, Django might fail on some operations or serve it incorrectly.
        # But for development, let's keep it simple. Actually, we can just leave it as is if there is no image handling yet.
        pass
    action = "Created" if created else "Updated"
    print(f"{action} Product: {prod.nombre}")

print("Done.")
