from rest_framework import serializers
from .models import (
    Usuario, PrivacyPolicy, Producto, Promocion,
    Pedido, Venta, DetalleVenta, Caja
)
from django.utils import timezone
from django.db import transaction
from datetime import datetime

# ============================================================
# UTILIDADES
# ============================================================

def generate_order_number():
    """
    Genera un número de pedido único con formato P-YYYYMMDD-XXX.
    
    Ejemplo: P-20260527-001, P-20260527-002
    """
    today = datetime.now().strftime('%Y%m%d')
    count = Pedido.objects.filter(numero_pedido__startswith=f'P-{today}').count()
    return f'P-{today}-{count+1:03d}'


# ============================================================
# SERIALIZERS - PRODUCTOS
# ============================================================

class ProductoSerializer(serializers.ModelSerializer):
    """
    # Serializer de Productos
    
    Serializa y valida datos de productos incluyendo:
    - Validación de precio > 0.01
    - Validación de stock >= 0
    - Campos de solo lectura: id, fecha_creacion
    """
    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ['id', 'fecha_creacion']
    
    def validate_precio(self, value):
        """Validar que el precio sea positivo"""
        if value < 0.01:
            raise serializers.ValidationError(
                "El precio debe ser mayor que 0.00"
            )
        return value
    
    def validate_stock(self, value):
        """Validar que el stock sea no-negativo"""
        if value < 0:
            raise serializers.ValidationError(
                "El stock no puede ser negativo"
            )
        return value


class PromocionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = '__all__'


# ============================================================
# SERIALIZERS - VENTAS Y DETALLES
# ============================================================

class DetalleVentaSerializer(serializers.ModelSerializer):
    """
    # Serializer de Detalle de Venta (Item)
    
    Serializa items individuales de una venta con información histórica.
    Incluye snapshots de precio y nombre del producto al momento de la venta.
    
    ## Campos Read-only
    - `id`: ID del detalle
    - `nombre_producto`: Snapshot del nombre
    - `subtotal`: Calculado automáticamente
    - `fecha_creacion`: Auto-generado
    """
    producto_nombre = serializers.CharField(source='nombre_producto', read_only=True)
    
    class Meta:
        model = DetalleVenta
        fields = [
            'id', 'producto', 'producto_nombre', 'nombre_producto',
            'cantidad', 'precio_unitario', 'subtotal', 'descripcion',
            'fecha_creacion'
        ]
        read_only_fields = [
            'id', 'nombre_producto', 'subtotal', 'fecha_creacion'
        ]


class VentaSerializer(serializers.ModelSerializer):
    """
    # Serializer de Venta (Transacción)
    
    Serializa transacciones de venta con detalles de items anidados.
    Una venta está vinculada a un Pedido y contiene la información
    de pago y el cajero que procesó la venta.
    """
    detalles = DetalleVentaSerializer(source='pedido.detalles_venta', many=True, read_only=True)
    
    class Meta:
        model = Venta
        fields = [
            'id', 'pedido', 'cajero', 'subtotal', 'metodo_pago',
            'fecha', 'detalles'
        ]
        read_only_fields = ['id', 'subtotal', 'fecha']


# ============================================================
# SERIALIZERS - PEDIDOS (ÓRDENES)
# ============================================================

