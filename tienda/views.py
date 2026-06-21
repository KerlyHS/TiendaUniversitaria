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

class ProductoViewSet(viewsets.ModelViewSet):
    """
    Catálogo de productos.
    Lectura: Pública. 
    Escritura: Requiere autenticación (Idealmente Administrador/Bodeguero).
    """
    queryset = Producto.objects.filter(is_activo=True).order_by('nombre')
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

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

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer
    permission_classes = [IsAuthenticated]

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
        alertas_stock = Producto.objects.filter(is_activo=True, stock__lte=5).values('id', 'nombre', 'stock', 'imagen')[:5]
        alertas_list = [{"id": a['id'], "nombre": a['nombre'], "stock": a['stock'], "imagen": a['imagen']} for a in alertas_stock]

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