from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Usuario, PrivacyPolicy
from .serializers import UsuarioSerializer, PrivacyPolicySerializer

class UsuarioRegistrationView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

class PrivacyPolicyRetrieveView(generics.RetrieveAPIView):
    serializer_class = PrivacyPolicySerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return PrivacyPolicy.objects.order_by('-effective_date').first()
