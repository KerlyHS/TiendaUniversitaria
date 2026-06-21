import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(email='admin@unl.edu.ec').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@unl.edu.ec',
        password='admin',
        nombre_completo='Administrador UNL'
    )
    print("Admin creado exitosamente.")
else:
    print("El Admin ya existe.")