class PedidoCreateSerializer(serializers.Serializer):
    """
    # Serializer de Creación de Pedido
    
    Valida y crea un nuevo pedido con validación de stock y
    cálculo automático de totales.
    
    ## Input Format
    ```json
    {
      "tipo_entrega": "TIENDA",
      "detalles": [
        {"producto_id": 1, "cantidad": 2},
        {"producto_id": 3, "cantidad": 1}
      ]
    }
    ```
    
    ## Validaciones
    - Cada producto debe existir y estar activo
    - Stock debe ser suficiente para cada item
    - Cantidad debe ser >= 1
    """
    
    tipo_entrega = serializers.ChoiceField(
        choices=['TIENDA', 'DOMICILIO'],
        default='TIENDA'
    )
    detalles = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        help_text="Lista de items: [{'producto_id': 1, 'cantidad': 2}, ...]"
    )
    
    def validate_detalles(self, value):
        """
        Validar que cada item tenga producto válido con stock suficiente.
        
        Raises:
            ValidationError: Si stock es insuficiente o producto no existe
        """
        if not value:
            raise serializers.ValidationError(
                "Debe incluir al menos un producto en la orden."
            )
        
        for detalle in value:
            producto_id = detalle.get('producto_id')
            cantidad = detalle.get('cantidad')
            
            # Validar que existan los campos requeridos
            if not producto_id:
                raise serializers.ValidationError(
                    "Cada detalle debe incluir 'producto_id'"
                )
            if not cantidad:
                raise serializers.ValidationError(
                    "Cada detalle debe incluir 'cantidad'"
                )
            
            # Validar que la cantidad sea positiva
            try:
                cantidad = int(cantidad)
                if cantidad < 1:
                    raise ValueError
            except (ValueError, TypeError):
                raise serializers.ValidationError(
                    f"Cantidad debe ser un número positivo, recibido: {cantidad}"
                )
            
            # Validar que el producto exista
            try:
                producto = Producto.objects.get(id=producto_id)
            except Producto.DoesNotExist:
                raise serializers.ValidationError(
                    f"Producto con ID {producto_id} no existe"
                )
            
            # Validar que el producto esté activo
            if not producto.is_activo:
                raise serializers.ValidationError(
                    f"Producto '{producto.nombre}' no está disponible"
                )
            
            # Validar que haya stock suficiente
            if producto.stock < cantidad:
                raise serializers.ValidationError(
                    f"Stock insuficiente para '{producto.nombre}'. "
                    f"Disponible: {producto.stock}, Solicitado: {cantidad}"
                )
            
            # Actualizar el detalle con valores calculados
            detalle['producto'] = producto
            detalle['cantidad'] = cantidad
            detalle['nombre_producto'] = producto.nombre
            detalle['descripcion'] = producto.descripcion or ""
            detalle['precio_unitario'] = producto.precio
            detalle['subtotal'] = cantidad * producto.precio
        
        return value
    
    def create(self, validated_data):
        """
        Crear pedido con detalles, validar stock atomicamente,
        reducir stock y calcular totales.
        """
        from decimal import Decimal
        
        user = self.context['request'].user
        tipo_entrega = validated_data['tipo_entrega']
        detalles_data = validated_data['detalles']
        
        with transaction.atomic():
            # Generar número de pedido único
            numero_pedido = generate_order_number()
            
            # Crear pedido
            pedido = Pedido.objects.create(
                numero_pedido=numero_pedido,
                cliente=user,
                tipo_entrega=tipo_entrega,
                estado='RECIBIDO'
            )
            
            # Crear detalles y reducir stock
            subtotal = Decimal('0.00')
            impuesto_total = Decimal('0.00')
            
            from django.conf import settings
            for detalle_data in detalles_data:
                # RE-FETCH WITH LOCK TO PREVENT RACE CONDITIONS
                producto = Producto.objects.select_for_update().get(id=detalle_data['producto'].id)
                cantidad = detalle_data['cantidad']
                
                if producto.stock < cantidad:
                    raise serializers.ValidationError(f"Stock insuficiente para '{producto.nombre}'. Disponible: {producto.stock}, Solicitado: {cantidad}")
                    
                precio_unitario = Decimal(str(detalle_data['precio_unitario']))
                
                # Crear detalle de venta (vinculado a Pedido, no a Venta)
                DetalleVenta.objects.create(
                    pedido=pedido,  # Vincular al Pedido
                    producto=producto,
                    nombre_producto=detalle_data['nombre_producto'],
                    descripcion=detalle_data['descripcion'],
                    cantidad=cantidad,
                    precio_unitario=precio_unitario,
                    subtotal=detalle_data['subtotal']
                )
                
                # Reducir stock
                producto.stock -= cantidad
                producto.save()
                
                # Calcular totales
                item_subtotal = Decimal(str(detalle_data['subtotal']))
                subtotal += item_subtotal
                
                # Calcular impuesto si aplica
                if producto.aplica_impuesto:
                    impuesto_total += item_subtotal * settings.IMPUESTO_IVA
            
            # Actualizar totales del pedido
            pedido.subtotal = subtotal
            pedido.impuesto = impuesto_total
            pedido.total = subtotal + impuesto_total
            pedido.save()
        
        return pedido


