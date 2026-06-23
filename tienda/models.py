from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

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
    HORTALIZAS = 'HORTALIZAS', _('Hortalizas')
    FRUTAS = 'FRUTAS', _('Frutas')
    CARNES = 'CARNES', _('Carnes')
    LACTEOS = 'LACTEOS', _('Lácteos')
    BEBIDAS = 'BEBIDAS', _('Bebidas')

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
    comunidad_rol = models.CharField(max_length=50, blank=True, verbose_name="Rol en la Comunidad UNL")
    
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
    descripcion = models.TextField(verbose_name="Descripción", blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    
    aplica_impuesto = models.BooleanField(default=True, verbose_name="¿Aplica Impuesto?")
    is_activo = models.BooleanField(default=True, verbose_name="¿Está Activo?")
    fecha_llegada = models.DateField(null=True, blank=True, verbose_name="Fecha de Llegada")
    fecha_caducidad = models.DateField(null=True, blank=True, verbose_name="Fecha de Caducidad")
    
    categoria = models.CharField(max_length=20, choices=CategoriaProducto.choices, default=CategoriaProducto.SOUVENIR, verbose_name="Categoría")
    medida = models.CharField(max_length=15, choices=Medida.choices, default=Medida.UNIDAD, verbose_name="Medida")
    
    stock = models.IntegerField(default=0, verbose_name="Stock")
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True, verbose_name="Imagen del Producto")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return f"[{self.codigo}] {self.nombre}"

class ProductoVariacion(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='variaciones')
    nombre = models.CharField(max_length=50, verbose_name="Nombre de Variación", help_text="Ej: Talla S, Kilo, Unidad")
    stock = models.IntegerField(default=0, verbose_name="Stock de Variación")
    precio_adicional = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Precio Adicional")
    precio_fijo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Precio Fijo Override")
    
    class Meta:
        verbose_name = "Variación de Producto"
        verbose_name_plural = "Variaciones de Producto"

    def __str__(self):
        return f"{self.producto.nombre} - {self.nombre}"

class Promocion(models.Model):
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    is_use = models.BooleanField(default=True)
    productos = models.ManyToManyField(Producto, related_name='promociones')

# ================= MÓDULO DE VENTAS =================

class Pedido(models.Model):
    """
    # Modelo Pedido (Orden)
    
    Representa una orden de compra del cliente con seguimiento de estado
    desde recepción hasta entrega.
    
    ## Campos
    - `numero_pedido`: Identificador único (P-YYYYMMDD-XXX)
    - `cliente`: Usuario que realizó la orden
    - `estado`: Estado actual de la orden (RECIBIDO, PREPARACION, LISTO, ENTREGADO, CANCELADO)
    - `tipo_entrega`: Forma de entrega (TIENDA, DOMICILIO)
    - `subtotal`: Suma de items sin impuesto
    - `impuesto`: IVA calculado (12%)
    - `total`: subtotal + impuesto
    
    ## Auditoría
    - `fecha_creacion`: Cuándo se creó la orden
    - `fecha_modificacion`: Última modificación
    """
    numero_pedido = models.CharField(
        max_length=20, 
        unique=True,
        verbose_name="Número de Pedido",
        help_text="Generado automáticamente. Formato: P-YYYYMMDD-XXX"
    )
    estado = models.CharField(
        max_length=20, 
        choices=ProgresoVenta.choices, 
        default=ProgresoVenta.RECIBIDO,
        verbose_name="Estado del Pedido"
    )
    tipo_entrega = models.CharField(
        max_length=15, 
        choices=Entrega.choices, 
        default=Entrega.TIENDA,
        verbose_name="Tipo de Entrega"
    )
    cliente = models.ForeignKey(
        Usuario, 
        on_delete=models.RESTRICT, 
        related_name='pedidos',
        verbose_name="Cliente"
    )
    
    # Totales
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name="Subtotal"
    )
    impuesto = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name="Impuesto (IVA)"
    )
    total = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
        verbose_name="Total"
    )
    
    # Auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    fecha_modificacion = models.DateTimeField(
        auto_now=True,
        verbose_name="Última Modificación"
    )
    
    class Meta:
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['numero_pedido']),
            models.Index(fields=['cliente', '-fecha_creacion']),
            models.Index(fields=['estado']),
        ]
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
    
    def __str__(self):
        return f"{self.numero_pedido} - {self.cliente.nombre_completo} ({self.get_estado_display()})"
    
