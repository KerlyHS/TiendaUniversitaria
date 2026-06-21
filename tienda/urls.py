from django.urls import path, include
# pyrefly: ignore [missing-import]
from rest_framework.routers import DefaultRouter
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.views import TokenRefreshView
from .authentication import LoginView, LogoutView, UserProfileView
from .views import (
    UsuarioRegistrationView, PrivacyPolicyRetrieveView, ProductoViewSet,
    PromocionViewSet, PedidoViewSet, VentaViewSet, CajaViewSet,
    PagoViewSet, StripeWebhookView, DashboardStatsView
)

router = DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'promociones', PromocionViewSet, basename='promocion')
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'ventas', VentaViewSet, basename='venta')
router.register(r'cajas', CajaViewSet, basename='caja')
router.register(r'pagos', PagoViewSet, basename='pago')

urlpatterns = [
    path('', include(router.urls)),
    
    # ================= DASHBOARD =================
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    
    # ================= AUTENTICACIÓN =================
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('usuarios/me/', UserProfileView.as_view(), name='usuario-profile'),
    
    # ================= USUARIOS & PRIVACIDAD =================
    path('usuarios/registro/', UsuarioRegistrationView.as_view(), name='usuario-registro'),
    path('politica-privacidad/', PrivacyPolicyRetrieveView.as_view(), name='politica-privacidad'),

    # ================= WEBHOOKS =================
    path('pagos/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]