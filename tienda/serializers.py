from rest_framework import serializers
from .models import Usuario, PrivacyPolicy
from django.utils import timezone

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
        fields = ['id', 'nombre_completo', 'email', 'password', 'consentimiento_lopdp', 'fecha_registro']
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
            consentimiento_lopdp=True,
            consentimiento_timestamp=timezone.now(),
            privacy_policy=latest_policy
        )
        return user