class Venta(models.Model):
    fecha = models.DateTimeField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    metodo_pago = models.CharField(max_length=20, choices=MetodoPago.choices, default=MetodoPago.EFECTIVO)
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, related_name='venta')
    cajero = models.ForeignKey(Usuario, on_delete=models.RESTRICT, related_name='ventas_registradas', limit_choices_to={'rol': Rol.CAJERO})

class DetalleVenta(models.Model):
    """
    # Modelo DetalleVenta (Item de Venta)
    
    Representa un item individual en una venta/orden con información
    histórica del precio al momento de la compra.
    
    ## Campos Históricos
    - `nombre_producto`: Snapshot del nombre del producto
    - `precio_unitario`: Precio que se pagó (no cambia si el producto se hace más caro)
    - `cantidad`: Cantidad comprada
    - `subtotal`: cantidad * precio_unitario
    """
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name='detalles_venta',
        null=True,
        blank=True,
        verbose_name="Pedido"
    )
    producto = models.ForeignKey(
        Producto, 
        on_delete=models.PROTECT,
        verbose_name="Producto"
    )
    
    # Información histórica (snapshots al momento de la venta)
    nombre_producto = models.CharField(
        max_length=255,
        verbose_name="Nombre del Producto",
        help_text="Snapshot del nombre al momento de la venta"
    )
    variacion = models.ForeignKey(
        ProductoVariacion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Variación Seleccionada"
    )
    descripcion = models.TextField(
        blank=True,
        verbose_name="Descripción"
    )
    cantidad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1.00,
        verbose_name="Cantidad",
        validators=[MinValueValidator(0.01)]
    )
    
    # Precio histórico
    precio_unitario = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name="Precio Unitario",
        help_text="Precio pagado por unidad (histórico)"
    )
    subtotal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=0.00,
        verbose_name="Subtotal",
        help_text="cantidad * precio_unitario"
    )
    
    # Auditoría
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )
    
    class Meta:
        ordering = ['fecha_creacion']
        verbose_name = "Detalle de Venta"
        verbose_name_plural = "Detalles de Venta"
    
    def __str__(self):
        return f"{self.nombre_producto} x {self.cantidad} @ ${self.precio_unitario}"
    
    def save(self, *args, **kwargs):
        """Auto-calcular subtotal si no está seteado"""
        if not self.subtotal:
            self.subtotal = self.cantidad * self.precio_unitario
        super().save(*args, **kwargs)

class Caja(models.Model):
    fecha_abre = models.DateTimeField(auto_now_add=True)
    fecha_cierra = models.DateTimeField(null=True, blank=True)
    saldo_abre = models.DecimalField(max_digits=10, decimal_places=2)
    saldo_cierra = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cajero = models.ForeignKey(Usuario, on_delete=models.RESTRICT, related_name='cajas_gestionadas', limit_choices_to={'rol': Rol.CAJERO})

class EstadoTransaccion(models.TextChoices):
    PENDING = 'PENDING', _('Pendiente')
    APROBADO = 'APROBADO', _('Aprobado')
    RECHAZADO = 'RECHAZADO', _('Rechazado')

class Transaccion(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, related_name='transaccion')
    stripe_session_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=EstadoTransaccion.choices, default=EstadoTransaccion.PENDING)
    metodo_pago = models.CharField(max_length=50, default='STRIPE')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = "Transacción"
        verbose_name_plural = "Transacciones"

    def __str__(self):
        return f"TX {self.id} - Pedido {self.pedido.id} - {self.estado}"