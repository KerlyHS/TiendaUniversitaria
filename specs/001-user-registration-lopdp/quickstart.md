# Quickstart: User Registration & LOPDP Compliance

## Prerequisites
- Python 3.11+
- Django 6.0.4
- Django Rest Framework (DRF)

## Installation
1. Install dependencies:
   ```bash
   pip install django djangorestframework django-environ
   ```
2. Run migrations:
   ```bash
   python manage.py migrate
   ```
3. Create a Privacy Policy entry via admin:
   ```bash
   python manage.py createsuperuser
   # Go to /admin/ and create a PrivacyPolicy instance (v1.0)
   ```

## Local Development
1. Start the server:
   ```bash
   python manage.py runserver
   ```
2. Visit `http://localhost:8000/usuarios/registro/` to see the registration form.

## Verification
- Test registration without checking the LOPDP box (should fail).
- Test registration with valid data and consent (should succeed).
- Verify the `Usuario` record in the database has a `consentimiento_timestamp` and correct `privacy_policy_id`.