class PedidoDetailSerializer(serializers.ModelSerializer):
    """
    # Serializer de Detalle de Pedido (Lectura)
    
    Serializa un pedido completo con información anidada de detalles,
    venta y cliente. Usado para GET /pedidos/{id}/.
    
    ## Campos Read-only
    - `numero_pedido`: Identificador único generado
    - `subtotal, impuesto, total`: Calculados automáticamente
    - `detalles`: Array de items
    - `venta`: Información de transacción (si existe)
    """
    detalles = serializers.SerializerMethodField()
    cliente_nombre = serializers.CharField(
        source='cliente.nombre_completo',
        read_only=True
    )
    cliente_email = serializers.CharField(
        source='cliente.email',
        read_only=True
    )
    venta = VentaSerializer(read_only=True)
    
    def get_detalles(self, obj):
        """
        Obtener detalles del pedido. 
        Los detalles se obtienen desde la relación detalles_venta del Pedido,
        o desde la venta si existe (cuando ya está finalizao).
        """
        try:
            # Intentar obtener detalles desde la venta (si existe)
            if hasattr(obj, 'venta') and obj.venta:
                detalles = obj.venta.detalles.all()
                return DetalleVentaSerializer(detalles, many=True).data
        except:
            pass
        
        # Obtener detalles directamente desde el Pedido
        detalles = obj.detalles_venta.all()
        return DetalleVentaSerializer(detalles, many=True).data
    
    class Meta:
        model = Pedido
        fields = [
            'id', 'numero_pedido', 'cliente', 'cliente_nombre', 'cliente_email',
            'estado', 'tipo_entrega', 'subtotal', 'impuesto', 'total',
            'detalles', 'venta', 'fecha_creacion', 'fecha_modificacion'
        ]
        read_only_fields = [
            'id', 'numero_pedido', 'cliente', 'subtotal', 'impuesto',
            'total', 'detalles', 'venta', 'fecha_creacion', 'fecha_modificacion'
        ]


