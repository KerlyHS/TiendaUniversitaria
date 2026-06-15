from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, PrivacyPolicy, Producto, Promocion, Pedido, Venta, DetalleVenta, Caja

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    # Añadimos tus campos personalizados al panel de edición del usuario
    fieldsets = UserAdmin.fieldsets + (
        ('Datos de Persona', {'fields': ('identificacion', 'direccion', 'telefono', 'rol', 'is_universidad')}),
        ('LOPDP Compliance', {'fields': ('consentimiento_lopdp', 'consentimiento_timestamp', 'privacy_policy')}),
    )
    # Mostramos columnas útiles en la lista principal
    list_display = ('email', 'nombre_completo', 'rol', 'is_universidad', 'is_staff')
    search_fields = ('email', 'nombre_completo', 'identificacion')
    list_filter = ('rol', 'is_universidad', 'is_staff', 'is_active')

@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = ('version', 'effective_date')
    readonly_fields = ('effective_date',)

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'precio', 'stock', 'categoria', 'is_activo')
    list_filter = ('categoria', 'is_activo', 'aplica_impuesto')
    search_fields = ('codigo', 'nombre')

@admin.register(Promocion)
class PromocionAdmin(admin.ModelAdmin):
    list_display = ('id', 'fecha_inicio', 'fecha_fin', 'is_use')
    list_filter = ('is_use',)

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'estado', 'tipo_entrega')
    list_filter = ('estado', 'tipo_entrega')

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'pedido', 'cajero', 'subtotal', 'fecha', 'metodo_pago')
    list_filter = ('metodo_pago', 'fecha')

@admin.register(DetalleVenta)
class DetalleVentaAdmin(admin.ModelAdmin):
    list_display = ('pedido', 'producto', 'cantidad', 'precio_unitario')

@admin.register(Caja)
class CajaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cajero', 'fecha_abre', 'fecha_cierra', 'saldo_abre')
    list_filter = ('cajero',)