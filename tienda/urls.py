from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioRegistrationView, PrivacyPolicyRetrieveView, ProductoViewSet,
    PromocionViewSet, PedidoViewSet, VentaViewSet, CajaViewSet
)

router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'promociones', PromocionViewSet, basename='promocion')
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'ventas', VentaViewSet, basename='venta')
router.register(r'cajas', CajaViewSet, basename='caja')

urlpatterns = [
    path('', include(router.urls)),
    path('usuarios/registro/', UsuarioRegistrationView.as_view(), name='usuario-registro'),
    path('politica-privacidad/', PrivacyPolicyRetrieveView.as_view(), name='politica-privacidad'),
]