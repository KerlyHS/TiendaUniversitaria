from django.contrib import admin
from .models import Usuario, PrivacyPolicy, Producto, Promocion, Pedido, Venta, DetalleVenta, Caja

admin.site.register(Usuario)
admin.site.register(PrivacyPolicy)
admin.site.register(Producto)
admin.site.register(Promocion)
admin.site.register(Pedido)
admin.site.register(Venta)
admin.site.register(DetalleVenta)
admin.site.register(Caja)