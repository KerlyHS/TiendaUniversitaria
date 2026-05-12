from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
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
    Public API to browse products, admin can modify.
    """
    queryset = Producto.objects.all().order_by('nombre')
    serializer_class = ProductoSerializer
    permission_classes = [AllowAny]

class PromocionViewSet(viewsets.ModelViewSet):
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer
    permission_classes = [AllowAny]

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer

class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.all()
    serializer_class = CajaSerializer


class UsuarioRegistrationView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

class PrivacyPolicyRetrieveView(generics.RetrieveAPIView):
    serializer_class = PrivacyPolicySerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return PrivacyPolicy.objects.order_by('-effective_date').first()
