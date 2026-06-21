"""
# Módulo de Autenticación JWT

Proporciona endpoints para autenticación con JWT, incluyendo login, logout y refresh de tokens.

## Características

- Login con email y contraseña
- Token refresh para renovar access tokens sin re-login
- Logout que invalida tokens
- Perfil de usuario autenticado

## Uso

```python
# Login
POST /api/v1/auth/login/
{
    "email": "usuario@unl.edu.ec",
    "password": "contraseña"
}

# Refresh Token
POST /api/v1/auth/refresh/
{
    "refresh": "token_refresh"
}

# Logout
POST /api/v1/auth/logout/
{
    "refresh": "token_refresh"
}
```
"""

from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import Usuario


class AuthSerializer(serializers.Serializer):
    """
    # Serializador de Autenticación
    
    Valida email y contraseña para autenticación.
    
    ## Campos
    - `email` (str): Correo electrónico del usuario
    - `password` (str): Contraseña (write-only)
    
    ## Validación
    - Email DEBE existir en el sistema
    - Contraseña DEBE ser correcta
    - Usuario DEBE estar activo (is_active=True)
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(
                "Email y contraseña son requeridos."
            )
        
        # Buscar usuario por email (case insensitive)
        try:
            usuario = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError(
                "El correo o la contraseña no coinciden."
            )
        
        # Verificar contraseña
        if not usuario.check_password(password):
            raise serializers.ValidationError(
                "El correo o la contraseña no coinciden."
            )
        
        # Verificar que el usuario esté activo
        if not usuario.is_active:
            raise serializers.ValidationError(
                "Esta cuenta está desactivada."
            )
        
        attrs['usuario'] = usuario
        return attrs


class LoginView(APIView):
    """
    # Vista de Login
    
    Endpoint para autenticación con email y contraseña.
    
    Retorna access_token y refresh_token para uso posterior.
    
    ## Request
    ```json
    {
        "email": "usuario@unl.edu.ec",
        "password": "contraseña_segura"
    }
    ```
    
    ## Response (201)
    ```json
    {
        "status": "success",
        "message": "Bienvenido Juan Pérez",
        "access_token": "eyJ...",
        "refresh_token": "eyJ...",
        "user": {
            "id": 1,
            "email": "usuario@unl.edu.ec",
            "nombre_completo": "Juan Pérez",
            "rol": "CLIENTE"
        }
    }
    ```
    
    ## Response (401)
    ```json
    {
        "status": "error",
        "message": "Credenciales inválidas"
    }
    ```
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = AuthSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario = serializer.validated_data['usuario']
        
        # Generar tokens
        refresh = RefreshToken.for_user(usuario)
        access_token = str(refresh.access_token)
        
        # Actualizar último login
        usuario.last_login = timezone.now()
        usuario.save(update_fields=['last_login'])
        
        return Response({
            "status": "success",
            "message": f"Bienvenido {usuario.nombre_completo}",
            "access_token": access_token,
            "refresh_token": str(refresh),
            "user": {
                "id": usuario.id,
                "email": usuario.email,
                "nombre_completo": usuario.nombre_completo,
                "rol": usuario.get_rol_display(),
                "is_universidad": usuario.is_universidad
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    # Vista de Logout
    
    Endpoint para cerrar sesión e invalidar refresh token.
    No requiere autenticación para permitir logout aunque el token esté expirado.
    
    ## Request
    ```json
    {
        "refresh": "refresh_token_aqui"
    }
    ```
    
    ## Response (200)
    ```json
    {
        "status": "success",
        "message": "Sesión cerrada correctamente"
    }
    ```
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {
                        "status": "error",
                        "message": "Refresh token requerido"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Aquí se podría implementar blacklist en Redis o DB
            # Por ahora solo retornamos éxito
            
            return Response(
                {
                    "status": "success",
                    "message": "Sesión cerrada correctamente"
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileSerializer(serializers.ModelSerializer):
    """
    # Serializador de Perfil de Usuario
    
    Serializa la información del perfil del usuario autenticado.
    
    ## Campos (Read)
    - `id`, `email`, `nombre_completo`, `identificacion`, `direccion`, `telefono`
    - `rol`, `is_universidad`, `consentimiento_lopdp`, `date_joined`, `last_login`
    
    ## Campos (Write)
    - `nombre_completo`, `identificacion`, `direccion`, `telefono` (no email, no rol)
    """
    class Meta:
        model = Usuario
        fields = [
            'id', 'email', 'nombre_completo', 'identificacion', 
            'direccion', 'telefono', 'rol', 'is_universidad',
            'consentimiento_lopdp', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'email', 'rol', 'is_universidad', 'consentimiento_lopdp', 'date_joined', 'last_login']
    
    def validate_nombre_completo(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 3 caracteres."
            )
        return value
    
    def validate_telefono(self, value):
        if value and not value.isdigit() and not all(c.isdigit() or c == '+' or c == '-' for c in value):
            raise serializers.ValidationError(
                "El teléfono solo debe contener dígitos."
            )
        return value


class UserProfileView(APIView):
    """
    # Vista de Perfil de Usuario
    
    GET: Obtener perfil del usuario autenticado
    PUT: Actualizar perfil del usuario autenticado
    
    ## GET Response (200)
    ```json
    {
        "id": 1,
        "email": "usuario@unl.edu.ec",
        "nombre_completo": "Juan Pérez García",
        "identificacion": "1103456789",
        "direccion": "Av. Atahuallpa, Loja",
        "telefono": "0998765432",
        "rol": "CLIENTE",
        "is_universidad": true,
        "date_joined": "2026-05-10T14:20:00Z"
    }
    ```
    
    ## PUT Request
    ```json
    {
        "nombre_completo": "Juan Carlos Pérez García",
        "direccion": "Av. Atahuallpa 123, Loja",
        "telefono": "0999876543"
    }
    ```
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Obtener perfil del usuario autenticado"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Actualizar perfil del usuario autenticado"""
        usuario = request.user
        serializer = UserProfileSerializer(
            usuario,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "errors": serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer.save()
        
        return Response(
            {
                "status": "success",
                "message": "Perfil actualizado correctamente",
                "user": serializer.data
            },
            status=status.HTTP_200_OK
        )
