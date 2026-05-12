# Tienda Universitaria - API Service

## Overview
This service provides the backend API for the Tienda Universitaria, ensuring LOPDP compliance for user registration and data management.

## API Endpoints

### User Registration
- **URL**: `/api/v1/usuarios/registro/`
- **Method**: `POST`
- **Description**: Registers a new user with mandatory LOPDP consent.
- **Request Body**:
```json
{
  "nombre_completo": "John Doe",
  "email": "john.doe@unl.edu.ec",
  "password": "secure_password123",
  "consentimiento_lopdp": true
}
```

### Privacy Policy
- **URL**: `/api/v1/politica-privacidad/`
- **Method**: `GET`
- **Description**: Retrieves the latest active privacy policy.

## Technical Stack
- **Framework**: Django 6.0.4
- **API**: Django Rest Framework (DRF)
- **Database**: SQLite (Dev) / PostgreSQL (Prod)

## Compliance
- **LOPDP Art. 39**: Privacy by Design.
- **Data Minimization**: Only essential user data is collected.
- **Consent Audit**: Every user registration includes a timestamped consent linked to a specific policy version.
# Tienda Universitaria

![Logo de Tienda Universitaria](img/LogoTienda.png)

**Tienda Universitaria** es una plataforma online de la **Universidad Nacional de Loja (UNL)**, que busca vincular a la comunidad universitaria con productos generados en las actividades académicas, como las **quintas experimentales**, y con los emprendimientos estudiantiles. El proyecto tiene como objetivo promover la comercialización de productos elaborados por los estudiantes y ofrecerlos a la comunidad, contribuyendo al desarrollo social, académico y empresarial de los mismos.

## Misión

Somos el espacio de vinculación de la Universidad Nacional de Loja que comercializa y promociona los productos generados en las quintas experimentales y los emprendimientos estudiantiles, fortaleciendo la formación académica de pregrado y contribuyendo al bienestar de la comunidad a través de una oferta de calidad, sostenible y de beneficio social.

## Visión

Consolidarnos como el portal oficial de productos y servicios de la UNL, donde la tecnología y el talento universitario se unen para servir a Loja. Visualizamos una comunidad donde cada estudiante tenga las herramientas digitales para potenciar sus emprendimientos y donde la ciudadanía reconozca en nuestra tienda online la excelencia, la transparencia y el compromiso social de nuestra institución.

## Características del Proyecto

- **Vinculación Universitaria**: Promueve los productos de los estudiantes y las actividades académicas.
- **Plataforma Online**: Accesible para toda la comunidad universitaria.
- **Productos Sostenibles y de Calidad**: Contribuye al desarrollo sostenible y social.
- **Fomento de Emprendimientos**: Apoya a los estudiantes en la creación de sus propios negocios.

## Instalación

### Requisitos

- Python 3.8 o superior.
- Django 6.0.4.