from django.test import TestCase

# Create your tests here.
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date
from .models import PrivacyPolicy, Usuario, Producto, Rol, MetodoPago

class ProductoApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.p1 = Producto.objects.create(
            codigo="P001",
            nombre="Camiseta UNL",
            descripcion="Algodón 100%",
            precio=15.50,
            stock=100,
            imagen_url="https://example.com/camiseta.jpg"
        )
        self.p2 = Producto.objects.create(
            codigo="P002",
            nombre="Gorra UNL",
            descripcion="Ajustable",
            precio=8.00,
            stock=50,
            imagen_url="https://example.com/gorra.jpg"
        )
        self.list_url = reverse('producto-list')

    def test_list_products(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 2)
        self.assertEqual(res.data[0]['nombre'], "Camiseta UNL")
        self.assertEqual(res.data[1]['nombre'], "Gorra UNL")

    def test_retrieve_product_detail(self):
        detail_url = reverse('producto-detail', kwargs={'pk': self.p1.id})
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['nombre'], "Camiseta UNL")
        self.assertEqual(res.data['codigo'], "P001")


class RegistrationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.policy = PrivacyPolicy.objects.create(
            version="v1.0.0",
            content="Standard terms and conditions."
        )
        try:
            self.register_url = reverse('usuario-registro')
        except:
            self.register_url = '/api/v1/usuarios/registro/'

    def test_registration_success(self):
        data = {
            "nombre_completo": "John Doe",
            "email": "john.doe@unl.edu.ec",
            "password": "secure_password123",
            "identificacion": "1100000000",
            "telefono": "0999999999",
            "rol": Rol.CLIENTE,
            "is_universidad": True,
            "consentimiento_lopdp": True
        }
        res = self.client.post(self.register_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = Usuario.objects.get(email="john.doe@unl.edu.ec")
        self.assertTrue(user.consentimiento_lopdp)
        self.assertIsNotNone(user.consentimiento_timestamp)
        self.assertEqual(user.privacy_policy, self.policy)
        self.assertEqual(user.nombre_completo, "John Doe")
        self.assertEqual(user.identificacion, "1100000000")
        self.assertTrue(user.is_universidad)

    def test_registration_fails_without_consent(self):
        data = {
            "nombre_completo": "Jane Doe",
            "email": "jane.doe@unl.edu.ec",
            "password": "secure_password123",
            "consentimiento_lopdp": False
        }
        res = self.client.post(self.register_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('consentimiento_lopdp', res.data)

    def test_registration_fails_invalid_email(self):
        data = {
            "nombre_completo": "Jane Doe",
            "email": "not-an-email",
            "password": "secure_password123",
            "consentimiento_lopdp": True
        }
        res = self.client.post(self.register_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)

    def test_registration_fails_extra_fields(self):
        data = {
            "nombre_completo": "John Doe",
            "email": "john.doe@unl.edu.ec",
            "password": "secure_password123",
            "consentimiento_lopdp": True,
            "campo_extra": "dato no deseado"
        }
        res = self.client.post(self.register_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', res.data)
        self.assertTrue(any("Unexpected fields" in str(err) for err in res.data['non_field_errors']))

class PrivacyPolicyApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.policy1 = PrivacyPolicy.objects.create(version="v1.0", content="Old")
        self.policy2 = PrivacyPolicy.objects.create(version="v2.0", content="New")
        try:
            self.policy_url = reverse('politica-privacidad')
        except:
            self.policy_url = '/api/v1/politica-privacidad/'

    def test_get_latest_policy(self):
        res = self.client.get(self.policy_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['version'], "v2.0")
        self.assertEqual(res.data['contenido'], "New")

