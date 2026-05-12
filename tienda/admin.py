from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, PrivacyPolicy, Producto

@admin.register(Usuario)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'nombre_completo', 'consentimiento_lopdp', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('LOPDP Compliance', {'fields': ('nombre_completo', 'consentimiento_lopdp', 'consentimiento_timestamp', 'privacy_policy')}),
    )

@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = ('version', 'effective_date')

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'precio', 'stock', 'fecha_creacion')
    search_fields = ('nombre', 'descripcion')
