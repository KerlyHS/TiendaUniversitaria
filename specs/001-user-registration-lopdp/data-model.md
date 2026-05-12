# Data Model: User Registration & LOPDP Compliance

## Entities

### Usuario (User)
Represents a registered user of the Tienda Universitaria. Extends Django's `AbstractUser`.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `email` | EmailField | Primary identifier and login credential | Unique, Mandatory |
| `nombre_completo` | CharField(255) | Full name as per registration | Mandatory |
| `password` | PasswordField | Hashed user password | Mandatory |
| `consentimiento_lopdp` | BooleanField | Flag indicating explicit LOPDP consent | Mandatory (Must be True) |
| `consentimiento_timestamp` | DateTimeField | When the consent was given | Auto-populated on creation |
| `privacy_policy` | ForeignKey(PrivacyPolicy) | Which version of the policy was accepted | Mandatory |

### PrivacyPolicy
Stores versioned legal documents to ensure consent is tracked against specific policy versions.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `version` | CharField(20) | Semantic version of the policy (e.g., v1.0) | Unique, Mandatory |
| `content` | TextField | Full text of the privacy policy | Mandatory |
| `effective_date` | DateField | When this policy version became active | Mandatory |

## Relationships
- `Usuario` --(n:1)--> `PrivacyPolicy`: Each user accepts a specific version of the privacy policy at the time of registration.

## Validation Rules
- `consentimiento_lopdp` must be `True` for the registration to be valid.
- `email` must be unique and valid format.
- `password` must meet minimum security standards defined in Django settings.
