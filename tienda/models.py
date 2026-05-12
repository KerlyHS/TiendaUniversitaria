from django.contrib.auth.models import AbstractUser
from django.db import models

class PrivacyPolicy(models.Model):
    version = models.CharField(max_length=20, unique=True, help_text="Version. Example: v1.0.0")
    content = models.TextField(help_text="Full text of the privacy policy")
    effective_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date']
        verbose_name_plural = "Privacy Policies"

    def __str__(self):
        return f"Privacy Policy {self.version} ({self.effective_date.date()})"


class Usuario(AbstractUser):
    # Data Minimization: Use email as primary identifier
    email = models.EmailField(unique=True, verbose_name="Correo Electrónico")
    nombre_completo = models.CharField(max_length=255, verbose_name="Nombre Completo")
    
    # LOPDP Compliance Fields
    consentimiento_lopdp = models.BooleanField(
        default=False, 
        help_text="Explicit consent to data processing under LOPDP"
    )
    consentimiento_timestamp = models.DateTimeField(
        null=True, 
        blank=True, 
        help_text="When the consent was given"
    )
    privacy_policy = models.ForeignKey(
        PrivacyPolicy, 
        on_delete=models.PROTECT, # Prevent deleting policy if users are linked
        related_name='usuarios',
        help_text="The privacy policy version accepted by the user"
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nombre_completo']

    def __str__(self):
        return f"{self.nombre_completo} ({self.email})"