class PedidoListSerializer(serializers.ModelSerializer):
    """
    # Serializer de Lista de Pedidos
    
    Serializa resumen de pedidos para GET /pedidos/ (lista paginada).
    Incluye solo los campos más importantes para no sobrecargar respuesta.
    """
    cliente_nombre = serializers.CharField(
        source='cliente.nombre_completo',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    class Meta:
        model = Pedido
        fields = [
            'id', 'numero_pedido', 'cliente_nombre', 'estado', 'estado_display',
            'tipo_entrega', 'total', 'fecha_creacion'
        ]
        read_only_fields = fields


class PedidoUpdateStateSerializer(serializers.ModelSerializer):
    """
    # Serializer de Actualización de Estado
    
    Valida transiciones de estado permitidas:
    - RECIBIDO → PREPARACION, CANCELADO
    - PREPARACION → LISTO, CANCELADO
    - LISTO → ENTREGADO, CANCELADO
    - ENTREGADO → (no permitido)
    - CANCELADO → (no permitido)
    """
    
    class Meta:
        model = Pedido
        fields = ['estado']
    
    def validate(self, data):
        """Validar que la transición de estado sea permitida"""
        new_estado = data.get('estado')
        old_pedido = self.instance
        old_estado = old_pedido.estado
        
        # Matriz de transiciones permitidas
        valid_transitions = {
            'RECIBIDO': ['PREPARACION', 'CANCELADO'],
            'PREPARACION': ['LISTO', 'CANCELADO'],
            'LISTO': ['ENTREGADO', 'CANCELADO'],
            'ENTREGADO': [],
            'CANCELADO': []
        }
        
        allowed = valid_transitions.get(old_estado, [])
        if new_estado not in allowed:
            raise serializers.ValidationError(
                f"Transición de estado inválida: {old_estado} → {new_estado}. "
                f"Transiciones permitidas desde {old_estado}: {', '.join(allowed) or 'ninguna'}"
            )
        
        return data
    
    def update(self, instance, validated_data):
        """Actualizar estado y liberar stock si es cancelación"""
        new_estado = validated_data['estado']
        old_estado = instance.estado
        
        with transaction.atomic():
            # Si se cancela, liberar el stock
            if new_estado == 'CANCELADO' and old_estado != 'CANCELADO':
                for detalle in instance.detalles_venta.all():
                    producto = detalle.producto
                    producto.stock += detalle.cantidad
                    producto.save()
            
            instance.estado = new_estado
            instance.save()
        
        return instance


# ============================================================
# SERIALIZERS - USUARIO Y OTROS
# ============================================================

class CajaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caja
        fields = '__all__'


class PrivacyPolicySerializer(serializers.ModelSerializer):
    contenido = serializers.CharField(source='content')
    fecha_entrada_vigor = serializers.DateTimeField(source='effective_date', format='%Y-%m-%d')

    class Meta:
        model = PrivacyPolicy
        fields = ['version', 'contenido', 'fecha_entrada_vigor']


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    fecha_registro = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'nombre_completo', 'email', 'password', 'identificacion', 'direccion', 'telefono', 'rol', 'is_universidad', 'comunidad_rol', 'consentimiento_lopdp', 'fecha_registro']
        read_only_fields = ['id', 'fecha_registro']

    def validate(self, data):
        # US3: Data Minimization - Reject unexpected fields
        allowed_fields = set(self.fields.keys())
        input_fields = set(self.initial_data.keys())
        extra_fields = input_fields - allowed_fields
        if extra_fields:
            raise serializers.ValidationError(
                f"Unexpected fields: {', '.join(extra_fields)}. Data minimization enforced."
            )
        return data

    def validate_consentimiento_lopdp(self, value):
        if not value:
            raise serializers.ValidationError("Explicit LOPDP consent is required to register.")
        return value

    def create(self, validated_data):
        # Fetch the latest privacy policy
        latest_policy = PrivacyPolicy.objects.order_by('-effective_date').first()
        if not latest_policy:
            raise serializers.ValidationError({"error": "No active privacy policy found. Registration cannot proceed."})

        # Create user
        user = Usuario.objects.create_user(
            username=validated_data['email'], # Use email as username internal identifier
            email=validated_data['email'],
            password=validated_data['password'],
            nombre_completo=validated_data['nombre_completo'],
            identificacion=validated_data.get('identificacion', ''),
            direccion=validated_data.get('direccion', ''),
            telefono=validated_data.get('telefono', ''),
            rol='CLIENTE', # Siempre forzamos que los registros desde el frontend sean clientes
            is_universidad=validated_data.get('is_universidad', False),
            comunidad_rol=validated_data.get('comunidad_rol', ''),
            consentimiento_lopdp=True,
            consentimiento_timestamp=timezone.now(),
            privacy_policy=latest_policy
        )
        return user

# ================= PAYMENT SERIALIZERS =================

from .models import Transaccion

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = ['id', 'pedido', 'stripe_session_id', 'monto', 'estado', 'metodo_pago', 'fecha_creacion']
        read_only_fields = ['id', 'pedido', 'stripe_session_id', 'monto', 'estado', 'fecha_creacion']

class CheckoutRequestSerializer(serializers.Serializer):
    pedido_id = serializers.IntegerField(required=True)
    
    def validate_pedido_id(self, value):
        try:
            pedido = Pedido.objects.get(id=value)
            # You can only pay for orders in RECIBIDO state
            if pedido.estado != 'RECIBIDO':
                raise serializers.ValidationError(f"El pedido está en estado {pedido.estado}. Solo pedidos en RECIBIDO pueden ser pagados.")
            return value
        except Pedido.DoesNotExist:
            raise serializers.ValidationError("El pedido especificado no existe.")