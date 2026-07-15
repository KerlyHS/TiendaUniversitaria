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

# Guía de Instalación y Ejecución

## Requisitos
- Python 3.8 o superior
- Node.js y npm
- Git

## Clonar el repositorio
Para obtener el proyecto, abre una terminal y ejecuta:
```bash
git clone <URL_DEL_REPOSITORIO>
cd TiendaUniversitaria
```

## Instalación del Backend

1. Crear un entorno virtual:
```bash
python -m venv venv
```

2. Activar el entorno virtual:
- En Windows:
```bash
venv\Scripts\activate
```
- En macOS/Linux:
```bash
source venv/bin/activate
```

3. Instalar las dependencias (requirements):
```bash
pip install -r requirements.txt
```

4. Aplicar migraciones:
El proyecto utiliza SQLite en desarrollo (`db.sqlite3`). Para preparar la base de datos, ejecuta:
```bash
python manage.py migrate
```

5. Ejecutar el servidor Django:
```bash
python manage.py runserver
```

## Instalación del Frontend

1. En una nueva terminal, ingresar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar las dependencias de Node:
```bash
npm install
```

3. Ejecutar el servidor de desarrollo de Vite:
```bash
npm run dev
```

## Orden recomendado para ejecutar el sistema
1. **Backend primero**: Ejecuta el servidor Django (`python manage.py runserver`) para levantar la API.
2. **Frontend después**: En otra terminal, ejecuta el servidor Vite (`npm run dev`) para levantar la interfaz gráfica.

## Acceso al sistema
- **Frontend (Interfaz Web)**: http://localhost:3000
- **Backend (API y Panel de Administración)**: http://localhost:8000

## Problemas comunes

- **Python no encontrado**: Asegúrate de tener Python instalado y añadido al PATH del sistema.
- **Entorno virtual no activado**: Si los comandos fallan por dependencias faltantes, verifica que el entorno virtual esté activo (generalmente se muestra `(venv)` en tu terminal). Si no es así, vuelve a activarlo.
- **Errores con npm install**: Si la instalación de dependencias del frontend falla, verifica tener Node.js actualizado. Si el problema persiste, borra la carpeta `node_modules` y el archivo `package-lock.json`, y ejecuta `npm install` nuevamente.
- **Migraciones pendientes**: Si la aplicación web muestra errores de base de datos, detén el servidor, asegúrate de tener tu entorno virtual activado y vuelve a correr `python manage.py migrate`.
- **Base de datos inexistente**: No te preocupes si no ves la base de datos al inicio. El archivo `db.sqlite3` se generará automáticamente en la raíz del proyecto al correr las migraciones.
- **Error de conexión entre frontend y backend**: El frontend está configurado en `vite.config.js` para usar el puerto 3000 y redirigir las peticiones `/api` al puerto 8000. Asegúrate de tener ambos servidores corriendo y en los puertos correctos (8000 para Django y 3000 para React).

## Recomendaciones
- Mantén dos terminales abiertas durante el desarrollo: una dedicada exclusivamente al backend (Django) y otra al frontend (Vite).
- Revisa el archivo `.env.template` en caso de que requieras configurar variables de entorno para Stripe u otros servicios.
