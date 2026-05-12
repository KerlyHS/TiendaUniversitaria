from django.urls import path
from .views import UsuarioRegistrationView, PrivacyPolicyRetrieveView

urlpatterns = [
    path('usuarios/registro/', UsuarioRegistrationView.as_view(), name='usuario-registro'),
    path('politica-privacidad/', PrivacyPolicyRetrieveView.as_view(), name='politica-privacidad'),
]
