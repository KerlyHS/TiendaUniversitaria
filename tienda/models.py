from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

# ================= ENUMS (TextChoices) =================

class Rol(models.TextChoices):
    ADMINISTRADOR = 'ADMIN', _('Administrador')
    CLIENTE = 'CLIENTE', _('Cliente')
    CAJERO = 'CAJERO', _('Cajero')
    BODEGUERO = 'BODEGUERO', _('Bodeguero')
    GERENTE = 'GERENTE', _('Gerente')
    SUPERVISOR = 'SUPERVISOR', _('Supervisor')

class MetodoPago(models.TextChoices):
    EFECTIVO = 'EFECTIVO', _('Efectivo')
    TRANSFERENCIA = 'TRANSFERENCIA', _('Transferencia')
    DEBITO = 'DEBITO', _('Débito')
    CREDITO = 'CREDITO', _('Crédito')

class ProgresoVenta(models.TextChoices):
    RECIBIDO = 'RECIBIDO', _('Recibido')
    EN_PREPARACION = 'PREPARACION', _('En Preparación')
    LISTO = 'LISTO', _('Listo')
    ENTREGADO = 'ENTREGADO', _('Entregado')
    CANCELADO = 'CANCELADO', _('Cancelado')
    DEVOLUCION = 'DEVOLUCION', _('Devolución')

class Entrega(models.TextChoices):
    TIENDA = 'TIENDA', _('Tienda')
    DOMICILIO = 'DOMICILIO', _('Domicilio')

class CategoriaProducto(models.TextChoices):
    AGRICOLA = 'AGRICOLA', _('Agrícola')
    INSTITUCIONAL = 'INSTITUCIONAL', _('Institucional')
    TECNOLOGICO = 'TECNOLOGICO', _('Tecnológico')
    ACADEMICO = 'ACADEMICO', _('Académico')
    TEXTIL = 'TEXTIL', _('Textil')
    SOUVENIR = 'SOUVENIR', _('Souvenir')
    TEMPORAL = 'TEMPORAL', _('Temporal')

class Medida(models.TextChoices):
    GRAMO = 'GRAMO', _('Gramo')
    KILOGRAMO = 'KILOGRAMO', _('Kilogramo')
    LIBRA = 'LIBRA', _('Libra')
    UNIDAD = 'UNIDAD', _('Unidad')

# ================= EXISTING: POLICY =================

class PrivacyPolicy(models.Model):
    version = models.CharField(max_length=20, unique=True, help_text="Version. Example: v1.0.0")
    content = models.TextField(help_text="Full text of the privacy policy")
    effective_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date']
        verbose_name_plural = "Privacy Policies"

    def __str__(self):
        return f"Privacy Policy {self.version} ({self.effective_date.date()})"

# ================= MÓDULO DE USUARIO =================

class Usuario(AbstractUser):
    # Data Minimization: Use email as primary identifier
    email = models.EmailField(unique=True, verbose_name="Correo Electrónico")
    nombre_completo = models.CharField(max_length=255, verbose_name="Nombre Completo")
    
    # Datos de Persona
    identificacion = models.CharField(max_length=20, blank=True, verbose_name="Identificación")
    direccion = models.TextField(blank=True, verbose_name="Dirección")
    telefono = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    
    # Atributos de Usuario
    rol = models.CharField(max_length=15, choices=Rol.choices, default=Rol.CLIENTE, verbose_name="Rol")
    is_universidad = models.BooleanField(default=False, verbose_name="¿Es de la Universidad?")
    
    # LOPDP Compliance Fields
    consentimiento_lopdp = models.BooleanField(default=False, help_text="Explicit consent to data processing under LOPDP")
    consentimiento_timestamp = models.DateTimeField(null=True, blank=True, help_text="When the consent was given")
    privacy_policy = models.ForeignKey(PrivacyPolicy, on_delete=models.PROTECT, related_name='usuarios', null=True, blank=True, help_text="The privacy policy version accepted")

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nombre_completo']

    def __str__(self):
        return f"{self.nombre_completo} ({self.email}) - {self.get_rol_display()}"


# ================= MÓDULO DE CATÁLOGO =================

class Producto(models.Model):
    codigo = models.CharField(max_length=20, unique=True, null=True, blank=True, verbose_name="Código")
    nombre = models.CharField(max_length=150, verbose_name="Nombre del Producto")
    descripcion = models.TextField(verbose_name="Descripción")
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    
    aplica_impuesto = models.BooleanField(default=True, verbose_name="¿Aplica Impuesto?")
    is_activo = models.BooleanField(default=True, verbose_name="¿Está Activo?")
    vencimiento = models.DateField(null=True, blank=True, verbose_name="Fecha de Vencimiento")
    
    categoria = models.CharField(max_length=20, choices=CategoriaProducto.choices, default=CategoriaProducto.SOUVENIR, verbose_name="Categoría")
    medida = models.CharField(max_length=15, choices=Medida.choices, default=Medida.UNIDAD, verbose_name="Medida")
    
    stock = models.IntegerField(default=0, verbose_name="Stock")
    imagen_url = models.URLField(blank=True, null=True, verbose_name="URL de Imagen Externa")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return f"[{self.codigo}] {self.nombre}"

class Promocion(models.Model):
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    is_use = models.BooleanField(default=True)
    productos = models.ManyToManyField(Producto, related_name='promociones')

# ================= MÓDULO DE VENTAS =================

class Pedido(models.Model):
    estado = models.CharField(max_length=20, choices=ProgresoVenta.choices, default=ProgresoVenta.RECIBIDO)
    tipo_entrega = models.CharField(max_length=15, choices=Entrega.choices, default=Entrega.TIENDA)
    cliente = models.ForeignKey(Usuario, on_delete=models.RESTRICT, related_name='pedidos')
    
class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    metodo_pago = models.CharField(max_length=20, choices=MetodoPago.choices, default=MetodoPago.EFECTIVO)
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, related_name='venta')
    cajero = models.ForeignKey(Usuario, on_delete=models.RESTRICT, related_name='ventas_registradas', limit_choices_to={'rol': Rol.CAJERO})

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    descripcion = models.CharField(max_length=255, blank=True)
    cantidad = models.IntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)

class Caja(models.Model):
    fecha_abre = models.DateTimeField(auto_now_add=True)
    fecha_cierra = models.DateTimeField(null=True, blank=True)
    saldo_abre = models.DecimalField(max_digits=10, decimal_places=2)
    saldo_cierra = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cajero = models.ForeignKey(Usuario, on_delete=models.RESTRICT, related_name='cajas_gestionadas', limit_choices_to={'rol': Rol.CAJERO})
