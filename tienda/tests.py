from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import PrivacyPolicy, Usuario

class RegistrationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.policy = PrivacyPolicy.objects.create(
            version="v1.0.0",
            content="Standard terms and conditions."
        )
        # Assuming URL names will be 'usuario-registro' as per common convention or to be defined
        try:
            self.register_url = reverse('usuario-registro')
        except:
            self.register_url = '/api/v1/usuarios/registro/'

    def test_registration_success(self):
        data = {
            "nombre_completo": "John Doe",
            "email": "john.doe@unl.edu.ec",
            "password": "secure_password123",
            "consentimiento_lopdp": True
        }
        res = self.client.post(self.register_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = Usuario.objects.get(email="john.doe@unl.edu.ec")
        self.assertTrue(user.consentimiento_lopdp)
        self.assertIsNotNone(user.consentimiento_timestamp)
        self.assertEqual(user.privacy_policy, self.policy)
        self.assertEqual(user.nombre_completo, "John Doe")

    def test_registration_fails_without_consent(self):
        data = {
            "nombre_completo": "Jane Doe",
            "email": "jane.doe@unl.edu.ec",
            "password": "secure_password123",
            "consentimiento_lopdp": False
        }
        res = self.client.post(self.register_url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        # Should contain error message about consent
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
        # Should return policy2 as it's the newest via effective_date 
        self.assertEqual(res.data['version'], "v2.0")
        self.assertEqual(res.data['contenido'], "New")
