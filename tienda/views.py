from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import (
    Usuario, PrivacyPolicy, Producto, Promocion,
    Pedido, Venta, DetalleVenta, Caja
)
from .serializers import (
    UsuarioSerializer, PrivacyPolicySerializer, ProductoSerializer,
    PromocionSerializer, PedidoSerializer, VentaSerializer,
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
    Gestión de Pedidos. Solo usuarios autenticados.
    """
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Asigna automáticamente el cliente autenticado al pedido
        serializer.save(cliente=self.request.user)

class VentaViewSet(viewsets.ModelViewSet):
    """
    Gestión de Ventas. Acceso restringido a cajeros y administradores.
    """
    queryset = Venta.objects.all()
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