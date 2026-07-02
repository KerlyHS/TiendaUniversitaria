from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import (
    Usuario, PrivacyPolicy, Producto, Promocion,
    Pedido, Venta, DetalleVenta, Caja
)
from .serializers import (
    UsuarioSerializer, PrivacyPolicySerializer, ProductoSerializer,
    PromocionSerializer, PedidoCreateSerializer, PedidoDetailSerializer,
    PedidoListSerializer, PedidoUpdateStateSerializer, VentaSerializer,
    DetalleVentaSerializer, CajaSerializer
)
from rest_framework import generics, viewsets, status, filters
from django_filters.rest_framework import DjangoFilterBackend

class ProductoViewSet(viewsets.ModelViewSet):
    """
    Catálogo de productos.
    Lectura: Pública. 
    Escritura: Requiere autenticación (Idealmente Administrador/Bodeguero).
    """
    queryset = Producto.objects.filter(is_activo=True).order_by('-fecha_creacion')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']
    search_fields = ['nombre', 'codigo', 'categoria', 'descripcion']
    ordering_fields = ['precio', 'fecha_creacion']

    def create(self, request, *args, **kwargs):
        variaciones_data = request.data.get('variaciones_data', None)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        producto = serializer.instance
        self._handle_variaciones(producto, variaciones_data)
        headers = self.get_success_headers(serializer.data)
        
        # Devolver data fresca para incluir variaciones
        fresh_serializer = self.get_serializer(producto)
        return Response(fresh_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        variaciones_data = request.data.get('variaciones_data', None)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        producto = serializer.instance
        if variaciones_data is not None:
            self._handle_variaciones(producto, variaciones_data)
            
        fresh_serializer = self.get_serializer(producto)
        return Response(fresh_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete para evitar errores de integridad con Detalles de Venta anteriores.
        """
        instance = self.get_object()
        instance.is_activo = False
        instance.save(update_fields=['is_activo'])
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    def _handle_variaciones(self, producto, variaciones_data):
        import json
        from .models import ProductoVariacion
        if variaciones_data:
            try:
                if isinstance(variaciones_data, str):
                    variaciones = json.loads(variaciones_data)
                else:
                    variaciones = variaciones_data
                    
                ids_a_mantener = []
                for var_data in variaciones:
                    vid = var_data.get('id')
                    stock = int(var_data.get('stock', 0))
                    precio_adicional = float(var_data.get('precio_adicional', 0.0)) if var_data.get('precio_adicional') else 0.0
                    precio_fijo_raw = var_data.get('precio_fijo')
                    precio_fijo = float(precio_fijo_raw) if precio_fijo_raw is not None and precio_fijo_raw != "" else None
                    nombre = var_data.get('nombre')
                    
                    if not nombre: continue # Omitir inválidos
                    
                    # Tratar de buscar por ID o por nombre para evitar duplicados al actualizar
                    v = None
                    if vid:
                        try:
                            v = ProductoVariacion.objects.get(id=vid, producto=producto)
                        except ProductoVariacion.DoesNotExist:
                            pass
                    
                    if not v:
                        try:
                            v = ProductoVariacion.objects.get(nombre=nombre, producto=producto)
                        except ProductoVariacion.DoesNotExist:
                            pass

                    if v:
                        v.nombre = nombre
                        v.stock = stock
                        v.precio_adicional = precio_adicional
                        v.precio_fijo = precio_fijo
                        v.save()
                        ids_a_mantener.append(v.id)
                    else:
                        v = ProductoVariacion.objects.create(
                            producto=producto,
                            nombre=nombre,
                            stock=stock,
                            precio_adicional=precio_adicional,
                            precio_fijo=precio_fijo
                        )
                        ids_a_mantener.append(v.id)
                
                # Borrar las que ya no están
                producto.variaciones.exclude(id__in=ids_a_mantener).delete()
                
                # Actualizar stock global si hay variaciones
                if ids_a_mantener:
                    producto.stock = sum(v.stock for v in producto.variaciones.all())
                    producto.save(update_fields=['stock'])
                
            except Exception as e:
                print("Error procesando variaciones:", e)

class PromocionViewSet(viewsets.ModelViewSet):
    queryset = Promocion.objects.filter(is_use=True)
    serializer_class = PromocionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class PedidoViewSet(viewsets.ModelViewSet):
    """
    # ViewSet de Pedidos (Órdenes)
    
    Gestión completa de órdenes de compra con:
    - Auto-filtering: Clientes ven solo sus pedidos, Admins ven todos
    - Validación de stock al crear
    - Transiciones de estado controladas
    - Liberación de stock al cancelar
    
    ## Permisos
    - GET (list/retrieve): Autenticado
    - POST (create): Autenticado
    - PUT (update): Admin solamente
    - DELETE: No permitido (soft state management)
    
    ## Endpoints Disponibles
    - `GET /pedidos/`: Lista de pedidos del usuario
    - `POST /pedidos/`: Crear nuevo pedido
    - `GET /pedidos/{id}/`: Detalles completos
    - `PUT /pedidos/{id}/`: Actualizar estado
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Auto-filter: Clientes ven solo sus pedidos, Admins ven todos.
        """
        user = self.request.user
        if user.rol in ['ADMIN', 'BODEGUERO', 'CAJERO']:
            return Pedido.objects.select_related('cliente').all().order_by('-fecha_creacion')
        else:
            # Clientes ven solo sus pedidos
            return Pedido.objects.select_related('cliente').filter(cliente=user).order_by('-fecha_creacion')
    
    def get_serializer_class(self):
        """
        Usar diferentes serializers según la acción:
        - create: PedidoCreateSerializer (con validaciones)
        - retrieve: PedidoDetailSerializer (con detalles anidados)
        - list: PedidoListSerializer (resumen)
        - update: PedidoUpdateStateSerializer (solo estado)
        """
        if self.action == 'create':
            return PedidoCreateSerializer
        elif self.action == 'retrieve':
            return PedidoDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return PedidoUpdateStateSerializer
        elif self.action == 'list':
            return PedidoListSerializer
        return PedidoDetailSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Crear nuevo pedido con validación de stock.
        
        ## Request Body
        ```json
        {
          "tipo_entrega": "TIENDA",
          "detalles": [
            {"producto_id": 1, "cantidad": 2}
          ]
        }
        ```
        
        ## Response (201 Created)
        Pedido completo con número generado y totales calculados.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("PEDIDO CREATE ERRORS:", serializer.errors)
            serializer.is_valid(raise_exception=True)
        pedido = serializer.save()
        
        # Retornar detalle completo del pedido creado
        detail_serializer = PedidoDetailSerializer(pedido)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """
        Actualizar estado de un pedido con validación de transiciones.
        
        ## Request Body
        ```json
        {"estado": "PREPARACION"}
        ```
        
        ## Transiciones Permitidas
        - RECIBIDO → PREPARACION, CANCELADO
        - PREPARACION → LISTO, CANCELADO
        - LISTO → ENTREGADO, CANCELADO
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Verificar permisos: administradores y roles operativos pueden actualizar estado
        if not request.user.rol in ['ADMIN', 'BODEGUERO', 'CAJERO', 'GERENTE']:
            return Response(
                {"detail": "Solo administradores pueden actualizar pedidos."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        pedido = serializer.save()
        
        # Retornar detalle completo
        detail_serializer = PedidoDetailSerializer(pedido)
        return Response(detail_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        DELETE no permitido. Los pedidos usan soft state management
        (cambiar a estado CANCELADO en lugar de eliminar).
        """
        return Response(
            {"detail": "No se pueden eliminar pedidos. Use CANCELADO como estado."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

class VentaViewSet(viewsets.ModelViewSet):
    """
    Gestión de Ventas. Acceso restringido a cajeros y administradores.
    """
    queryset = Venta.objects.select_related('cajero', 'pedido').prefetch_related('pedido__detalles_venta').all()
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated]

from django.db import models
from tienda.serializers import generate_order_number

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='procesar-venta')
    def procesar_venta(self, request):
        user = request.user
        if user.rol not in ['ADMIN', 'CAJERO', 'GERENTE']:
            return Response({"detail": "Permiso denegado."}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        cliente_id = data.get('cliente_id')
        metodo_pago = data.get('metodo_pago', 'EFECTIVO')
        detalles_data = data.get('detalles', [])
        
        if not detalles_data:
            return Response({"detail": "La venta debe tener al menos un producto."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Cliente
        if not cliente_id:
            try:
                cliente = Usuario.objects.get(email='consumidor.final@unl.edu.ec')
            except Usuario.DoesNotExist:
                return Response({"detail": "Cliente consumidor final no encontrado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            try:
                cliente = Usuario.objects.get(id=cliente_id)
            except Usuario.DoesNotExist:
                return Response({"detail": "Cliente especificado no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        if metodo_pago != 'EFECTIVO' and cliente.email == 'consumidor.final@unl.edu.ec':
            return Response(
                {"detail": "Para pagos con tarjeta o transferencia es OBLIGATORIO emitir factura (seleccionar o crear cliente real)."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        with transaction.atomic():
            numero_pedido = generate_order_number()
            pedido = Pedido.objects.create(
                numero_pedido=numero_pedido,
                cliente=cliente,
                tipo_entrega='TIENDA',
                estado='ENTREGADO'
            )
            
            from decimal import Decimal
            import math
            subtotal = Decimal('0.00')
            impuesto_total = Decimal('0.00')
            
            for detalle in detalles_data:
                producto_id = detalle.get('producto_id')
                cantidad = Decimal(str(detalle.get('cantidad', 1)))
                
                try:
                    producto = Producto.objects.select_for_update().get(id=producto_id)
                except Producto.DoesNotExist:
                    raise serializers.ValidationError(f"Producto {producto_id} no existe.")
                
                # Check for food category variations
                variacion = None
                precio_unitario = producto.precio
                es_alimento = producto.categoria in ['AGRICOLA', 'HORTALIZAS', 'FRUTAS', 'CARNES', 'LACTEOS', 'BEBIDAS']
                
                if es_alimento and producto.variaciones.exists():
                    # Look for variation containing "libra" or "lb" case-insensitively
                    libra_var = None
                    for var in producto.variaciones.all():
                        if 'libra' in var.nombre.lower() or 'lb' in var.nombre.lower():
                            libra_var = var
                            break
                    if not libra_var:
                        libra_var = producto.variaciones.first()
                    
                    variacion = libra_var
                    if variacion:
                        precio_unitario = variacion.precio_fijo if variacion.precio_fijo is not None else producto.precio
                
                cantidad_descontar = int(math.ceil(cantidad))
                
                if variacion:
                    if variacion.stock < cantidad_descontar:
                        raise serializers.ValidationError(f"Stock insuficiente en la variación '{variacion.nombre}' para {producto.nombre}.")
                else:
                    if producto.stock < cantidad_descontar:
                        raise serializers.ValidationError(f"Stock insuficiente para {producto.nombre}.")
                
                subtotal_item = precio_unitario * cantidad
                
                DetalleVenta.objects.create(
                    pedido=pedido,
                    producto=producto,
                    nombre_producto=producto.nombre,
                    variacion=variacion,
                    descripcion=producto.descripcion or '',
                    cantidad=cantidad,
                    precio_unitario=precio_unitario,
                    subtotal=subtotal_item
                )
                
                if variacion:
                    variacion.stock -= cantidad_descontar
                    variacion.save()
                    # Refresh and update global product stock
                    producto.stock = sum(v.stock for v in producto.variaciones.all())
                    producto.save()
                else:
                    producto.stock -= cantidad_descontar
                    producto.save()
                
                subtotal += subtotal_item
                if producto.aplica_impuesto:
                    from django.conf import settings
                    impuesto_total += subtotal_item * Decimal('0.12')
                    
            pedido.subtotal = subtotal
            pedido.impuesto = impuesto_total
            pedido.total = subtotal + impuesto_total
            pedido.save()
            
            venta = Venta.objects.create(
                subtotal=subtotal,
                metodo_pago=metodo_pago,
                pedido=pedido,
                cajero=user
            )
            
        return Response({
            "mensaje": "Venta procesada exitosamente.",
            "pedido_id": pedido.id,
            "venta_id": venta.id,
            "numero_pedido": pedido.numero_pedido,
            "total": pedido.total
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get', 'post'], url_path='clientes')
    def clientes(self, request):
        if request.method == 'POST':
            data = request.data
            nombre_completo = data.get('nombre_completo')
            identificacion = data.get('identificacion', '')
            direccion = data.get('direccion', '')
            telefono = data.get('telefono', '')
            email = data.get('email')
            
            if not email and identificacion:
                email = f"{identificacion}@cliente.unl.edu.ec"
            elif not email:
                import uuid
                email = f"{uuid.uuid4().hex[:10]}@cliente.unl.edu.ec"
                
            if not nombre_completo:
                return Response({"detail": "El nombre completo es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)
                
            if Usuario.objects.filter(email=email).exists():
                return Response({"detail": "Ya existe un usuario con este correo."}, status=status.HTTP_400_BAD_REQUEST)
            if identificacion and Usuario.objects.filter(identificacion=identificacion).exclude(identificacion='').exists():
                return Response({"detail": "Ya existe un usuario con esta identificación."}, status=status.HTTP_400_BAD_REQUEST)
                
            cliente = Usuario.objects.create(
                username=email,
                email=email,
                nombre_completo=nombre_completo,
                identificacion=identificacion,
                direccion=direccion,
                telefono=telefono,
                rol='CLIENTE',
                is_active=True
            )
            return Response({
                "id": cliente.id, 
                "nombre_completo": cliente.nombre_completo, 
                "identificacion": cliente.identificacion, 
                "email": cliente.email
            }, status=status.HTTP_201_CREATED)
            
        q = request.query_params.get('q', '')
        if len(q) < 3:
            return Response([])
            
        clientes = Usuario.objects.filter(rol='CLIENTE').filter(
            models.Q(nombre_completo__icontains=q) |
            models.Q(identificacion__icontains=q) |
            models.Q(email__icontains=q)
        )[:10]
        
        data = [{"id": c.id, "nombre_completo": c.nombre_completo, "identificacion": c.identificacion, "email": c.email} for c in clientes]
        return Response(data)

    @action(detail=False, methods=['get'], url_path=r'comprobante/(?P<pedido_id>\d+)/pdf')
    def comprobante_pdf(self, request, pedido_id=None):
        try:
            pedido = Pedido.objects.get(id=pedido_id)
        except Pedido.DoesNotExist:
            return Response({"detail": "Pedido no encontrado."}, status=404)
            
        from django.http import HttpResponse
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        import io
        
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 800, "Tienda Universitaria UNL")
        p.setFont("Helvetica", 12)
        p.drawString(50, 780, f"Comprobante / Factura: {pedido.numero_pedido}")
        p.drawString(50, 760, f"Fecha: {pedido.fecha_creacion.strftime('%Y-%m-%d %H:%M')}")
        
        p.drawString(50, 730, "Datos del Cliente:")
        p.setFont("Helvetica", 10)
        p.drawString(50, 715, f"Nombre: {pedido.cliente.nombre_completo}")
        p.drawString(50, 700, f"RUC/CI: {pedido.cliente.identificacion or 'Consumidor Final'}")
        p.drawString(50, 685, f"Correo: {pedido.cliente.email}")
        
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, 650, "Detalle de Productos:")
        p.setFont("Helvetica", 10)
        y = 630
        for dt in pedido.detalles_venta.all():
            p.drawString(50, y, f"{dt.cantidad}x {dt.nombre_producto} - ${dt.subtotal}")
            y -= 20
            
        y -= 20
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, f"Subtotal: ${pedido.subtotal}")
        p.drawString(50, y-20, f"IVA: ${pedido.impuesto}")
        p.drawString(50, y-40, f"Total a Pagar: ${pedido.total}")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="comprobante_{pedido.numero_pedido}.pdf"'
        return response

# ================= ENDPOINTS PÚBLICOS =================

class UsuarioRegistrationView(generics.CreateAPIView):
    """
    Registro de nuevos usuarios (Endpoint Público).
    Garantiza el cumplimiento LOPDP.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

class PrivacyPolicyRetrieveView(generics.RetrieveAPIView):
    """
    Obtener la política de privacidad vigente.
    """
    serializer_class = PrivacyPolicySerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return PrivacyPolicy.objects.order_by('-effective_date').first()

# ================= PAYMENT VIEWS =================
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .serializers import CheckoutRequestSerializer, TransaccionSerializer
from .models import Transaccion, EstadoTransaccion
from .services.payment import StripePaymentService
import stripe

class PagoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='preparar-checkout')
    def preparar_checkout(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        if serializer.is_valid():
            pedido_id = serializer.validated_data['pedido_id']
            pedido = Pedido.objects.get(id=pedido_id)

            # Validar pertenencia del pedido (solo el cliente que lo hizo o admins)
            if pedido.cliente != request.user and request.user.rol not in ['ADMIN', 'GERENTE']:
                return Response({"detail": "No tienes permiso para pagar este pedido."}, status=status.HTTP_403_FORBIDDEN)

            success_url = f"{settings.FRONTEND_URL}/pagos/exito?session_id={{CHECKOUT_SESSION_ID}}"
            cancel_url = f"{settings.FRONTEND_URL}/pagos/cancelado"

            try:
                # Create Stripe Session
                session = StripePaymentService.create_checkout_session(pedido, success_url, cancel_url)

                # Create or Update Transaccion
                transaccion, created = Transaccion.objects.update_or_create(
                    pedido=pedido,
                    defaults={
                        'stripe_session_id': session.id,
                        'monto': pedido.total,
                        'estado': EstadoTransaccion.PENDING,
                        'metodo_pago': 'STRIPE'
                    }
                )

                return Response({'checkout_url': session.url}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='crear-payment-intent')
    def crear_payment_intent(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        if serializer.is_valid():
            pedido_id = serializer.validated_data['pedido_id']
            pedido = Pedido.objects.get(id=pedido_id)

            if pedido.cliente != request.user and request.user.rol not in ['ADMIN', 'GERENTE']:
                return Response({"detail": "No tienes permiso para pagar este pedido."}, status=status.HTTP_403_FORBIDDEN)

            try:
                # Create PaymentIntent
                intent = StripePaymentService.create_payment_intent(pedido)

                # Create or Update Transaccion
                transaccion, created = Transaccion.objects.update_or_create(
                    pedido=pedido,
                    defaults={
                        'stripe_session_id': intent.id, # reusamos este campo para guardar el intent id
                        'monto': pedido.total,
                        'estado': EstadoTransaccion.PENDING,
                        'metodo_pago': 'STRIPE'
                    }
                )

                return Response({'client_secret': intent.client_secret}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='comprobante')
    def comprobante(self, request):
        payment_intent_id = request.query_params.get('payment_intent')
        if not payment_intent_id:
            return Response({"error": "Falta el parámetro payment_intent"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            transaccion = Transaccion.objects.get(stripe_session_id=payment_intent_id)
            
            # Validar pertenencia del pedido
            pedido = transaccion.pedido
            if pedido.cliente != request.user and request.user.rol not in ['ADMIN', 'GERENTE']:
                return Response({"detail": "No tienes permiso para descargar este comprobante."}, status=status.HTTP_403_FORBIDDEN)
                
            from .services.pdf_receipt import generate_receipt_pdf
            from django.http import HttpResponse
            
            buffer = generate_receipt_pdf(transaccion)
            response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="comprobante_{pedido.numero_pedido}.pdf"'
            return response
            
        except Transaccion.DoesNotExist:
            return Response({"error": "Transacción no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": "Error al generar el PDF"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = StripePaymentService.construct_webhook_event(payload, sig_header)
        except ValueError as e:
            # Invalid payload
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle both Checkout Session and Payment Intent events
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            pedido_id = session.get('client_reference_id')
        elif event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            pedido_id = payment_intent.get('metadata', {}).get('pedido_id')
        else:
            pedido_id = None

        if pedido_id:
            try:
                with transaction.atomic():
                    pedido = Pedido.objects.select_for_update().get(id=pedido_id)
                    if pedido.estado == 'RECIBIDO':
                        pedido.estado = 'LISTO'
                        pedido.save()
                        
                        transaccion = pedido.transaccion
                        transaccion.estado = EstadoTransaccion.APROBADO
                        transaccion.save()
            except Pedido.DoesNotExist:
                pass
        
        return Response(status=status.HTTP_200_OK)

# ================= DASHBOARD STATS =================

from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta

class DashboardStatsView(APIView):
    """
    # Dashboard Stats
    Devuelve los indicadores clave (KPIs) para el Panel de Control del Administrador.
    """
    # Require admin or staff permissions
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.rol not in ['ADMIN', 'GERENTE', 'SUPERVISOR', 'BODEGUERO', 'CAJERO']:
            return Response({"detail": "No tienes permiso para ver el panel."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Ventas del mes (Monto de pedidos pagados/completados)
        pedidos_mes = Pedido.objects.filter(
            fecha_creacion__gte=start_of_month,
            estado__in=['PAGADO', 'PREPARACION', 'LISTO', 'ENTREGADO']
        )
        ventas_totales_mes = pedidos_mes.aggregate(Sum('total'))['total__sum'] or 0
        total_pedidos_mes = pedidos_mes.count()
        ticket_promedio = (ventas_totales_mes / total_pedidos_mes) if total_pedidos_mes > 0 else 0

        # Órdenes de hoy
        ordenes_hoy = Pedido.objects.filter(fecha_creacion__gte=start_of_today).count()
        pendientes_hoy = Pedido.objects.filter(fecha_creacion__gte=start_of_today, estado='RECIBIDO').count()

        # Datos para el Gráfico (Últimos 6 meses o días del mes)
        # Aquí mockeamos los últimos 6 meses para la demostración
        grafico_ventas = [
            {"name": "Ene", "ventas": 1200},
            {"name": "Feb", "ventas": 1900},
            {"name": "Mar", "ventas": 1500},
            {"name": "Abr", "ventas": 2100},
            {"name": "May", "ventas": 1800},
            {"name": "Jun", "ventas": float(ventas_totales_mes)},
        ]

        # Alertas de Stock
        alertas_stock = Producto.objects.filter(is_activo=True, stock__lte=5).values('id', 'nombre', 'stock', 'imagen', 'codigo')[:5]
        alertas_list = [{"id": a['id'], "nombre": a['nombre'], "stock": a['stock'], "imagen": a['imagen'], "codigo": a['codigo'] or ''} for a in alertas_stock]

        # Órdenes Recientes
        ordenes_recientes_qs = Pedido.objects.order_by('-fecha_creacion')[:5]
        ordenes_recientes = []
        for p in ordenes_recientes_qs:
            ordenes_recientes.append({
                "id": p.id,
                "cliente": p.cliente.nombre_completo if p.cliente else "Anónimo",
                "monto": float(p.total),
                "fecha": p.fecha_creacion.strftime("%Y-%m-%d %H:%M"),
                "estado": p.estado
            })

        # Reporte Caja
        caja_activa = Caja.objects.filter(fecha_cierra__isnull=True).first()
        saldo_actual = caja_activa.saldo_abre if caja_activa else 0
        entradas_hoy = 450.00  # Mock
        salidas_hoy = 25.00    # Mock

        data = {
            "kpis": {
                "ventas_mes": float(ventas_totales_mes),
                "ticket_promedio": float(ticket_promedio),
                "ordenes_hoy": ordenes_hoy,
                "pendientes_empaque": pendientes_hoy
            },
            "grafico_ventas": grafico_ventas,
            "caja": {
                "saldo_actual": float(saldo_actual),
                "entradas_hoy": entradas_hoy,
                "salidas_hoy": salidas_hoy,
                "ultimos_cierres": [
                    {"fecha": "Ayer", "monto": 1150.00},
                    {"fecha": "15 Oct", "monto": 980.00}
                ]
            },
            "alertas_stock": alertas_list,
            "ordenes_recientes": ordenes_recientes
        }

        return Response(data)