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

## Instalación y Despliegue Local

El proyecto está dividido en tres componentes principales: Backend (Django), Web Frontend (React) y Aplicación Móvil (React Native/Expo). Al clonar el repositorio, la base de datos (con productos e inventario de prueba) y las imágenes vienen incluidas por defecto.

### Requisitos Previos
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/es/) (Incluye `npm`)
- [Expo Go](https://expo.dev/client) instalado en tu dispositivo móvil (Android/iOS)

---

### Paso 1: Levantar el Backend (Django)

1. Abre una terminal y sitúate en la raíz del proyecto.
2. Crea un entorno virtual e inicialízalo:
   ```bash
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   # En macOS/Linux:
   source venv/bin/activate
   ```
3. Instala las dependencias de Python:
   ```bash
   pip install -r requirements.txt
   ```
4. Levanta el servidor backend (La base de datos SQLite y la media ya están configuradas globalmente):
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   > El backend ahora corre en `http://localhost:8000`

---

### Paso 2: Levantar el Frontend Web (React)

1. Abre una nueva pestaña en tu terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   > La página web de Tienda Universitaria se abrirá en `http://localhost:5173`

---

### Paso 3: Levantar la Aplicación Móvil (React Native / Expo)

Para visualizar el catálogo desde el celular, asegúrate de que tu celular y tu computadora estén conectados a la **misma red Wi-Fi**.

1. Abre otra pestaña de terminal y navega a la carpeta móvil:
   ```bash
   cd app-movil
   ```
2. Instala las dependencias de Expo:
   ```bash
   npm install
   ```
3. Configura tu IP: 
   Abre el archivo `app-movil/.env` y reemplaza la IP `192.168.X.X` por tu IP IPv4 local (puedes obtenerla ejecutando `ipconfig` en Windows o `ifconfig` en Mac).
   ```env
   EXPO_PUBLIC_API_URL=http://<TU_IP_LOCAL>:8000/api
   ```
4. Inicia el emulador Expo:
   ```bash
   npx expo start -c
   ```
5. Escanea el código QR que aparece en tu terminal con la app **Expo Go** en tu celular.

### Credenciales de Acceso
Como la base de datos se distribuye junto al repositorio de forma global, puedes usar las credenciales de administración por defecto para probar el panel de control:
- **Usuario:** SuperAdmin (O el usuario que hayas creado previamente)
- Las imágenes, catálogo e historial de pedidos ya están configurados para correr automáticamente (`out-of-the-box`).